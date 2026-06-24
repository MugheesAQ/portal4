# DESC Digital Innovation Center — Citizen Portal

A complete microservices-based Citizen Portal application.

## How to Start

1. Clone and enter the project
   `cd desc-citizen-portal`

2. Copy env file
   `cp .env.example .env`

3. Start everything
   `docker compose up --build`

4. Access the app
   - Citizen Portal:     http://localhost:8080
   - Grafana:            http://localhost:3030  (admin / admin)
   - Prometheus:         http://localhost:9090
   - Loki:               http://localhost:3100

5. Login as officer
   - Badge: OFF-001
   - Password: officer123

6. Login as citizen (Demo account)
   - CNIC: 42101-1234567-1
   - Password: citizen123
