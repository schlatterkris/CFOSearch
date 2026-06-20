#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateContent } from '../lib/ai-client.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(__dirname, '..');
const BATCH_DIR = __dirname;
const INPUT_FILE = path.join(BATCH_DIR, 'batch-input.tsv');
const STATE_FILE = path.join(BATCH_DIR, 'batch-state.tsv');
const PROMPT_FILE = path.join(BATCH_DIR, 'batch-prompt.md');
const LOGS_DIR = path.join(BATCH_DIR, 'logs');
const TRACKER_DIR = path.join(BATCH_DIR, 'tracker-additions');
const REPORTS_DIR = path.join(PROJECT_DIR, 'reports');

let PARALLEL = 1;
let DRY_RUN = false;
let RETRY_FAILED = false;
let START_FROM = 0;
let MAX_RETRIES = 2;

function usage() {
  console.log(`
career-ops batch runner — Gemini-powered batch processing

Usage: gemini-runner.mjs [OPTIONS]

Options:
  --parallel N       Number of parallel workers (default: 1)
  --dry-run          Show what would be processed, don't execute
  --retry-failed     Only retry offers marked as "failed" in state
  --start-from N     Start from offer ID N (skip earlier IDs)
  --max-retries N    Max retry attempts per offer (default: 2)
  -h, --help         Show this help

Files:
  batch-input.tsv    Input offers (id, url, source, notes)
  batch-state.tsv    Processing state (auto-managed)
  batch-prompt.md    Prompt template for Gemini
  logs/              Per-offer logs
  tracker-additions/ Tracker lines for post-batch merge
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  while (args.length > 0) {
    const arg = args.shift();
    switch (arg) {
      case '--parallel': PARALLEL = parseInt(args.shift()); break;
      case '--dry-run': DRY_RUN = true; break;
      case '--retry-failed': RETRY_FAILED = true; break;
      case '--start-from': START_FROM = parseInt(args.shift()); break;
      case '--max-retries': MAX_RETRIES = parseInt(args.shift()); break;
      case '-h':
      case '--help': usage(); process.exit(0);
    }
  }
}

parseArgs();

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function initState() {
  ensureDir(LOGS_DIR);
  ensureDir(TRACKER_DIR);
  ensureDir(REPORTS_DIR);
  
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, 'id\turl\tstatus\tstarted_at\tcompleted_at\treport_num\tscore\terror\tretries\n');
  }
}

function readState() {
  if (!fs.existsSync(STATE_FILE)) return new Map();
  
  const state = new Map();
  const lines = fs.readFileSync(STATE_FILE, 'utf-8').split('\n').filter(l => l.trim());
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (cols.length >= 3) {
      state.set(cols[0], {
        id: cols[0],
        url: cols[1],
        status: cols[2],
        started_at: cols[3] || '',
        completed_at: cols[4] || '',
        report_num: cols[5] || '-',
        score: cols[6] || '-',
        error: cols[7] || '',
        retries: parseInt(cols[8]) || 0,
      });
    }
  }
  return state;
}

function updateState(id, offer) {
  const state = readState();
  state.set(id, offer);
  
  const lines = ['id\turl\tstatus\tstarted_at\tcompleted_at\treport_num\tscore\terror\tretries'];
  for (const [, o] of state) {
    lines.push(`${o.id}\t${o.url}\t${o.status}\t${o.started_at}\t${o.completed_at}\t${o.report_num}\t${o.score}\t${o.error}\t${o.retries}`);
  }
  fs.writeFileSync(STATE_FILE, lines.join('\n') + '\n');
}

function getNextReportNum() {
  let maxNum = 0;
  
  if (fs.existsSync(REPORTS_DIR)) {
    const files = fs.readdirSync(REPORTS_DIR).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const num = parseInt(file.split('-')[0]);
      if (num > maxNum) maxNum = num;
    }
  }
  
  const state = readState();
  for (const [, o] of state) {
    const num = parseInt(o.report_num);
    if (num > maxNum) maxNum = num;
  }
  
  return String(maxNum + 1).padStart(3, '0');
}

function getStatus(id) {
  const state = readState();
  return state.get(id)?.status || 'none';
}

function getRetries(id) {
  const state = readState();
  return state.get(id)?.retries || 0;
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getDate() {
  return new Date().toISOString().split('T')[0];
}

async function processOffer(id, url, source, notes) {
  const startedAt = new Date().toISOString();
  const retries = getRetries(id);
  const reportNum = getNextReportNum();
  const date = getDate();
  const logFile = path.join(LOGS_DIR, `${reportNum}-${id}.log`);
  
  console.log(`--- Processing offer #${id}: ${url} (report ${reportNum}, attempt ${retries + 1})`);
  
  ensureDir(LOGS_DIR);
  
  const logStream = fs.createWriteStream(logFile);
  
  try {
    if (!fs.existsSync(PROMPT_FILE)) {
      throw new Error(`Prompt file not found: ${PROMPT_FILE}`);
    }
    
    let promptTemplate = fs.readFileSync(PROMPT_FILE, 'utf-8');
    const jdFile = `/tmp/batch-jd-${id}.txt`;
    
    promptTemplate = promptTemplate
      .replace(/\{\{URL\}\}/g, url)
      .replace(/\{\{JD_FILE\}\}/g, jdFile)
      .replace(/\{\{REPORT_NUM\}\}/g, reportNum)
      .replace(/\{\{DATE\}\}/g, date)
      .replace(/\{\{ID\}\}/g, id);
    
    logStream.write(`=== PROMPT FOR OFFER #${id} ===\n\n`);
    logStream.write(promptTemplate + '\n\n');
    
    const cvPath = path.join(PROJECT_DIR, 'cv.md');
    const llmsPath = path.join(PROJECT_DIR, 'llms.txt');
    const digestPath = path.join(PROJECT_DIR, 'article-digest.md');
    const profilePath = path.join(PROJECT_DIR, 'config', 'profile.yml');
    
    let context = '\n\n=== CONTEXT FILES ===\n\n';
    
    if (fs.existsSync(profilePath)) {
      context += `--- config/profile.yml ---\n${fs.readFileSync(profilePath, 'utf-8')}\n\n`;
    }
    
    if (fs.existsSync(cvPath)) {
      context += `--- cv.md ---\n${fs.readFileSync(cvPath, 'utf-8')}\n\n`;
    }
    
    if (fs.existsSync(llmsPath)) {
      context += `--- llms.txt ---\n${fs.readFileSync(llmsPath, 'utf-8')}\n\n`;
    }
    
    if (fs.existsSync(digestPath)) {
      context += `--- article-digest.md ---\n${fs.readFileSync(digestPath, 'utf-8')}\n\n`;
    }
    
    const fullPrompt = context + promptTemplate;
    
    logStream.write(`\n=== GEMINI RESPONSE ===\n\n`);
    
    const response = await generateContent(fullPrompt);
    
    logStream.write(response + '\n');
    
    const completedAt = new Date().toISOString();
    
    const scoreMatch = response.match(/(?:Global|Overall|Score)[:\s]*(\d+\.?\d*)\/5/i);
    const score = scoreMatch ? scoreMatch[1] : '-';
    
    const companyMatch = url.match(/linkedin\.com.*\/jobs\/|lever\.|ashby\.|greenhouse\.|workday\.|indeed\./i);
    const company = companyMatch ? slugify(companyMatch[0]) : `company-${id}`;
    
    const reportPath = path.join(REPORTS_DIR, `${reportNum}-${company}-${date}.md`);
    fs.writeFileSync(reportPath, response);
    
    const trackerLine = `${reportNum}\t${date}\t${company}\tJob #${id}\tEvaluated\t${score}/5\t❌\t[${reportNum}](reports/${reportNum}-${company}-${date}.md)\t${notes || 'Automatic evaluation'}\n`;
    fs.writeFileSync(path.join(TRACKER_DIR, `${id}.tsv`), trackerLine);
    
    updateState(id, {
      id, url, status: 'completed',
      started_at: startedAt, completed_at: completedAt,
      report_num: reportNum, score, error: '', retries,
    });
    
    console.log(`    Completed (score: ${score}, report: ${reportNum})`);
    
    return { status: 'completed', id, report_num: reportNum, score, company };
    
  } catch (error) {
    const completedAt = new Date().toISOString();
    const newRetries = retries + 1;
    
    logStream.write(`\n=== ERROR ===\n${error.message}\n`);
    
    updateState(id, {
      id, url, status: 'failed',
      started_at: startedAt, completed_at: completedAt,
      report_num: reportNum, score: '-', error: error.message.slice(0, 200), retries: newRetries,
    });
    
    console.log(`    Failed (attempt ${newRetries}): ${error.message.slice(0, 100)}`);
    
    return { status: 'failed', id, error: error.message };
    
  } finally {
    logStream.end();
  }
}

async function processBatch(offers) {
  if (PARALLEL <= 1) {
    for (const offer of offers) {
      await processOffer(offer.id, offer.url, offer.source, offer.notes);
    }
  } else {
    const chunks = [];
    for (let i = 0; i < offers.length; i += PARALLEL) {
      chunks.push(offers.slice(i, i + PARALLEL));
    }
    
    for (const chunk of chunks) {
      await Promise.all(chunk.map(o => processOffer(o.id, o.url, o.source, o.notes)));
    }
  }
}

function printSummary() {
  console.log('\n=== Batch Summary ===\n');
  
  const state = readState();
  if (state.size === 0) {
    console.log('No state file found.');
    return;
  }
  
  let total = 0, completed = 0, failed = 0, pending = 0;
  let scoreSum = 0, scoreCount = 0;
  
  for (const [, o] of state) {
    total++;
    if (o.status === 'completed') {
      completed++;
      if (o.score !== '-') {
        scoreSum += parseFloat(o.score);
        scoreCount++;
      }
    } else if (o.status === 'failed') {
      failed++;
    } else {
      pending++;
    }
  }
  
  console.log(`Total: ${total} | Completed: ${completed} | Failed: ${failed} | Pending: ${pending}`);
  
  if (scoreCount > 0) {
    const avg = (scoreSum / scoreCount).toFixed(1);
    console.log(`Average score: ${avg}/5 (${scoreCount} scored)`);
  }
}

function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`ERROR: ${INPUT_FILE} not found. Add offers first.`);
    process.exit(1);
  }
  
  if (!fs.existsSync(PROMPT_FILE)) {
    console.error(`ERROR: ${PROMPT_FILE} not found.`);
    process.exit(1);
  }
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY environment variable is not set.');
    console.error('Set it with: export GEMINI_API_KEY=your-api-key');
    process.exit(1);
  }
  
  initState();
  
  const lines = fs.readFileSync(INPUT_FILE, 'utf-8').split('\n').filter(l => l.trim());
  const offers = [];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (cols.length < 2) continue;
    
    const id = cols[0];
    const url = cols[1];
    const source = cols[2] || '';
    const notes = cols.slice(3).join('\t');
    
    if (parseInt(id) < START_FROM) continue;
    
    const status = getStatus(id);
    
    if (RETRY_FAILED) {
      if (status !== 'failed') continue;
      if (getRetries(id) >= MAX_RETRIES) {
        console.log(`SKIP #${id}: max retries (${MAX_RETRIES}) reached`);
        continue;
      }
    } else {
      if (status === 'completed') continue;
      if (status === 'failed' && getRetries(id) >= MAX_RETRIES) {
        console.log(`SKIP #${id}: failed and max retries reached (use --retry-failed to force)`);
        continue;
      }
    }
    
    offers.push({ id, url, source, notes });
  }
  
  if (offers.length === 0) {
    console.log('No offers to process.');
    printSummary();
    process.exit(0);
  }
  
  console.log('=== career-ops batch runner (Gemini) ===');
  console.log(`Parallel: ${PARALLEL} | Max retries: ${MAX_RETRIES}`);
  console.log(`Input: ${offers.length} offers`);
  console.log();
  
  if (DRY_RUN) {
    console.log('=== DRY RUN (no processing) ===');
    for (const o of offers) {
      const status = getStatus(o.id);
      console.log(`  #${o.id}: ${o.url} [${o.source}] (status: ${status})`);
    }
    console.log();
    console.log(`Would process ${offers.length} offers`);
    process.exit(0);
  }
  
  processBatch(offers).then(() => {
    printSummary();
  }).catch(err => {
    console.error('Batch processing failed:', err);
    process.exit(1);
  });
}

main();
