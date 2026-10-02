# Diary API

A REST API for personal diary entries with JWT authentication, built with Node.js, Express and SQLite.

## Technologies

- Node.js
- Express
- better-sqlite3
- jsonwebtoken
- bcrypt

## How to run

1. Clone the repository
2. Install dependencies:
```bash
   npm install
```
3. Start the server:
```bash
   node server.js
```
4. Server will be running at `http://localhost:3000`

## Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /register | Register a new user |
| POST | /login | Login and get JWT token |
| POST | /entries | Create a diary entry (auth required) |
| GET | /entries | List user's entries (auth required) |
| DELETE | /entries/:id | Delete an entry (auth required) |