# OpenCode V2 Telegram 通知 Plugin 開發提示詞

## 任務目標

請幫我開發一個適用於 **OpenCode V2** 的 Plugin，使用 **TypeScript** 撰寫。

當 OpenCode Agent 發生以下情況時，自動透過 Telegram Bot API 發送通知：

1. Agent 已完成目前任務，進入閒置 / idle 狀態。
2. Agent 執行過程需要使用者同意、確認或授權，例如：
   - 需要確認是否執行某個操作
   - 需要使用者批准
   - 需要使用者輸入
   - 任務被阻塞，正在等待使用者回覆

通知內容應包含簡要狀態，例如：

- OpenCode 任務已完成，等待下一步指示
- OpenCode 正在等待你的確認
- OpenCode 需要你的操作才能繼續

---

## 技術要求

### 1. 使用 OpenCode V2 Plugin API

請先確認目前使用的是 **OpenCode V2 最新 Plugin API**。

請參考 OpenCode V2 官方文件，不要使用 V1 Plugin API。

實作前請先確認：

- Plugin 的正確建立方式
- Plugin lifecycle
- hooks / events
- Agent idle / task completed 相關事件
- permission / confirmation / user interaction 相關事件

如果官方 API 沒有直接提供 `idle` 或 `permission` 事件，請使用最接近且可靠的 lifecycle event 實作，不要自行假設不存在的 API。

---

### 2. 使用 TypeScript

Plugin 必須使用 TypeScript 撰寫。

建議專案結構：

```text
.opencode/
└── plugins/
    └── telegram-notify/
        ├── index.ts
        ├── telegram.ts
        ├── package.json
        └── .env
```

如果 OpenCode V2 官方建議其他結構，請以官方格式為準。

---

## Telegram 設定

### 3. 從 `.env` 讀取設定

不要把 Bot Token 或 Chat ID 寫死在程式碼中。

請從 `.env` 檔案讀取：

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

TypeScript 中應以環境變數方式取得，例如：

```ts
const botToken = process.env.TELEGRAM_BOT_TOKEN
const chatId = process.env.TELEGRAM_CHAT_ID
```

如有需要，可以使用：

```bash
dotenv
```

並正確初始化：

```ts
import "dotenv/config"
```

或使用官方更適合 OpenCode Plugin 的方式。

---

## Telegram Bot API

### 4. 使用 Telegram Bot API 發送訊息

使用 Telegram Bot API：

```text
POST https://api.telegram.org/bot{BOT_TOKEN}/sendMessage
```

請使用 `fetch()` 呼叫 API。

Request body：

```json
{
  "chat_id": "CHAT_ID",
  "text": "訊息內容"
}
```

例如：

```ts
async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn("Telegram configuration is missing")
    return
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  })
}
```

請再補上：

- HTTP error handling
- Telegram API error handling
- network exception handling
- timeout handling
- 避免通知失敗導致 OpenCode 本身中斷

---

## 通知事件

### 5. Agent 完成任務 / Idle

當 Agent 完成工作並進入等待狀態時，發送：

```text
✅ OpenCode 任務已完成

Agent 已完成目前工作，正在等待你的下一步指示。
```

如果能取得：

- 專案名稱
- session ID
- Agent 名稱
- 最後任務摘要

可以加入通知，但不是必要條件。

---

### 6. 等待使用者確認

當 Agent 遇到需要使用者批准、確認、輸入或授權的情況時，發送：

```text
⚠️ OpenCode 等待確認

目前有操作需要你的確認，請回到 OpenCode 查看。
```

如果能取得 permission / tool / action 名稱，可以加入，例如：

```text
⚠️ OpenCode 等待確認

需要確認的操作：
Execute shell command

請回到 OpenCode 查看。
```

---

## 防止重複通知

請避免同一個狀態被短時間重複觸發時，大量發送 Telegram 訊息。

至少實作其中一種：

- debounce
- cooldown
- event deduplication

例如：

```text
同類通知 5 秒內只發送一次
```

---

## `.env`

請建立：

```text
.env
```

內容：

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

不要填入真實 Token。

---

## `.env.example`

另外建立：

```text
.env.example
```

內容：

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

---

## `.gitignore`

確認：

```text
.env
```

有加入 `.gitignore`。

例如：

```gitignore
.env
.env.local
```

避免 Telegram Bot Token 被 commit 到 Git。

---

## 安全要求

禁止：

```ts
const TOKEN = "123456789:ABC..."
```

禁止將 Token：

- 寫死在 source code
- 寫進 Git
- 顯示在 log
- 顯示在 error message
- 放入 README 範例真實值

Telegram Bot Token 必須只存在於：

```text
.env
```

---

## 程式架構

盡量將 Telegram 發送邏輯獨立。

例如：

```text
index.ts
```

負責：

- OpenCode Plugin 註冊
- event / lifecycle hook
- 判斷通知條件

```text
telegram.ts
```

負責：

- 讀取 Telegram 設定
- 呼叫 Telegram Bot API
- error handling

---

## 開發流程

請依照以下流程執行：

1. 先閱讀目前專案
2. 確認 OpenCode 版本
3. 查閱 OpenCode V2 官方 Plugin 文件
4. 找出適合監控：
   - Agent task completed
   - idle
   - permission
   - confirmation
   - user input
   的 event / hook
5. 說明你準備採用哪些 OpenCode V2 API
6. 再開始建立 Plugin
7. 建立 `.env`
8. 建立 `.env.example`
9. 更新 `.gitignore`
10. 完成 Telegram API function
11. 接入 OpenCode lifecycle
12. 執行 TypeScript type check
13. 執行基本測試
14. 說明如何安裝與使用

---

## 驗收條件

完成後必須符合：

### 情境一

Agent 完成任務。

結果：

```text
Telegram 收到：
✅ OpenCode 任務已完成
```

### 情境二

Agent 需要使用者確認。

結果：

```text
Telegram 收到：
⚠️ OpenCode 等待確認
```

### 情境三

`.env` 未設定。

Plugin 不應造成 OpenCode crash。

只能：

```text
warn
```

並略過通知。

### 情境四

Telegram API 無法連線。

OpenCode 本身仍應正常運作。

### 情境五

同一事件短時間重複觸發。

Telegram 不應被大量重複通知。

---

## 最後輸出

完成後請提供：

1. 修改 / 新增了哪些檔案
2. 每個檔案用途
3. 使用了哪些 OpenCode V2 hooks / events
4. 為什麼選擇這些事件
5. `.env` 設定方式
6. Plugin 安裝方式
7. Plugin 啟用方式
8. 測試方式
9. 如何手動測試 Telegram 通知
10. 如果 OpenCode V2 API 無法精準判斷 idle 或 permission，請清楚說明限制與替代實作

不要自行假設不存在的 OpenCode API。

若官方文件與舊版教學有衝突，以 **OpenCode V2 官方文件**為準。
