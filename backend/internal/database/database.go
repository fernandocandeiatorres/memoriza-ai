package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	connStr := os.Getenv("SUPABASE_DB_URL")
    log.Printf("DEBUG: Connection String: %s", connStr) // Check for extra quotes!
    var err error
    DB, err = sql.Open("postgres", connStr)
    if err != nil {
        log.Fatal("Erro ao conectar com o banco:", err)
    }
    if err := DB.Ping(); err != nil {
        log.Fatal("Banco não respondeu:", err)
    }
    log.Println("Conexão com PostgreSQL e Supabase estabelecida!")
}