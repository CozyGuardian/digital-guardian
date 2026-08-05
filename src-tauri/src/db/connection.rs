use std::path::Path;

use rusqlite::Connection;
use thiserror::Error;

use super::key::{KeyError, KeyProvider};
use super::migrations::migrations;

#[derive(Debug, Error)]
pub enum DbError {
    #[error("key error: {0}")]
    Key(#[from] KeyError),
    #[error("sqlite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("migration error: {0}")]
    Migration(#[from] rusqlite_migration::Error),
}

pub fn init_db(path: &Path, key_provider: &dyn KeyProvider) -> Result<Connection, DbError> {
    let key = key_provider.get_or_create_key()?;
    let mut conn = Connection::open(path)?;
    conn.pragma_update(None, "key", &key)?;
    migrations().to_latest(&mut conn)?;
    Ok(conn)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::key::StaticKeyProvider;
    use tempfile::tempdir;

    #[test]
    fn init_db_creates_encrypted_db_with_tables() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("test.db");
        let provider = StaticKeyProvider("correct-key".to_string());

        let conn = init_db(&path, &provider).unwrap();
        let count: i64 = conn
            .query_row(
                "SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'scans'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(count, 1);
    }

    #[test]
    fn wrong_key_cannot_read_existing_db() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("test.db");
        let right_key = StaticKeyProvider("correct-key".to_string());
        init_db(&path, &right_key).unwrap();
        drop(right_key);

        let wrong_key = StaticKeyProvider("wrong-key".to_string());
        let result = init_db(&path, &wrong_key);
        assert!(result.is_err(), "expected wrong key to fail opening the DB");
    }
}
