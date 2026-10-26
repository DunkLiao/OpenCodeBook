# GitHub MCP 設定指南

本指南說明如何建立 GitHub Personal Access Token (classic)、將它安全地設定為 Windows 使用者環境變數，並讓支援 Remote MCP 的 AI agent CLI 透過 GitHub 官方 MCP Server 存取 GitHub。各 CLI 的設定檔位置、MCP 註冊命令及環境變數引用方式可能不同；以下列出通用連線資訊，以及 Codex 與 OpenCode 的範例。

> GitHub 官方 Remote MCP Server endpoint：`https://api.githubcopilot.com/mcp/`。建議透過用戶端的秘密管理或環境變數引用 `GITHUB_PAT_TOKEN`，不要把 token 寫入共用設定檔。

## 1. 建立 Personal Access Token (classic)

1. 登入 GitHub，開啟 [Personal access tokens (classic)](https://github.com/settings/tokens)。
2. 點選 **Generate new token**，再選 **Generate new token (classic)**。
3. 在 **Note** 輸入容易辨識的名稱，例如 `Codex GitHub MCP`。
4. 在 **Expiration** 選擇到期日。建議設定到期日，並在到期時重新建立 token。
5. 勾選需要的 scopes：

   | Scope | 何時需要 | 權限範圍提醒 |
   | --- | --- | --- |
   | `repo` | 需要讀取私人儲存庫，或使用一般 Repository、Issue、Pull request 工具 | 權限較廣，可涵蓋此帳號可存取的私人儲存庫 |
   | `public_repo` | 只需要操作公開儲存庫 | 不提供私人儲存庫存取；公開儲存庫操作範圍較 `repo` 小 |
   | `workflow` | 需要查看或管理 GitHub Actions workflows | 不需要 Actions 功能時不要勾選 |
   | `read:org` | 需要讀取組織與團隊資訊 | 不需要組織資訊時不要勾選 |
   | `project` | 需要操作 GitHub Projects (classic) | 一般程式碼、Issue、PR 工作通常不需要 |
   | `gist` | 需要讀取或建立 Gist | 不使用 Gist 時不要勾選 |

   GitHub MCP 會依 classic PAT 的 OAuth scopes 過濾可用工具。若只使用公開儲存庫，可從 `public_repo` 開始；需要私人儲存庫時才選 `repo`。之後遇到權限不足，再依實際功能新增 scope。

6. 按 **Generate token**。
7. 立即複製 token 並暫存於密碼管理器。GitHub 只會在建立時顯示完整 token；不要把 token 貼進對話、文件、程式碼或 Git 儲存庫。

若需要存取啟用 SAML SSO 的組織，建立後還要在 token 設定頁對該組織執行 **Configure SSO / Authorize**。組織政策也可能要求管理員核准或禁止 classic PAT。

## 2. 在 Windows 設定 `GITHUB_PAT_TOKEN`

在 PowerShell 執行以下指令。安全輸入提示不會回顯 token；腳本會將它寫入目前 Windows 使用者的環境變數，而不會出現在命令列歷史中：

```powershell
$secureToken = Read-Host '請貼上 GitHub PAT (classic)' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
try {
    $plainToken = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    [Environment]::SetEnvironmentVariable('GITHUB_PAT_TOKEN', $plainToken, 'User')
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    Remove-Variable plainToken -ErrorAction SilentlyContinue
    Remove-Variable secureToken -ErrorAction SilentlyContinue
}
```

此環境變數儲存在 Windows 使用者設定中，供 AI agent CLI 等程序讀取。不要用 `setx GITHUB_PAT_TOKEN <token>` 或把真實 token 寫入 PowerShell 指令，避免 token 留在命令歷史或程序參數中。

### 確認變數已設定（不顯示 token）

```powershell
[bool][Environment]::GetEnvironmentVariable('GITHUB_PAT_TOKEN', 'User')
```

輸出 `True` 代表使用者環境變數已有值；請勿用 `echo $env:GITHUB_PAT_TOKEN` 檢查，以免把 token 顯示在終端機或紀錄中。

## 3. 在 AI agent CLI 設定 GitHub MCP

若你的 CLI 支援 Remote MCP 與 bearer token 環境變數，請用該 CLI 的設定格式加入下列連線資訊：

```text
URL: https://api.githubcopilot.com/mcp/
Authorization: Bearer <讀取 GITHUB_PAT_TOKEN 環境變數>
```

以 Codex 為例，可在 PowerShell 執行：

```powershell
codex mcp add github --url https://api.githubcopilot.com/mcp/ --bearer-token-env-var GITHUB_PAT_TOKEN
```

Codex 可檢查伺服器是否已登錄：

```powershell
codex mcp list
```

清單中應出現 `github` 並處於啟用狀態。其他 CLI 請使用其 MCP 管理命令或介面檢查。登錄狀態只代表設定已存在，不代表 token 已成功通過 GitHub 驗證。

## 4. 重新啟動並驗證

1. 重新載入 MCP 設定或重新啟動 agent，讓新程序讀取使用者環境變數。
2. 在 agent 的 MCP 清單或管理介面檢查 GitHub Server 與工具是否載入。
3. 先用唯讀操作驗證，例如請 agent 列出一個你有權限存取的 repository，或讀取該 repository 的 README。
4. 確認可讀取後，再依需要使用 Issues、Pull requests 或 Actions 工具。

若仍無法連線，先在新開的 PowerShell 視窗確認環境變數存在（只輸出 True/False），再確認 token 未過期、scope 足夠、組織 SSO 已授權，最後依使用中的 CLI 方式重新載入設定或重啟 agent。

## 5. OpenCode 設定（V2）

OpenCode V2 的全域設定檔位於 `%USERPROFILE%\.config\opencode\opencode.jsonc`。在 `mcp.servers` 下加入：

```jsonc
"github": {
  "type": "remote",
  "url": "https://api.githubcopilot.com/mcp/",
  "oauth": false,
  "headers": {
    "Authorization": "Bearer {env:GITHUB_PAT_TOKEN}",
    "X-MCP-Toolsets": "context,repos,issues,pull_requests"
  }
}
```

三個關鍵設定：

| 設定 | 作用 |
| --- | --- |
| `oauth: false` | 強制使用 PAT；未設定時 OpenCode 會先嘗試自動 OAuth，可能出現 401 或授權錯誤 |
| `{env:GITHUB_PAT_TOKEN}` | OpenCode 的環境變數插值語法，避免把 PAT 寫死在設定檔 |
| `X-MCP-Toolsets` | 只註冊需要的工具集，避免 GitHub MCP 一次載入上百個工具佔用 context |

確認狀態：

```powershell
opencode mcp list
```

`github` 顯示 `connected` 代表連線成功。若要診斷授權或連線問題：

```powershell
opencode mcp debug github
```

也可用唯讀工具驗證，請 agent 執行「用 github 工具取得目前登入的帳號資訊」，成功時會回傳 `get_me` 的帳號資料。

### 工具集選擇

`X-MCP-Toolsets` 可用的工具集包括 `context`、`repos`、`issues`、`pull_requests`、`actions`、`code_security`、`discussions`、`gists`、`labels`、`notifications`、`orgs`、`projects`、`secret_protection`、`security_advisories`、`stargazers`、`users` 等（實際清單依伺服器版本為準）。常見組合：

| 用途 | 建議值 |
| --- | --- |
| 讀程式碼與 PR | `context,repos,pull_requests` |
| 含 Issue 管理 | `context,repos,issues,pull_requests` |
| 含 CI/CD | `context,repos,pull_requests,actions` |

工具集越多，載入的工具與 token 也越多；建議從最小集合開始，需要時再增加。

### 減少 context 佔用

若不想每個 agent 都載入 GitHub 工具，可全域停用再針對特定 agent 開啟：

```jsonc
"tools": {
  "github_*": false
},
"agent": {
  "github-helper": {
    "tools": { "github_*": true }
  }
}
```

## 6. 常見問題

### 顯示 401 / Unauthorized

- token 可能已過期、撤銷或複製錯誤；請在 GitHub 檢查狀態，必要時建立新 token 並更新 `GITHUB_PAT_TOKEN`。
- 設定環境變數後必須重新載入設定或重新啟動 agent，讓新程序讀取變數。
- OpenCode 需加上 `"oauth": false`，否則可能改用 OAuth 流程而非 `Authorization` 標頭。

### 顯示 403 / Resource not accessible

- token scope 可能不足，或組織政策尚未核准 classic PAT。
- 若組織啟用 SAML SSO，請在 token 頁面授權該組織。
- 確認 GitHub 帳號本身有目標 repository 的存取權。

### 找不到 GitHub 工具

- 使用該 CLI 的 MCP 清單或管理介面確認 `github` 已啟用；OpenCode 請執行 `opencode mcp list` 並確認狀態為 `connected`。
- 確認伺服器名稱、URL 與環境變數名稱拼寫正確，且設定格式符合該 CLI 文件。
- 重新載入 MCP 設定或重啟 agent，並檢查其 MCP 面板或日誌中的啟動錯誤。
- OpenCode 若工具數量異常少，檢查 `X-MCP-Toolsets` 是否漏列需要的工具集。

### 更新或移除 token

- 更新：在 GitHub 建立新 token，重跑第 2 節設定指令輸入新 token，然後重新載入 agent 設定。
- 撤銷：到 [GitHub classic tokens 設定頁](https://github.com/settings/tokens) 刪除舊 token。
- 從 Windows 使用者環境變數移除：

  ```powershell
  [Environment]::SetEnvironmentVariable('GITHUB_PAT_TOKEN', $null, 'User')
  ```

## 官方參考

- [GitHub MCP Server：Codex 安裝指南](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-codex.md)
- [GitHub MCP Server：OpenCode 安裝指南](https://github.com/github/github-mcp-server/blob/main/docs/installation-guides/install-opencode.md)
- [GitHub MCP Server：PAT 權限與工具過濾](https://github.com/github/github-mcp-server/blob/main/docs/scope-filtering.md)
- [GitHub Docs：管理 Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
