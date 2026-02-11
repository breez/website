package main

import (
	"bytes"
	"encoding/json"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/ses"
)

const (
	charset = "UTF-8"
)

type contact struct {
	FullName    string
	Company     string
	Email       string
	ContactType string
	Message     string
	APIKey      string
}

func addresses(a string) (addr []*string) {
	json.Unmarshal([]byte(a), &addr)
	return
}

func getContact(r *http.Request) contact {
	c := contact{
		FullName:    r.FormValue("fullname"),
		Company:     r.FormValue("company"),
		Email:       r.FormValue("email"),
		ContactType: r.FormValue("contact_type"),
		Message:     r.FormValue("message"),
	}
	return c
}

func sendEmails(w http.ResponseWriter, c contact, isAPIKey bool) {
	if isAPIKey {
		generatedKey, err := generateKey(c.FullName, c.Email, c.Company)
		if err != nil {
			log.Printf("Error in generateKey(\"%v\",\"%v\",\"%v\"): %v", c.FullName, c.Email, c.Company, err)
		}
		c.APIKey, err = getKey(generatedKey)
		if err != nil {
			log.Printf("Error in getKey(\"%v\"): %v", generatedKey, err)
		}
	}
	if err := contactNotification(c); err != nil {
		http.Error(w, "", http.StatusBadRequest)
		return
	}
	if c.APIKey != "" {
		sendAPIKey(c)
	}
}

func apiKeySender(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/contact/apikey" || r.Method != "POST" {
		http.Error(w, "404 not found.", http.StatusNotFound)
		return
	}
	if err := r.ParseForm(); err != nil {
		http.Error(w, "", http.StatusBadRequest)
		return
	}
	log.Printf("Post from website! r.PostFrom = %v\n", r.PostForm)
	c := getContact(r)
	c.ContactType = "sdk-liquid-api-key/api"
	sendEmails(w, c, true)
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
	if score <= 0.05 {
		http.Error(w, "", http.StatusBadRequest)
		return
	}
	c := getContact(r)
	sendEmails(w, c, c.ContactType == "sdk-liquid-api-key")
}

func sendAPIKey(c contact) error {
	var html bytes.Buffer

	tpl := `
Hello {{ .FullName }},<br /><br />
Please use the following API key for the Breez SDK (Nodeless implementation):<br /><br />
<pre>{{ .APIKey }}</pre><br />
If you have any questions, you can reply to this email or join our telegram group: https://t.me/breezsdk<br />
<br />
Best,<br />
Breez
	`
	t, err := template.New("APIKeyEmail").Parse(tpl)
	if err != nil {
		return err
	}

	if err := t.Execute(&html, c); err != nil {
		return err
	}

	sess, err := session.NewSession(&aws.Config{})
	if err != nil {
		log.Printf("Error in session.NewSession: %v", err)
		return err
	}
	svc := ses.New(sess)

	input := &ses.SendEmailInput{
		Destination: &ses.Destination{
			BccAddresses: addresses(os.Getenv("APIKEY_EMAIL_BCC")),
			ToAddresses:  []*string{&c.Email},
		},
		Message: &ses.Message{
			Body: &ses.Body{
				Html: &ses.Content{
					Charset: aws.String(charset),
					Data:    aws.String(html.String()),
				},
			},
			Subject: &ses.Content{
				Charset: aws.String(charset),
				Data:    aws.String("API key"),
			},
		},
		Source: aws.String(os.Getenv("APIKEY_EMAIL_FROM")),
	}
	// Attempt to send the email.
	result, err := svc.SendEmail(input)
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case ses.ErrCodeMessageRejected:
				log.Println(ses.ErrCodeMessageRejected, aerr.Error())
			case ses.ErrCodeMailFromDomainNotVerifiedException:
				log.Println(ses.ErrCodeMailFromDomainNotVerifiedException, aerr.Error())
			case ses.ErrCodeConfigurationSetDoesNotExistException:
				log.Println(ses.ErrCodeConfigurationSetDoesNotExistException, aerr.Error())
			default:
				log.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			log.Println(err.Error())
		}
		return err
	}

	log.Printf("Transmission sent with result:\n%v", result)

	return nil
}

func contactNotification(c contact) error {

	var html bytes.Buffer

	tpl := `
	<div>Full Name: {{ .FullName }}</div>
	{{if .Company -}}
	<div>Company: {{ .Company }}</div>
	{{end -}}
	<div>Email: {{ .Email }}</div>
	<div>Contact Type: {{ .ContactType }}</div>
	<div>Message:<br /> {{ .Message }}</div>
	{{if .APIKey -}}
	<div>API Key: <pre>{{ .APIKey }}</pre></div>
	{{end -}}

	`
	t, err := template.New("ContactEmail").Parse(tpl)
	if err != nil {
		return err
	}

	if err := t.Execute(&html, c); err != nil {
		return err
	}

	sess, err := session.NewSession(&aws.Config{})
	if err != nil {
		log.Printf("Error in session.NewSession: %v", err)
		return err
	}
	svc := ses.New(sess)

	input := &ses.SendEmailInput{
		Destination: &ses.Destination{
			CcAddresses: addresses(os.Getenv("CONTACT_NOTIFICATION_CC")),
			ToAddresses: addresses(os.Getenv("CONTACT_NOTIFICATION_TO")),
		},
		Message: &ses.Message{
			Body: &ses.Body{
				Html: &ses.Content{
					Charset: aws.String(charset),
					Data:    aws.String(html.String()),
				},
			},
			Subject: &ses.Content{
				Charset: aws.String(charset),
				Data:    aws.String("Contact Form"),
			},
		},
		Source: aws.String(os.Getenv("CONTACT_NOTIFICATION_FROM")),
	}
	// Attempt to send the email.
	result, err := svc.SendEmail(input)
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case ses.ErrCodeMessageRejected:
				log.Println(ses.ErrCodeMessageRejected, aerr.Error())
			case ses.ErrCodeMailFromDomainNotVerifiedException:
				log.Println(ses.ErrCodeMailFromDomainNotVerifiedException, aerr.Error())
			case ses.ErrCodeConfigurationSetDoesNotExistException:
				log.Println(ses.ErrCodeConfigurationSetDoesNotExistException, aerr.Error())
			default:
				log.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			log.Println(err.Error())
		}
		return err
	}

	log.Printf("Transmission sent with result:\n%v", result)

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
	b, err := io.ReadAll(r.Body)
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
	sess, err := session.NewSession(&aws.Config{})
	if err != nil {
		log.Printf("Error in session.NewSession: %v", err)
		return err
	}
	svc := ses.New(sess)

	input := &ses.SendEmailInput{
		Destination: &ses.Destination{
			CcAddresses: addresses(os.Getenv("PAYMENT_FAILURE_NOTIFICATION_CC")),
			ToAddresses: addresses(os.Getenv("PAYMENT_FAILURE_NOTIFICATION_TO")),
		},
		Message: &ses.Message{
			Body: &ses.Body{
				Text: &ses.Content{
					Charset: aws.String(charset),
					Data:    aws.String(j),
				},
			},
			Subject: &ses.Content{
				Charset: aws.String(charset),
				Data:    aws.String("Payment Failure"),
			},
		},
		Source: aws.String(os.Getenv("PAYMENT_FAILURE_NOTIFICATION_FROM")),
	}
	// Attempt to send the email.
	result, err := svc.SendEmail(input)
	if err != nil {
		if aerr, ok := err.(awserr.Error); ok {
			switch aerr.Code() {
			case ses.ErrCodeMessageRejected:
				log.Println(ses.ErrCodeMessageRejected, aerr.Error())
			case ses.ErrCodeMailFromDomainNotVerifiedException:
				log.Println(ses.ErrCodeMailFromDomainNotVerifiedException, aerr.Error())
			case ses.ErrCodeConfigurationSetDoesNotExistException:
				log.Println(ses.ErrCodeConfigurationSetDoesNotExistException, aerr.Error())
			default:
				log.Println(aerr.Error())
			}
		} else {
			// Print the error, cast err to awserr.Error to get the Code and
			// Message from an error.
			log.Println(err.Error())
		}
		return err
	}

	log.Printf("Payment Failure notification sent with result:\n%v", result)

	return nil
}

func main() {
	handler := http.NewServeMux()
	handler.Handle("/", http.FileServer(http.Dir(".")))
	handler.HandleFunc("/paymentfailure", paymentFailure)
	handler.HandleFunc("/contact/apikey", apiKeySender)
	handler.HandleFunc("/contact", contactMailer)

	if err := http.ListenAndServe(os.Getenv("HOSTNAME"), handler); err != nil {
		log.Println(err)
	}
}
