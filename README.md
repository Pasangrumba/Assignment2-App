# Assignment2-App — Mobile Web Component Coursework

## App Name & Description
Assignment2-App is a component-based mobile web application developed for Coursework 2 (Software Implementation) of the Mobile Web Component Development (CP70055E) module at the University of West London. The application implements a component-oriented architecture aligned with Coursework 1 (Component Model), separating concerns across frontend, backend services, and data persistence. It supports secure user access and a workflow for managing knowledge assets through reusable UI and backend modules.

## Key Features
- User authentication with registration and login flows
- Component-based separation between UI, services, and data access
- REST API communication between frontend and backend
- Knowledge asset submission with metadata tagging
- Governance workflow for asset review and management

## Technology Stack
- Frontend: React (mobile-first UI)
- Backend: Node.js + Express
- Database: SQLite (`mwcd_coursework2.db`)
- Security libraries: bcrypt, JSON Web Tokens (JWT)

## Project Structure (Brief)
- `frontend/`: React client implementing mobile-first, component-based UI
- `backend/`: Express server exposing REST endpoints and structured into component-like modules (authentication, assets, governance, data access)

## How to Run Locally
Backend:
1. `cd backend`
2. `npm install`
3. `npm start`
4. API runs on `http://localhost:5000`

Frontend:
1. `cd frontend`
2. `npm install`
3. `npm start`
4. UI runs on `http://localhost:3000`

## Environment / Setup Notes
- No environment variables are required for the default setup.
- Ensure SQLite is available via the bundled `mwcd_coursework2.db` file in the backend directory.

## Screenshots
Screenshots are provided in the coursework report.
