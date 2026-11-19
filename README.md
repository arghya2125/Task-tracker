# Task Tracker

Node.js + Express + TypeScript API, React + TypeScript (Vite) frontend, MySQL database.

## Setup

1. Create the database and table:
   mysql -u root -p < schema.sql

2. Start the API (port 4000):
   cd server
   cp .env.example .env      # then set DB_PASSWORD
   npm install
   npm run dev

3. Start the frontend (port 5173), in a second terminal:
   cd client
   npm install
   npm run dev

Open http://localhost:5173

## API

GET    /api/tasks              list tasks
POST   /api/tasks              create  { "title": "..." }
PATCH  /api/tasks/:id/toggle   mark done / not done
DELETE /api/tasks/:id          delete
