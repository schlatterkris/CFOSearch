package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/santifer/career-ops/dashboard/internal/web"
)

func main() {
	port := flag.String("port", "8080", "Port to listen on")
	pathFlag := flag.String("path", "", "Path to career-ops directory (default: parent of dashboard/)")
	flag.Parse()

	careerOpsPath := *pathFlag
	if careerOpsPath == "" {
		execPath, err := os.Executable()
		if err == nil {
			careerOpsPath = filepath.Dir(filepath.Dir(execPath))
		}
		if _, err := os.Stat(filepath.Join(careerOpsPath, "applications.md")); os.IsNotExist(err) {
			careerOpsPath = ".."
		}
	}

	absPath, _ := filepath.Abs(careerOpsPath)
	fmt.Printf("Career-Ops path: %s\n", absPath)
	fmt.Printf("Web dashboard listening on http://localhost:%s\n", *port)

	srv := web.NewServer(careerOpsPath)
	if err := http.ListenAndServe(":"+*port, srv.Handler()); err != nil {
		log.Fatal(err)
	}
}
