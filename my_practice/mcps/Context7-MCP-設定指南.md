# Context7 MCP 設定指南

本指南說明如何在 Windows 上將 Context7 文件查詢 MCP 加入支援 MCP 的 AI agent CLI，供 agent 查詢更新的程式庫文件與範例。Context7 不是套件安裝器；它提供文件搜尋與查詢工具。各 CLI 的設定檔位置、驗證流程與重新載入方式可能不同，以下分成通用設定與 Codex 範例。

## 1. 安裝前準備

1. 安裝 [Node.js 20 或更新版本](https://nodejs.org/)，確保 `npx` 可從 PowerShell 使用。
2. 開啟新的 PowerShell，確認 Node 與 npx 可用；若使用 Codex，也確認 CLI 可用：

   ```powershell
   node --version
   npx --version
   codex --version
   ```

3. 選擇登入方式：使用 Context7 官方設定命令的 OAuth 流程，或使用 Context7 API key。一般使用者可先採 OAuth 流程，免去手動複製金鑰。

## 2. 使用 Context7 CLI 設定精靈

執行：

```powershell
npx ctx7 setup --codex
```

依提示選擇 **MCP** 模式、目標 agent 及驗證方式。OAuth 裝置登入時，若瀏覽器沒有自動開啟，依終端機提供的驗證網址與一次性代碼，在瀏覽器完成授權。CLI 可能支援其他 agent 的旗標或專案層級設定；先執行 `npx ctx7 setup --help` 查看目前版本選項。完成後檢查終端機回報的設定檔位置與變更。

若希望明確指定 Codex 與 MCP 模式，可執行：

```powershell
npx ctx7 setup --mcp --codex
```

設定精靈若支援目前安裝版本的互動登入與 API key 管理，依其提示完成即可。命令選項會隨 CLI 版本更新；如遇到不支援的選項，執行 `npx ctx7 setup --help` 查看該版本說明，或採用下方手動設定方式。

## 3. 手動設定：Remote MCP 與 API key

若要手動設定，先到 [Context7](https://context7.com/) 帳戶頁申請 API key。不要將真實金鑰貼入對話、文件、程式碼、Git 儲存庫或命令列參數。

### 3.1 將金鑰存入 Windows 使用者環境變數

在 PowerShell 執行下列指令，以隱藏輸入方式設定使用者環境變數：

```powershell
$secureKey = Read-Host '請貼上 Context7 API key' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
    $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    [Environment]::SetEnvironmentVariable('CONTEXT7_API_KEY', $plainKey, 'User')
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    Remove-Variable plainKey -ErrorAction SilentlyContinue
    Remove-Variable secureKey -ErrorAction SilentlyContinue
}
```

確認變數已設定但不顯示金鑰：

```powershell
[bool][Environment]::GetEnvironmentVariable('CONTEXT7_API_KEY', 'User')
```

輸出 `True` 表示使用者環境變數有值。請勿用 `echo $env:CONTEXT7_API_KEY` 檢查。設定後需重新啟動 agent，讓新程序讀取變數。

### 3.2 登錄 Remote MCP

Remote MCP 使用 Context7 的 Streamable HTTP endpoint `https://mcp.context7.com/mcp` 與 HTTP Bearer 認證。若你的 CLI 支援遠端 MCP，可依其格式使用以下 JSON 示意；`headers` 中的環境變數插值格式並非所有 CLI 都支援，請查該 CLI 的文件：

```json
{
  "mcpServers": {
    "context7": {
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "Authorization": "Bearer ${CONTEXT7_API_KEY}"
      }
    }
  }
}
```

不要將真實金鑰寫入共用設定或提交至版本庫。Codex 支援使用環境變數提供 bearer token，可用以下命令登錄：

```powershell
codex mcp add context7 --url https://mcp.context7.com/mcp --bearer-token-env-var CONTEXT7_API_KEY
```

若偏好手動設定 Codex，可編輯 `%USERPROFILE%\.codex\config.toml`，增加：

```toml
[mcp_servers.context7]
url = "https://mcp.context7.com/mcp"
bearer_token_env_var = "CONTEXT7_API_KEY"
```

不要把 `YOUR_API_KEY` 或真實金鑰直接填入 TOML。Context7 官方文件亦提供本機 stdio MCP 選項；若選擇本機模式，金鑰可能會成為啟動參數，請遵循 Context7 最新文件並避免將設定提交至專案版本庫。

## 4. 確認設定與使用

若使用 Codex，檢查登錄項目：

```powershell
codex mcp list
```

確認清單含 `context7` 且已啟用。其他 CLI 請用其 MCP 清單、診斷命令或管理介面檢查。重新載入設定或重啟 agent，再確認 `resolve-library-id` 與 `query-docs` 工具可用。

可用下列提示驗證：

> 使用 Context7 查詢 React 最新文件，整理 useState 的基本用法，並附上文件中的一個簡短範例。

成功時，agent 會先解析程式庫識別名稱，再查詢文件內容。若只看到伺服器已登錄，仍需透過實際查詢確認連線及授權正常。

## 5. 常見問題

### Context7 工具沒有出現

- 執行 `codex mcp list` 確認項目已登錄並啟用。
- 完全重啟 Codex，然後查看 MCP 面板中的啟動錯誤。
- 檢查 `config.toml` 的區塊名稱、URL、環境變數名稱拼寫，避免重複的 `[mcp_servers.context7]` 區塊。

### 401 或 403 錯誤

- 確認 API key 有效且未撤銷，並確認 `CONTEXT7_API_KEY` 使用者變數有值。
- 更新環境變數後，完全重啟 Codex。
- 若使用免費方案或組織金鑰，確認目前帳戶額度與存取政策。

### 啟動逾時

- 確認網路可連線至 `https://mcp.context7.com/mcp`，並檢查代理或防火牆設定。
- 若採用本機 stdio 伺服器，官方設定範例可提高 `startup_timeout_sec`；Remote MCP 則先確認網路、授權與 Codex 記錄中的錯誤。

### 更新或移除設定

重新執行 `npx ctx7 setup --codex`，依精靈更新設定；移除 Codex 登錄項目可執行：

```powershell
codex mcp remove context7
```

移除 API key 環境變數：

```powershell
[Environment]::SetEnvironmentVariable('CONTEXT7_API_KEY', $null, 'User')
```

## 官方參考

- [Context7：Codex 設定範例](https://context7.com/docs/clients/codex)
- [Context7：所有用戶端設定](https://context7.com/docs/resources/all-clients)
- [Context7 CLI 設定說明](https://context7.com/docs/clients/cli)
- [Codex MCP 設定文件](https://developers.openai.com/codex/mcp)
