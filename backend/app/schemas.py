"""Pydantic models and schemas for data validation and API documentation.

Sustainable Agriculture Monitoring System
Operating Systems PBL - NIET
"""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class SensorReading(BaseModel):
    """Schema representing an individual sensor reading from the database."""
    id: int = Field(..., description="Unique database identifier")
    soil_moisture_pct: float = Field(..., description="Soil moisture level as a percentage (0.0 to 100.0%)")
    temperature_c: float = Field(..., description="Ambient temperature in degrees Celsius")
    humidity_pct: float = Field(..., description="Relative air humidity as a percentage (0.0 to 100.0%)")
    source: str = Field(..., description="Source of reading ('simulation' or hardware identifier)")
    recorded_at: str = Field(..., description="ISO 8601 formatted timestamp of when reading was recorded")

    class Config:
        from_attributes = True


class GenerateReadingRequest(BaseModel):
    """Optional payload to generate a simulated sensor reading with custom or random values."""
    soil_moisture_pct: Optional[float] = Field(
        default=None,
        description="Optional soil moisture percentage (0.0 - 100.0). If omitted, a realistic value is simulated."
    )
    temperature_c: Optional[float] = Field(
        default=None,
        description="Optional temperature in Celsius (-20.0 - 60.0). If omitted, a realistic value is simulated."
    )
    humidity_pct: Optional[float] = Field(
        default=None,
        description="Optional relative humidity percentage (0.0 - 100.0). If omitted, a realistic value is simulated."
    )

    @field_validator("soil_moisture_pct")
    @classmethod
    def validate_moisture(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (0.0 <= v <= 100.0):
            raise ValueError("soil_moisture_pct must be between 0.0 and 100.0 percent")
        return v

    @field_validator("humidity_pct")
    @classmethod
    def validate_humidity(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (0.0 <= v <= 100.0):
            raise ValueError("humidity_pct must be between 0.0 and 100.0 percent")
        return v

    @field_validator("temperature_c")
    @classmethod
    def validate_temperature(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (-20.0 <= v <= 60.0):
            raise ValueError("temperature_c must be between -20.0 and 60.0 degrees Celsius")
        return v


class ReadingsListResponse(BaseModel):
    """Response schema for listing historical sensor readings."""
    count: int = Field(..., description="Number of readings returned in this query")
    readings: List[SensorReading] = Field(..., description="List of sensor readings sorted newest first")


class LatestReadingResponse(BaseModel):
    """Response schema for retrieving the single latest sensor reading."""
    reading: Optional[SensorReading] = Field(default=None, description="The most recent sensor reading, or null")
    message: Optional[str] = Field(default=None, description="Status or information message if no data exists")


class GenerateReadingResponse(BaseModel):
    """Response schema after generating a single simulated reading."""
    message: str = Field(..., description="Result message")
    notice: str = Field(..., description="Educational disclaimer indicating simulated origin")
    reading: SensorReading = Field(..., description="The newly saved sensor reading record")
