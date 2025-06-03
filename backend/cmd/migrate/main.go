package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	// Conectar ao banco de dados usando a mesma string de conexão
	connStr := os.Getenv("SUPABASE_DB_URL")
	if connStr == "" {
		log.Fatal("SUPABASE_DB_URL environment variable is required")
	}

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Erro ao conectar com o banco:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("Banco não respondeu:", err)
	}

	fmt.Println("Conectado ao banco de dados!")

	// Ler o script de migração
	sqlScript, err := ioutil.ReadFile("scripts/fix_schema.sql")
	if err != nil {
		log.Fatal("Erro ao ler o script de migração:", err)
	}

	fmt.Println("Executando migração...")

	// Executar o script
	_, err = db.Exec(string(sqlScript))
	if err != nil {
		log.Fatal("Erro ao executar migração:", err)
	}

	fmt.Println("Migração executada com sucesso!")
	fmt.Println("As tabelas foram corrigidas para corresponder ao modelo Go.")
} 