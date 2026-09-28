# telegram-notify — OpenCode V2 Telegram 通知 Plugin

當 OpenCode Agent 完成任務、等待確認、需要輸入或發生錯誤時，透過 Telegram Bot 發送通知。

- 使用 **OpenCode V2 Plugin API**（`Plugin.define` + `ctx.event.subscribe`），**不是 V1**。
- TypeScript 撰寫，零執行期依賴。
- Bot Token 只從環境變數 / `.env` 讀取，不會寫死在程式碼，也不會出現在 log。

---

## 檔案結構

```text
.opencode/plugins/telegram-notify/
├── index.ts         # Plugin 註冊、事件訂閱、通知判斷、cooldown / 去重
├── telegram.ts      # 讀取設定(.env)、呼叫 Telegram Bot API、錯誤處理
├── messages.ts      # 通知訊息文字組裝
├── test-send.ts     # 手動測試 Telegram 發送
├── package.json     # 開發用（typecheck 依賴）
├── tsconfig.json    # TypeScript 設定
├── .env             # 你的 Token 與 Chat ID（已被 .gitignore 忽略）
└── .env.example     # 範例
```

---

## 使用的 OpenCode V2 API

| 用途 | API |
| --- | --- |
| Plugin 進入點 | `Plugin.define({ id, setup(ctx) })` |
| 事件訂閱 | `ctx.event.subscribe({ signal })`（公開事件流，事件為 `{ type, data }`） |
| 讀取 Session | `ctx.session.get({ sessionID })` → `Session.Info` |
| 專案 / 目錄 | `ctx.location.project` / `ctx.location.directory` |
| Plugin 選項 | `ctx.options` |
| 版本 | `ctx.app.version` |
| 清除資源 | `setup` 回傳 cleanup 函式（`AbortController.abort()`） |

### 事件對應

| 事件 `type` | 觸發時機 | 通知 |
| --- | --- | --- |
| `session.execution.succeeded` | Agent 完成一輪工作 | ✅ OpenCode 任務已完成 |
| `session.idle` / `session.status`（`status.type === "idle"`） | 同上（僅為備援） | ✅ OpenCode 任務已完成 |
| `permission.asked` | 需要批准 / 授權操作 | ⚠️ OpenCode 等待確認 |
| `permission.replied` | 使用者已回覆權限 | （僅清除待確認狀態，不通知） |
| `form.created` | OpenCode 需要使用者輸入 | 📝 OpenCode 需要你的輸入 |
| `session.execution.failed` / `session.error` | 執行發生錯誤 | ❌ OpenCode 執行發生錯誤 |

> 這些事件名稱取自 OpenCode V2 的公開事件流定義（與官方文件 `session.idle` 範例同一組 API），非自行假設。
>
> 實測 V2 事件流**不會**把 `session.idle` / `session.status` 送達外掛，可靠的「一輪結束」訊號是 `session.execution.succeeded`（失敗為 `session.execution.failed`）。這些事件共用同一個去重 key，即使同時收到也不會重複通知。

---

## 設定 `.env`

編輯 `.opencode/plugins/telegram-notify/.env`：

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdef...
TELEGRAM_CHAT_ID=123456789
```

- `TELEGRAM_BOT_TOKEN`：向 [@BotFather](https://t.me/BotFather) 建立 Bot 後取得的 Token。
- `TELEGRAM_CHAT_ID`：你的聊天 ID（可透過 `https://api.telegram.org/bot<TOKEN>/getUpdates` 取得）。
- 真正的環境變數會覆蓋 `.env` 的值。
- Plugin 會依序尋找：本目錄的 `.env` → 目前工作目錄的 `.env`。

`.env` 已列入專案根目錄 `.gitignore`，不會被 commit。

---

## 安裝與啟用

Plugin 位於 `.opencode/plugins/`，OpenCode V2 會**自動探索**，不需要修改 `opencode.jsonc`。

重新載入：

```bash
opencode service restart
```

確認是否有載入（外掛會在 log 印出 `[telegram-notify] ready ...`）：

```bash
opencode plugin list
```

---

## 測試

### 1. TypeScript 型別檢查

```bash
cd .opencode/plugins/telegram-notify
npm install
npm run typecheck
```

### 2. 手動測試 Telegram 發送

```bash
cd .opencode/plugins/telegram-notify
bun test-send.ts "OpenCode Telegram 測試 ✅"
```

### 3. 端到端測試

1. 設定好 `.env` 並重新啟動服務。
2. 在 OpenCode 執行一個會要求權限的操作（例如執行 shell 指令），應收到 **⚠️ OpenCode 等待確認**。
3. 讓 Agent 完成一個回合，應收到 **✅ OpenCode 任務已完成**。

---

## 防止重複通知

- **Cooldown / dedup**：同一種通知（以 `類型:sessionID` 為 key）預設 **5 秒**內只發送一次。
- **待確認抑制**：當送出 `permission.asked` 後，該 session 的 `session.idle` 在未回覆前不會誤發「任務已完成」（TTL 30 分鐘）。
- **子 session 過濾**：預設不通知 subagent 的 session（可透過選項開啟）。

### 可用選項（`opencode.jsonc`）

```jsonc
{
  "plugins": [
    {
      "package": "./.opencode/plugins/telegram-notify",
      "options": {
        "cooldownMs": 5000,
        "notifySubagents": false,
        "notifyErrors": true
      }
    }
  ]
}
```

> 自動探索時不需要這段；只有在你想覆寫預設值時才需要明確加入並帶 `options`。

---

## 安全性

- Token 只存在於 `.env` / 環境變數。
- 錯誤訊息與 log 會將 Token 以 `[redacted]` 取代。
- 設定缺失時只 `warn` 並略過通知，不會讓 OpenCode crash。
- Telegram 無法連線或逾時（預設 8 秒）時，OpenCode 仍正常運作。

---

## 已知限制

- `form.created` 屬於較新 / 較少見的互動流程，在某些介面可能不會出現；程式以防禦性方式處理，只對已知事件類型反應。
- `session.idle` 在「被中斷」時也可能觸發，通知會附上 `結束狀態`（取自 `Session.Info.outcome`），如需只通知成功，可再過濾。
- `session.error` 的錯誤文字會截斷後才送出。
- `package.json` / `node_modules` 僅供本機 typecheck 使用；OpenCode 執行期會自行提供 `@opencode/plugin`。
