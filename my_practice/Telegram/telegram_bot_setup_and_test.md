# Telegram Bot 設定與測試步驟

本文件整理 Telegram Bot 的建立、取得 Bot Token、取得 Chat ID，以及傳送測試訊息的完整流程。

> 安全原則：本文件不包含任何真實密碼、Bot Token、Chat ID 或其他機敏資訊。所有範例均使用占位符。

---

## 1. 建立 Telegram Bot

1. 開啟 Telegram。
2. 搜尋官方 Bot：

```text
@BotFather
```

3. 開啟對話後輸入：

```text
/newbot
```

4. 依照 BotFather 指示設定：
   - Bot 顯示名稱
   - Bot Username

Bot Username 必須以：

```text
bot
```

結尾，例如：

```text
my_opencode_notify_bot
```

5. 建立完成後，BotFather 會提供一組 Bot Token。

範例：

```text
1234567890:AAExampleTokenHere
```

這組 Token 相當於 Bot 的密碼，請妥善保管。

---

## 2. Bot Token 安全注意事項

Bot Token 不應：

- 寫死在程式碼
- 上傳到 GitHub
- 放在公開文件
- 出現在螢幕截圖
- 貼到公開聊天室
- 顯示在 log

建議放在 `.env`：

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

並在 `.gitignore` 加入：

```gitignore
.env
.env.local
```

如果 Bot Token 曾經外洩，請立即到 BotFather 重新產生。

---

## 3. 讓 Telegram Bot 收到訊息

新建立的 Bot 必須先收到使用者訊息，Telegram Bot API 才能透過 `getUpdates` 查到 Chat ID。

操作方式：

1. 在 Telegram 搜尋你的 Bot。
2. 開啟 Bot。
3. 按下：

```text
Start
```

或者輸入：

```text
/start
```

4. 再傳一則測試訊息：

```text
test
```

---

## 4. 使用 getUpdates 取得 Chat ID

瀏覽器開啟：

```text
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```

將：

```text
<BOT_TOKEN>
```

替換成你的 Bot Token。

例如：

```text
https://api.telegram.org/bot1234567890:AAExampleTokenHere/getUpdates
```

> 注意：不要將真實網址截圖或公開分享，因為網址本身會包含 Bot Token。

成功時會看到類似：

```json
{
  "ok": true,
  "result": [
    {
      "update_id": 123456789,
      "message": {
        "message_id": 1,
        "from": {
          "id": 987654321,
          "is_bot": false,
          "first_name": "Example"
        },
        "chat": {
          "id": 987654321,
          "first_name": "Example",
          "type": "private"
        },
        "text": "test"
      }
    }
  ]
}
```

其中：

```json
"chat": {
  "id": 987654321
}
```

這個：

```text
987654321
```

就是 Chat ID。

---

## 5. getUpdates 常見錯誤

### 404 Not Found

如果看到：

```json
{
  "ok": false,
  "error_code": 404,
  "description": "Not Found"
}
```

通常是網址格式錯誤。

錯誤：

```text
https://api.telegram.org/bot/getUpdates
```

正確：

```text
https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```

---

### result 是空陣列

如果看到：

```json
{
  "ok": true,
  "result": []
}
```

代表 Telegram 目前沒有可取得的更新。

請：

1. 回到 Telegram
2. 對 Bot 傳：

```text
/start
```

3. 再傳：

```text
test
```

4. 重新整理 `getUpdates`

---

## 6. 使用瀏覽器測試 sendMessage

Telegram Bot API 傳送訊息端點：

```text
https://api.telegram.org/bot<BOT_TOKEN>/sendMessage
```

最簡單的 GET 測試方式：

```text
https://api.telegram.org/bot<BOT_TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=Hello
```

範例：

```text
https://api.telegram.org/bot1234567890:AAExampleTokenHere/sendMessage?chat_id=987654321&text=Hello
```

成功時 Telegram Bot 應該會傳送：

```text
Hello
```

---

## 7. 使用 curl 測試 Telegram Bot

### Windows PowerShell / CMD

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/sendMessage" ^
  -H "Content-Type: application/json" ^
  -d "{\"chat_id\":\"<CHAT_ID>\",\"text\":\"Telegram Bot test\"}"
```

### Linux / macOS

```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "<CHAT_ID>",
    "text": "Telegram Bot test"
  }'
```

---

## 8. 使用 PowerShell 測試

```powershell
$botToken = "<BOT_TOKEN>"
$chatId = "<CHAT_ID>"

$uri = "https://api.telegram.org/bot$botToken/sendMessage"

$body = @{
    chat_id = $chatId
    text = "Telegram Bot test"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri $uri `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

建議正式使用時不要直接把 Token 寫在 PowerShell 程式內，而是從環境變數或 `.env` 讀取。

---

## 9. 使用 TypeScript 測試

```ts
const botToken = process.env.TELEGRAM_BOT_TOKEN
const chatId = process.env.TELEGRAM_CHAT_ID

async function sendTelegramMessage(message: string) {
  if (!botToken || !chatId) {
    console.warn("Telegram configuration is missing")
    return
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    })

    if (!response.ok) {
      console.warn(`Telegram API returned HTTP ${response.status}`)
      return
    }

    const result = await response.json()

    if (!result.ok) {
      console.warn("Telegram API returned an error")
      return
    }

    console.log("Telegram notification sent")
  } catch {
    console.warn("Unable to send Telegram notification")
  }
}

sendTelegramMessage("OpenCode Telegram Plugin 測試成功")
```

---

## 10. 建立 `.env`

專案根目錄建立：

```text
.env
```

內容：

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

實際使用時自行填入：

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

---

## 11. 建立 `.env.example`

建議同時建立：

```text
.env.example
```

內容：

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

`.env.example` 可以提交 Git，因為裡面只有占位符。

---

## 12. 安裝 dotenv

如果 TypeScript 專案需要從 `.env` 載入設定，可以安裝：

```bash
npm install dotenv
```

然後在程式入口加入：

```ts
import "dotenv/config"
```

之後即可使用：

```ts
process.env.TELEGRAM_BOT_TOKEN
process.env.TELEGRAM_CHAT_ID
```

---

## 13. 測試流程建議

建議依照以下順序測試：

1. 確認 Bot 已建立。
2. 確認已對 Bot 傳 `/start`。
3. 確認 `getUpdates` 可正常回傳資料。
4. 確認可取得 `chat.id`。
5. 使用瀏覽器測試 `sendMessage`。
6. 使用 curl 或 PowerShell 測試 POST。
7. 建立 `.env`。
8. 使用 TypeScript 從 `.env` 讀取設定。
9. 執行 TypeScript 測試程式。
10. 最後再整合進 OpenCode Plugin。

---

## 14. 建議驗收條件

Telegram 設定完成後，至少確認：

### Bot API 正常

`getUpdates`：

```json
{
  "ok": true
}
```

### Chat ID 正確

可在：

```text
message.chat.id
```

找到 Chat ID。

### Bot 可以傳送訊息

執行 `sendMessage` 後，Telegram 收到測試訊息。

### `.env` 正常

TypeScript 能讀取：

```ts
process.env.TELEGRAM_BOT_TOKEN
process.env.TELEGRAM_CHAT_ID
```

### Token 不會外洩

確認：

```text
.env
```

已經加入：

```text
.gitignore
```

---

## 15. 最終設定結構

建議專案：

```text
project/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── src/
    └── telegram.ts
```

`.env`：

```env
TELEGRAM_BOT_TOKEN=實際 Bot Token
TELEGRAM_CHAT_ID=實際 Chat ID
```

`.env.example`：

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

`.gitignore`：

```gitignore
.env
.env.local
```

---

## 16. 安全檢查清單

正式使用前確認：

- [ ] Bot Token 沒有寫死在程式碼
- [ ] Bot Token 沒有出現在 Git commit
- [ ] Bot Token 沒有出現在 README
- [ ] Bot Token 沒有出現在公開截圖
- [ ] `.env` 已加入 `.gitignore`
- [ ] `.env.example` 只有占位符
- [ ] Telegram API 錯誤不會導致主程式中斷
- [ ] log 不會印出完整 Bot Token
