use std::path::{Path, PathBuf};

use tauri::{AppHandle, Manager};
use thiserror::Error;

use crate::db::{self, init_db, KeyProvider, OsKeyringKeyProvider};
use crate::models::personal_spec::{PersonalSpec, SavePersonalSpecInput};

#[tauri::command]
pub fn get_personal_spec(app: AppHandle) -> Result<Option<PersonalSpec>, String> {
    let path = db_path(&app)?;
    compute_get(&path, &OsKeyringKeyProvider).map_err(|e| {
        eprintln!("personal_spec: get failed: {e}");
        "Couldn't load Personal Spec".to_string()
    })
}

#[tauri::command]
pub fn save_personal_spec(
    app: AppHandle,
    input: SavePersonalSpecInput,
) -> Result<PersonalSpec, String> {
    let path = db_path(&app)?;
    compute_save(&path, &OsKeyringKeyProvider, &input).map_err(|e| {
        eprintln!("personal_spec: save failed: {e}");
        "Couldn't save Personal Spec".to_string()
    })
}

fn db_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("digital_guardian.db"))
}

#[derive(Debug, Error)]
enum SaveError {
    #[error(transparent)]
    Db(#[from] db::DbError),
    #[error(transparent)]
    PersonalSpec(#[from] db::PersonalSpecError),
}

fn compute_get(
    path: &Path,
    key_provider: &dyn KeyProvider,
) -> Result<Option<PersonalSpec>, db::DbError> {
    let conn = init_db(path, key_provider)?;
    Ok(db::get_personal_spec(&conn)?)
}

fn compute_save(
    path: &Path,
    key_provider: &dyn KeyProvider,
    input: &SavePersonalSpecInput,
) -> Result<PersonalSpec, SaveError> {
    let mut conn = init_db(path, key_provider)?;
    Ok(db::upsert_personal_spec(&mut conn, input)?)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::key::StaticKeyProvider;
    use crate::models::personal_spec::{AccountKind, PersonalSpecAccountInput};
    use tempfile::tempdir;

    fn sample_input() -> SavePersonalSpecInput {
        SavePersonalSpecInput {
            full_name: "Ada Lovelace".to_string(),
            accounts: vec![PersonalSpecAccountInput {
                platform: "GitHub".to_string(),
                identifier: "ada".to_string(),
                kind: AccountKind::Username,
            }],
        }
    }

    #[test]
    fn compute_get_returns_none_on_fresh_db() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("test.db");
        let provider = StaticKeyProvider("test-key".to_string());

        let result = compute_get(&path, &provider).unwrap();
        assert_eq!(result, None);
    }

    #[test]
    fn compute_save_then_get_round_trips() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("test.db");
        let provider = StaticKeyProvider("test-key".to_string());

        let saved = compute_save(&path, &provider, &sample_input()).unwrap();
        assert_eq!(saved.full_name.as_deref(), Some("Ada Lovelace"));

        let fetched = compute_get(&path, &provider).unwrap();
        assert_eq!(fetched, Some(saved));
    }

    #[test]
    fn compute_save_rejects_invalid_input() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("test.db");
        let provider = StaticKeyProvider("test-key".to_string());

        let input = SavePersonalSpecInput {
            full_name: "".to_string(),
            accounts: vec![],
        };
        assert!(compute_save(&path, &provider, &input).is_err());
    }
}
