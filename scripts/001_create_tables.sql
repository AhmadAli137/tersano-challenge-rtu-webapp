-- Tersano RTU IoT Telemetry Database Schema

-- Telemetry table for sensor readings
CREATE TABLE IF NOT EXISTS telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  seq INTEGER NOT NULL,
  uptime_ms BIGINT,
  temperature_c NUMERIC(5,2),
  humidity_pct NUMERIC(5,2),
  pressure_hpa NUMERIC(7,2),
  battery_v NUMERIC(4,2),
  sensor_ok BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_telemetry_device_created 
  ON telemetry(device_id, created_at DESC);

-- Device commands table for control instructions
CREATE TABLE IF NOT EXISTS device_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  command JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commands_device_processed 
  ON device_commands(device_id, processed, created_at DESC);

-- Device status/events table
CREATE TABLE IF NOT EXISTS device_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  event TEXT NOT NULL,
  uptime_ms BIGINT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_device_created 
  ON device_status(device_id, created_at DESC);
