import { invoke } from "@tauri-apps/api/core";

export interface DbStatus {
  connected: boolean;
  scan_count: number;
}

export async function dbStatus(): Promise<DbStatus> {
  return invoke<DbStatus>("db_status");
}
