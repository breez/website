package main

import (
	"encoding/json"
	"errors"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const (
	requestTimeout  = time.Second * 10
	recaptchaServer = "https://www.google.com/recaptcha/api/siteverify"
)

// google recaptcha response
type recaptchaResponse struct {
	Success     bool      `json:"success"`
	Score       float64   `json:"score"`
	Action      string    `json:"action"`
	ChallengeTS time.Time `json:"challenge_ts"`
	Hostname    string    `json:"hostname"`
	ErrorCodes  []string  `json:"error-codes"`
}

type Recaptcha struct {
	PrivateKey string
}

var recaptcha = Recaptcha{PrivateKey: os.Getenv("RECAPTCHA_KEY")}

// check : initiate a recaptcha verify request
func (r *Recaptcha) requestVerify(remoteAddr net.IP, captchaResponse string) (recaptchaResponse, error) {

	params := url.Values{
		"secret":   {r.PrivateKey},
		"response": {captchaResponse},
	}

	if remoteAddr != nil {
		params.Set("remoteip", remoteAddr.String())
	}

	client := &http.Client{Timeout: requestTimeout}
	// fire off request with a timeout of 10 seconds
	resp, err := client.PostForm(recaptchaServer, params)

	// request failed
	if err != nil {
		return recaptchaResponse{Success: false}, err
	}

	// close response when function exits
	defer resp.Body.Close()

	// read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return recaptchaResponse{Success: false}, err
	}

	log.Printf("body: %s", body)

	// parse json to our response object
	var response recaptchaResponse
	err = json.Unmarshal(body, &response)
	if err != nil {
		log.Printf("Unmarshal error: %v", err)
		return recaptchaResponse{Success: false}, err
	}

	// return our object response
	return response, nil
}

// Check : check user IP, captcha subject (= page) and captcha response but return treshold
func (r *Recaptcha) Check(remoteip net.IP, action string, response string) (success bool, score float64, err error) {
	resp, err := r.requestVerify(remoteip, response)
	// fetch/parsing failed
	if err != nil {
		return false, 0, err
	}

	// captcha subject did not match
	if strings.ToLower(resp.Action) != strings.ToLower(action) {
		return false, 0, errors.New("recaptcha actions do not match")
	}

	// recaptcha token was not valid
	if !resp.Success {
		return false, 0, nil
	}

	// user treshold was not enough
	return true, resp.Score, nil
}

// Verify : check user IP, captcha subject (= page) and captcha response
func (r *Recaptcha) Verify(remoteip net.IP, action string, response string, minScore float64) (success bool, err error) {
	success, score, err := r.Check(remoteip, action, response)

	// return false if response failed
	if !success || err != nil {
		return false, err
	}

	// user score was not enough
	return score >= minScore, nil
}
