use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct AiSummary {
    pub id: i64,
    pub scan_id: i64,
    pub summary_text: String,
    pub action_items: Vec<String>,
    pub created_at: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ai_summary_round_trips_through_json() {
        let summary = AiSummary {
            id: 1,
            scan_id: 1,
            summary_text: "2 accounts need attention.".to_string(),
            action_items: vec!["Review unexpected Instagram account".to_string()],
            created_at: "2026-08-04T00:00:00Z".to_string(),
        };
        let json = serde_json::to_string(&summary).unwrap();
        let parsed: AiSummary = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed, summary);
    }
}
