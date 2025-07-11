package main

import (
	"encoding/json"
	"time"
)

type URL struct {
	ID        uint             `json:"id" gorm:"primaryKey"`
	Address   string           `json:"address" gorm:"unique;not null"`
	CreatedAt time.Time        `json:"created_at"`
	UpdatedAt time.Time        `json:"updated_at"`
	Status    string           `json:"status"`
	Results   []AnalysisResult `json:"results" gorm:"foreignKey:URLID;constraint:OnDelete:CASCADE"`
}

type AnalysisResult struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	URLID         uint           `json:"url_id"`
	HTMLVersion   string         `json:"html_version"`
	Title         string         `json:"title"`
	Headings      map[string]int `json:"headings" gorm:"serializer:json"`
	HeadingsJSON  string         `json:"-" gorm:"column:headings"`
	InternalLinks int            `json:"internal_links"`
	ExternalLinks int            `json:"external_links"`
	BrokenLinks   int            `json:"broken_links"`
	LoginForm     bool           `json:"login_form"`
	CreatedAt     time.Time      `json:"created_at"`
	Links         []Link         `json:"links" gorm:"foreignKey:ResultID;constraint:OnDelete:CASCADE"`
}

func (ar *AnalysisResult) AfterFind() error {
	if ar.HeadingsJSON != "" {
		return json.Unmarshal([]byte(ar.HeadingsJSON), &ar.Headings)
	}
	return nil
}

func (ar *AnalysisResult) BeforeSave() error {
	if ar.Headings != nil {
		data, err := json.Marshal(ar.Headings)
		if err != nil {
			return err
		}
		ar.HeadingsJSON = string(data)
	}
	return nil
}

type Link struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	ResultID uint   `json:"result_id"`
	URL      string `json:"url"`
	Internal bool   `json:"internal"`
	Broken   bool   `json:"broken"`
	Status   int    `json:"status"`
}
