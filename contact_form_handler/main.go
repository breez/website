package main

import (
	"bytes"
	"encoding/json"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/SparkPost/gosparkpost"
)

type contact struct {
	FullName    string
	Email       string
	ContactType string
	Message     string
}

func contactMailer(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/contact" || r.Method != "POST" {
		http.Error(w, "404 not found.", http.StatusNotFound)
		return
	}

	if err := r.ParseForm(); err != nil {
		http.Error(w, "", http.StatusBadRequest)
		return
	}

	log.Printf("Post from website! r.PostFrom = %v\n", r.PostForm)
	success, score, err := recaptcha.Check(nil, "contact", r.FormValue("recaptcha_response"))
	log.Printf("recaptcha.Verify: %v, score: %v, err: %v", success, score, err)

	if score <= 0.2 {
		http.Error(w, "", http.StatusBadRequest)
		return
	}

	if err = contactNotification(contact{
		FullName:    r.FormValue("fullname"),
		Email:       r.FormValue("email"),
		ContactType: r.FormValue("contact_type"),
		Message:     r.FormValue("message"),
	}); err != nil {
		http.Error(w, "", http.StatusBadRequest)
		return
	}
}

func contactNotification(c contact) error {

	var html bytes.Buffer

	tpl := `
	<div>FullName: {{ .FullName }}</div>
	<div>Email: {{ .Email }}</div>
	<div>Contact Type: {{ .ContactType }}</div>
	<div>Message:<br /> {{ .Message }}</div>
	
	`
	t, err := template.New("ContactEmail").Parse(tpl)
	if err != nil {
		return err
	}

	if err := t.Execute(&html, c); err != nil {
		return err
	}

	apiKey := os.Getenv("SPARKPOST_API_KEY")
	cfg := &gosparkpost.Config{
		BaseUrl:    "https://api.sparkpost.com",
		ApiKey:     apiKey,
		ApiVersion: 1,
	}
	var client gosparkpost.Client
	err = client.Init(cfg)
	if err != nil {
		log.Printf("SparkPost client init failed: %s", err)
		return err
	}

	// Create a Transmission using an inline Recipient List
	// and inline email Content.
	tx := &gosparkpost.Transmission{
		Recipients: []gosparkpost.Recipient{{Address: gosparkpost.Address{Email: os.Getenv("CONTACT_NOTIFICATION_EMAIL"), Name: os.Getenv("CONTACT_NOTIFICATION_NAME")}}},
		Content: gosparkpost.Content{
			HTML:    html.String(),
			From:    os.Getenv("CONTACT_NOTIFICATION_FROM"),
			Subject: "Contact Form",
		},
	}
	id, _, err := client.Send(tx)
	if err != nil {
		log.Printf("Error sending email: %v", err)
		return err
	}

	// The second value returned from Send
	// has more info about the HTTP response, in case
	// you'd like to see more than the Transmission id.
	log.Printf("Transmission sent with id [%s]\n", id)
	return nil
}

func paymentFailure(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "404 not found.", http.StatusNotFound)
		return
	}
	if r.Header.Get("PF-Key") != os.Getenv("PAYMENT_FAILURE_KEY") {
		http.Error(w, "404 not found.", http.StatusNotFound)
		return
	}
	b, err := ioutil.ReadAll(r.Body)
	defer r.Body.Close()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	log.Println("paymentfailure:", string(b))
	//Check that it's a valid json
	var o1 interface{}
	err = json.Unmarshal(b, &o1)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	if err = paymentFailureNotification(string(b)); err != nil {
		http.Error(w, "", http.StatusBadRequest)
		return
	}
}

func paymentFailureNotification(j string) error {
	apiKey := os.Getenv("SPARKPOST_API_KEY")
	cfg := &gosparkpost.Config{
		BaseUrl:    "https://api.sparkpost.com",
		ApiKey:     apiKey,
		ApiVersion: 1,
	}
	var client gosparkpost.Client
	err := client.Init(cfg)
	if err != nil {
		log.Printf("SparkPost client init failed: %s", err)
		return err
	}

	tx := &gosparkpost.Transmission{
		Recipients: []gosparkpost.Recipient{{Address: gosparkpost.Address{Email: os.Getenv("PAYMENT_NOTIFICATION_EMAIL"), Name: os.Getenv("PAYMENT_NOTIFICATION_NAME")}}},
		Content: gosparkpost.Content{
			HTML:    j,
			From:    os.Getenv("PAYMENT_NOTIFICATION_FROM"),
			Subject: "Payment Failure",
		},
	}
	id, _, err := client.Send(tx)
	if err != nil {
		log.Printf("Error sending email: %v", err)
		return err
	}

	log.Printf("Payment Failure notification sent with id [%s]\n", id)
	return nil
}

func main() {
	handler := http.NewServeMux()
	handler.Handle("/", http.FileServer(http.Dir(".")))
	handler.HandleFunc("/paymentfailure", paymentFailure)
	handler.HandleFunc("/contact", contactMailer)

	if err := http.ListenAndServe(os.Getenv("HOSTNAME"), handler); err != nil {
		log.Println(err)
	}
}
