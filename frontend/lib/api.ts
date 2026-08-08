import { invoke } from "@tauri-apps/api/core";

export interface DbStatus {
  connected: boolean;
  scan_count: number;
}

export async function dbStatus(): Promise<DbStatus> {
  return invoke<DbStatus>("db_status");
}

export type AccountKind = "username" | "email";

export interface PersonalSpecAccount {
  id: number;
  personal_spec_id: number;
  platform: string;
  identifier: string;
  kind: AccountKind;
}

export interface PersonalSpec {
  id: number;
  full_name: string | null;
  accounts: PersonalSpecAccount[];
  created_at: string;
  updated_at: string;
}

export interface PersonalSpecAccountInput {
  platform: string;
  identifier: string;
  kind: AccountKind;
}

export interface SavePersonalSpecInput {
  full_name: string;
  accounts: PersonalSpecAccountInput[];
}

export async function getPersonalSpec(): Promise<PersonalSpec | null> {
  return invoke<PersonalSpec | null>("get_personal_spec");
}

export async function savePersonalSpec(
  input: SavePersonalSpecInput,
): Promise<PersonalSpec> {
  return invoke<PersonalSpec>("save_personal_spec", { input });
}
