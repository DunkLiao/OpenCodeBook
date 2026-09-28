/**
 * Message builders for the `telegram.notify` plugin.
 * Kept separate from delivery so wording can change without touching the API layer.
 */

export interface SessionSummary {
  id: string
  title?: string
  agent?: string
  outcome?: string
}

export interface PermissionSummary {
  action?: string
  resources?: readonly string[]
  message?: string
}

export interface FormSummary {
  title?: string
  fieldCount?: number
}

function truncate(value: string, max = 200): string {
  const flat = value.replace(/\s+/g, " ").trim()
  return flat.length > max ? `${flat.slice(0, max)}…` : flat
}

function contextLines(project: string | undefined, session: SessionSummary | undefined): string[] {
  const lines: string[] = []
  if (project) lines.push(`專案：${truncate(project, 120)}`)
  if (session?.id) lines.push(`Session：${session.id}`)
  if (session?.agent) lines.push(`Agent：${session.agent}`)
  if (session?.title) lines.push(`標題：${truncate(session.title, 120)}`)
  return lines
}

function withContext(
  body: string[],
  project: string | undefined,
  session: SessionSummary | undefined,
): string {
  const context = contextLines(project, session)
  return context.length > 0 ? `${body.join("\n")}\n\n${context.join("\n")}` : body.join("\n")
}

export function buildIdleMessage(
  project: string | undefined,
  session: SessionSummary | undefined,
): string {
  const body = ["✅ OpenCode 任務已完成", "", "Agent 已完成目前工作，正在等待你的下一步指示。"]
  if (session?.outcome && session.outcome !== "succeeded") {
    body.push("", `結束狀態：${session.outcome}`)
  }
  return withContext(body, project, session)
}

export function buildPermissionMessage(
  project: string | undefined,
  session: SessionSummary | undefined,
  permission: PermissionSummary,
): string {
  const body = [
    "⚠️ OpenCode 等待確認",
    "",
    "目前有操作需要你的確認，請回到 OpenCode 查看。",
    "",
    "需要確認的操作：",
  ]

  const action = permission.action ? truncate(permission.action, 80) : "未知操作"
  const resources = (permission.resources ?? []).map((resource) => truncate(resource, 120))
  body.push(resources.length > 0 ? `${action} ${resources.join(", ")}` : action)

  if (permission.message) body.push("", truncate(permission.message, 300))

  return withContext(body, project, session)
}

export function buildFormMessage(
  project: string | undefined,
  session: SessionSummary | undefined,
  form: FormSummary,
): string {
  const title = form.title ? truncate(form.title, 120) : "未命名表單"
  const count = typeof form.fieldCount === "number" ? `（${form.fieldCount} 個欄位）` : ""
  const body = [
    "📝 OpenCode 需要你的輸入",
    "",
    "請回到 OpenCode 填寫資訊以繼續。",
    "",
    `表單：${title}${count}`,
  ]
  return withContext(body, project, session)
}

export function buildErrorMessage(
  project: string | undefined,
  session: SessionSummary | undefined,
  errorMessage: string | undefined,
): string {
  const body = ["❌ OpenCode 執行發生錯誤", "", `錯誤：${truncate(errorMessage || "未知錯誤", 300)}`]
  return withContext(body, project, session)
}
