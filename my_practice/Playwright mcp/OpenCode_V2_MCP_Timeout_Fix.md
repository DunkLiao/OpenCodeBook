# OpenCode V2 MCP 啟動逾時（Request timed out）排查與修正紀錄

> 適用情境：Windows + OpenCode V2 + npx 啟動的 Local MCP
> 本次症狀：`playwright` 與 `chrome-devtools` 顯示 `failed: Request timed out`
> 結論：**MCP Server 本身沒有壞**，是啟動逾時後狀態被快取，加上兩個設定上的地雷。
> 環境：OpenCode `v2.0.18`、Node `v24.16.0`、npm `11.13.0`

---

## 1. 問題現象

執行：

```powershell
opencode mcp list
```

得到：

```text
✗ chrome-devtools  failed: Request timed out
✓ deepwiki         connected
✗ playwright       failed: Request timed out
```

`deepwiki` 是 Remote MCP 所以正常，兩個 Local（npx）MCP 都掛掉。

---

## 2. 診斷過程

排查時**先確認 MCP Server 本體是否健康**，再回頭看 OpenCode 這一側。

### 2-1 直接手動執行 MCP Server

```powershell
npx -y "@playwright/mcp@latest" --version
npx -y "chrome-devtools-mcp@latest" --version
```

結果：

```text
Version 0.0.82          (playwright，約 4.6 秒)
1.10.1                  (chrome-devtools，約 5.9 秒)
```

兩個套件都能正常啟動、速度也正常。

### 2-2 直接對 Server 做 MCP 握手

把標準的 `initialize` JSON-RPC 請求直接餵給 Server：

```powershell
$req = '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"probe","version":"1.0"}}}'
$req | npx -y "@playwright/mcp@latest"
```

回應（節錄）：

```json
{"result":{"protocolVersion":"2024-11-05","capabilities":{"tools":{"listChanged":true}},"serverInfo":{"name":"Playwright","version":"1.64.0-alpha-..."}},"jsonrpc":"2.0","id":1}
```

**Server 秒回、完全正常。** 所以問題不在 Playwright MCP。

### 2-3 檢查有沒有殘留的 Server 程序

```powershell
Get-Process node | Select-Object Id, StartTime
```

結果：**沒有任何 node 程序在跑**。代表 OpenCode 端根本沒有連上，而不是連上後斷線。

### 2-4 翻 OpenCode Log（關鍵證據）

```powershell
Select-String -Path "$env:USERPROFILE\.local\share\opencode\log\opencode.log" `
  -Pattern "playwright|chrome-devtools|mcp" -CaseSensitive:$false |
  Select-Object -Last 40 | ForEach-Object { $_.Line }
```

比對同一天的紀錄：

| 時間 | Server | 結果 | http.span |
|---|---|---|---|
| 03:28:49 | chrome-devtools | connected（30 tools） | 6102 ms |
| 04:29:54 | playwright | connected（25 tools） | 5615 ms |
| 04:29:55 | chrome-devtools | connected（30 tools） | 6284 ms |
| 07:19:21 | deepwiki | connected | **31081 ms** |
| 07:19:59 | chrome-devtools | **connect failed** | 68315 ms |
| 07:19:59 | playwright | **connect failed** | 68458 ms |
| 07:20:02 | playwright | **connect failed** | 51371 ms |
| 07:20:02 | chrome-devtools | **connect failed** | 51482 ms |

兩個重點：

1. **早上 03:00～04:29 兩個 Local MCP 都連得好好的**（5～9 秒）→ 設定本身沒有錯。
2. 07:19 那次連 `deepwiki` 都花了 31 秒（平常約 3 秒）→ **當時整台機器／網路很慢**。
3. 失敗時的 `http.span` 是 **51～68 秒**，遠超過 OpenCode 預設的 **30 秒 startup timeout**。

---

## 3. 根本原因

### 3-1 啟動逾時 + 狀態被快取（主因）

OpenCode 的 MCP 逾時預設值：

| Timeout | 預設值 | 適用範圍 |
|---|---|---|
| `startup` | 30 秒 | 建立傳輸連線與 Server 初始化 |
| `catalog` | 30 秒 | 列出 tools / prompts / resources |
| `execution` | 12 小時 | 實際呼叫工具 |

07:19 那次啟動時系統很忙，兩個 npx Server 在 30 秒內**還沒完成初始化**，就被判定 `failed`。

而 `opencode mcp list` **顯示的是服務啟動當下快取的狀態，不會自動重新連線**。

驗證方式：在 07:26 再跑一次 `opencode mcp list`，log 裡**沒有出現任何新的連線嘗試或失敗紀錄**——它只是把舊結果再印一次。這就是為什麼「明明 Server 好了，它還是一直顯示 failed」。

### 3-2 地雷一：`playwright` 少了 `-y`

原設定：

```jsonc
"playwright": {
  "type": "local",
  "command": ["npx", "@playwright/mcp@latest"]   // ← 少了 -y
}
```

`npx` 在**套件尚未快取**、需要下載時會停下來問：

```text
Need to install the following packages. Ok to proceed? (y)
```

在 OpenCode 這種**非互動**環境裡，這個提問會直接卡死到逾時。

對照組：`chrome-devtools` 有 `-y`，`playwright` 沒有——這是不一致的設定。

> 註：舊文件 `OpenCode_V2_MCP_Global_Setup_Guide.md` 第 4 節曾說「為什麼沒有加 `-y`」，
> 原因是當時 `opencode mcp add` 的 CLI 把 `-y` 誤判成自己的參數。
> **直接編輯 JSON 設定檔就不會有這個問題**，`-y` 是 `npx` 的參數，寫在 `command` 陣列裡不會經過 OpenCode 的 CLI 解析。

### 3-3 地雷二：`@latest` 每次啟動都要連 npm registry

`@latest` 會讓 `npx` 每次啟動都去 registry 查詢最新版本。網路一慢，啟動時間就被拖垮——這正是 07:19 那次的情境。

---

## 4. 修正內容

檔案位置：

```text
C:\Users\user\.config\opencode\opencode.jsonc
```

### 修改前

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": ["npx", "-y", "chrome-devtools-mcp@latest"]
      },
      "playwright": {
        "type": "local",
        "command": ["npx", "@playwright/mcp@latest"]
      },
      "deepwiki": {
        "type": "remote",
        "url": "https://mcp.deepwiki.com/mcp"
      }
    }
  }
}
```

### 修改後

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "timeout": {
      "startup": 60000
    },
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": ["npx", "-y", "chrome-devtools-mcp@1.10.1"]
      },
      "playwright": {
        "type": "local",
        "command": ["npx", "-y", "@playwright/mcp@0.0.82"]
      },
      "deepwiki": {
        "type": "remote",
        "url": "https://mcp.deepwiki.com/mcp"
      }
    }
  }
}
```

### 三項調整對照

| 項目 | 修改前 | 修改後 | 目的 |
|---|---|---|---|
| `playwright` 的 `-y` | 無 | **有** | 避免非互動環境卡在安裝確認 |
| 套件版本 | `@latest` | 釘死 `@0.0.82` / `@1.10.1` | 免去每次啟動查 registry |
| `mcp.timeout.startup` | 30 秒（預設） | **60000 毫秒** | 給慢速冷啟動更多餘裕 |

> `mcp.timeout` 是 `mcp.servers` 的**同層兄弟節點**，不是寫在 server 裡面。

---

## 5. 驗證結果

### 5-1 讓設定生效

設定檔修改後必須**重啟 OpenCode 服務**，因為先前的失敗狀態被快取住了：

```powershell
opencode service restart
```

或直接把 OpenCode 整個關掉重開。

> 注意：重啟服務可能會中斷正在進行的 session，建議在另一個終端機執行。

### 5-2 確認連線

```powershell
opencode mcp list
```

修正後實際輸出：

```text
✓ chrome-devtools  connected
✓ deepwiki         connected
✓ playwright       connected
```

三個全部 `connected`，修正完成。

### 5-3 在 TUI 中確認

```text
/mcps
```

應可看到三個 MCP 都已載入，且工具數量正常：

```text
chrome-devtools   30 tools
playwright        25 tools
deepwiki           3 tools
```

---

## 6. 給未來自己的排查 SOP

遇到 `failed: Request timed out` 時，照這個順序做：

```text
1. opencode mcp list                     ← 先看現象
2. 手動跑 npx ... --version              ← Server 本體壞了嗎？
3. 餵 initialize 握手                    ← 真的能通嗎？
4. Get-Process node                      ← 有沒有程序在跑？
5. 查 opencode.log 的 http.span          ← 是逾時還是真的錯誤？
6. opencode service restart              ← 狀態被快取時的解藥
7. opencode mcp list                     ← 複驗
```

Log 位置：

```text
C:\Users\user\.local\share\opencode\log\opencode.log
```

判斷原則：

- **Server 手動跑得動 + Log 出現 `mcp connect failed`** → 逾時／快取問題，重啟服務即可。
- **Server 手動跑不動** → 才是套件、Node 版本或 PATH 問題。
- 需要更細的紀錄時，用 `OPENCODE_LOG_LEVEL=DEBUG` 重現一次。

---

## 7. 需要升級套件版本時

版本已釘死，要升級請**手動改版號**，不要改回 `@latest`：

```powershell
# 先查目前最新版
npm view @playwright/mcp version
npm view chrome-devtools-mcp version
```

再更新 `opencode.jsonc` 中的版號，然後：

```powershell
opencode service restart
opencode mcp list
```

這樣可以在「可控的時間點」升級，而不是每次啟動都被迫連線 registry。

---

## 8. 官方參考資料

- OpenCode MCP Servers（含 Timeouts 章節）
  <https://opencode.ai/v2/docs/mcp-servers>
- OpenCode Troubleshooting
  <https://opencode.ai/v2/docs/troubleshooting>
- Microsoft Playwright MCP
  <https://github.com/microsoft/playwright-mcp>
- Chrome DevTools MCP
  <https://github.com/ChromeDevTools/chrome-devtools-mcp>

---

## 9. 一句話總結

> `Request timed out` 不等於 Server 壞掉。
> 這次是「機器慢 → 30 秒 startup timeout 來不及 → 狀態被快取」，
> 外加 `playwright` 少了 `-y`、兩個套件都用 `@latest` 兩個地雷；
> 補上 `-y`、釘死版本、timeout 拉到 60 秒，重啟服務後三個 MCP 全數 `connected`。
