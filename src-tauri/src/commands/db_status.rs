use serde::Serialize;
use tauri::{AppHandle, Manager};

use crate::db::{init_db, OsKeyringKeyProvider};

#[derive(Debug, Serialize)]
pub struct DbStatus {
    pub connected: bool,
    pub scan_count: i64,
}

#[tauri::command]
pub fn db_status(app: AppHandle) -> Result<DbStatus, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let path = dir.join("digital_guardian.db");
    compute_status(&path, &OsKeyringKeyProvider).map_err(|e| e.to_string())
}

fn compute_status(
    path: &std::path::Path,
    key_provider: &dyn crate::db::KeyProvider,
) -> Result<DbStatus, crate::db::DbError> {
    let conn = init_db(path, key_provider)?;
    let scan_count: i64 = conn.query_row("SELECT count(*) FROM scans", [], |row| row.get(0))?;
    Ok(DbStatus {
        connected: true,
        scan_count,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::key::StaticKeyProvider;
    use tempfile::tempdir;

    #[test]
    fn compute_status_reports_zero_scans_on_fresh_db() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("test.db");
        let provider = StaticKeyProvider("test-key".to_string());

        let status = compute_status(&path, &provider).unwrap();
        assert!(status.connected);
        assert_eq!(status.scan_count, 0);
    }
}
