# OpenCode V2 Telegram 通知 Plugin 完整實作指南

> 適用：OpenCode V2（實測 v2.0.18）
> 環境：Windows + 專案內 `.opencode/plugins/`
> 更新日期：2026-09-28
> 對應提示詞：`opencode_v2_telegram_plugin_prompt.md`

---

## 目錄

1. [這個 Plugin 做什麼](#1-這個-plugin-做什麼)
2. [成果與驗收條件](#2-成果與驗收條件)
3. [V2 Plugin 基本結構](#3-v2-plugin-基本結構)
4. [使用哪些 V2 API 與事件](#4-使用哪些-v2-api-與事件)
5. [為什麼選擇這些事件](#5-為什麼選擇這些事件)
6. [檔案結構與各檔用途](#6-檔案結構與各檔用途)
7. [程式架構與關鍵設計](#7-程式架構與關鍵設計)
8. [設定 .env](#8-設定-env)
9. [安裝與啟用](#9-安裝與啟用)
10. [測試方式](#10-測試方式)
11. [如何手動測試 Telegram 通知](#11-如何手動測試-telegram-通知)
12. [重要陷阱：不能執行期 import @opencode/plugin](#12-重要陷阱不能執行期-import-opencodeplugin)
13. [常見錯誤與除錯](#13-常見錯誤與除錯)
14. [已知限制與替代實作](#14-已知限制與替代實作)
15. [安全性要求](#15-安全性要求)
16. [官方文件](#16-官方文件)

---

# 1. 這個 Plugin 做什麼

當 OpenCode Agent 發生以下情況時，自動透過 Telegram Bot 發送通知：

```text
Agent 完成任務 / 進入 idle        → ✅ 任務已完成
需要使用者同意、確認、授權        → ⚠️ 等待確認
需要使用者輸入                    → 📝 需要你的輸入
執行過程發生錯誤                  → ❌ 執行發生錯誤
```

通知內容範例：

```text
✅ OpenCode 任務已完成

Agent 已完成目前工作，正在等待你的下一步指示。

專案：OpenCodeBook
Session：ses_xxxx
Agent：build
```

```text
⚠️ OpenCode 等待確認

目前有操作需要你的確認，請回到 OpenCode 查看。

需要確認的操作：
shell git push origin main

專案：OpenCodeBook
Session：ses_xxxx
```

---

# 2. 成果與驗收條件

| 情境 | 預期結果 |
| --- | --- |
| 一、Agent 完成任務 | Telegram 收到 `✅ OpenCode 任務已完成` |
| 二、需要使用者確認 | Telegram 收到 `⚠️ OpenCode 等待確認`（含操作內容） |
| 三、`.env` 未設定 | Plugin 只 `warn` 並略過，不讓 OpenCode crash |
| 四、Telegram API 無法連線 | OpenCode 仍正常運作（逾時 / 例外皆被攔截） |
| 五、同事件短時間重複觸發 | 不大量重複通知（cooldown + 抑制） |

---

# 3. V2 Plugin 基本結構

V2 Plugin 使用 `Plugin.define()`，與 V1 函式式 Plugin 完全不同：

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "example",
  async setup(ctx) {
    // 註冊 hooks / transforms / 訂閱事件
    return () => {
      // cleanup
    }
  },
})
```

重點：

```text
id      → 每個 Plugin 唯一，storage 與診斷以此為 key
setup   → Plugin 載入時執行，可回傳 cleanup
```

---

# 4. 使用哪些 V2 API 與事件

Plugin 執行時可用的 Context（本 Plugin 實際使用）：

| 用途 | API |
| --- | --- |
| Plugin 進入點 | 預設匯出 `{ id, setup(ctx) }`（`Plugin.define` 只是 identity） |
| 事件訂閱 | `ctx.event.subscribe({ signal })` |
| 讀取 Session | `ctx.session.get({ sessionID })` → `Session.Info` |
| 專案 / 目錄 | `ctx.location.project`、`ctx.location.directory` |
| 選項 | `ctx.options` |
| 版本 | `ctx.app.version` |
| 清除資源 | `setup` 回傳 cleanup（`AbortController.abort()`） |

## 事件（`ctx.event.subscribe`）

事件物件格式為 `{ type, data }`。

| 事件 `type` | `event.data` 欄位 | 用途 |
| --- | --- | --- |
| `session.idle` | `{ sessionID }` | Agent 完成 / 進入等待 |
| `permission.asked` | `{ id, sessionID, action, resources[], save?, metadata?, source?, message? }` | 等待確認 / 授權 |
| `permission.replied` | `{ sessionID, requestID, reply }` | 使用者已回覆 |
| `form.created` | `{ form: { id, sessionID, title, fields } }` | 等待使用者輸入 |
| `session.error` | `{ sessionID?, error }` | 執行錯誤 |

`Session.Info` 可用欄位：`id`、`parentID`、`agent`、`title`、`outcome`（`succeeded` / `failed` / `interrupted`）、`time`、`cost`、`tokens`。

> 實際事件訂閱範例：

```ts
const controller = new AbortController()

void (async () => {
  for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
    if (event.type === "session.idle") {
      console.log("Session completed", event.data.sessionID)
    }
  }
})()

return () => controller.abort()
```

---

# 5. 為什麼選擇這些事件

```text
session.idle
→ 官方 migration 指南明確用它代表「session 完成」，是最可靠的 idle 訊號。

permission.asked
→ 公開事件流中「需要批准 / 授權」的對應事件，
  且 payload 直接帶 action 與 resources，比 ctx.permission.hook("evaluate") 單純。

form.created
→ 對應「需要使用者輸入」。

session.error
→ 對應「執行發生錯誤」。
```

補充說明：

- V2 **沒有** 名為 `idle` 或 `permission` 的單一 hook；官方以 `ctx.event.subscribe()` 提供事件流。
- `ctx.permission.hook("evaluate")` 是另一條路：它在權限提示發布前執行，可改寫 `effect`。本 Plugin 不改寫行為，只做通知，因此選擇事件流。
- 這些事件名稱皆取自 V2 公開事件流定義，非自行假設。

---

# 6. 檔案結構與各檔用途

```text
.opencode/plugins/telegram-notify/
├── index.ts          # Plugin 註冊、事件訂閱、通知判斷、cooldown / 去重
├── telegram.ts       # 讀取設定(.env)、呼叫 Telegram Bot API、錯誤處理
├── messages.ts       # 通知訊息文字組裝
├── test-send.ts      # 手動測試 Telegram 發送
├── package.json      # 開發用（typecheck 依賴）
├── tsconfig.json     # TypeScript 設定
├── .env              # 你的 Token 與 Chat ID（會被 gitignore）
└── .env.example      # 範例
```

分工原則：

```text
index.ts    → OpenCode 生命週期、事件判斷
telegram.ts → 對外 API 呼叫、設定、錯誤處理
messages.ts → 文字內容（可獨立調整文案）
```

---

# 7. 程式架構與關鍵設計

## 7.1 事件迴圈與清除

```ts
setup(ctx) {
  const controller = new AbortController()

  void (async () => {
    for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
      // 處理事件
    }
  })()

  return () => controller.abort()   // Plugin 卸載時停止訂閱
}
```

## 7.2 不讓通知失敗影響 OpenCode

```ts
const notify = (key, build) => {
  if (withinCooldown(key)) return
  void (async () => {
    try {
      if (!getTelegramConfig()) return
      const text = build()
      const result = await sendTelegramMessage(text)
      if (!result.ok && result.error !== "missing-config") {
        console.warn(`[telegram-notify] notification was not delivered (${result.error})`)
      }
    } catch (error) {
      console.warn(`[telegram-notify] notification failed`)
    }
  })()
}
```

重點：

```text
- 所有發送都是 fire-and-forget（不 await，不阻塞事件流）
- 全程 try/catch
- sendTelegramMessage 本身也永不出錯（回傳 { ok, error }）
```

## 7.3 防重複通知

三層防護：

```text
1. Cooldown / dedup
   同一 key（類型:sessionID）預設 5 秒內只送一次
   key 例如：idle:ses_xxx、permission:ses_xxx

2. 待確認抑制
   送出 permission.asked 後，該 session 在未回覆前
   不再誤發「任務已完成」（TTL 30 分鐘）
   permission.replied 時清除

3. 子 session 過濾
   預設跳過有 parentID 的 subagent session（可選項開啟）
```

## 7.4 Telegram 呼叫（含逾時）

```ts
const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  signal: AbortSignal.timeout(8000),
})
```

處理：

```text
- response.ok === false          → 記錄 HTTP 狀態
- payload.ok === false           → 記錄 Telegram 錯誤描述
- TimeoutError / AbortError      → 記錄逾時
- 其他例外                      → 記錄網路錯誤
- 所有錯誤輸出前做 Token 遮蔽    → token → [redacted]
```

## 7.5 Plugin 選項

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

> 自動探索時不需要這段；只有要覆寫預設值時才明確加入。

---

# 8. 設定 .env

編輯 `.opencode/plugins/telegram-notify/.env`：

```env
TELEGRAM_BOT_TOKEN=你的_bot_token
TELEGRAM_CHAT_ID=你的_chat_id
```

取得方式：

```text
TELEGRAM_BOT_TOKEN
→ 向 @BotFather 建立 Bot 後取得

TELEGRAM_CHAT_ID
→ 對 Bot 傳訊息後，呼叫
  https://api.telegram.org/bot<TOKEN>/getUpdates 取得
```

讀取規則：

```text
1. 真正的環境變數優先，會覆蓋 .env
2. .env 尋找順序：Plugin 目錄 → 目前工作目錄
3. .env 由根目錄 .gitignore 忽略，不會被 commit
```

`.env.example`：

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

---

# 9. 安裝與啟用

Plugin 位於 `.opencode/plugins/`，OpenCode V2 會自動探索，**不需要**修改 `opencode.jsonc`。

```bash
opencode service restart
opencode plugin list
```

預期輸出：

```text
ID               VERSION  SOURCE
telegram.notify  local    D:\...\.opencode\plugins\telegram-notify\index.ts
```

移除方式：刪除整個 `telegram-notify` 目錄，或移動到別處後 `opencode service restart`。

---

# 10. 測試方式

## 10.1 TypeScript 型別檢查

```bash
cd .opencode/plugins/telegram-notify
npm install
npm run typecheck
```

## 10.2 缺少設定時的行為

未設定 `.env` 時執行：

```bash
bun test-send.ts
```

預期：

```text
[telegram-notify] Telegram configuration is missing ...; notifications are disabled.
[telegram-notify] 找不到 TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID，請先設定 .env
```

只 warn，不 crash。

## 10.3 錯誤處理（假 Token）

```powershell
$env:TELEGRAM_BOT_TOKEN='123456789:FAKE'
$env:TELEGRAM_CHAT_ID='1'
bun test-send.ts "pipeline check"
```

預期：

```text
[telegram-notify] Telegram API request failed: HTTP 401 {...}
[telegram-notify] 發送失敗：HTTP 401 {...}
```

重點：Token 不會出現在任何輸出中。

---

# 11. 如何手動測試 Telegram 通知

1. 設定 `.env` 的真實 Token 與 Chat ID。
2. `opencode service restart`。
3. 直接測試發送：

```bash
cd .opencode/plugins/telegram-notify
bun test-send.ts "OpenCode Telegram 測試 ✅"
```

4. 端到端測試：

```text
⚠️ 等待確認
→ 觸發一個需要權限的操作（例如會詢問的 shell 指令）

✅ 任務完成
→ 讓 Agent 完成一個回合
```

---

# 12. 重要陷阱：不能執行期 import @opencode/plugin

在 OpenCode 2.0.18 實測發現：

```text
Plugin loader 無法解析執行期的：import { Plugin } from "@opencode/plugin"
即使 Plugin 目錄內已安裝 node_modules，仍會出現：

  ResolveMessage: Cannot find package '@opencode/plugin' imported from .../index.ts
  → failed to load plugin
```

原因：V2 執行期只讀取 default export 的 `id` 與 `setup`，而 `Plugin.define` 只是 identity 函式：

```ts
// node_modules/@opencode/plugin/dist/promise/plugin.js
export function define(plugin) {
  return plugin
}
```

因此正確寫法有兩種：

## 寫法 A：純物件（最簡單）

```ts
export default {
  id: "telegram.notify",
  setup(ctx) {
    // ...
  },
}
```

## 寫法 B：type-only import（保留型別，執行期被消除）

```ts
import type { Plugin } from "@opencode/plugin"

const plugin: Plugin.Plugin = {
  id: "telegram.notify",
  setup(ctx) {
    // ...
  },
}

export default plugin
```

本 Plugin 採用 **寫法 B**：typecheck 保有完整型別，執行期沒有 bare import，可正常載入。

> 注意：這與文件上「local plugin 範例直接 `import { Plugin }`」的寫法不同；在 2.0.18 上直接照抄會載入失敗。若未來版本修正，寫法 B 仍相容。

---

# 13. 常見錯誤與除錯

## 問題 1：log 出現 `failed to load plugin`

```text
Cannot find package '@opencode/plugin'
```

→ 見第 12 節，改成 `import type` 或純物件匯出。

## 問題 2：Plugin 沒被載入

檢查：

```text
- 是否放在 .opencode/plugins/（不是專案根的 plugins/）
- 目錄內是否有 index.ts
- opencode plugin list 是否看到它
```

## 問題 3：改了程式沒生效

```bash
opencode service restart
```

## 問題 4：Telegram 沒收到通知

檢查順序：

```text
1. .env 是否有值（Token / Chat ID）
2. test-send.ts 是否成功
3. 是否因 cooldown 被去重（同類型 5 秒內只一次）
4. 是否為 subagent session（預設不通知）
```

## 問題 5：一直重複通知

```text
→ 調高 cooldownMs
→ 確認 permission.asked 與 session.idle 的抑制邏輯生效
```

## 問題 6：不確定有哪些事件

可在 Plugin 內暫時訂閱並列出：

```ts
for await (const event of ctx.event.subscribe({ signal })) {
  console.log(event.type, event.data)
}
```

---

# 14. 已知限制與替代實作

| 限制 | 說明 / 替代 |
| --- | --- |
| `form.created` 不一定出現 | 較新的互動流程，部分介面不觸發；程式以防禦性方式處理 |
| `session.idle` 可能因中斷觸發 | 通知附上 `結束狀態`（`Session.Info.outcome`）；要只通知成功可再過濾 `outcome === "succeeded"` |
| 無法取得「最後任務摘要」 | 事件不含摘要；必要時可讀 `ctx.session.context({ sessionID })`，但成本較高 |
| 沒有真正的 idle hook | 官方以事件流 `session.idle` 代表；本 Plugin 採用之 |
| 沒有 permission hook 的替代 | 可用 `ctx.permission.hook("evaluate")`，但那是介入決策，非單純通知 |
| 錯誤文字可能很長 | 送出前已截斷（約 300 字） |

---

# 15. 安全性要求

```text
禁止：
  const TOKEN = "123456789:ABC..."

Token 只能存在於：
  .env / 環境變數

且必須：
  - 不寫進 Git（.gitignore）
  - 不出現在 log
  - 不出現在 error message
  - 不出現在 README 真實值
```

本 Plugin 的保護：

```text
- 讀取時只從 process.env / .env
- 所有錯誤輸出前以 [redacted] 取代 Token
- 缺少設定只 warn，不 crash
```

---

# 16. 官方文件

以 OpenCode V2 官方文件為準：

```text
Plugins 設定
https://opencode.ai/v2/docs/plugins

Build Plugins（Plugin API / Hooks / Events）
https://opencode.ai/v2/docs/build/plugins

V1 → V2 Plugin 遷移
https://opencode.ai/v2/docs/build/plugins/migrate-v1

Config
https://opencode.ai/v2/docs/config
```

---

**文件版本：OpenCode V2 Telegram 通知 Plugin / 2026-09-28**
