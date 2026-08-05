use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PersonalSpec {
    pub id: i64,
    pub full_name: Option<String>,
    pub accounts: Vec<PersonalSpecAccount>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PersonalSpecAccount {
    pub id: i64,
    pub personal_spec_id: i64,
    pub platform: String,
    pub identifier: String,
    pub kind: AccountKind,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AccountKind {
    Username,
    Email,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn personal_spec_round_trips_through_json() {
        let spec = PersonalSpec {
            id: 1,
            full_name: Some("Ada Lovelace".to_string()),
            accounts: vec![PersonalSpecAccount {
                id: 1,
                personal_spec_id: 1,
                platform: "github".to_string(),
                identifier: "ada".to_string(),
                kind: AccountKind::Username,
            }],
            created_at: "2026-08-04T00:00:00Z".to_string(),
            updated_at: "2026-08-04T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&spec).unwrap();
        let parsed: PersonalSpec = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed, spec);
        assert!(json.contains("\"kind\":\"username\""));
    }
}
