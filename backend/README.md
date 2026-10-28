# Backend - Sustainable Agriculture Monitoring System

This directory houses the Python FastAPI backend service and local SQLite database.

---

## Directory Layout
```text
backend/
├── app/
│   ├── __init__.py       # Marks app as a Python module
│   ├── database.py       # SQLite connection manager & schema initialization
│   ├── schemas.py        # Pydantic request & response validation schemas
│   └── main.py           # FastAPI application endpoints & lifespan handlers
├── data/
│   └── agriculture.db    # SQLite database file (created automatically)
├── requirements.txt      # Python dependencies (FastAPI, Uvicorn)
└── README.md             # Backend setup and execution instructions
```

---

## Setup & Running Instructions

### Step 1: Open a terminal inside the `backend` folder
```powershell
cd "C:\Users\Ayush Shivam Singh\.gemini\antigravity\scratch\sustainable-agri-monitor\backend"
```

### Step 2: Start the development server
Run using the virtual environment:
```powershell
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```

---

## Available API Endpoints & Swagger Testing

Open **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** in your web browser.

### 1. General & Health
* **`GET /`**: Project welcome message.
* **`GET /api/health`**: Real-time service health check.

### 2. Sensor Telemetry & Simulation Endpoints
* **`GET /api/sensors/latest`**:
  * Retrieves the single newest reading. If the database is empty, returns `reading: null` with an explanatory message.
* **`GET /api/sensors/readings`**:
  * Retrieves list of saved readings, ordered newest first.
  * Query parameter `limit`: (1 to 500, default: 50).
* **`POST /api/demo/generate-reading`**:
  * Creates and persists exactly ONE simulated reading in the database.
  * Explicitly marked with `source='simulation'`.
  * Optionally pass custom values in the request body (e.g. `{"soil_moisture_pct": 55.0, "temperature_c": 23.5, "humidity_pct": 60.0}`) or leave body empty (`{}`) to automatically generate realistic agricultural parameters.
  * Strict validation rejects out-of-range values with HTTP 422.
