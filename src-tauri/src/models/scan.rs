use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Scan {
    pub id: i64,
    pub started_at: String,
    pub completed_at: Option<String>,
    pub status: ScanStatus,
    pub config_snapshot: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ScanStatus {
    Running,
    Completed,
    Failed,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn scan_round_trips_through_json() {
        let scan = Scan {
            id: 1,
            started_at: "2026-08-04T00:00:00Z".to_string(),
            completed_at: None,
            status: ScanStatus::Running,
            config_snapshot: "{}".to_string(),
        };
        let json = serde_json::to_string(&scan).unwrap();
        let parsed: Scan = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed, scan);
    }
}
