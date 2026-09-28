// Type-only import: erased at runtime. OpenCode's plugin loader provides the
// plugin context, and the runtime only reads the default export's `id` and
// `setup`, so the plugin must not contain a runtime import of this specifier.
import type { Plugin } from "@opencode/plugin"

import {
  buildErrorMessage,
  buildFormMessage,
  buildIdleMessage,
  buildPermissionMessage,
  type SessionSummary,
} from "./messages"
import { getTelegramConfig, sendTelegramMessage } from "./telegram"

/**
 * OpenCode V2 plugin: send Telegram notifications when the agent finishes a task,
 * needs confirmation, needs input, or hits an error.
 *
 * Detection is based entirely on the public V2 event stream (`ctx.event.subscribe`):
 * - `session.idle`        -> task completed / idle
 * - `permission.asked`    -> waiting for confirmation/approval
 * - `permission.replied`  -> clears the pending state
 * - `form.created`        -> waiting for user input
 * - `session.error`       -> execution error
 *
 * The plugin never throws into OpenCode and never blocks the event loop.
 */

const LOG_PREFIX = "[telegram-notify]"

/** How long an unanswered permission keeps `session.idle` from reporting "task completed". */
const PENDING_PERMISSION_TTL_MS = 30 * 60 * 1000

interface NotifyOptions {
  cooldownMs: number
  notifySubagents: boolean
  notifyErrors: boolean
}

interface RawSessionInfo {
  id?: string
  title?: string
  agent?: string
  parentID?: string
  outcome?: string
}

function readOptions(raw: unknown): NotifyOptions {
  const source = (raw ?? {}) as Record<string, unknown>
  const cooldown = source.cooldownMs
  return {
    cooldownMs: typeof cooldown === "number" && cooldown >= 0 ? cooldown : 5000,
    notifySubagents: source.notifySubagents === true,
    notifyErrors: source.notifyErrors !== false,
  }
}

/** The public event stream yields `{ type, data }`; fall back to the raw object defensively. */
function asData(event: unknown): Record<string, unknown> {
  const value = event as { data?: unknown } | null | undefined
  if (value && typeof value === "object" && value.data && typeof value.data === "object") {
    return value.data as Record<string, unknown>
  }
  return (event ?? {}) as Record<string, unknown>
}

function safeMessage(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : String(error)
}

const plugin: Plugin.Plugin = {
  id: "telegram.notify",

  setup(ctx) {
    const options = readOptions(ctx.options)
    const controller = new AbortController()
    const lastSent = new Map<string, number>()
    const pendingPermissions = new Map<string, number>()

    const projectName = (() => {
      try {
        const location = ctx.location as
          | { directory?: string; project?: { canonical?: string; directory?: string } }
          | undefined
        const dir = location?.project?.canonical ?? location?.project?.directory ?? location?.directory
        if (!dir) return undefined
        return dir.replace(/[\\/]+$/, "").split(/[\\/]/).pop()
      } catch {
        return undefined
      }
    })()

    /** Cooldown/dedup guard: at most one notification per key within `cooldownMs`. */
    const withinCooldown = (key: string): boolean => {
      const now = Date.now()
      const last = lastSent.get(key)
      if (last !== undefined && now - last < options.cooldownMs) return true
      lastSent.set(key, now)
      return false
    }

    /** Build and send a notification off the event loop; all failures are contained. */
    const notify = (key: string, build: () => string | null): void => {
      if (withinCooldown(key)) return
      void (async () => {
        try {
          if (!getTelegramConfig()) return
          const text = build()
          if (!text) return
          const result = await sendTelegramMessage(text)
          if (!result.ok && result.error !== "missing-config") {
            console.warn(`${LOG_PREFIX} notification was not delivered (${result.error})`)
          }
        } catch (error) {
          console.warn(`${LOG_PREFIX} notification failed: ${safeMessage(error)}`)
        }
      })()
    }

    const getSessionInfo = async (sessionID: string | undefined): Promise<RawSessionInfo | undefined> => {
      if (!sessionID) return undefined
      try {
        return (await ctx.session.get({ sessionID })) as unknown as RawSessionInfo
      } catch (error) {
        console.warn(`${LOG_PREFIX} could not read session ${sessionID}: ${safeMessage(error)}`)
        return undefined
      }
    }

    const toSummary = (
      info: RawSessionInfo | undefined,
      fallbackID: string | undefined,
    ): SessionSummary | undefined => {
      const id = info?.id ?? fallbackID
      if (!id) return undefined
      return { id, title: info?.title, agent: info?.agent, outcome: info?.outcome }
    }

    const handleEvent = async (event: unknown): Promise<void> => {
      const type = (event as { type?: string } | null | undefined)?.type
      const data = asData(event)

      switch (type) {
        case "session.idle": {
          const sessionID = typeof data.sessionID === "string" ? data.sessionID : undefined

          if (sessionID) {
            const pendingAt = pendingPermissions.get(sessionID)
            if (pendingAt !== undefined) {
              if (Date.now() - pendingAt < PENDING_PERMISSION_TTL_MS) return // still waiting for the user
              pendingPermissions.delete(sessionID)
            }
          }

          const info = await getSessionInfo(sessionID)
          if (info?.parentID && !options.notifySubagents) return // subagent sessions are noisy
          const summary = toSummary(info, sessionID)
          notify(`idle:${sessionID ?? "unknown"}`, () => buildIdleMessage(projectName, summary))
          return
        }

        case "permission.asked": {
          const sessionID = typeof data.sessionID === "string" ? data.sessionID : undefined
          if (sessionID) pendingPermissions.set(sessionID, Date.now())

          const info = await getSessionInfo(sessionID)
          const summary = toSummary(info, sessionID)
          const permission = {
            action: typeof data.action === "string" ? data.action : undefined,
            resources: Array.isArray(data.resources) ? (data.resources as string[]) : undefined,
            message: typeof data.message === "string" ? data.message : undefined,
          }
          notify(`permission:${sessionID ?? "unknown"}`, () =>
            buildPermissionMessage(projectName, summary, permission),
          )
          return
        }

        case "permission.replied": {
          const sessionID = typeof data.sessionID === "string" ? data.sessionID : undefined
          if (sessionID) pendingPermissions.delete(sessionID)
          return
        }

        case "form.created": {
          const form = (data.form ?? {}) as Record<string, unknown>
          const sessionID = typeof form.sessionID === "string" ? form.sessionID : undefined
          const info = await getSessionInfo(sessionID)
          const summary = toSummary(info, sessionID)
          const formSummary = {
            title: typeof form.title === "string" ? form.title : undefined,
            fieldCount: Array.isArray(form.fields) ? form.fields.length : undefined,
          }
          const key = `form:${sessionID ?? String(form.id ?? "unknown")}`
          notify(key, () => buildFormMessage(projectName, summary, formSummary))
          return
        }

        case "session.error": {
          if (!options.notifyErrors) return
          const sessionID = typeof data.sessionID === "string" ? data.sessionID : undefined
          const info = await getSessionInfo(sessionID)
          const summary = toSummary(info, sessionID)
          const rawError = (data.error ?? {}) as Record<string, unknown>
          const message = typeof rawError.message === "string" ? rawError.message : undefined
          notify(`error:${sessionID ?? "global"}`, () => buildErrorMessage(projectName, summary, message))
          return
        }

        default:
          return
      }
    }

    void (async () => {
      try {
        for await (const event of ctx.event.subscribe({ signal: controller.signal })) {
          try {
            await handleEvent(event)
          } catch (error) {
            console.warn(`${LOG_PREFIX} event handler error: ${safeMessage(error)}`)
          }
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn(`${LOG_PREFIX} event stream stopped: ${safeMessage(error)}`)
        }
      }
    })()

    const enabled = getTelegramConfig() !== null
    console.log(
      `${LOG_PREFIX} ready (OpenCode ${ctx.app.version}) — Telegram notifications ${
        enabled ? "enabled" : "disabled (set .env)"
      }`,
    )

    return () => controller.abort()
  },
}

export default plugin
