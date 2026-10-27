# HHC Portal - React & .NET Architecture PoC

This repository contains the Proof of Concept (PoC) for the modernization of the Home Health Care (HHC) Portal. It validates the transition from legacy ASP.NET Web Forms / DevExpress to a modern **React (Vite)** frontend and a **.NET (C#) Web API** backend.

## 🎯 Architecture Objectives Validated
* **Performance:** Shifted rendering from server-side postbacks to client-side Virtual DOM, eliminating UI freezing during heavy clinical data loads.
* **Multi-Tenancy:** Secure data isolation via HTTP-only cookies. The backend dynamically routes to tenant SQL databases based on the `AgencyId` claim.
* **Security:** Client-side HIPAA inactivity lock utilizing `localStorage` to persist locked states across browser refreshes.
* **Modern UI:** Implemented responsive React-Bootstrap components, enterprise master/detail views, and non-destructive soft-delete clinical workflows.

---

## 📁 Repository Structure
* `/backend` - The .NET Core Web API (C#) handling multi-tenant routing, authentication, and SQL Server EF Core interactions.
* `/reactapp` - The React Single Page Application (SPA) powered by Vite, React Router, and Axios.

---

## 🚀 Local Setup & Run Instructions

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [.NET SDK](https://dotnet.microsoft.com/) (Matching your project environment, e.g., .NET 8)
* SQL Server (LocalDB, Express, or configured instance)
* Git (for version control)

### 1. Repository Setup & Git Configuration
Before committing, you must ensure temporary files are ignored. Create a file named `.gitignore` in the root folder (next to this README) and paste this inside:

```text
# Backend (.NET / C#)
.vs/
bin/
obj/
*.user
appsettings.Development.json

# Frontend (Node / React / Vite)
node_modules/
dist/
.env

# OS
.DS_Store
```

### 2. Start the Backend (.NET)
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend/authbackend
   ```
2. Restore the NuGet packages:
   ```bash
   dotnet restore
   ```
3. Update the database connection strings in `appsettings.json` (or `appsettings.Development.json`) to point to your local SQL instance.
4. Run the API server:
   ```bash
   dotnet run
   ```
   *Important: Note the local port it starts on (e.g., `http://localhost:5000` or `https://localhost:7000`) and verify it matches the `baseURL` in the frontend's `api.ts` file.*

### 3. Start the Frontend (React)
1. Open a **new, separate terminal** and navigate to the frontend folder:
   ```bash
   cd reactapp
   ```
2. Install the required Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the provided `localhost` link (e.g., `http://localhost:5173` or `5175`) in your browser to view the application. 
   *Important: Ensure this exact frontend URL is allowed in the backend's `Program.cs` CORS policy.*

---

## 📦 Key Community Libraries Used
* **Axios:** Handles background API communication and automatic secure cookie transmission (`withCredentials: true`).
* **React Router DOM:** Enables instant client-side navigation without server round-trips and triggers local HIPAA lock routing.
* **React-Bootstrap:** Provides responsive layout grids and form controls as a lightweight alternative to legacy DevExpress controls.
