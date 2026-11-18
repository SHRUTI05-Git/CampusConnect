# CampusConnect – Smart Campus Collaboration Platform

A MERN-stack starter application for students, faculty, and administrators.

## Included
- JWT registration/login with `student`, `faculty`, and `admin` roles
- Role-aware dashboard and navigation
- Notes/resource sharing (create, list, delete own/admin)
- Events (faculty/admin can create; students can register)
- Discussion posts (create, list, delete own/admin)
- Student profile details (department, year, interests)
- Responsive React UI
- Express REST API + MongoDB/Mongoose

## Requirements
- Node.js 20+
- MongoDB Community Server or MongoDB Atlas
- VS Code

## Setup

### 1. Backend
Open a terminal in `server`:
```bash
npm install
```
Copy `.env.example` to `.env` and update `MONGO_URI` and `JWT_SECRET`.
```bash
npm run dev
```
Backend runs at `http://localhost:5000`.

### 2. Frontend
Open another terminal in `client`:
```bash
npm install
npm run dev
```
Open the URL printed by Vite (normally `http://localhost:5173`).

## Create an admin
Register normally, then update that user's `role` to `admin` in MongoDB:
```js
use campusconnect
db.users.updateOne({ email: "your-email@example.com" }, { $set: { role: "admin" } })
```
Log out and log in again to refresh the role in the JWT.

## Notes
- This is a working educational MVP, not a production deployment.
- File uploads are represented by resource URLs for this starter version. Add Cloudinary/S3 before accepting arbitrary files.
- Configure CORS and secrets securely before deployment.
