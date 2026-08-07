#[cfg(all(feature = "bundled", feature = "lite"))]
compile_error!("features `bundled` and `lite` are mutually exclusive");
#[cfg(not(any(feature = "bundled", feature = "lite")))]
compile_error!("exactly one of `bundled` or `lite` must be enabled");

mod commands;
pub mod db;
pub mod models;

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            build_variant,
            commands::db_status,
            commands::get_personal_spec,
            commands::save_personal_spec
        ])
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
