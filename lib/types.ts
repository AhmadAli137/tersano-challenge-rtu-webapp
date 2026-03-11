export interface TelemetryRow {
  id: string
  device_id: string
  seq: number
  uptime_ms: number | null
  temperature_c: number | null
  humidity_pct: number | null
  pressure_hpa: number | null
  battery_v: number | null
  sensor_ok: boolean
  created_at: string
}

export interface DeviceCommand {
  id: string
  device_id: string
  command: CommandPayload
  processed: boolean
  created_at: string
}

export interface CommandPayload {
  type: 'set_sampling_interval' | 'set_buzzer' | 'custom'
  sampling_interval_ms?: number
  buzzer_on?: boolean
  buzzer_frequency?: number
  [key: string]: unknown
}

export interface DeviceStatus {
  id: string
  device_id: string
  event: string
  uptime_ms: number | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// Alias for DeviceStatus used in events
export type DeviceEvent = DeviceStatus

export type TimeRange = '15m' | '1h' | '6h' | '24h'

export interface DeviceInfo {
  id: string
  name: string
  isOnline: boolean
  lastSeen: string | null
}

export type SamplingMode = 'normal' | 'low-sample' | 'no-signal'
