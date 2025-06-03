package database

import (
	"database/sql"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	connStr := os.Getenv("SUPABASE_DB_URL")
	if connStr == "" {
		log.Fatal("SUPABASE_DB_URL environment variable is required")
	}
	
	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Erro ao conectar com o banco:", err)
	}
	
	// Configure connection pool settings
	DB.SetMaxOpenConns(25)                  // Maximum number of open connections
	DB.SetMaxIdleConns(10)                  // Maximum number of idle connections
	DB.SetConnMaxLifetime(5 * time.Minute)  // Maximum lifetime of a connection
	DB.SetConnMaxIdleTime(2 * time.Minute)  // Maximum idle time for a connection
	
	if err := DB.Ping(); err != nil {
		log.Fatal("Banco não respondeu:", err)
	}
	
	log.Println("Conexão com PostgreSQL e Supabase estabelecida com pool configurado!")
}