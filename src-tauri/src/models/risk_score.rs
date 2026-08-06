use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct RiskScore {
    pub id: i64,
    pub finding_id: i64,
    pub level: RiskLevel,
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RiskLevel {
    Safe,
    Watch,
    AtRisk,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn risk_score_round_trips_through_json() {
        let score = RiskScore {
            id: 1,
            finding_id: 1,
            level: RiskLevel::AtRisk,
            reason: Some("account not in Personal Spec".to_string()),
        };
        let json = serde_json::to_string(&score).unwrap();
        let parsed: RiskScore = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed, score);
        assert!(json.contains("\"level\":\"at_risk\""));
    }
}
