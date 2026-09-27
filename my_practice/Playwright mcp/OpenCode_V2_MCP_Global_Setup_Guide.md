# OpenCode V2 MCP 全域（Global）設定指南

> 適用情境：Windows + OpenCode V2  
> 目標：將常用 MCP 設定為 **Global**，讓所有專案都能直接使用。  
> 本文件整理並彙總此次已驗證的 DeepWiki、Microsoft Playwright MCP 與 Chrome DevTools MCP 設定方式。

> [!IMPORTANT]
> **後續更新：** 本文件部分設定（`playwright` 的 `-y`、`@latest` 版本、startup timeout）
> 已由 **[OpenCode_V2_MCP_Timeout_Fix.md](./OpenCode_V2_MCP_Timeout_Fix.md)** 更正。
> 本文仍保留原始紀錄作為對照，遇到 `failed: Request timed out` 請看新文件的排查 SOP。

---

## 1. 為什麼建議使用 Global MCP？

OpenCode V2 執行：

```powershell
opencode mcp add ...
```

預設會將 MCP 寫入「目前專案」的設定。

如果改用：

```powershell
opencode mcp add ... --global ...
```

則會寫入全域設定，之後不論你開啟哪個專案，都可以使用同一組 MCP。

例如：

```text
D:\Vibecoding\project-a
D:\Vibecoding\project-b
D:\Vibecoding\project-c
```

都可以直接使用：

```text
chrome-devtools
deepwiki
playwright
```

---

## 2. OpenCode V2 MCP 設定格式

OpenCode V2 的 MCP 設定放在：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
    }
  }
}
```

V2 的 MCP Server 名稱必須放在：

```text
mcp.servers
```

而不是其他 MCP Client 常見的：

```text
mcpServers
```

### Remote MCP 範例

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "example": {
        "type": "remote",
        "url": "https://example.com/mcp"
      }
    }
  }
}
```

### Local MCP 範例

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "example": {
        "type": "local",
        "command": [
          "npx",
          "example-mcp-server"
        ]
      }
    }
  }
}
```

---

# 3. DeepWiki MCP

DeepWiki 是 Remote MCP。

官方 MCP Endpoint：

```text
https://mcp.deepwiki.com/mcp
```

## 建議：使用 CLI 加入 Global

```powershell
opencode mcp add deepwiki --global --url https://mcp.deepwiki.com/mcp
```

完成後驗證：

```powershell
opencode mcp list
```

正常應看到：

```text
✓ deepwiki  connected
```

## 對應 OpenCode V2 JSON

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "deepwiki": {
        "type": "remote",
        "url": "https://mcp.deepwiki.com/mcp"
      }
    }
  }
}
```

---

# 4. Microsoft Playwright MCP

Microsoft Playwright MCP 是 Local MCP。

Microsoft 官方標準啟動方式：

```powershell
npx @playwright/mcp@latest
```

官方文件建議 Node.js 20 或更新版本。

> [!IMPORTANT]
> **本節部分內容已由後續文件更正。**
> 請一併閱讀：**[OpenCode_V2_MCP_Timeout_Fix.md](./OpenCode_V2_MCP_Timeout_Fix.md)**
>
> 更正重點：
> 1. `playwright` 指令**應該加上 `-y`**（見本節「為什麼沒有加 `-y`？」的更正說明）。
> 2. 套件版本建議**釘死**（例如 `@0.0.82`），不要用 `@latest`。
> 3. 建議設定 `mcp.timeout.startup`（例如 `60000`）。
>
> 若遇到 `failed: Request timed out`，請直接看新文件的排查 SOP。

## 已驗證可用的 OpenCode Global CLI 指令

在此次 Windows / OpenCode 環境中，以下方式已成功：

```powershell
opencode mcp add playwright --global -- npx @playwright/mcp@latest
```

完成後：

```powershell
opencode mcp list
```

正常應看到：

```text
✓ playwright  connected
```

## 為什麼沒有加 `-y`？

> [!NOTE]
> **此段落已被更正。** 結論是：`playwright` **應該加上 `-y`**。
>
> 當時的錯誤原因是 `opencode mcp add` 這個 **CLI 指令**把 `-y` 誤判成 OpenCode 自己的參數。
> 但只要**直接編輯 `opencode.jsonc`**，`-y` 寫在 `command` 陣列裡就不會經過 CLI 解析，
> 因此可以（也應該）安心加上。
>
> 詳細原因與完整修正紀錄請見
> **[OpenCode_V2_MCP_Timeout_Fix.md](./OpenCode_V2_MCP_Timeout_Fix.md)**。
> 以下為當時的原始紀錄，保留作為對照。

原本嘗試：

```powershell
opencode mcp add playwright -- npx -y @playwright/mcp@latest
```

實際發生：

```text
ERROR
Unrecognized flag: -y in command opencode mcp add
```

代表目前使用的 OpenCode CLI 在這個指令情境下，將 `-y` 誤判為 OpenCode 自己的參數。

因此這台 Windows 環境已驗證可直接使用：

```powershell
npx @playwright/mcp@latest
```

而 Microsoft Playwright MCP 官方標準設定本身也不要求 `-y`。

## 對應 OpenCode V2 JSON

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "playwright": {
        "type": "local",
        "command": [
          "npx",
          "@playwright/mcp@latest"
        ]
      }
    }
  }
}
```

### 建議寫法（已更正）

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "playwright": {
        "type": "local",
        "command": [
          "npx",
          "-y",
          "@playwright/mcp@0.0.82"
        ]
      }
    }
  }
}
```

### Windows 若 `npx` 無法正常啟動

可以測試：

```powershell
npx --version
```

如果 PATH 或 Windows 執行檔解析有問題，也可以嘗試：

```powershell
npx.cmd @playwright/mcp@latest
```

---

# 5. Chrome DevTools MCP

Chrome DevTools MCP 也是 Local MCP。

官方套件：

```text
chrome-devtools-mcp
```

官方常見啟動方式：

```powershell
npx -y chrome-devtools-mcp@latest
```

## Global 設定

若你的 OpenCode CLI 可以正確處理 `-y`：

```powershell
opencode mcp add chrome-devtools --global -- npx -y chrome-devtools-mcp@latest
```

如果你的 OpenCode 版本也對 `-y` 發生參數解析問題，可嘗試省略：

```powershell
opencode mcp add chrome-devtools --global -- npx chrome-devtools-mcp@latest
```

或沿用你目前已經驗證成功的 Chrome DevTools MCP command。

## 對應 OpenCode V2 JSON

```json
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

---

# 6. Chrome Remote Debugging

如果你的 Chrome DevTools MCP 使用「連線既有 Chrome」的方式，需要先啟動 Chrome Remote Debugging。

例如 Windows：

```powershell
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

如果 Chrome 安裝在：

```text
C:\Program Files (x86)\Google\Chrome\Application\
```

則：

```powershell
"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
```

啟動後可在瀏覽器確認：

```text
http://localhost:9222/json
```

如果能看到 JSON 資料，代表 Remote Debugging 已啟動。

> 注意：新版 Chrome 對既有個人 Profile 的 remote debugging 可能有額外限制。若遇到問題，可使用獨立的 user data directory。

例如：

```powershell
"C:\Program Files\Google\Chrome\Application\chrome.exe" `
  --remote-debugging-port=9222 `
  --user-data-dir="C:\chrome-debug"
```

---

# 7. 一次設定三個 Global MCP

建議分開執行，方便判斷哪一個 MCP 發生問題。

## DeepWiki

```powershell
opencode mcp add deepwiki --global --url https://mcp.deepwiki.com/mcp
```

## Microsoft Playwright MCP

```powershell
opencode mcp add playwright --global -- npx @playwright/mcp@latest
```

## Chrome DevTools MCP

```powershell
opencode mcp add chrome-devtools --global -- npx chrome-devtools-mcp@latest
```

若你目前既有 Chrome DevTools MCP 已經成功，則直接保留原本設定即可。

---

# 8. 驗證 MCP

執行：

```powershell
opencode mcp list
```

此次已驗證成功的結果類似：

```text
✓ chrome-devtools  connected
✓ deepwiki         connected
✓ playwright       connected
```

只要看到：

```text
connected
```

就代表 OpenCode 已成功啟動或連線該 MCP Server。

---

# 9. 在 OpenCode TUI 中確認

進入 OpenCode：

```powershell
opencode
```

然後輸入：

```text
/mcps
```

可以查看目前 OpenCode 工作階段載入的 MCP Server。

如果三個 Global MCP 都成功，應可看到：

```text
chrome-devtools
deepwiki
playwright
```

---

# 10. 為什麼 `opencode mcp list` 有 3 個，但 TUI 只顯示 1 MCP？

這次實際遇到的原因是「Project MCP」與「Global MCP」作用範圍不同。

例如在：

```text
C:\Users\user
```

執行：

```powershell
opencode mcp list
```

可能看到：

```text
✓ chrome-devtools  connected
✓ deepwiki         connected
✓ playwright       connected
```

但 OpenCode TUI 開啟的專案卻是：

```text
D:\Vibecoding\test_buyhouse.update_data
```

如果其中兩個 MCP 是加入 `C:\Users\user` 對應的 Project Config，而不是 Global Config，就可能造成 TUI 中只有部分 MCP。

### 驗證方式

切換到實際專案：

```powershell
cd D:\Vibecoding\test_buyhouse.update_data
```

再執行：

```powershell
opencode mcp list
```

即可確認該專案真正載入的 MCP。

### 解決方式

將常用 MCP 全部改為：

```text
--global
```

這也是本文件最建議的做法。

---

# 11. Global 設定檔位置

OpenCode V2 的全域設定位置：

```text
~/.config/opencode/opencode.json
```

或：

```text
~/.config/opencode/opencode.jsonc
```

Windows 的 `~` 通常就是：

```text
C:\Users\<你的帳號>
```

因此常見實際位置為：

```text
C:\Users\<你的帳號>\.config\opencode\opencode.json
```

或：

```text
C:\Users\<你的帳號>\.config\opencode\opencode.jsonc
```

Windows 可按：

```text
Win + R
```

輸入：

```text
%USERPROFILE%\.config\opencode
```

即可快速開啟。

---

# 12. 三個 MCP 合併後的 Global JSON 範例

若想直接管理全域 `opencode.json` / `opencode.jsonc`，可參考：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "deepwiki": {
        "type": "remote",
        "url": "https://mcp.deepwiki.com/mcp"
      },
      "playwright": {
        "type": "local",
        "command": [
          "npx",
          "@playwright/mcp@latest"
        ]
      },
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

如果你的 OpenCode CLI 對 Chrome DevTools 的 `-y` 也有解析問題，可以改成：

```json
"chrome-devtools": {
  "type": "local",
  "command": [
    "npx",
    "chrome-devtools-mcp@latest"
  ]
}
```

---

# 13. Global 與 Project Config 優先順序

OpenCode 會合併 Global 與 Project Config。

大致概念：

```text
Global Config
    ↓
Project Config
    ↓
較接近目前工作目錄的 Project Config
```

如果同名 MCP 在 Project Config 中再次定義，Project Config 可能覆蓋 Global 設定。

因此如果：

```text
Global:
playwright
```

而專案內又有：

```text
playwright
```

OpenCode 會以較高優先權的專案設定為準。

建議：

- 通用工具：放 Global
- 特定專案才需要的 MCP：放 Project
- 同一 MCP 不要在多層設定中重複定義，除非你明確需要覆蓋

---

# 14. 建議的 MCP 分工

## DeepWiki

適合：

- 查詢 GitHub Repository 架構
- 理解陌生 Open Source 專案
- 詢問某 Repo 的設計方式
- 快速取得技術文件摘要

---

## Playwright MCP

適合：

- 網頁操作
- UI 自動化
- 表單測試
- 點擊與輸入
- End-to-End 驗證
- Browser automation
- 網頁功能測試

Playwright MCP 主要透過網頁 Accessibility Tree / structured snapshot 操作頁面，而不是單純依靠畫面座標。

---

## Chrome DevTools MCP

適合：

- DevTools Debugging
- Console Error
- Network Request
- Performance
- DOM
- Browser Debugging
- Lighthouse / Performance 分析
- 既有 Chrome Session 除錯

---

# 15. Playwright MCP 與 Chrome DevTools MCP 的差異

| 功能 | Playwright MCP | Chrome DevTools MCP |
|---|---|---|
| 網頁自動化 | 很適合 | 可 |
| E2E 測試 | 很適合 | 次要 |
| 點擊 / 輸入 / 表單 | 很適合 | 可 |
| Console Debug | 可 | 很適合 |
| Network Debug | 可 | 很適合 |
| Performance | 可 | 很適合 |
| DevTools 功能 | 一般 | 很完整 |
| 操作既有 Chrome | 可設定 | 很適合 |
| 自動開瀏覽器 | 可以 | 可以 |
| 適合 Coding Agent | 是 | 是 |

實務上兩個可以一起裝：

```text
Playwright MCP
    → 操作、測試網站

Chrome DevTools MCP
    → Debug、Network、Console、Performance
```

兩者用途互補，不必二選一。

---

# 16. 建議最終配置

推薦將以下三個設成 Global：

```text
OpenCode Global MCP
│
├── deepwiki
│   └── Repository / 技術文件查詢
│
├── playwright
│   └── Browser Automation / E2E
│
└── chrome-devtools
    └── Browser Debug / Network / Console / Performance
```

最重要的驗證指令：

```powershell
opencode mcp list
```

預期：

```text
✓ chrome-devtools  connected
✓ deepwiki         connected
✓ playwright       connected
```

進入 TUI 後：

```text
/mcps
```

也應該能看到三個 MCP。

---

# 17. 快速指令總表

```powershell
# DeepWiki - Global
opencode mcp add deepwiki --global --url https://mcp.deepwiki.com/mcp

# Microsoft Playwright MCP - Global
opencode mcp add playwright --global -- npx @playwright/mcp@latest

# Chrome DevTools MCP - Global
opencode mcp add chrome-devtools --global -- npx chrome-devtools-mcp@latest

# 查看 MCP 狀態
opencode mcp list

# 啟動 OpenCode
opencode
```

OpenCode TUI：

```text
/mcps
```

---

# 18. 官方參考資料

## OpenCode

- MCP Servers  
  https://opencode.ai/v2/docs/mcp-servers

- Configuration  
  https://opencode.ai/v2/docs/config

- CLI Commands  
  https://opencode.ai/v2/docs/cli/commands/

## Microsoft Playwright MCP

- GitHub  
  https://github.com/microsoft/playwright-mcp

- Playwright MCP Documentation  
  https://playwright.dev/mcp/

## Chrome DevTools MCP

- GitHub  
  https://github.com/ChromeDevTools/chrome-devtools-mcp

## DeepWiki MCP

- MCP Endpoint  
  https://mcp.deepwiki.com/mcp

---

## 最終結論

對於日常 Vibe Coding / Coding Agent 工作環境，建議把通用 MCP 全部設定成 **Global**：

```powershell
opencode mcp add deepwiki --global --url https://mcp.deepwiki.com/mcp

opencode mcp add playwright --global -- npx @playwright/mcp@latest

opencode mcp add chrome-devtools --global -- npx chrome-devtools-mcp@latest
```

設定完成後：

```powershell
opencode mcp list
```

只要三個都顯示：

```text
connected
```

代表 Global MCP 環境已完成。

