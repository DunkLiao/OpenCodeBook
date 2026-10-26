# Playwright MCP 設定指南

本指南說明如何在 Windows 上將 Microsoft Playwright MCP 加入支援 MCP 的 AI agent CLI，並驗證瀏覽器自動化工具已載入。此 MCP 讓 AI agent 透過結構化的頁面資訊操作瀏覽器；它不是 Playwright 測試套件本身。不同 CLI 的設定檔位置與命令可能不同，請依該 CLI 的 MCP 文件設定。

## 1. 安裝前準備

1. 安裝 [Node.js 20 或更新版本](https://nodejs.org/)，其中包含 `npm` 與 `npx`。
2. 開啟新的 PowerShell，確認命令可用：

   ```powershell
   node --version
   npm --version
   npx --version
   ```

   Node.js 版本應為 `v20` 或更新版本。如果剛安裝 Node.js，請先關閉並重開 PowerShell，讓 PATH 更新。
3. 確認你使用的 AI agent CLI 可用。若使用 Codex，可執行：

   ```powershell
   codex --version
   ```

Playwright MCP 使用 `npx` 啟動套件；通常不必先全域安裝 MCP 套件。瀏覽器會在首次使用時下載或初始化。

## 2. 將 Playwright MCP 加入 AI agent CLI

若 CLI 支援 MCP 登錄命令，依其語法登錄 stdio server。以下為 Codex 範例：

```powershell
codex mcp add playwright -- npx -y @playwright/mcp@latest
```

這會建立名為 `playwright` 的 stdio MCP 伺服器設定。`-y` 讓 npx 在尚未快取套件時自動確認安裝。

多數 MCP 用戶端可使用以下 JSON 結構；將內容加入該 CLI 指定的 MCP 設定檔。部分 CLI 使用 TOML 或圖形介面，欄位名稱可能不同：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

Codex 的手動設定方式是編輯使用者層級設定檔。以 PowerShell 開啟：

```powershell
notepad "$env:USERPROFILE\.codex\config.toml"
```

加入以下內容；若檔案已有 `[mcp_servers.playwright]`，請編輯既有區塊，不要建立重複區塊：

```toml
[mcp_servers.playwright]
command = "npx"
args = ["-y", "@playwright/mcp@latest"]
```

Codex 設定通常位於 `%USERPROFILE%\.codex\config.toml`；其他 agent CLI 請查閱其文件取得設定位置與格式。

## 3. 選用瀏覽器與執行模式

預設使用可見的 Chromium 瀏覽器。若要使用其他支援的瀏覽器，可在 `args` 加入選項，例如：

```toml
args = ["-y", "@playwright/mcp@latest", "--browser=firefox"]
```

支援的瀏覽器選項包括 `chrome`、`firefox`、`webkit` 與 `msedge`。若要在背景執行，可加上 `--headless`：

```toml
args = ["-y", "@playwright/mcp@latest", "--headless"]
```

首次啟動時可能需要下載瀏覽器，請保持網路連線並等待完成。若公司網路、代理伺服器或端點防護阻擋下載，需先依組織政策允許相關套件與瀏覽器下載。

## 4. 檢查設定與連線

```powershell
codex mcp list
```

Codex 清單應包含 `playwright` 並處於啟用狀態。其他 CLI 請使用其 MCP 清單、診斷命令或管理介面確認 server 已載入，並依其方式重新載入設定或重啟 agent。

可用下列唯讀頁面操作驗證：

> 使用 Playwright MCP 開啟 https://playwright.dev/，讀取頁面標題並回報。

若瀏覽器視窗開啟且 agent 能讀取頁面標題，代表 MCP 已能啟動並操作瀏覽器。

## 5. 常見問題

### 找不到 `npx` 或伺服器無法啟動

- 在新的 PowerShell 執行 `node --version`、`npm --version` 與 `npx --version`。
- 若 `npx` 命令不存在，安裝或修復 Node.js，再重新啟動使用中的 agent CLI。
- `codex mcp list` 只確認登錄狀態；請檢查 Codex MCP 面板中的啟動錯誤。

### 首次啟動停住或逾時

- 初次執行可能正在取得套件或瀏覽器，先確認網路及代理設定。
- 可在 PowerShell 手動執行 `npx -y @playwright/mcp@latest`，查看完整錯誤訊息；完成診斷後按 `Ctrl+C` 停止前景程序，再重新啟動 Codex。

### 找不到瀏覽器或瀏覽器無法啟動

- 確認 Playwright MCP 已完成首次瀏覽器下載。
- 檢查組織的端點防護、瀏覽器政策與下載限制。
- 若指定了 `--browser`，確認該瀏覽器已安裝且該選項拼寫正確；也可先移除選項回到預設設定。

### 更新或移除伺服器

`@latest` 會在 npx 解析時使用目前套件版本。若要移除 Codex 登錄項目：

```powershell
codex mcp remove playwright
```

## 官方參考

- [Microsoft Playwright MCP：用戶端安裝與設定](https://github.com/microsoft/playwright-mcp)
- [Playwright MCP 入門說明](https://playwright.dev/docs/getting-started-mcp)
- [Codex MCP 設定文件](https://developers.openai.com/codex/mcp)
