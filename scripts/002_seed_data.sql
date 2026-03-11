-- Seed sample telemetry data for testing
-- This creates realistic IoT sensor data for a device

-- Clear existing sample data (optional - comment out to keep existing data)
-- DELETE FROM telemetry WHERE device_id = 'tersano-rtu-001';
-- DELETE FROM device_status WHERE device_id = 'tersano-rtu-001';

-- Insert sample device events
INSERT INTO device_status (device_id, event, uptime_ms, metadata, created_at)
VALUES 
  ('tersano-rtu-001', 'boot', 0, '{"firmware": "1.2.3", "reason": "power_on"}', NOW() - INTERVAL '2 hours'),
  ('tersano-rtu-001', 'online', 1000, '{"ip": "192.168.1.100", "rssi": -45}', NOW() - INTERVAL '2 hours' + INTERVAL '1 second'),
  ('tersano-rtu-001', 'calibrated', 5000, '{"sensors": ["temp", "humidity", "pressure"]}', NOW() - INTERVAL '2 hours' + INTERVAL '5 seconds'),
  ('tersano-rtu-001', 'warning', 3600000, '{"type": "low_battery", "level": 3.2}', NOW() - INTERVAL '1 hour');

-- Generate telemetry readings every 30 seconds for the last 2 hours
INSERT INTO telemetry (device_id, seq, uptime_ms, temperature_c, humidity_pct, pressure_hpa, battery_v, sensor_ok, created_at)
SELECT 
  'tersano-rtu-001',
  row_number() OVER () AS seq,
  (row_number() OVER ()) * 30000 AS uptime_ms,
  -- Temperature varies between 20-26°C with some randomness
  ROUND((23 + 3 * SIN(row_number() OVER () * 0.1) + (RANDOM() - 0.5) * 2)::numeric, 2) AS temperature_c,
  -- Humidity varies between 40-60%
  ROUND((50 + 10 * COS(row_number() OVER () * 0.08) + (RANDOM() - 0.5) * 5)::numeric, 2) AS humidity_pct,
  -- Pressure varies around 1013 hPa
  ROUND((1013 + 5 * SIN(row_number() OVER () * 0.05) + (RANDOM() - 0.5) * 3)::numeric, 2) AS pressure_hpa,
  -- Battery slowly decreases from 4.2V to 3.3V
  ROUND((4.2 - (row_number() OVER ()) * 0.003 + (RANDOM() - 0.5) * 0.05)::numeric, 2) AS battery_v,
  -- Sensor is usually OK, occasionally false
  (RANDOM() > 0.02) AS sensor_ok,
  -- Timestamps spread over last 2 hours
  NOW() - INTERVAL '2 hours' + (row_number() OVER ()) * INTERVAL '30 seconds'
FROM generate_series(1, 240);
