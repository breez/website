package main

import (
	"context"
	"errors"
	"log"
	"net"
	"time"
)

const mxLookupTimeout = 2 * time.Second

// hasMXRecords checks whether the domain has at least one MX record
func hasMXRecords(domain string) bool {
	ctx, cancel := context.WithTimeout(context.Background(), mxLookupTimeout)
	defer cancel()

	var resolver net.Resolver
	mxs, err := resolver.LookupMX(ctx, domain)
	if err != nil {
		var dnsErr *net.DNSError
		if errors.As(err, &dnsErr) && dnsErr.IsNotFound {
			log.Printf("no MX records for domain: %s", domain)
			return false
		}
		log.Printf("MX lookup error for %s: %v (allowing through)", domain, err)
		return true
	}

	if len(mxs) == 0 {
		log.Printf("no MX records found for domain: %s", domain)
		return false
	}

	// RFC 7505: a single MX record with host "." means the domain explicitly
	// accepts no mail (e.g. example.com).
	if len(mxs) == 1 && mxs[0].Host == "." {
		log.Printf("null MX (no mail accepted) for domain: %s", domain)
		return false
	}

	return true
}
