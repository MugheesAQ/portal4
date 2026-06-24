# Frontend App
React SPA for Citizen Portal.
* `src/`: React components and pages.
* `Dockerfile`: Multi-stage build serving dist via Nginx.

## How to run
1. `cd frontend`
2. `npm install`
3. `npm run dev`

┌─────────────────────────────────────────────┐
│ SUMMARY                                     │
│ Service: frontend                           │
│ Port: 3000                                  │
│ Job: User interface                         │
│ Talks to: Gateway (nginx on 8080)           │
└─────────────────────────────────────────────┘
