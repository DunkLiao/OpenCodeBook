import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Telegram delivery layer for the `telegram.notify` OpenCode V2 plugin.
 *
 * Responsibilities:
 * - Load configuration from `.env` (zero dependency) with `process.env` taking precedence.
 * - Call the Telegram Bot API with a timeout.
 * - Handle HTTP, Telegram API, network and timeout failures without ever throwing.
 * - Keep the bot token out of every log line and error message.
 */

const PLUGIN_DIR = dirname(fileURLToPath(import.meta.url))
const LOG_PREFIX = "[telegram-notify]"

export interface TelegramConfig {
  botToken: string
  chatId: string
}

export interface SendResult {
  ok: boolean
  error?: string
}

let envLoaded = false
let warnedMissingConfig = false

/** Parse a `.env` file into key/value pairs. Tolerant of comments, blank lines and quotes. */
function parseEnvFile(path: string): Record<string, string> {
  const result: Record<string, string> = {}
  if (!existsSync(path)) return result

  let raw: string
  try {
    raw = readFileSync(path, "utf8")
  } catch {
    return result
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const eq = trimmed.indexOf("=")
    if (eq === -1) continue

    const key = trimmed.slice(0, eq).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue

    let value = trimmed.slice(eq + 1).trim()
    const quoted =
      (value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))
    if (quoted && value.length >= 2) value = value.slice(1, -1)

    result[key] = value
  }

  return result
}

/**
 * Load `.env` once. A real environment variable always wins over a file value.
 * Looks next to this module first, then in the current working directory.
 */
function loadEnvOnce(): void {
  if (envLoaded) return
  envLoaded = true

  const candidates = [join(PLUGIN_DIR, ".env"), join(process.cwd(), ".env")]
  for (const file of candidates) {
    const parsed = parseEnvFile(file)
    for (const [key, value] of Object.entries(parsed)) {
      const current = process.env[key]
      if (current === undefined || current === "") process.env[key] = value
    }
  }
}

/** Resolve the Telegram credentials, or `null` when they are missing. */
export function getTelegramConfig(): TelegramConfig | null {
  loadEnvOnce()

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim()
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim()

  if (!botToken || !chatId) {
    if (!warnedMissingConfig) {
      warnedMissingConfig = true
      console.warn(
        `${LOG_PREFIX} Telegram configuration is missing (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID); notifications are disabled.`,
      )
    }
    return null
  }

  return { botToken, chatId }
}

/** Remove anything resembling the bot token before it can reach a log or error message. */
function redact(input: string, secret: string): string {
  if (!secret) return input
  return input.split(secret).join("[redacted]")
}

/**
 * Send a plain-text message through the Telegram Bot API.
 * Never throws: failures are reported as `{ ok: false, error }` and logged.
 */
export async function sendTelegramMessage(
  text: string,
  options: { timeoutMs?: number } = {},
): Promise<SendResult> {
  const config = getTelegramConfig()
  if (!config) return { ok: false, error: "missing-config" }

  const { botToken, chatId } = config
  const timeoutMs = options.timeoutMs ?? 8000
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(timeoutMs),
    })

    if (!response.ok) {
      let detail = ""
      try {
        detail = (await response.text()).slice(0, 300)
      } catch {
        /* ignore body read failures */
      }
      const message = redact(`HTTP ${response.status} ${detail}`.trim(), botToken)
      console.warn(`${LOG_PREFIX} Telegram API request failed: ${message}`)
      return { ok: false, error: message }
    }

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; description?: string }
      | null

    if (payload && payload.ok === false) {
      const message = redact(`Telegram API error: ${payload.description ?? "unknown"}`, botToken)
      console.warn(`${LOG_PREFIX} ${message}`)
      return { ok: false, error: message }
    }

    return { ok: true }
  } catch (error) {
    const timedOut =
      error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")
    const raw = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
    const message = redact(timedOut ? `request timed out after ${timeoutMs}ms` : raw, botToken)
    console.warn(`${LOG_PREFIX} Telegram request failed: ${message}`)
    return { ok: false, error: message }
  }
}
