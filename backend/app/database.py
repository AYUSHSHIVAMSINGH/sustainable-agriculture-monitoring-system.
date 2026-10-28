"""SQLite Database Management Module.

Sustainable Agriculture Monitoring System
Operating Systems PBL - NIET

This module uses Python's built-in sqlite3 library to manage database
connections and schema initialization without external ORM dependencies.
"""

import os
import sqlite3
from typing import Generator
from contextlib import contextmanager

# Determine the absolute path to the backend directory and database file
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BACKEND_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "agriculture.db")


def ensure_data_directory() -> None:
    """Ensure that the data/ directory exists before creating or accessing the database."""
    os.makedirs(DATA_DIR, exist_ok=True)


def get_db_connection() -> sqlite3.Connection:
    """Create and return a new SQLite database connection.
    
    row_factory is set to sqlite3.Row so query results can be accessed like dictionaries.
    """
    ensure_data_directory()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    # Enable Write-Ahead Logging (WAL) for better concurrent read/write performance
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Context manager for SQLite database operations.
    
    Ensures transactions are committed on success, rolled back on error,
    and connections are always properly closed.
    """
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    """Initialize the SQLite database and create required tables if they don't exist."""
    ensure_data_directory()
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Create the sensor_readings table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS sensor_readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                soil_moisture_pct REAL NOT NULL,
                temperature_c REAL NOT NULL,
                humidity_pct REAL NOT NULL,
                source TEXT NOT NULL,
                recorded_at TEXT NOT NULL
            );
            """
        )
        
        # Create an index for fast retrieval ordered by recorded timestamp
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded_at 
            ON sensor_readings (recorded_at DESC, id DESC);
            """
        )
