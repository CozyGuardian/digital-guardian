mod commands;
mod db;
mod models;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![build_variant, commands::db_status])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn build_variant() -> &'static str {
    if cfg!(feature = "bundled") {
        "bundled"
    } else {
        "lite"
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_variant_matches_active_feature() {
        let variant = build_variant();
        #[cfg(feature = "bundled")]
        assert_eq!(variant, "bundled");
        #[cfg(not(feature = "bundled"))]
        assert_eq!(variant, "lite");
    }
}
