package web

import (
	_ "embed"
	"encoding/json"
	"html/template"
	"net/http"
	"sort"
	"sync"
	"time"

	"github.com/santifer/career-ops/dashboard/internal/data"
	"github.com/santifer/career-ops/dashboard/internal/model"
)

//go:embed templates/dashboard.html
var dashboardHTML string

type Server struct {
	careerOpsPath string
	tmpl          *template.Template
	mu            sync.RWMutex
	apps          []model.CareerApplication
	metrics       model.PipelineMetrics
	lastLoad      time.Time
}

func NewServer(careerOpsPath string) *Server {
	tmpl := template.Must(template.New("dashboard").Funcs(template.FuncMap{
		"statusColor": statusColor,
		"scoreColor":  scoreColor,
		"inc":         func(n int) int { return n + 1 },
	}).Parse(dashboardHTML))

	s := &Server{
		careerOpsPath: careerOpsPath,
		tmpl:          tmpl,
	}
	s.refresh()
	return s
}

type PageData struct {
	Applications []model.CareerApplication
	Metrics      model.PipelineMetrics
	Statuses     []StatusCount
	ScoreBuckets []ScoreBucket
}

type StatusCount struct {
	Name  string
	Count int
	Color string
}

type ScoreBucket struct {
	Min   float64
	Max   float64
	Label string
	Count int
}

func statusColor(status string) string {
	switch data.NormalizeStatus(status) {
	case "interview":
		return "#a6e3a1"
	case "offer":
		return "#a6e3a1"
	case "applied":
		return "#89dceb"
	case "responded":
		return "#89b4fa"
	case "evaluated":
		return "#cdd6f4"
	case "skip":
		return "#f38ba8"
	case "rejected":
		return "#585b70"
	case "discarded":
		return "#585b70"
	default:
		return "#cdd6f4"
	}
}

func scoreColor(score float64) string {
	switch {
	case score >= 4.2:
		return "#a6e3a1"
	case score >= 3.8:
		return "#f9e2af"
	case score >= 3.0:
		return "#cdd6f4"
	default:
		return "#f38ba8"
	}
}

func (s *Server) refresh() {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.apps = data.ParseApplications(s.careerOpsPath)
	s.metrics = data.ComputeMetrics(s.apps)
	s.lastLoad = time.Now()
}

func (s *Server) getData() ([]model.CareerApplication, model.PipelineMetrics) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	if time.Since(s.lastLoad) > 30*time.Second {
		go s.refresh()
	}
	return s.apps, s.metrics
}

func (s *Server) Handler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/", s.handleDashboard)
	mux.HandleFunc("/api/applications", s.handleApplicationsJSON)
	mux.HandleFunc("/api/metrics", s.handleMetricsJSON)
	mux.HandleFunc("/api/refresh", s.handleRefresh)
	return mux
}

func (s *Server) handleDashboard(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	apps, metrics := s.getData()

	// Status counts
	statusOrder := []string{"interview", "offer", "responded", "applied", "evaluated", "rejected", "discarded", "skip"}
	statusColors := map[string]string{
		"interview": "#a6e3a1",
		"offer":     "#a6e3a1",
		"applied":   "#89dceb",
		"responded": "#89b4fa",
		"evaluated": "#cdd6f4",
		"skip":      "#f38ba8",
		"rejected":  "#585b70",
		"discarded": "#585b70",
	}
	var statuses []StatusCount
	for _, s := range statusOrder {
		if count, ok := metrics.ByStatus[s]; ok && count > 0 {
			statuses = append(statuses, StatusCount{Name: s, Count: count, Color: statusColors[s]})
		}
	}

	// Score buckets (0-5)
	buckets := []struct {
		min, max float64
		label    string
	}{
		{0, 1, "0-1"},
		{1, 2, "1-2"},
		{2, 3, "2-3"},
		{3, 3.5, "3-3.5"},
		{3.5, 4, "3.5-4"},
		{4, 4.5, "4-4.5"},
		{4.5, 5, "4.5-5"},
	}
	var scoreBuckets []ScoreBucket
	for _, b := range buckets {
		count := 0
		for _, app := range apps {
			if app.Score >= b.min && app.Score < b.max {
				count++
			}
		}
		scoreBuckets = append(scoreBuckets, ScoreBucket{Min: b.min, Max: b.max, Label: b.label, Count: count})
	}

	// Sort apps by score desc for table
	sorted := make([]model.CareerApplication, len(apps))
	copy(sorted, apps)
	sort.Slice(sorted, func(i, j int) bool {
		if sorted[i].Score != sorted[j].Score {
			return sorted[i].Score > sorted[j].Score
		}
		return sorted[i].Company < sorted[j].Company
	})

	data := PageData{
		Applications: sorted,
		Metrics:      metrics,
		Statuses:     statuses,
		ScoreBuckets: scoreBuckets,
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	s.tmpl.Execute(w, data)
}

func (s *Server) handleApplicationsJSON(w http.ResponseWriter, r *http.Request) {
	apps, _ := s.getData()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(apps)
}

func (s *Server) handleMetricsJSON(w http.ResponseWriter, r *http.Request) {
	_, metrics := s.getData()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metrics)
}

func (s *Server) handleRefresh(w http.ResponseWriter, r *http.Request) {
	s.refresh()
	http.Redirect(w, r, "/", http.StatusSeeOther)
}
