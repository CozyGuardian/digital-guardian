use rusqlite::{Connection, OptionalExtension};
use thiserror::Error;

use crate::models::personal_spec::{
    AccountKind, PersonalSpec, PersonalSpecAccount, SavePersonalSpecInput,
};

#[derive(Debug, Error)]
pub enum PersonalSpecError {
    #[error("validation error: {0}")]
    Validation(String),
    #[error("sqlite error: {0}")]
    Sqlite(#[from] rusqlite::Error),
}

pub fn get_personal_spec(conn: &Connection) -> rusqlite::Result<Option<PersonalSpec>> {
    let spec = conn
        .query_row(
            "SELECT id, full_name, created_at, updated_at FROM personal_spec ORDER BY id LIMIT 1",
            [],
            |row| {
                Ok(PersonalSpec {
                    id: row.get(0)?,
                    full_name: row.get(1)?,
                    accounts: Vec::new(),
                    created_at: row.get(2)?,
                    updated_at: row.get(3)?,
                })
            },
        )
        .optional()?;

    let Some(mut spec) = spec else {
        return Ok(None);
    };

    let mut stmt = conn.prepare(
        "SELECT id, personal_spec_id, platform, identifier, kind \
         FROM personal_spec_accounts WHERE personal_spec_id = ?1 ORDER BY id",
    )?;
    let accounts = stmt
        .query_map([spec.id], |row| {
            let kind: String = row.get(4)?;
            Ok(PersonalSpecAccount {
                id: row.get(0)?,
                personal_spec_id: row.get(1)?,
                platform: row.get(2)?,
                identifier: row.get(3)?,
                kind: parse_kind(&kind),
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    spec.accounts = accounts;
    Ok(Some(spec))
}

pub fn upsert_personal_spec(
    conn: &mut Connection,
    input: &SavePersonalSpecInput,
) -> Result<PersonalSpec, PersonalSpecError> {
    validate_input(input)?;

    let tx = conn.transaction()?;

    let existing_id: Option<i64> = tx
        .query_row("SELECT id FROM personal_spec ORDER BY id LIMIT 1", [], |row| {
            row.get(0)
        })
        .optional()?;

    let spec_id = match existing_id {
        Some(id) => {
            tx.execute(
                "UPDATE personal_spec SET full_name = ?1, updated_at = datetime('now') WHERE id = ?2",
                rusqlite::params![input.full_name, id],
            )?;
            id
        }
        None => {
            tx.execute(
                "INSERT INTO personal_spec (full_name) VALUES (?1)",
                rusqlite::params![input.full_name],
            )?;
            tx.last_insert_rowid()
        }
    };

    tx.execute(
        "DELETE FROM personal_spec_accounts WHERE personal_spec_id = ?1",
        rusqlite::params![spec_id],
    )?;

    for account in &input.accounts {
        tx.execute(
            "INSERT INTO personal_spec_accounts (personal_spec_id, platform, identifier, kind) \
             VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![spec_id, account.platform, account.identifier, kind_str(account.kind)],
        )?;
    }

    tx.commit()?;

    get_personal_spec(conn)?.ok_or_else(|| {
        PersonalSpecError::Sqlite(rusqlite::Error::QueryReturnedNoRows)
    })
}

fn validate_input(input: &SavePersonalSpecInput) -> Result<(), PersonalSpecError> {
    if input.full_name.trim().is_empty() {
        return Err(PersonalSpecError::Validation(
            "full_name is required".to_string(),
        ));
    }
    if input.accounts.is_empty() {
        return Err(PersonalSpecError::Validation(
            "at least one account is required".to_string(),
        ));
    }
    for account in &input.accounts {
        if account.identifier.trim().is_empty() {
            return Err(PersonalSpecError::Validation(
                "identifier is required".to_string(),
            ));
        }
    }
    Ok(())
}

fn kind_str(kind: AccountKind) -> &'static str {
    match kind {
        AccountKind::Username => "username",
        AccountKind::Email => "email",
    }
}

fn parse_kind(s: &str) -> AccountKind {
    match s {
        "username" => AccountKind::Username,
        _ => AccountKind::Email,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::migrations::migrations;
    use crate::models::personal_spec::{AccountKind, PersonalSpecAccountInput, SavePersonalSpecInput};
    use rusqlite::Connection;

    fn test_conn() -> Connection {
        let mut conn = Connection::open_in_memory().unwrap();
        migrations().to_latest(&mut conn).unwrap();
        conn
    }

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
    fn get_personal_spec_returns_none_on_empty_db() {
        let conn = test_conn();
        assert_eq!(get_personal_spec(&conn).unwrap(), None);
    }

    #[test]
    fn upsert_inserts_new_spec_with_accounts() {
        let mut conn = test_conn();
        let spec = upsert_personal_spec(&mut conn, &sample_input()).unwrap();
        assert_eq!(spec.full_name.as_deref(), Some("Ada Lovelace"));
        assert_eq!(spec.accounts.len(), 1);
        assert_eq!(spec.accounts[0].platform, "GitHub");
        assert_eq!(spec.accounts[0].kind, AccountKind::Username);
    }

    #[test]
    fn upsert_twice_replaces_accounts_and_keeps_single_row() {
        let mut conn = test_conn();
        let first = upsert_personal_spec(&mut conn, &sample_input()).unwrap();

        let second_input = SavePersonalSpecInput {
            full_name: "Ada L.".to_string(),
            accounts: vec![PersonalSpecAccountInput {
                platform: "email".to_string(),
                identifier: "ada@example.com".to_string(),
                kind: AccountKind::Email,
            }],
        };
        let second = upsert_personal_spec(&mut conn, &second_input).unwrap();

        assert_eq!(second.id, first.id, "must stay a single row");
        assert_eq!(second.accounts.len(), 1);
        assert_eq!(second.accounts[0].identifier, "ada@example.com");
        assert_eq!(second.accounts[0].kind, AccountKind::Email);
    }

    #[test]
    fn upsert_rejects_empty_full_name() {
        let mut conn = test_conn();
        let input = SavePersonalSpecInput {
            full_name: "   ".to_string(),
            ..sample_input()
        };
        assert!(matches!(
            upsert_personal_spec(&mut conn, &input),
            Err(PersonalSpecError::Validation(_))
        ));
    }

    #[test]
    fn upsert_rejects_empty_accounts() {
        let mut conn = test_conn();
        let input = SavePersonalSpecInput {
            full_name: "Ada".to_string(),
            accounts: vec![],
        };
        assert!(matches!(
            upsert_personal_spec(&mut conn, &input),
            Err(PersonalSpecError::Validation(_))
        ));
    }

    #[test]
    fn upsert_rejects_empty_identifier() {
        let mut conn = test_conn();
        let input = SavePersonalSpecInput {
            full_name: "Ada".to_string(),
            accounts: vec![PersonalSpecAccountInput {
                platform: "GitHub".to_string(),
                identifier: "  ".to_string(),
                kind: AccountKind::Username,
            }],
        };
        assert!(matches!(
            upsert_personal_spec(&mut conn, &input),
            Err(PersonalSpecError::Validation(_))
        ));
    }
}
