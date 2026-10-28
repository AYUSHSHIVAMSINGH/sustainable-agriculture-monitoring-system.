"""Main FastAPI application entry point.

Sustainable Agriculture Monitoring System
Operating Systems PBL - NIET

Phase 3: SQLite persistence, sensor data models, and simulated demo reading generation.
"""

import random
from datetime import datetime, timezone
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db, get_db
from app.schemas import (
    SensorReading,
    GenerateReadingRequest,
    ReadingsListResponse,
    LatestReadingResponse,
    GenerateReadingResponse,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler to perform startup and shutdown tasks.
    
    Initializes the SQLite database and ensures the sensor_readings table exists
    when the FastAPI server starts up.
    """
    init_db()
    yield


# Initialize the FastAPI application with lifespan management
app = FastAPI(
    title="Sustainable Agriculture Monitoring System API",
    description=(
        "Backend API for monitoring farm environmental telemetry, irrigation, "
        "and demonstrating core Operating System principles (PBL at NIET)."
    ),
    version="1.1.0",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS)
# Allows production frontend and local Vite development origins
allowed_origins = [
    "https://sustainable-agriculture-monitoring.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Phase 1 & 2: General & Health Endpoints
# ==========================================

@app.get("/", tags=["General"])
def read_root():
    """Root endpoint providing a welcoming message and basic project information."""
    return {
        "project": "Sustainable Agriculture Monitoring System",
        "course": "Operating Systems PBL - NIET",
        "message": "Welcome to the Sustainable Agriculture Monitoring System API!",
        "status": "online",
        "version": "1.1.0",
    }


@app.get("/api/health", tags=["Monitoring"])
def check_health():
    """Health check endpoint to verify that the backend API service is running."""
    return {
        "status": "healthy",
        "service": "agriculture-monitoring-backend",
        "environment": "development",
    }


# ==========================================
# Phase 3: Sensor Telemetry & Demo Endpoints
# ==========================================

@app.get(
    "/api/sensors/readings",
    response_model=ReadingsListResponse,
    tags=["Sensors"],
    summary="Retrieve saved sensor readings",
)
def get_sensor_readings(
    limit: int = Query(
        default=50,
        ge=1,
        le=500,
        description="Maximum number of historical records to retrieve (1 to 500).",
    )
):
    """Retrieve saved sensor readings from the SQLite database, ordered newest first.
    
    Uses parameterized SQL queries and manages the connection lifecycle automatically.
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, soil_moisture_pct, temperature_c, humidity_pct, source, recorded_at
                FROM sensor_readings
                ORDER BY recorded_at DESC, id DESC
                LIMIT ?;
                """,
                (limit,),
            )
            rows = cursor.fetchall()
            readings = [dict(row) for row in rows]

        return ReadingsListResponse(count=len(readings), readings=readings)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP(500),
            detail=f"Database query error while retrieving sensor readings: {str(e)}",
        )


@app.get(
    "/api/sensors/latest",
    response_model=LatestReadingResponse,
    tags=["Sensors"],
    summary="Retrieve the most recent sensor reading",
)
def get_latest_sensor_reading():
    """Retrieve the single most recent sensor reading from the database.
    
    If the database is currently empty, returns a clear empty result with an informative message.
    """
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, soil_moisture_pct, temperature_c, humidity_pct, source, recorded_at
                FROM sensor_readings
                ORDER BY recorded_at DESC, id DESC
                LIMIT 1;
                """
            )
            row = cursor.fetchone()

        if row is None:
            return LatestReadingResponse(
                reading=None,
                message="No sensor readings available yet. Generate one using POST /api/demo/generate-reading.",
            )

        return LatestReadingResponse(
            reading=dict(row),
            message="Latest sensor reading retrieved successfully.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while retrieving the latest reading: {str(e)}",
        )


@app.post(
    "/api/demo/generate-reading",
    response_model=GenerateReadingResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Demo Simulation"],
    summary="Create and persist ONE simulated agricultural reading",
)
def generate_simulated_reading(payload: Optional[GenerateReadingRequest] = None):
    """Generate and store exactly ONE simulated agricultural sensor reading.
    
    - Can accept optional manual override values in the request body for testing validation.
    - If values are omitted, realistic agricultural sensor values are randomly generated:
      * Soil moisture: 35.0% - 75.0%
      * Ambient temperature: 18.0°C - 32.0°C
      * Relative humidity: 45.0% - 85.0%
    - Explicitly marks the record with source='simulation'.
    - Stores the timestamp in standard UTC ISO 8601 format.
    """
    # 1. Determine values (use provided or generate realistic simulated ranges)
    if payload and payload.soil_moisture_pct is not None:
        moisture = round(float(payload.soil_moisture_pct), 2)
    else:
        moisture = round(random.uniform(35.0, 75.0), 2)

    if payload and payload.temperature_c is not None:
        temperature = round(float(payload.temperature_c), 2)
    else:
        temperature = round(random.uniform(18.0, 32.0), 2)

    if payload and payload.humidity_pct is not None:
        humidity = round(float(payload.humidity_pct), 2)
    else:
        humidity = round(random.uniform(45.0, 85.0), 2)

    # 2. Strict range validation guard
    if not (0.0 <= moisture <= 100.0):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Soil moisture percentage must be between 0.0 and 100.0.",
        )
    if not (-20.0 <= temperature <= 60.0):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Temperature must be within the reasonable range of -20.0°C to 60.0°C.",
        )
    if not (0.0 <= humidity <= 100.0):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Relative humidity percentage must be between 0.0 and 100.0.",
        )

    # 3. Create ISO 8601 UTC timestamp and explicit source
    recorded_at = datetime.now(timezone.utc).isoformat()
    source_label = "simulation"

    # 4. Insert into SQLite database using parameterized query
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO sensor_readings (
                    soil_moisture_pct,
                    temperature_c,
                    humidity_pct,
                    source,
                    recorded_at
                ) VALUES (?, ?, ?, ?, ?);
                """,
                (moisture, temperature, humidity, source_label, recorded_at),
            )
            inserted_id = cursor.lastrowid

            cursor.execute(
                """
                SELECT id, soil_moisture_pct, temperature_c, humidity_pct, source, recorded_at
                FROM sensor_readings
                WHERE id = ?;
                """,
                (inserted_id,),
            )
            row = cursor.fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve record after insertion.",
            )

        saved_reading = dict(row)

        return GenerateReadingResponse(
            message="Simulated sensor reading generated and saved successfully.",
            notice=(
                "SIMULATION NOTICE: This reading was generated algorithmically for "
                "Operating Systems PBL demonstration and testing. It does NOT come from physical hardware."
            ),
            reading=saved_reading,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error while saving simulated reading: {str(e)}",
        )
