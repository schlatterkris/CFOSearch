import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const PROJECT_DIR = path.resolve(process.cwd());
const CONFIG_PATH = path.join(PROJECT_DIR, 'config', 'ai.yml');

let config = null;

function loadConfig() {
  if (config) return config;
  
  if (fs.existsSync(CONFIG_PATH)) {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    config = yaml.load(raw);
  } else {
    config = {
      model: 'gemini-2.0-flash',
      temperature: 0.7,
      maxOutputTokens: 8192,
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    };
  }
  return config;
}

let genAI = null;
let model = null;

function getModel() {
  if (model) return model;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  const cfg = loadConfig();
  
  model = genAI.getGenerativeModel({
    model: cfg.model || 'gemini-2.0-flash',
    generationConfig: {
      temperature: cfg.temperature ?? 0.7,
      maxOutputTokens: cfg.maxOutputTokens ?? 8192,
    },
    safetySettings: cfg.safetySettings ?? [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  });
  
  return model;
}

export async function generateContent(prompt, systemInstruction = null) {
  const m = getModel();
  const cfg = loadConfig();
  
  const options = {
    generationConfig: {
      temperature: cfg.temperature ?? 0.7,
      maxOutputTokens: cfg.maxOutputTokens ?? 8192,
    },
  };
  
  if (systemInstruction) {
    options.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  
  const result = await m.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    ...options,
  });
  
  const response = result.response;
  return response.text();
}

export async function generateContentStream(prompt, systemInstruction = null) {
  const m = getModel();
  const cfg = loadConfig();
  
  const options = {
    generationConfig: {
      temperature: cfg.temperature ?? 0.7,
      maxOutputTokens: cfg.maxOutputTokens ?? 8192,
    },
  };
  
  if (systemInstruction) {
    options.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  
  const result = await m.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    ...options,
  });
  
  return result.response;
}

export function getConfig() {
  return loadConfig();
}

export function setConfig(newConfig) {
  config = { ...loadConfig(), ...newConfig };
}
