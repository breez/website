package main

import (
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/Laisky/go-utils/v4/crypto"
)

func generateKey(fullName, email, company string) (string, error) {
	if fullName == "" || email == "" || company == "" {
		err := errors.New("Bad Parameters")
		err = fmt.Errorf("fullName == \"\" || email == \"\" || company == \"\" [%v,%v,%v] error: %w", fullName, email, company, err)
		return "", err
	}

	breezCACertPem := []byte(os.Getenv("BREEZ_CA_CERTIFICATE"))
	breezCACert, err := crypto.Pem2Cert(breezCACertPem)
	if err != nil {
		err = fmt.Errorf("crypto.Pem2Cert(breezCACertPem) %s error: %w", breezCACertPem, err)
		log.Println(err)
		return "", err
	}

	breezCAPrikeyPem := []byte(os.Getenv("BREEZ_CA_PRIVATE_KEY"))
	breezCAPrikey, err := crypto.Pem2Prikey(breezCAPrikeyPem)
	if err != nil {
		err = fmt.Errorf("crypto.Pem2Prikey(breezCAPrikeyPem) %s error: %w", breezCAPrikeyPem, err)
		log.Println(err)
		return "", err
	}

	breezAPIPrikeyPem := []byte(os.Getenv("BREEZ_API_PRIVATE_KEY"))
	breezAPIPrikey, err := crypto.Pem2Prikey(breezAPIPrikeyPem)
	if err != nil {
		err = fmt.Errorf("crypto.Pem2Prikey(breezAPIPrikeyPem) %s error: %w", breezAPIPrikeyPem, err)
		log.Println(err)
		return "", err
	}

	csrDer, err := crypto.NewX509CSR(
		breezAPIPrikey,
		crypto.WithX509CSRCommonName(fullName),
		crypto.WithX509CSREmailAddrs(email),
		crypto.WithX509CSROrganization(company),
	)
	if err != nil {
		err = fmt.Errorf("crypto.NewX509CSR() [%v,%v,%v] error: %w", fullName, email, company, err)
		log.Println(err)
		return "", err
	}

	notBefore := time.Now()
	notAfter := notBefore.Add(10 * 365 * 24 * time.Hour)
	certDer, err := crypto.NewX509CertByCSR(
		breezCACert, breezCAPrikey, csrDer,
		crypto.WithX509SignCSRNotBefore(notBefore),
		crypto.WithX509SignCSRNotAfter(notAfter),
	)
	if err != nil {
		err = fmt.Errorf("crypto.NewX509CertByCSR() %v error: %w", crypto.CSRDer2Pem(csrDer), err)
		log.Println(err)
		return "", err
	}

	b64Cert := base64.StdEncoding.EncodeToString(certDer)
	log.Printf("apiKey for [%v, %v, %v] is %v", fullName, email, company, b64Cert)
	return b64Cert, nil
}

func getKey(generatedKey string) (string, error) {
	URLEncodedKey := strings.ReplaceAll(strings.ReplaceAll(generatedKey, "+", "-"), "/", "_")
	getKeyURLFormat := os.Getenv("GETKEY_URL")
	getKeyURL := strings.ReplaceAll(getKeyURLFormat, "{key}", URLEncodedKey)
	resp, err := http.Get(getKeyURL)
	if err != nil {
		log.Printf("Error getting %v %v", getKeyURL, err)
		return "", err
	}
	defer resp.Body.Close()
	var key string
	err = json.NewDecoder(resp.Body).Decode(&key)
	if err != nil {
		log.Printf("Error json decoding result: %v", err)
		return "", err
	}
	return key, nil
}
