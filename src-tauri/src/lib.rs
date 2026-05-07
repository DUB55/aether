use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::command;
use sha2::{Sha256, Digest};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileOperationResult {
    success: bool,
    message: String,
    data: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandResult {
    success: bool,
    stdout: String,
    stderr: String,
    exit_code: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DirectoryItem {
    name: String,
    path: String,
    is_file: bool,
    size: Option<u64>,
}

#[command]
async fn write_file(path: String, content: String) -> Result<FileOperationResult, String> {
    match fs::write(&path, content) {
        Ok(_) => Ok(FileOperationResult {
            success: true,
            message: format!("File written successfully to {}", path),
            data: Some(serde_json::json!({ "path": path })),
        }),
        Err(e) => Ok(FileOperationResult {
            success: false,
            message: format!("Failed to write file: {}", e),
            data: None,
        }),
    }
}

#[command]
async fn read_file(path: String) -> Result<FileOperationResult, String> {
    match fs::read_to_string(&path) {
        Ok(content) => Ok(FileOperationResult {
            success: true,
            message: format!("File read successfully from {}", path),
            data: Some(serde_json::json!({ "content": content })),
        }),
        Err(e) => Ok(FileOperationResult {
            success: false,
            message: format!("Failed to read file: {}", e),
            data: None,
        }),
    }
}

#[command]
async fn manage_directory(action: String, path: String) -> Result<FileOperationResult, String> {
    match action.as_str() {
        "create" => {
            match fs::create_dir_all(&path) {
                Ok(_) => Ok(FileOperationResult {
                    success: true,
                    message: format!("Directory created successfully at {}", path),
                    data: Some(serde_json::json!({ "path": path })),
                }),
                Err(e) => Ok(FileOperationResult {
                    success: false,
                    message: format!("Failed to create directory: {}", e),
                    data: None,
                }),
            }
        }
        "delete" => {
            match fs::remove_dir_all(&path) {
                Ok(_) => Ok(FileOperationResult {
                    success: true,
                    message: format!("Directory deleted successfully at {}", path),
                    data: Some(serde_json::json!({ "path": path })),
                }),
                Err(e) => Ok(FileOperationResult {
                    success: false,
                    message: format!("Failed to delete directory: {}", e),
                    data: None,
                }),
            }
        }
        "list" => {
            match fs::read_dir(&path) {
                Ok(entries) => {
                    let items: Vec<DirectoryItem> = entries
                        .filter_map(|entry| entry.ok())
                        .map(|entry| {
                            let metadata = entry.metadata().ok();
                            DirectoryItem {
                                name: entry.file_name().to_string_lossy().to_string(),
                                path: entry.path().to_string_lossy().to_string(),
                                is_file: metadata.as_ref().map(|m| m.is_file()).unwrap_or(false),
                                size: metadata.map(|m| m.len()),
                            }
                        })
                        .collect();
                    
                    Ok(FileOperationResult {
                        success: true,
                        message: format!("Directory listed successfully: {}", path),
                        data: Some(serde_json::json!({ "items": items })),
                    })
                }
                Err(e) => Ok(FileOperationResult {
                    success: false,
                    message: format!("Failed to list directory: {}", e),
                    data: None,
                }),
            }
        }
        _ => Ok(FileOperationResult {
            success: false,
            message: format!("Invalid directory action: {}", action),
            data: None,
        }),
    }
}

#[command]
async fn execute_command(command: String, args: Option<Vec<String>>) -> Result<CommandResult, String> {
    use tokio::process::Command;
    
    let mut cmd = Command::new(if cfg!(target_os = "windows") {
        "powershell"
    } else {
        "sh"
    });
    
    if cfg!(target_os = "windows") {
        cmd.arg("-Command").arg(&command);
    } else {
        cmd.arg("-c").arg(&command);
    }
    
    if let Some(args) = args {
        cmd.args(args);
    }
    
    match cmd.output().await {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            let exit_code = output.status.code().unwrap_or(-1);
            
            Ok(CommandResult {
                success: output.status.success(),
                stdout,
                stderr,
                exit_code,
            })
        }
        Err(e) => Ok(CommandResult {
            success: false,
            stdout: String::new(),
            stderr: format!("Failed to execute command: {}", e),
            exit_code: -1,
        }),
    }
}

#[command]
async fn get_current_directory() -> Result<FileOperationResult, String> {
    match std::env::current_dir() {
        Ok(path) => Ok(FileOperationResult {
            success: true,
            message: "Current directory retrieved successfully".to_string(),
            data: Some(serde_json::json!({ "path": path.to_string_lossy() })),
        }),
        Err(e) => Ok(FileOperationResult {
            success: false,
            message: format!("Failed to get current directory: {}", e),
            data: None,
        }),
    }
}

#[command]
async fn set_current_directory(path: String) -> Result<FileOperationResult, String> {
    match std::env::set_current_dir(&path) {
        Ok(_) => Ok(FileOperationResult {
            success: true,
            message: format!("Changed directory to {}", path),
            data: Some(serde_json::json!({ "path": path })),
        }),
        Err(e) => Ok(FileOperationResult {
            success: false,
            message: format!("Failed to change directory: {}", e),
            data: None,
        }),
    }
}

#[command]
async fn open_directory_dialog(title: String) -> Result<FileOperationResult, String> {
    use tauri_plugin_dialog::{DialogExt, MessageDialogKind};
    
    // This will be handled by the frontend using the dialog plugin
    // For now, return a placeholder
    Ok(FileOperationResult {
        success: false,
        message: "Use the dialog plugin from the frontend instead".to_string(),
        data: None,
    })
}

#[command]
async fn create_project_files(project_path: String, files: std::collections::HashMap<String, String>) -> Result<FileOperationResult, String> {
    // Create the project directory if it doesn't exist
    if let Err(e) = fs::create_dir_all(&project_path) {
        return Ok(FileOperationResult {
            success: false,
            message: format!("Failed to create project directory: {}", e),
            data: None,
        });
    }

    let mut created_files = Vec::new();
    let mut failed_files = Vec::new();

    for (file_path, content) in files {
        let full_path = Path::new(&project_path).join(&file_path);
        
        // Create parent directories if needed
        if let Some(parent) = full_path.parent() {
            if let Err(e) = fs::create_dir_all(parent) {
                failed_files.push(format!("{}: Failed to create parent directory: {}", file_path, e));
                continue;
            }
        }

        match fs::write(&full_path, content) {
            Ok(_) => created_files.push(file_path),
            Err(e) => failed_files.push(format!("{}: {}", file_path, e)),
        }
    }

    Ok(FileOperationResult {
        success: failed_files.is_empty(),
        message: format!(
            "Created {} files, {} failed",
            created_files.len(),
            failed_files.len()
        ),
        data: Some(serde_json::json!({
            "created": created_files,
            "failed": failed_files
        })),
    })
}

#[command]
async fn compute_file_hash(file_path: String) -> Result<FileOperationResult, String> {
    match fs::read(&file_path) {
        Ok(content) => {
            let mut hasher = Sha256::new();
            hasher.update(&content);
            let hash = format!("{:x}", hasher.finalize());
            
            Ok(FileOperationResult {
                success: true,
                message: format!("Hash computed for {}", file_path),
                data: Some(serde_json::json!({ "hash": hash })),
            })
        }
        Err(e) => Ok(FileOperationResult {
            success: false,
            message: format!("Failed to read file for hashing: {}", e),
            data: None,
        }),
    }
}

#[command]
async fn compute_project_hashes(project_path: String) -> Result<FileOperationResult, String> {
    let mut file_hashes = std::collections::HashMap::new();
    let mut errors = Vec::new();

    fn visit_files(
        dir: &Path,
        file_hashes: &mut std::collections::HashMap<String, String>,
        errors: &mut Vec<String>,
        base_path: &Path,
    ) {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.filter_map(Result::ok) {
                let path = entry.path();
                if path.is_dir() {
                    visit_files(&path, file_hashes, errors, base_path);
                } else {
                    let relative_path = path.strip_prefix(base_path)
                        .unwrap_or(&path)
                        .to_string_lossy()
                        .replace('\\', "/");
                    
                    match fs::read(&path) {
                        Ok(content) => {
                            let mut hasher = Sha256::new();
                            hasher.update(&content);
                            let hash = format!("{:x}", hasher.finalize());
                            file_hashes.insert(relative_path, hash);
                        }
                        Err(e) => {
                            errors.push(format!("{}: {}", relative_path, e));
                        }
                    }
                }
            }
        }
    }

    let base_path = Path::new(&project_path);
    visit_files(base_path, &mut file_hashes, &mut errors, base_path);

    Ok(FileOperationResult {
        success: errors.is_empty(),
        message: format!(
            "Computed {} hashes, {} errors",
            file_hashes.len(),
            errors.len()
        ),
        data: Some(serde_json::json!({
            "hashes": file_hashes,
            "errors": errors
        })),
    })
}

#[command]
async fn copy_file(src: String, dst: String) -> Result<FileOperationResult, String> {
    match fs::copy(&src, &dst) {
        Ok(_) => Ok(FileOperationResult {
            success: true,
            message: format!("File copied from {} to {}", src, dst),
            data: Some(serde_json::json!({ "src": src, "dst": dst })),
        }),
        Err(e) => Ok(FileOperationResult {
            success: false,
            message: format!("Failed to copy file: {}", e),
            data: None,
        }),
    }
}

#[command]
async fn delete_file(file_path: String) -> Result<FileOperationResult, String> {
    match fs::remove_file(&file_path) {
        Ok(_) => Ok(FileOperationResult {
            success: true,
            message: format!("File deleted: {}", file_path),
            data: Some(serde_json::json!({ "path": file_path })),
        }),
        Err(e) => Ok(FileOperationResult {
            success: false,
            message: format!("Failed to delete file: {}", e),
            data: None,
        }),
    }
}

#[command]
async fn file_exists(file_path: String) -> Result<FileOperationResult, String> {
    let exists = Path::new(&file_path).exists();
    Ok(FileOperationResult {
        success: true,
        message: format!("File existence check for {}", file_path),
        data: Some(serde_json::json!({ "exists": exists })),
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        write_file,
        read_file,
        manage_directory,
        execute_command,
        get_current_directory,
        set_current_directory,
        open_directory_dialog,
        create_project_files,
        compute_file_hash,
        compute_project_hashes,
        copy_file,
        delete_file,
        file_exists
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
