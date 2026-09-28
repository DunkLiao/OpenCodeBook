/**
 * Manual Telegram delivery test for the `telegram.notify` plugin.
 *
 * Usage (Bun is provided by OpenCode, or install it yourself):
 *   bun test-send.ts
 *   bun test-send.ts "自訂測試訊息"
 *
 * The script reads the same `.env` as the plugin and exits non-zero on failure.
 */
import { getTelegramConfig, sendTelegramMessage } from "./telegram"

const text = process.argv.slice(2).join(" ").trim() || "✅ OpenCode Telegram plugin 測試訊息"

if (!getTelegramConfig()) {
  console.error("[telegram-notify] 找不到 TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID，請先設定 .env")
  process.exit(1)
}

const result = await sendTelegramMessage(text)

if (result.ok) {
  console.log("[telegram-notify] 測試訊息已送出，請檢查 Telegram。")
} else {
  console.error(`[telegram-notify] 發送失敗：${result.error}`)
  process.exit(1)
}
