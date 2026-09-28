# OpenCode V2 Telegram 通知 Plugin — 修正與異動說明

本文件記錄 `telegram-notify` Plugin 在 **2026-09-28** 的除錯與修正：為什麼「任務完成」通知一直不會送出，以及實際改了哪些檔案與事件監聽邏輯。

> 安全原則：本文件不包含任何真實 Bot Token、Chat ID 或其他機敏資訊。

---

## 1. 問題現象

- Plugin 可正常載入（`opencode plugin list` 顯示 `telegram.notify`）。
- 手動測試 `bun test-send.ts` 能成功送出訊息。
- 實際上線後：
  - ✅ 偶爾會收到「📝 OpenCode 需要你的輸入」（`form.created`）
  - ❌ **永遠收不到「✅ OpenCode 任務已完成」**
  - ❌ 也收不到錯誤通知

也就是「發送層正常，但 idle／完成事件根本沒觸發」。

---

## 2. 根因

### 2.1 觀測障礙

OpenCode 會把 Plugin 的 `console.log` / `console.warn` **整個吞掉**，
即使加上 `--standalone --print-logs --log-level debug` 也看不到任何 `[telegram-notify]` 輸出；
而 Plugin context 的 `ctx.app` 只有 `name` / `version` / `channel`，沒有 logger 可用。
因此無法從日誌判斷事件是否送達。

### 2.2 用臨時探針取得真相

改以一個臨時探針 Plugin 把 `ctx.event.subscribe` 收到的**每一個原始事件**寫入檔案，
在 `opencode run --standalone` 的實測中擷取到 159 筆事件，統計結果：

| 事件 | 送達次數 |
| --- | --- |
| `session.idle` | **0** |
| `session.status` | **0** |
| `session.execution.succeeded` | 1（每輪結束都會送） |
| `session.error` | 0（V2 事件清單中根本不存在） |

單一測試 session 的實際事件序列：

```text
session.inbox.enqueued      (seq 1)
session.execution.started   (seq 2)
session.inbox.delivered     (seq 4)
session.step.ended          (seq 13, finish: "stop")
session.execution.succeeded (seq 14)   ← 真正的「一輪結束」訊號
```

### 2.3 結論

- 原本監聽的 **`session.idle` 不會送達 Plugin** → 完成通知永遠不觸發。
- 原本監聽的 **`session.error` 不在 V2 事件清單** → 錯誤通知永遠不觸發。
- 真正可靠的訊號是 **`session.execution.succeeded`**（失敗為 `session.execution.failed`）。

事件定義可在 `@opencode/schema` 的 `session-event.d.ts` 找到：

```ts
// session.execution.succeeded
data: { sessionID }

// session.execution.failed
data: { error: { type, message, status? }, sessionID }

// session.execution.interrupted
data: { reason: "user" | "shutdown" | "superseded" | "inactivity", sessionID }
```

---

## 3. 修正內容

### 3.1 事件監聽對照（修正前 → 修正後）

| 事件 | 修正前 | 修正後 |
| --- | --- | --- |
| `session.execution.succeeded` | ❌ 未監聽 | ✅ 主要「任務完成」訊號 |
| `session.idle` | ✅ 主要（但不會送達） | ⚪ 保留為備援 |
| `session.status`（`status.type === "idle"`） | ❌ 未監聽 | ⚪ 新增為備援 |
| `session.execution.failed` | ❌ 未監聽 | ✅ 主要「執行錯誤」訊號 |
| `session.error` | ✅ 主要（但不存在） | ⚪ 保留為備援 |
| `permission.asked` | ✅ | ✅（不變） |
| `permission.replied` | ✅ | ✅（不變） |
| `form.created` | ✅ | ✅（不變） |

### 3.2 程式邏輯重點

- 把 idle 通知邏輯抽成共用函式 `handleIdle(sessionID)`。
- `session.execution.succeeded` 與 `session.idle` 都導向 `handleIdle()`。
- `session.status` 僅在 `data.status.type === "idle"` 時導向 `handleIdle()`。
- **去重（dedup）**：上述完成類事件共用同一個 dedupe key `idle:<sessionID>`，
  即使同時收到多個也只送一次（預設冷卻 5 秒）。
- 錯誤通知改用 `session.execution.failed`，並保留 `session.error` 為備援。

### 3.3 檔案異動

| 檔案 | 狀態 | 說明 |
| --- | --- | --- |
| `.opencode/plugins/telegram-notify/index.ts` | 修改 | 事件監聽與 `handleIdle()` 修正 |
| `.opencode/plugins/telegram-notify/README.md` | 修改 | 事件對照表與說明同步更正 |
| `.opencode/plugins/debug-probe/`（臨時探針） | 新增後刪除 | 只用於擷取事件，驗證後已移除 |

> 除上述兩個檔案外，工作區沒有其他異動。

---

## 4. 驗證

1. **型別檢查**

   ```bash
   cd .opencode/plugins/telegram-notify
   npm run typecheck
   ```

   結果：通過（無錯誤）。

2. **端到端（私有 server，不影響共用服務）**

   ```bash
   opencode run --standalone --auto --format json "Reply with exactly: OK"
   ```

   結果：session 正常結束、Plugin 無載入錯誤，
   且探針確認該 session 送出 `session.execution.succeeded`。

3. **使用者驗收**：Telegram 收到「✅ OpenCode 任務已完成」→ 驗證通過。

---

## 5. 已知行為與提醒

- 修好之後，**每一輪對話結束都會收到通知**（包含互動 TUI session）。
  預設冷卻為 5 秒；同一 session 短時間內的重複完成事件不會重複發送。
- `session.idle` / `session.status` / `session.error` 僅為備援；
  若未來 OpenCode 版本開始送達，會與主要事件共用 dedupe key，不會造成重複通知。
- 若覺得通知太吵，可再考慮：
  - 提高 `cooldownMs`；
  - 增加「只在視窗失焦時通知」或「暫停通知」的開關。

---

## 6. 除錯心法（給未來的自己）

1. Plugin 的 `console.*` 看不到 → 需要**寫檔**或結構化日誌才能觀測。
2. 事件「名稱對」不代表「會送達」→ 用探針把**實際事件**記錄下來再判斷。
3. 事件定義以 `@opencode/schema` 的 `*.d.ts` 為準（`event-manifest.d.ts` 可列出全部事件型別）。
4. 用 `opencode run --standalone` 測試，不會干擾正在使用的共用服務。
