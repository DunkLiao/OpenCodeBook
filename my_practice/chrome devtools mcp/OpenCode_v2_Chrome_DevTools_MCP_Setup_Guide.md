# OpenCode v2 設定 Chrome DevTools MCP 完整指南

> 適用環境：Windows 10 / Windows 11  
> 適用情境：使用 OpenCode v2 搭配 Chrome DevTools MCP，讓 Coding Agent 可實際操作 Chrome、讀取 DOM、Console、Network、Performance 等資訊。  
> 本文件包含：安裝檢查、OpenCode v2 MCP 設定、Chrome Remote Debugging、既有 Chrome 連線、驗證方式與常見錯誤排查。

---

## 1. 架構說明

整體關係如下：

```text
OpenCode v2
   │
   │ 呼叫 MCP Server
   ▼
chrome-devtools-mcp
   │
   │ Chrome DevTools Protocol
   ▼
Google Chrome
   │
   └─ Remote Debugging Port: 9222
```

使用 Remote Debugging 模式時：

1. 先以 `--remote-debugging-port=9222` 啟動 Chrome。
2. Chrome DevTools MCP 透過 `http://127.0.0.1:9222` 連到該 Chrome。
3. OpenCode 再透過 MCP 操作 Chrome。

這種方式特別適合：

- Web / SPA 開發除錯
- 檢查 Console Error
- 檢查 Network Request
- 讀取 DOM
- 測試 localhost 開發網站
- 讓 AI Agent 操作已登入的測試系統
- UI / 前端功能驗證

---

# 2. 前置需求

建議先確認已安裝：

- Google Chrome
- Node.js LTS
- npm
- npx
- OpenCode v2

PowerShell 執行：

```powershell
node --version
npm --version
npx --version
opencode --version
```

若以上皆可正常顯示版本號，即可繼續。

---

# 3. 確認 Chrome DevTools MCP 可以執行

先單獨測試 MCP Server。

PowerShell：

```powershell
npx -y chrome-devtools-mcp@latest --help
```

如果能正常顯示指令參數，代表：

- Node.js 正常
- npm / npx 正常
- `chrome-devtools-mcp` 套件可以下載與執行

如果這一步失敗，先不要處理 OpenCode 設定，應優先排查 Node.js / npm / npx。

---

# 4. OpenCode v2 全域設定位置

Windows 建議使用：

```text
C:\Users\<你的帳號>\.config\opencode\opencode.jsonc
```

例如：

```text
C:\Users\user\.config\opencode\opencode.jsonc
```

如果資料夾已存在，但沒有 `opencode.jsonc`，可以直接建立。

PowerShell：

```powershell
notepad $HOME\.config\opencode\opencode.jsonc
```

若 Windows 顯示檔案不存在，選擇建立新檔。

---

# 5. 最基本的 Chrome DevTools MCP 設定

如果你不打算連到自己手動開啟的 Chrome，可以先使用最基本版本：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": [
          "npx",
          "-y",
          "chrome-devtools-mcp@latest"
        ]
      }
    }
  }
}
```

這種模式通常由 MCP 自己管理瀏覽器工作階段。

---

# 6. 建議設定：連線到 Chrome Remote Debugging

如果希望 OpenCode 操作「你自己開啟的 Chrome」，例如：

- 已登入網站
- 已開啟 localhost
- 已設定測試帳號
- 想保留特定瀏覽器 Session
- 想讓 Agent 直接檢查目前頁面

建議使用 `--browser-url`。

`opencode.jsonc`：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": [
          "npx",
          "-y",
          "chrome-devtools-mcp@latest",
          "--browser-url=http://127.0.0.1:9222"
        ]
      }
    }
  }
}
```

重點：

```text
--browser-url=http://127.0.0.1:9222
```

這代表 Chrome DevTools MCP 會連到本機 TCP 9222 的 Chrome DevTools Protocol。

---

# 7. 開啟 Chrome Remote Debugging

## 7.1 先關閉目前所有 Chrome

Remote Debugging 建議使用獨立 Chrome Profile。

先關閉所有 Chrome 視窗。

也可以 PowerShell 強制關閉：

```powershell
taskkill /F /IM chrome.exe
```

如果出現找不到程序，代表 Chrome 已關閉，可以忽略。

---

## 7.2 找到 Chrome 執行檔

一般 64-bit Windows：

```text
C:\Program Files\Google\Chrome\Application\chrome.exe
```

另一個可能位置：

```text
C:\Program Files (x86)\Google\Chrome\Application\chrome.exe
```

可以測試：

```powershell
Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe"
```

如果顯示：

```text
True
```

表示路徑正確。

---

# 8. 以 Remote Debugging 模式啟動 Chrome

PowerShell：

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="C:\chrome-debug"
```

注意 PowerShell 的換行符號是反引號：

```text
`
```

也可以寫成單行：

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\chrome-debug"
```

---

# 9. 為什麼要指定 user-data-dir

Chrome 新版通常不建議直接對平常使用中的預設 Profile 開 Remote Debugging。

因此使用：

```text
--user-data-dir="C:\chrome-debug"
```

建立一個獨立的測試 Profile。

優點：

- 不影響平常使用的 Chrome
- 不容易跟既有 Chrome Process 衝突
- 測試環境比較乾淨
- 避免 AI Agent 操作到私人分頁
- Remote Debugging 較穩定

第一次開啟：

```text
C:\chrome-debug
```

會自動建立新的 Chrome Profile。

---

# 10. 驗證 Remote Debugging Port

Chrome 開啟後，在瀏覽器輸入：

```text
http://127.0.0.1:9222/json/version
```

正常時會看到 JSON 資訊，例如：

```json
{
  "Browser": "Chrome/...",
  "Protocol-Version": "...",
  "webSocketDebuggerUrl": "ws://127.0.0.1:9222/devtools/browser/..."
}
```

也可以 PowerShell 測試：

```powershell
Invoke-WebRequest http://127.0.0.1:9222/json/version
```

若成功回應，表示：

```text
Chrome Remote Debugging
        ↓
Port 9222
        ↓
正常
```

---

# 11. 驗證 OpenCode MCP

設定好 `opencode.jsonc` 後執行：

```powershell
opencode mcp list
```

正常情況應該看到：

```text
chrome-devtools    connected
```

或相近的 Connected 狀態。

接著啟動：

```powershell
opencode
```

在 OpenCode 裡執行：

```text
/mcps
```

確認：

```text
chrome-devtools
Connected
```

---

# 12. 第一個實際測試

在 Chrome Remote Debugging 視窗開啟：

```text
https://example.com
```

再到 OpenCode 輸入：

```text
使用 chrome-devtools MCP 檢查目前開啟的頁面。

請告訴我：

1. 目前 URL
2. Page Title
3. 主要 Heading
4. Console 是否有 Error
5. 是否存在 Failed Network Request

先不要修改任何程式碼。
```

如果 Agent 能讀取 Chrome 畫面與 DevTools 資訊，即代表整體設定完成。

---

# 13. SPA / Web 開發推薦用法

例如正在開發：

```text
http://localhost:5173
```

先啟動專案：

```powershell
npm run dev
```

再用 Remote Debugging Chrome 開：

```text
http://localhost:5173
```

然後 OpenCode 可使用：

```text
請使用 chrome-devtools MCP 檢查目前 localhost 網頁。

檢查：

1. Console errors
2. Failed network requests
3. DOM 結構
4. JavaScript Runtime Error
5. CSS/Layout 異常
6. 是否有 API 404 / 500
7. 是否有 CORS 錯誤

先分析問題，不要修改任何程式碼。
```

確認問題後，再輸入：

```text
根據剛才 Chrome DevTools MCP 的檢查結果修正程式。

限制：

1. 只修改必要檔案
2. 不改變原有功能
3. 修改後再次使用 Chrome DevTools MCP 驗證
4. 確認 Console 沒有新增 Error
5. 確認原有功能仍可使用
```

這樣可以形成：

```text
讀程式
   ↓
開網站
   ↓
DevTools 檢查
   ↓
找出問題
   ↓
修改程式
   ↓
重新整理
   ↓
再次 DevTools 驗證
```

---

# 14. 建議的最終 opencode.jsonc

如果主要用途是 Coding Agent + Web 開發，推薦：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": [
          "npx",
          "-y",
          "chrome-devtools-mcp@latest",
          "--browser-url=http://127.0.0.1:9222"
        ]
      }
    }
  }
}
```

---

# 15. OpenCode v2 MCP 設定結構

OpenCode v2 MCP 結構：

```text
mcp
└── servers
    └── chrome-devtools
        ├── type
        └── command
```

也就是：

```jsonc
{
  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": []
      }
    }
  }
}
```

不要使用舊格式。

---

# 16. 為什麼不使用 opencode mcp add

理論上可以使用：

```powershell
opencode mcp add chrome-devtools --global -- npx -y chrome-devtools-mcp@latest
```

但部分 Windows / OpenCode v2 Build 可能發生參數解析問題：

```text
ERROR
Unrecognized flag: -y in command opencode mcp add
```

原因是：

```text
-y
```

可能被 OpenCode CLI 自己解析，而不是傳給 `npx`。

因此 Windows 環境建議直接維護：

```text
opencode.jsonc
```

優點：

- MCP 設定清楚
- 容易備份
- 容易 Git 版控
- 容易增加其他 MCP
- 不會受到 CLI 參數解析問題影響

---

# 17. 常見錯誤排查

## 問題 1：chrome-devtools 顯示 disconnected

先檢查：

```powershell
npx -y chrome-devtools-mcp@latest --help
```

如果失敗，問題在 Node / npm / MCP。

如果成功，再檢查 Chrome：

```text
http://127.0.0.1:9222/json/version
```

---

## 問題 2：127.0.0.1:9222 無法連線

表示 Chrome 沒有用 Remote Debugging 啟動。

重新執行：

```powershell
taskkill /F /IM chrome.exe
```

再：

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="C:\chrome-debug"
```

---

## 問題 3：Chrome 開了，但 MCP 找不到 Page

先在 Remote Debugging Chrome 開啟網站，例如：

```text
https://example.com
```

再重新：

```powershell
opencode mcp list
```

必要時重新啟動 OpenCode。

---

## 問題 4：opencode.jsonc JSON 錯誤

常見原因：

- 少逗號
- 多逗號
- 大括號沒有配對
- `mcp.servers` 層級寫錯
- `command` 寫成字串而不是陣列

建議格式：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": [
          "npx",
          "-y",
          "chrome-devtools-mcp@latest",
          "--browser-url=http://127.0.0.1:9222"
        ]
      }
    }
  }
}
```

---

# 18. 建立 Chrome Remote Debugging 快捷 BAT

可以建立：

```text
start-chrome-debug.bat
```

內容：

```bat
@echo off

taskkill /F /IM chrome.exe >nul 2>&1

start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --remote-debugging-port=9222 ^
  --user-data-dir="C:\chrome-debug"

exit
```

以後只要雙擊：

```text
start-chrome-debug.bat
```

即可快速啟動測試 Chrome。

---

# 19. PowerShell 版本啟動腳本

例如建立：

```text
start-chrome-debug.ps1
```

內容：

```powershell
Get-Process chrome -ErrorAction SilentlyContinue |
    Stop-Process -Force

Start-Process `
    "C:\Program Files\Google\Chrome\Application\chrome.exe" `
    -ArgumentList @(
        "--remote-debugging-port=9222",
        "--user-data-dir=C:\chrome-debug"
    )
```

執行：

```powershell
.\start-chrome-debug.ps1
```

---

# 20. 安全注意事項

Remote Debugging Port 可以控制瀏覽器，因此不要直接對外網路開放：

```text
9222
```

建議只使用：

```text
127.0.0.1:9222
```

不要：

- Port Forward 到 Internet
- 對外開 Firewall Rule
- 綁定 0.0.0.0
- 在含敏感資料的日常 Chrome Profile 使用
- 讓 AI Agent 存取網銀、信箱、公司正式系統等高敏感分頁

推薦使用獨立 Profile：

```text
C:\chrome-debug
```

並只登入測試用帳號。

---

# 21. 每次開發時的推薦流程

## Step 1

開啟 Chrome Remote Debugging：

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="C:\chrome-debug"
```

## Step 2

啟動 Web 專案：

```powershell
npm run dev
```

## Step 3

在 Chrome 開：

```text
http://localhost:5173
```

## Step 4

確認 MCP：

```powershell
opencode mcp list
```

## Step 5

啟動 OpenCode：

```powershell
opencode
```

## Step 6

檢查：

```text
/mcps
```

## Step 7

要求 Agent：

```text
使用 chrome-devtools MCP 檢查目前 localhost 頁面。

分析：

- Console
- Network
- DOM
- JavaScript Error
- API Request
- Layout

先分析，不要修改程式。
```

## Step 8

分析完成後：

```text
根據剛才的 DevTools 分析結果進行修正。

完成後再次使用 chrome-devtools MCP 驗證，
直到 Console 無新增錯誤、Network 無異常，
並確認原功能沒有被破壞。
```

---

# 22. 快速檢查清單

```text
[ ] Node.js 已安裝
[ ] npm 可執行
[ ] npx 可執行
[ ] OpenCode v2 可執行

[ ] npx -y chrome-devtools-mcp@latest --help 正常

[ ] opencode.jsonc 已建立
[ ] mcp.servers.chrome-devtools 已設定

[ ] Chrome 已完全關閉
[ ] 使用 --remote-debugging-port=9222 啟動
[ ] 使用獨立 --user-data-dir

[ ] http://127.0.0.1:9222/json/version 可開啟

[ ] opencode mcp list 顯示 connected
[ ] /mcps 顯示 chrome-devtools Connected

[ ] Agent 可以讀取 Page Title
[ ] Agent 可以讀取 DOM
[ ] Agent 可以檢查 Console
[ ] Agent 可以檢查 Network
```

---

# 23. 最精簡版指令

## 啟動 Chrome

```powershell
& "C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="C:\chrome-debug"
```

## OpenCode 設定

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": [
          "npx",
          "-y",
          "chrome-devtools-mcp@latest",
          "--browser-url=http://127.0.0.1:9222"
        ]
      }
    }
  }
}
```

## 驗證

```powershell
opencode mcp list
```

OpenCode：

```text
/mcps
```

## 測試 Prompt

```text
使用 chrome-devtools MCP 檢查目前開啟的網頁。

請取得：

1. URL
2. Title
3. DOM
4. Console Errors
5. Failed Network Requests

先分析，不要修改程式碼。
```

---

# 24. 建議

對 OpenCode v2 的 Web / SPA 開發流程來說，推薦：

```text
OpenCode
+ AGENTS.md
+ Chrome DevTools MCP
+ Git
```

形成：

```text
AGENTS.md
   │
   ├─ 專案規則
   │
OpenCode Agent
   │
   ├─ 讀取程式碼
   ├─ 修改程式碼
   │
Chrome DevTools MCP
   │
   ├─ Browser
   ├─ DOM
   ├─ Console
   ├─ Network
   └─ Performance
   │
Git
   │
   └─ 版本控管
```

這樣 Coding Agent 就不只是「產生程式碼」，而是能執行：

```text
讀取需求
→ 查看程式碼
→ 實際打開網站
→ DevTools 檢查
→ 修改
→ 實際驗證
→ 再修正
→ 完成
```

特別適合 SPA、離線 Web 工具、內部管理系統與前端專案。
