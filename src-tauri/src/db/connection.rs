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
    conn.pragma_update(None, "foreign_keys", "ON")?;
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

    #[test]
    fn cascade_delete_works_when_foreign_keys_enabled() {
        let dir = tempdir().unwrap();
        let path = dir.path().join("test.db");
        let provider = StaticKeyProvider("test-key".to_string());
        let conn = init_db(&path, &provider).unwrap();

        // Insert a personal_spec
        conn.execute(
            "INSERT INTO personal_spec (full_name) VALUES (?1)",
            ["Test User"],
        )
        .unwrap();
        let spec_id: i64 = conn
            .query_row("SELECT id FROM personal_spec ORDER BY id DESC LIMIT 1", [], |row| {
                row.get(0)
            })
            .unwrap();

        // Insert a linked personal_spec_account
        conn.execute(
            "INSERT INTO personal_spec_accounts (personal_spec_id, platform, identifier, kind) VALUES (?1, ?2, ?3, ?4)",
            [spec_id.to_string(), "github".to_string(), "user123".to_string(), "username".to_string()],
        )
        .unwrap();

        // Verify the account exists
        let account_count: i64 = conn
            .query_row(
                "SELECT count(*) FROM personal_spec_accounts WHERE personal_spec_id = ?1",
                [spec_id],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(account_count, 1, "account should exist before delete");

        // Delete the personal_spec (should cascade delete accounts)
        conn.execute("DELETE FROM personal_spec WHERE id = ?1", [spec_id])
            .unwrap();

        // Verify the account is gone (cascade delete worked)
        let account_count_after: i64 = conn
            .query_row(
                "SELECT count(*) FROM personal_spec_accounts WHERE personal_spec_id = ?1",
                [spec_id],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(
            account_count_after, 0,
            "account should be cascade-deleted when parent personal_spec is deleted"
        );
    }
}
