-- Add RLS policies for public access (IoT devices don't use auth)
-- This allows the dashboard to insert commands and read data

-- Enable RLS on tables (if not already enabled)
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_status ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read on telemetry" ON telemetry;
DROP POLICY IF EXISTS "Allow public insert on telemetry" ON telemetry;
DROP POLICY IF EXISTS "Allow public read on device_commands" ON device_commands;
DROP POLICY IF EXISTS "Allow public insert on device_commands" ON device_commands;
DROP POLICY IF EXISTS "Allow public update on device_commands" ON device_commands;
DROP POLICY IF EXISTS "Allow public read on device_status" ON device_status;
DROP POLICY IF EXISTS "Allow public insert on device_status" ON device_status;

-- Telemetry policies
CREATE POLICY "Allow public read on telemetry" ON telemetry
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on telemetry" ON telemetry
  FOR INSERT WITH CHECK (true);

-- Device commands policies
CREATE POLICY "Allow public read on device_commands" ON device_commands
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on device_commands" ON device_commands
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on device_commands" ON device_commands
  FOR UPDATE USING (true);

-- Device status policies
CREATE POLICY "Allow public read on device_status" ON device_status
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on device_status" ON device_status
  FOR INSERT WITH CHECK (true);
