# Use Go official image
FROM golang:1.24.1-alpine

# Set working directory
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN go build -o main cmd/server/main.go

# Expose port
EXPOSE 8080

# Run the application
CMD ["./main"] 