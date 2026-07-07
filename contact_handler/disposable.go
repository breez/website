package main

import (
	"io"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"
)

const (
	disposableURL   = "https://disposable.github.io/disposable-email-domains/domains.txt"
	refreshInterval = 24 * time.Hour
	fetchTimeout    = 30 * time.Second
)

var (
	disposableDomains map[string]bool
	disposableMu      sync.RWMutex
)

// init kicks off the initial fetch and starts the background refresher.
func init() {
	if err := refreshDisposableDomains(); err != nil {
		log.Printf("WARNING: initial fetch of disposable domains failed: %v", err)
		disposableDomains = make(map[string]bool)
	}
	go func() {
		ticker := time.NewTicker(refreshInterval)
		defer ticker.Stop()
		for range ticker.C {
			if err := refreshDisposableDomains(); err != nil {
				log.Printf("WARNING: periodic refresh of disposable domains failed: %v", err)
			}
		}
	}()
}

// refreshDisposableDomains downloads the domain list and rebuilds the lookup map.
func refreshDisposableDomains() error {
	client := &http.Client{Timeout: fetchTimeout}
	resp, err := client.Get(disposableURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	lines := strings.Split(string(body), "\n")
	domains := make(map[string]bool, len(lines))
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line != "" {
			domains[strings.ToLower(line)] = true
		}
	}

	disposableMu.Lock()
	disposableDomains = domains
	disposableMu.Unlock()

	log.Printf("Loaded %d disposable email domains", len(domains))
	return nil
}

// isDisposable checks whether the given domain is in the disposable list.
func isDisposable(domain string) bool {
	disposableMu.RLock()
	defer disposableMu.RUnlock()
	return disposableDomains[strings.ToLower(domain)]
}
