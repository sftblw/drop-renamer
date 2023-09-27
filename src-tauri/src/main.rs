// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

// use std::path::PathBuf;


// #[tauri::command]
// fn path_join(chunks: Vec<String>) -> Option<String> {
//     let mut path_buf = PathBuf::new();
//     path_buf.extend(chunks);

//     Some(std::fs::canonicalize(path_buf).ok()?.to_string_lossy().to_string())
// }

fn main() {
    tauri::Builder::default()
        // .invoke_handler(tauri::generate_handler![path_join])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
