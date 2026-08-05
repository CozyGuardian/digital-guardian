use rusqlite_migration::{Migrations, M};

pub fn migrations() -> Migrations<'static> {
    Migrations::new(vec![M::up(include_str!("../../migrations/0001_initial.sql"))])
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;

    const EXPECTED_TABLES: &[&str] = &[
        "personal_spec",
        "personal_spec_accounts",
        "scans",
        "findings",
        "risk_scores",
        "ai_summaries",
    ];

    #[test]
    fn migrations_create_all_core_tables() {
        let mut conn = Connection::open_in_memory().unwrap();
        migrations().to_latest(&mut conn).unwrap();

        for table in EXPECTED_TABLES {
            let count: i64 = conn
                .query_row(
                    "SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = ?1",
                    [table],
                    |row| row.get(0),
                )
                .unwrap();
            assert_eq!(count, 1, "expected table `{table}` to exist");
        }
    }

    #[test]
    fn migrations_validate_as_internally_consistent() {
        migrations().validate().unwrap();
    }
}
