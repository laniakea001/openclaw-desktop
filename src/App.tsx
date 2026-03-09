import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface AppState {
  openclawInstalled: boolean;
  gatewayRunning: boolean;
  config: {
    apiKey: string;
    channel: string;
    model: string;
  };
}

function App() {
  const [state, setState] = useState<AppState>({
    openclawInstalled: false,
    gatewayRunning: false,
    config: {
      apiKey: '',
      channel: 'feishu',
      model: 'minimax-cn/MiniMax-M2.5',
    },
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('status');

  useEffect(() => {
    checkStatus();
    loadConfig();
  }, []);

  const addLog = (msg: string, type: 'info' | 'warn' | 'error' = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-99), `[${time}] ${msg}`]);
  };

  const checkStatus = async () => {
    try {
      const status = await invoke<{ installed: boolean; running: boolean }>('check_status');
      setState(prev => ({ ...prev, openclawInstalled: status.installed, gatewayRunning: status.running }));
      addLog(status.installed ? '✅ OpenClaw 已安装' : '❌ OpenClaw 未安装', status.installed ? 'info' : 'warn');
      addLog(status.running ? '✅ Gateway 运行中' : '⏹️ Gateway 已停止', status.running ? 'info' : 'warn');
    } catch (e) {
      addLog(`❌ 检查状态失败: ${e}`, 'error');
    }
  };

  const loadConfig = async () => {
    try {
      const config = await invoke<{ apiKey: string; channel: string; model: string }>('load_config');
      setState(prev => ({ ...prev, config: config || prev.config }));
    } catch (e) {
      // 配置加载失败，使用默认值
    }
  };

  const installOpenClaw = async () => {
    setLoading(true);
    addLog('🔄 开始安装 OpenClaw...');
    try {
      await invoke('install_openclaw');
      setState(prev => ({ ...prev, openclawInstalled: true }));
      addLog('✅ OpenClaw 安装成功！', 'info');
    } catch (e) {
      addLog(`❌ 安装失败: ${e}`, 'error');
    }
    setLoading(false);
  };

  const startGateway = async () => {
    setLoading(true);
    addLog('🔄 启动 Gateway...');
    try {
      await invoke('start_gateway');
      setState(prev => ({ ...prev, gatewayRunning: true }));
      addLog('✅ Gateway 启动成功！', 'info');
    } catch (e) {
      addLog(`❌ 启动失败: ${e}`, 'error');
    }
    setLoading(false);
  };

  const stopGateway = async () => {
    setLoading(true);
    addLog('🔄 停止 Gateway...');
    try {
      await invoke('stop_gateway');
      setState(prev => ({ ...prev, gatewayRunning: false }));
      addLog('⏹️ Gateway 已停止', 'info');
    } catch (e) {
      addLog(`❌ 停止失败: ${e}`, 'error');
    }
    setLoading(false);
  };

  const saveConfig = async () => {
    setLoading(true);
    addLog('🔄 保存配置...');
    try {
      await invoke('save_config', { 
        apiKey: state.config.apiKey, 
        channel: state.config.channel,
        model: state.config.model,
      });
      addLog('✅ 配置保存成功！', 'info');
    } catch (e) {
      addLog(`❌ 保存失败: ${e}`, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🧠 OpenClaw Desktop</h1>
        <p>Windows 一键安装包 - 让 AI 助手触手可及</p>
      </header>

      <nav className="tabs">
        <button className={activeTab === 'status' ? 'active' : ''} onClick={() => setActiveTab('status')}>📊 状态</button>
        <button className={activeTab === 'config' ? 'active' : ''} onClick={() => setActiveTab('config')}>⚙️ 配置</button>
        <button className={activeTab === 'skills' ? 'active' : ''} onClick={() => setActiveTab('skills')}>🛒 Skills</button>
        <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>📝 日志</button>
      </nav>

      <main className="main">
        {activeTab === 'status' && (
          <div className="card">
            <h2>📊 运行状态</h2>
            <div className={`status ${state.gatewayRunning ? 'running' : 'stopped'}`}>
              <span>●</span>
              <span>{state.gatewayRunning ? 'Gateway 运行中' : 'Gateway 已停止'}</span>
            </div>
            <div className="status-actions">
              {!state.openclawInstalled ? (
                <button className="btn btn-primary" onClick={installOpenClaw} disabled={loading}>
                  安装 OpenClaw
                </button>
              ) : state.gatewayRunning ? (
                <button className="btn btn-danger" onClick={stopGateway} disabled={loading}>
                  停止 Gateway
                </button>
              ) : (
                <button className="btn btn-success" onClick={startGateway} disabled={loading}>
                  启动 Gateway
                </button>
              )}
              <button className="btn btn-secondary" onClick={checkStatus} disabled={loading}>
                刷新状态
              </button>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <>
            <div className="card">
              <h2>🤖 模型配置</h2>
              <div className="input-group">
                <label>API Key</label>
                <input
                  type="password"
                  placeholder="输入你的 API Key"
                  value={state.config.apiKey}
                  onChange={e => setState(prev => ({ ...prev, config: { ...prev.config, apiKey: e.target.value } }))}
                />
              </div>
              <div className="input-group">
                <label>模型</label>
                <select
                  value={state.config.model}
                  onChange={e => setState(prev => ({ ...prev, config: { ...prev.config, model: e.target.value } }))}
                >
                  <option value="minimax-cn/MiniMax-M2.5">MiniMax M2.5</option>
                  <option value="deepseek/deepseek-chat">DeepSeek Chat</option>
                  <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={saveConfig} disabled={loading}>
                保存配置
              </button>
            </div>

            <div className="card">
              <h2>💬 渠道配置</h2>
              <div className="input-group">
                <label>选择渠道</label>
                <select
                  value={state.config.channel}
                  onChange={e => setState(prev => ({ ...prev, config: { ...prev.config, channel: e.target.value } }))}
                >
                  <option value="feishu">飞书</option>
                  <option value="telegram">Telegram</option>
                  <option value="discord">Discord</option>
                  <option value="slack">Slack</option>
                </select>
              </div>
              <p className="hint">选择渠道后，需要配置对应的 Bot Token</p>
            </div>

            <div className="card">
              <h2>⚡ 高级设置</h2>
              <div className="setting-item">
                <label>
                  <input type="checkbox" /> 开机自动启动
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" /> 启动时自动运行 Gateway
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" /> 最小化到系统托盘
                </label>
              </div>
            </div>
          </>
        )}

        {activeTab === 'skills' && (
          <div className="card">
            <h2>🛒 Skills 市场</h2>
            <p>浏览和安装 OpenClaw 技能</p>
            <div className="skills-grid">
              <div className="skill-item">
                <span className="skill-name">🤖 coding-agent</span>
                <span className="skill-desc">编程开发自动化</span>
                <button className="btn btn-sm">安装</button>
              </div>
              <div className="skill-item">
                <span className="skill-name">🐙 github</span>
                <span className="skill-desc">GitHub 操作</span>
                <button className="btn btn-sm">安装</button>
              </div>
              <div className="skill-item">
                <span className="skill-name">🌐 agent-reach</span>
                <span className="skill-desc">13+ 平台访问</span>
                <button className="btn btn-sm">安装</button>
              </div>
              <div className="skill-item">
                <span className="skill-name">🛡️ ghost-scan</span>
                <span className="skill-desc">安全扫描</span>
                <button className="btn btn-sm">安装</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="card">
            <h2>📝 运行日志</h2>
            <div className="log-viewer">
              {logs.length === 0 ? (
                <div className="log-line">暂无日志...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`log-line ${log.includes('error') ? 'log-error' : log.includes('warn') ? 'log-warn' : log.includes('✅') ? 'log-success' : 'log-info'}`}>
                    {log}
                  </div>
                ))
              )}
            </div>
            <button className="btn btn-secondary" onClick={() => setLogs([])}>清空日志</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
