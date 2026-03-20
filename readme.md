# Real-Time Collaborative Notes App


## User Interface -
<img width="1918" height="1064" alt="image" src="https://github.com/user-attachments/assets/e241fe58-4f13-4cab-84a4-7aec2f9cccdb" />




## Overview

This is a full stack MERN style application built using:

Frontend:
React + Tailwind

Backend:
Node + Express

Database:
SQLite

Features:
Realtime collaboration
JWT authentication
Role-based access
Activity tracking
Public sharing

## Architecture

The system uses REST APIs for CRUD operations and Socket.io for real-time collaboration.

## Database Schema

Tables used:

Users
Notes
Collaborators
Activity


## Setup Instructions

Backend:

cd backend
npm install
npm run dev

Frontend:

cd frontend
npm install
npm run dev


## Environment Variables

Backend (.env):

JWT_SECRET=secret123
PORT=5000

Frontend (.env):

VITE_API_URL=http://localhost:5000


## API Documentation

Authentication:

POST /api/auth/register
POST /api/auth/login

Notes:

GET /api/notes
POST /api/notes
PUT /api/notes/:id
DELETE /api/notes/:id

Collaboration:

POST /api/notes/:id/collaborator
GET /api/notes/:id/collaborators

Public:

GET /api/notes/public/:shareId


## Features

User Authentication
Role Based Access
Realtime Editing
Search Notes
Public Sharing
Activity Logging
Collaborators
