# NGINX API Gateway
Routes all traffic.
* `nginx.conf`: Configuration for routes.
* `Dockerfile`: Builds the NGINX image.

## How to use
1. Runs automatically via docker compose.
2. Proxy routes `/api/*` to microservices and `/` to frontend.

┌─────────────────────────────────────────────┐
│ SUMMARY                                     │
│ Service: nginx                              │
│ Port: 8080                                  │
│ Job: Reverse proxy for all services         │
│ Talks to: All microservices + frontend      │
└─────────────────────────────────────────────┘
