# Assignment2-App — Mobile Web Component Coursework

## App Name & Description
Assignment2-App is a component-based mobile web application developed for Coursework 2 (Software Implementation) of the Mobile Web Component Development (CP70055E) module at the University of West London. The application implements a component-oriented architecture aligned with Coursework 1 (Component Model), separating concerns across frontend, backend services, and data persistence. It supports secure user access and a workflow for managing knowledge assets through reusable UI and backend modules.

## Key Features
- User authentication with registration and login flows
- Component-based separation between UI, services, and data access
- REST API communication between frontend and backend
- Knowledge asset submission with metadata tagging
- Governance workflow for asset review and management
- Digital Knowledge Network (DKN) type model alignment with user profiles, expertise profiles, workspaces, versioned knowledge assets, recommendations, and integration events

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
3. `npm start` (defaults to port 5001 for local development to avoid macOS Control Center conflicts). You can also explicitly set the port: `PORT=5001 npm start`.
4. API runs on `http://localhost:5001` (or the port you set).
5. If the schema changes, run `node src/db/reset_db.js` to rebuild the SQLite database with the latest DKN tables and columns. You can also control the database file location via the `DB_PATH` environment variable if needed (example: `DB_PATH=backend/mwcd_coursework2.db node src/db/reset_db.js`).

Frontend environment:
- Local dev: create `frontend/.env.local` with `REACT_APP_API_BASE=http://127.0.0.1:5001/api` (ignored by git).
- Production build/deploy: `frontend/.env.production` points to `https://assignment2-app-ae32.onrender.com/api` for gh-pages.

Deploy to GitHub Pages:
1. `cd frontend`
2. `npm install` (first time)
3. `npm run deploy` (uses `.env.production`, builds, and publishes to `gh-pages`)
4. Push branches when network is available: `git push origin main` and `git push origin gh-pages`

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
