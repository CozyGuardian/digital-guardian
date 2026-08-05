use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Finding {
    pub id: i64,
    pub scan_id: i64,
    pub site: String,
    pub identifier: String,
    pub found: bool,
    pub classification: FindingClassification,
    pub url: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FindingClassification {
    Expected,
    Unexpected,
    Missing,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn finding_round_trips_through_json() {
        let finding = Finding {
            id: 1,
            scan_id: 1,
            site: "github.com".to_string(),
            identifier: "ada".to_string(),
            found: true,
            classification: FindingClassification::Expected,
            url: Some("https://github.com/ada".to_string()),
        };
        let json = serde_json::to_string(&finding).unwrap();
        let parsed: Finding = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed, finding);
    }
}
