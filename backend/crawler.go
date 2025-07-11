package main

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

func AnalyzeURL(urlObj *URL) error {
	urlObj.Status = "running"
	DB.Save(urlObj)
	if err := DB.First(urlObj, urlObj.ID).Error; err != nil {
		return err
	}
	if urlObj.Status == "stopped" {
		return nil
	}
	resp, err := http.Get(urlObj.Address)
	if err != nil {
		urlObj.Status = "error"
		DB.Save(urlObj)
		return err
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		urlObj.Status = "error"
		DB.Save(urlObj)
		return err
	}

	htmlVersion := "unknown"
	if goquery.NewDocumentFromNode(doc.Nodes[0]).Find("html").Length() > 0 {
		if doc.Find("!DOCTYPE html").Length() > 0 {
			htmlVersion = "HTML5"
		} else {
			htmlVersion = "HTML4 or older"
		}
	}

	title := doc.Find("title").Text()

	headings := map[string]int{
		"h1": doc.Find("h1").Length(),
		"h2": doc.Find("h2").Length(),
		"h3": doc.Find("h3").Length(),
		"h4": doc.Find("h4").Length(),
		"h5": doc.Find("h5").Length(),
		"h6": doc.Find("h6").Length(),
	}

	fmt.Printf("Heading counts: %+v\n", headings)

	internalLinks, externalLinks, brokenLinks := 0, 0, 0
	var links []Link
	base := urlObj.Address
	if strings.HasSuffix(base, "/") {
		base = base[:len(base)-1]
	}
	client := &http.Client{Timeout: 5 * time.Second}

	if err := DB.First(urlObj, urlObj.ID).Error; err != nil {
		return err
	}
	if urlObj.Status == "stopped" {
		return nil
	}
	doc.Find("a[href]").Each(func(i int, s *goquery.Selection) {
		href, _ := s.Attr("href")
		isInternal := strings.HasPrefix(href, "/") || strings.HasPrefix(href, base)
		link := Link{URL: href, Internal: isInternal}
		if !strings.HasPrefix(href, "http") {
			if strings.HasPrefix(href, "/") {
				href = base + href
			} else {
				href = base + "/" + href
			}
		}
		status := 0
		req, err := http.NewRequest("GET", href, nil)
		if err == nil {
			req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")
			resp, err := client.Do(req)
			if err == nil {
				status = resp.StatusCode
				if status >= 400 {
					link.Broken = true
					brokenLinks++
				}
				resp.Body.Close()
			} else {
				link.Broken = true
				brokenLinks++
			}
		} else {
			link.Broken = true
			brokenLinks++
		}
		link.Status = status
		if isInternal {
			internalLinks++
		} else {
			externalLinks++
		}
		links = append(links, link)
	})

	loginForm := false
	doc.Find("form").Each(func(i int, s *goquery.Selection) {
		if s.Find("input[type='password']").Length() > 0 {
			loginForm = true
		}
	})

	if err := DB.First(urlObj, urlObj.ID).Error; err != nil {
		return err
	}
	if urlObj.Status == "stopped" {
		return nil
	}

	result := AnalysisResult{
		URLID:         urlObj.ID,
		HTMLVersion:   htmlVersion,
		Title:         title,
		Headings:      headings,
		InternalLinks: internalLinks,
		ExternalLinks: externalLinks,
		BrokenLinks:   brokenLinks,
		LoginForm:     loginForm,
		CreatedAt:     time.Now(),
		Links:         links,
	}

	if err := DB.Create(&result).Error; err != nil {
		urlObj.Status = "error"
		DB.Save(urlObj)
		return err
	}

	if err := DB.First(urlObj, urlObj.ID).Error; err != nil {
		return err
	}
	if urlObj.Status != "stopped" {
		urlObj.Status = "done"
		DB.Save(urlObj)
	}

	fmt.Printf("Analysis completed for URL %s: %d internal, %d external, %d broken links\n",
		urlObj.Address, internalLinks, externalLinks, brokenLinks)

	return nil
}
