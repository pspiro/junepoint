---
description: Start the full application stack locally — database, backend API, and frontend dev server
---

- Check the project structure and config docs to determine what services need to run and on which ports
- Ensure the database engine is running; start it if it is not
- Ensure the application database exists; create and migrate it if it does not
- Kill any existing processes occupying the required ports before starting new ones
- Confirm required `.env` files exist; create them from `.env.example` if missing
- Start the backend server in a background process
- Confirm the backend server is reachable and report any errors
- Start the frontend server in a background process with the --open command so the browser will open to the frontend URL

