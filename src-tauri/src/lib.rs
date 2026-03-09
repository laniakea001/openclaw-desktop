use serde::{Deserialize, Serialize};
use std::process::Command;
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize)]
pub struct Status {
    installed: bool,
    running: bool,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Config {
    #[serde(rename = "apiKey")]
    pub api_key: String,
    pub channel: String,
    pub model: String,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            api_key: String::new(),
            channel: "feishu".to_string(),
            model: "minimax-cn/MiniMax-M2.5".to_string(),
        }
    }
}

fn get_config_path() -> Option<PathBuf> {
    dirs::config_dir().map(|p| p.join("openclaw").join("config.json"))
}

#[tauri::command]
fn check_status() -> Status {
    let installed = which::which("openclaw").is_ok();
    let running = Command::new("pgrep")
        .args(["openclaw-gateway"])
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false);

    Status { installed, running }
}

#[tauri::command]
fn load_config() -> Result<Config, String> {
    let config_path = get_config_path().ok_or("无法获取配置目录")?;
    
    if !config_path.exists() {
        return Ok(Config::default());
    }

    let content = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let json: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    
    Ok(Config {
        api_key: json.get("apiKey").and_then(|v| v.as_str()).unwrap_or("").to_string(),
        channel: json.get("channel").and_then(|v| v.as_str()).unwrap_or("feishu").to_string(),
        model: json.get("model").and_then(|v| v.as_str()).unwrap_or("minimax-cn/MiniMax-M2.5").to_string(),
    })
}

#[tauri::command]
fn install_openclaw() -> Result<(), String> {
    let node_exists = which::which("node").is_ok();
    if !node_exists {
        return Err("请先安装 Node.js".to_string());
    }

    let output = Command::new("npm")
        .args(["install", "-g", "@openclaw/openclaw"])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(format!("安装失败: {}", String::from_utf8_lossy(&output.stderr)));
    }

    Ok(())
}

#[tauri::command]
fn start_gateway() -> Result<(), String> {
    let output = Command::new("openclaw")
        .args(["gateway", "start"])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(format!("启动失败: {}", String::from_utf8_lossy(&output.stderr)));
    }

    Ok(())
}

#[tauri::command]
fn stop_gateway() -> Result<(), String> {
    let _ = Command::new("pkill").args(["openclaw-gateway"]).output();
    Ok(())
}

#[tauri::command]
fn save_config(api_key: String, channel: String, model: String) -> Result<(), String> {
    let config_dir = dirs::config_dir()
        .ok_or("无法获取配置目录")?
        .join("openclaw");

    fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;

    let config = serde_json::json!({
        "apiKey": api_key,
        "channel": channel,
        "model": model,
    });

    fs::write(config_dir.join("config.json"), config.to_string()).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd").args(["/C", "start", "", &url]).spawn().map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        Command::new("open").arg(&url).spawn().map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        Command::new("xdg-open").arg(&url).spawn().map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            check_status,
            load_config,
            install_openclaw,
            start_gateway,
            stop_gateway,
            save_config,
            open_url,
        ])
        .run(tauri::generate_context!())
        .expect("启动失败");
}
