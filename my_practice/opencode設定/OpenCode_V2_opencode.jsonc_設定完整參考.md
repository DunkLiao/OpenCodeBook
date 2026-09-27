# OpenCode V2 `opencode.jsonc` 設定完整參考

> **資料來源與查證方式**
>
> - 主要依據：官方 V2 文件 [Config](https://opencode.ai/v2/docs/config)、[MCP servers](https://opencode.ai/v2/docs/mcp-servers)、[Migrate from V1](https://opencode.ai/v2/docs/migrate-v1)
> - 輔助查證：DeepWiki `sst/opencode`（原始碼層），僅採用**與官方文件一致**的部分
> - 另有本機實測（`opencode mcp list`、實際 `opencode.jsonc`）
> - 查證日期：2026-09-27
>
> ⚠️ 本檔只收錄**已由官方文件證實**的內容。DeepWiki 查到但官方文件未證實、或與官方衝突的說法，統一列在最後〈附錄〉，**請勿當作設定依據**。

---

## 1. 檔案格式

V2 同時支援 **JSON** 與 **JSONC**（JSON with Comments）：

- 可以寫 `//` 註解
- 可以留尾隨逗號（trailing comma）
- 建議加上 `$schema`，讓編輯器有驗證與自動完成

```jsonc title="opencode.jsonc"
{
  "$schema": "https://opencode.ai/config.json",
  // 預設使用的模型
  "model": "anthropic/claude-sonnet-4-5",
}
```

完整 schema 在 <https://opencode.ai/config.json>（欄位與巢狀結構以它為最終依據）。

---

## 2. 檔案位置

| 層級 | 路徑 |
|---|---|
| 全域（所有專案適用） | `~/.config/opencode/opencode.json(c)` |
| 專案（二選一，可並存） | `<project>/opencode.json(c)` |
| 專案（`.opencode` 形式） | `<project>/.opencode/opencode.json(c)` |

Windows 上 `~` 即 `%USERPROFILE%`，例如：

```
C:\Users\user\.config\opencode\opencode.jsonc
```

---

## 3. 搜尋範圍與優先順序（重要）

搜尋方式是**從目前目錄一路往上找到檔案系統根目錄**，不是只找到專案根目錄為止。

合併順序：

1. 先合併**直接放在目錄裡的** `opencode.json(c)`，從最遠的目錄往最近的目錄合併
2. 再合併**放在 `.opencode/` 目錄裡的** `opencode.json(c)`，同樣從最遠往最近

這代表一個關鍵行為：

> **所有被找到的 `.opencode/` 設定，都會覆蓋所有直接放在目錄裡的設定。**

合併是**逐鍵覆蓋**，不衝突的設定會被保留（不是整份取代）。

範例：從 `/home/user/projects/acme/packages/web` 啟動 OpenCode

```text
~/.config/opencode/opencode.json          ← 最低優先

/home/user/projects/acme/
├── opencode.json
└── packages/
    └── web/
        ├── opencode.json
        └── src/
```

實際套用順序（低 → 高）：

1. `~/.config/opencode/opencode.json`
2. `/home/user/projects/acme/opencode.json`
3. `/home/user/projects/acme/packages/web/opencode.json`

> 💡 建議同一個目錄樹**統一只用一種形式**（要嘛都用直接檔案，要嘛都用 `.opencode/`），避免搞混覆蓋關係。

---

## 4. 頂層欄位一覽

| 欄位 | 說明 |
|---|---|
| `$schema` | 編輯器驗證用 |
| `shell` | 終端與 shell 工具使用的 shell |
| `model` | 預設模型，格式 `provider/model` |
| `default_agent` | session 未指定時使用的 primary agent（例：`"build"`） |
| `update` | 更新行為：`"disable"` / `"notify"`（預設）/ `"auto"`。**只在全域設定有效，專案層會被忽略** |
| `share` | session 分享政策：`"manual"` / `"auto"` / `"disabled"`（目前尚未支援分享） |
| `username` | 使用者名稱（目前不會顯示在對話中） |
| `permissions` | 有序的權限規則陣列 |
| `experimental.policies` | provider 使用 / 權限的 allow、deny 政策 |
| `agents` | 覆寫內建 agent 或定義自訂 agent |
| `snapshots` | 開關 undo / revert 用的檔案快照 |
| `watcher` | 檔案監看的 ignore 規則 |
| `formatter` | 格式化器（`true` 啟用內建） |
| `media` | 圖片處理（`auto_resize`、`max_width`、`max_height`、`max_base64_bytes`） |
| `tool_output` | 工具輸出保留上限（`max_lines`、`max_bytes`） |
| `websearch` | 網路搜尋 provider 選擇（`"random"` 自動選） |
| `mcp` | MCP server 設定（見第 6 節） |
| `compaction` | 自動壓縮行為（`auto`、`keep.tokens`、`buffer`） |
| `warming` | 保持模型 session 溫暖（預設關閉） |
| `skills` | 額外的 skill 探索來源（路徑或 URL 陣列） |
| `commands` | 具名 slash command 樣板 |
| `instructions` | ⚠️ **接受但不會載入**——請改用 `AGENTS.md` |
| `references` | 具名外部上下文（本地目錄或 Git repo） |
| `worktree` | 新 worktree 的父目錄（`worktree.directory`） |
| `plugins` | 要載入的 plugin（字串或 `{ package, options }` 物件） |
| `providers` | provider 與模型覆寫 |

### 取值會被忽略的欄位

V2 接受但**不生效**（僅保留設定、不報錯），別誤以為有作用：

- `instructions` — 改用 `AGENTS.md`
- `lsp` — V2 不啟動語言伺服器、不提供 LSP 工具、不產生診斷

### 只在全域有效的欄位

- `update`：專案層設定會被忽略

---

## 5. 常見設定範例

### 權限（`permissions`）

V1 是把權限效果按工具分組，V2 改成**一個有序陣列**，讓優先序與例外更明確：

```jsonc
{
  "permissions": [
    { "action": "shell", "resource": "git push *", "effect": "ask" },
    { "action": "edit", "resource": "*", "effect": "allow" },
    { "action": "websearch", "resource": "*", "effect": "deny" },
  ],
}
```

- `effect`：`allow` / `ask` / `deny`
- **action 名稱有改**：`bash` → `shell`、`task` → `subagent`、`write` 與 `patch` → `edit`

### 政策（`experimental.policies`）

```jsonc
{
  "experimental": {
    "policies": [
      { "action": "provider.use", "resource": "*", "effect": "deny" },
      { "action": "provider.use", "resource": "anthropic", "effect": "allow" },
      { "action": "permission", "resource": "shell:git push *", "effect": "deny" },
    ],
  },
}
```

### Agent（`agents`）

```jsonc
{
  "agents": {
    "reviewer": {
      "description": "Review changes without editing files",
      "mode": "subagent",
      "system": "Focus on correctness, security, and missing tests.",
      "permissions": [{ "action": "edit", "resource": "*", "effect": "deny" }],
    },
  },
}
```

### 壓縮（`compaction`）

```jsonc
{
  "compaction": {
    "auto": true,
    "keep": { "tokens": 15000 },
    "buffer": 20000,
  },
}
```

也可針對 provider / model 改用原生壓縮：

```jsonc
{
  "providers": {
    "openai": {
      "settings": { "compaction": { "type": "native" } },
      "models": {
        "gpt-4.1": { "settings": { "compaction": { "type": "summary" } } },
      },
    },
  },
}
```

> model 層設定會覆蓋 provider 層設定。

### Skills / Commands

```jsonc
{
  "skills": ["./team-skills", "https://example.com/.well-known/skills/"],
  "commands": {
    "review": {
      "description": "Review the current changes",
      "template": "Review the current diff for correctness and missing tests.",
    },
  },
}
```

### Plugins

```jsonc
{
  "plugins": [
    "opencode-example-plugin",
    { "package": "./plugins/local", "options": { "enabled": true } },
  ],
}
```

---

## 6. MCP 伺服器（`mcp`）

### 結構

```jsonc
{
  "mcp": {
    "timeout": { "startup": 45000, "catalog": 30000, "execution": 600000 },
    "servers": {
      "my-server": { /* ... */ },
    },
  },
}
```

> ✅ server 名稱放在 **`mcp.servers`** 底下，**不是**直接放在 `mcp` 底下。

### Local server

```jsonc
{
  "mcp": {
    "servers": {
      "playwright": {
        "type": "local",
        "command": ["npx", "-y", "@playwright/mcp@0.0.82"],
        "cwd": ".",
        "environment": { "LOG_LEVEL": "info", "MCP_API_KEY": "{env:MCP_API_KEY}" },
        "disabled": false,
      },
    },
  },
}
```

| 欄位 | 必填 | 說明 |
|---|---|---|
| `type` | ✅ | 固定 `"local"` |
| `command` | ✅ | 執行檔 + 參數的陣列 |
| `cwd` | — | 工作目錄（相對路徑以 workspace 為基準，也是預設值） |
| `environment` | — | 附加到既有行程環境的變數 |
| `disabled` | — | `true` 則保持設定但不連線（預設 `false`） |
| `codemode` | — | 設 `false` 讓工具直接曝露，不走 Code Mode（預設 `true`） |
| `timeout` | — | 覆寫該 server 的逾時 |
| `protocol` | — | `legacy`（預設）/ `auto` / `2026-07-28` |

### Remote server

```jsonc
{
  "mcp": {
    "servers": {
      "context7": {
        "type": "remote",
        "url": "https://mcp.context7.com/mcp",
        "oauth": false,
        "headers": { "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}" },
      },
    },
  },
}
```

| 欄位 | 必填 | 說明 |
|---|---|---|
| `type` | ✅ | 固定 `"remote"` |
| `url` | ✅ | 絕對的 Streamable HTTP 端點 |
| `headers` | — | HTTP 標頭（密鑰請用 `{env:...}`，不要寫死） |
| `oauth` | — | OAuth 設定物件，或 `false` 關閉 OAuth |
| `disabled` | — | 同上 |
| `codemode` | — | 同上 |
| `timeout` | — | 同上 |
| `protocol` | — | 同上 |

### 逾時

| 逾時 | 預設 | 適用 |
|---|---|---|
| `startup` | 30 秒 | 建立連線與 server 初始化 |
| `catalog` | 30 秒 | 列出 tools / prompts / resources |
| `execution` | 12 小時 | 工具呼叫、prompt 取得、resource 讀取 |

`mcp.timeout` 設全域預設，單一 server 的 `timeout` 物件會覆蓋對應的預設值。

### 開啟 / 關閉

V2 **沒有「開啟」指令**，開關就是 `disabled` 欄位：

```jsonc
{
  "mcp": {
    "servers": {
      "deepwiki": {
        "type": "remote",
        "url": "https://mcp.deepwiki.com/mcp",
        "disabled": true, // ← 保留設定但不連線
      },
    },
  },
}
```

要啟用某幾個 server：**只刪掉那幾個的 `"disabled": true`（別忘了處理前一行的逗號）**，其他保留。

執行期的開關（不改檔案）：

- 在 OpenCode 裡打 `/mcps` → 選 server → connect / disconnect / 授權登入
- CLI：`opencode mcp add`、`opencode mcp list`、`opencode mcp auth <name>`、`opencode mcp logout <name>`

> `opencode mcp add` 會把 server 寫進設定檔；`--global` 表示寫到全域設定。

**只開其中幾個的範例**（保留 deepwiki 關閉）：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "timeout": { "startup": 60000 },
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": ["npx", "-y", "chrome-devtools-mcp@1.10.1"],
      },
      "playwright": {
        "type": "local",
        "command": ["npx", "-y", "@playwright/mcp@0.0.82"],
      },
      "deepwiki": {
        "type": "remote",
        "url": "https://mcp.deepwiki.com/mcp",
        "disabled": true,
      },
    },
  },
}
```

改完存檔後重啟服務再驗證：

```powershell
opencode service restart
opencode mcp list
```

`✓ connected` 代表連線成功。local server 第一次啟動要下載套件（`npx`），可能要等數十秒。

### OAuth

remote server 預設啟用 OAuth。需要授權時用 `/mcps` 選該 server 登入，或在 CLI 執行 `opencode mcp auth <name>`。憑證存放在設定檔之外。

若 provider 提供預先註冊的 client credentials，欄位為 **snake_case**：

```jsonc
{
  "type": "remote",
  "url": "https://mcp.example.com/mcp",
  "oauth": {
    "client_id": "{env:MCP_CLIENT_ID}",
    "client_secret": "{env:MCP_CLIENT_SECRET}",
    "scope": "tools:read tools:execute",
    "callback_port": 19876,
    "redirect_uri": "http://127.0.0.1:19876/callback",
  },
}
```

### 命名與 Code Mode

- 工具名稱格式為 `<server>_<tool>`，非字母、數字、`_`、`-` 的字元會換成 `_`
- MCP prompt 會變成指令 `/<server>:<prompt>`
- 預設走 Code Mode，工具會依 server 名稱分組，例如 `tools.context_7.resolve_library_id(...)`
- 設 `"codemode": false` 可讓該 server 的工具回到 provider 的原生工具列表

---

## 7. V1 → V2 對照表

| V1 | V2 | 狀態 |
|---|---|---|
| `autoshare: true` | `share: "auto"` | 改名 |
| `autoupdate` | `update`（`false`→`"disable"`、`"notify"`→`"notify"`、`true`→`"auto"`） | 改名 |
| `permission: { bash: {...} }` | `permissions: [{ action, resource, effect }]` | 重新設計 |
| `tools: { websearch: false }` | `permissions` 內一筆 `deny` | 改用 permissions |
| `agent` | `agents` | 改名（複數） |
| `mode`（已棄用） | `agents` 內的 primary agent | 移除 / 併入 |
| agent `prompt` | agent `system` | 改名 |
| agent `disable` | agent `disabled` | 改名 |
| agent `permission` | agent `permissions` | 改名 |
| agent `variant` 獨立欄位 | 併入 model：`provider/model#variant` | 改名 |
| agent `maxSteps` | agent `steps` | 改名 |
| `snapshot` | `snapshots` | 改名（複數） |
| `attachment` | `media` | 改名 |
| `reference` | `references` | 改名（複數） |
| `plugin` | `plugins` | 改名（複數） |
| `plugin` 的 tuple 形式 | `{ package, options }` 物件 | 重新設計 |
| `provider` | `providers` | 改名（複數） |
| provider `npm` | provider `package`（AI SDK 套件加 `aisdk:` 前綴） | 改名 |
| provider `api` | provider `settings.baseURL` | 改名 |
| provider `options` | 依角色拆到 `settings` / `headers` / `body` | 重新設計 |
| model `id` | model `modelID` | 改名 |
| model `tool_call` / `modalities` | `capabilities.tools` / `capabilities.input` / `capabilities.output` | 改名 |
| model `cache_read` / `cache_write` | `cache.read` / `cache.write` | 改名 |
| model `status: "deprecated"` | `disabled: true` | 改名 |
| model `options` | `settings` | 改名 |
| model `variants` 物件 | `variants` 陣列（每筆有 `id`） | 重新設計 |
| `command` | `commands` | 改名（複數） |
| command `subtask: true` | `subagent: true` | 改名 |
| command 獨立 `variant` 欄位 | 併入 model：`provider/model#variant` | 改名 |
| `skills: { paths, urls }` | `skills: [...]` 單一陣列 | 重新設計 |
| `compaction.preserve_recent_tokens` | `compaction.keep.tokens` | 改名 |
| `compaction.reserved` | `compaction.buffer` | 改名 |
| `mcp.<name>` | `mcp.servers.<name>` | 重新分組 |
| MCP `enabled: true` | `disabled: false`（反向） | 改名 |
| MCP `timeout: 30000`（單一數字） | `timeout: { startup, catalog, execution }` | 重新設計 |
| `experimental.mcp_timeout` | `mcp.timeout.catalog` / `execution` | 改名 |
| MCP OAuth `clientId` / `clientSecret` / `callbackPort` / `redirectUri` | `client_id` / `client_secret` / `callback_port` / `redirect_uri` | snake_case |
| `small_model` | `agents.title.model` | 改用 agent |
| `enabled_providers` / `disabled_providers` | `experimental.policies`（內部轉換） | 改用 policies |
| `logLevel` | 環境變數 `OPENCODE_LOG_LEVEL` | 移除 |
| `server` | V2 service 與明確的 server 選項 | 移除 |
| `layout` | V2 固定使用 stretch 版面 | 移除 |
| `compaction.tail_turns` / `compaction.prune` | 改用 `compaction.keep.tokens` 與 checkpoint 機制 | 已忽略 |
| 頂層 `subagent_depth` | `experimental.subagent_depth` | 搬移 |
| `theme` / `keybinds` / `tui` | 屬 CLI 設定，移至 `~/.config/opencode/cli.json` | 搬移 |

**保留不需遷移的欄位**：`shell`、`model`、`default_agent`、`watcher`、`formatter`、`instructions`、`enterprise`、`tool_output`。

### 相容性重點

- V2 讀取**相同的位置**，支援的 V1 與原生 V2 欄位**可以在最上層共存**，不需要一次全部改完
- 兩種形式同時設定同一個值時，**合法的原生 V2 值優先**（與 JSON 鍵的順序無關）
- V1/V2 混寫只支援在 **`mcp`、`compaction`、`experimental`** 這三處；`agents`、`providers`、`commands`、`models` 的**單一項目內必須統一用一種格式**
- V2 是在記憶體中轉換設定，**不會改寫你的原始檔案**
- 意圖上「沒有 V2 對應」的欄位會被忽略並**發出警告**

### 檔案式定義（`.opencode/`）

| 類型 | V1 位置 | V2 建議位置 |
|---|---|---|
| Agent | `agent/`、`agents/`、`mode/`、`modes/` | `.opencode/agents/<name>.md` |
| Command | `command/`、`commands/` | `.opencode/commands/<name>.md` |
| Skill | `.opencode/skill/`、`.opencode/skills/` | `.opencode/skills/<skill-id>/SKILL.md` |
| Plugin | `.opencode/plugin/`、`.opencode/plugins/` | `.opencode/plugins/` |
| 指令 | `CLAUDE.md` 備援 | 改用 `AGENTS.md`（V2 只找 `AGENTS.md`） |

> 移動 skill 時要**搬整個資料夾**，不要只搬 `SKILL.md`，否則相對路徑的腳本與參考檔會失效。

---

## 8. 容易踩到的陷阱

1. **`instructions` 不會被載入** — 設定它沒有作用，要放專案指引請用 `AGENTS.md`
2. **`lsp` 不會執行** — V2 不跑語言伺服器，請改用專案的 lint / typecheck / build 指令
3. **`update` 只在全域有效** — 專案層設定會被忽略
4. **`.opencode/` 一定贏過同層的直接檔案** — 混用兩種形式很容易搞錯誰覆蓋誰
5. **權限 action 名稱變了** — `bash`→`shell`、`task`→`subagent`、`write`/`patch`→`edit`
6. **MCP 是 `disabled` 不是 `enabled`** — 而且是「反向」語意，從 V1 抄過來要特別注意
7. **MCP server 名稱要在 `mcp.servers` 底下** — 直接放在 `mcp` 底下是 V1 寫法
8. **密鑰不要寫死在設定檔** — 用 `{env:VAR}` 取代
9. **V1 plugin 在 V2 不會執行** — 只改檔名或設定項名稱沒有用，必須改寫實作
10. **`~/.config/opencode/cli.json` 與 `opencode.jsonc` 是兩件事** — 主題、鍵位、TUI 偏好屬於前者

---

## 附錄：經查證後**不採用**的說法

以下是本次用 DeepWiki 查 `sst/opencode` 時得到、但**與官方 V2 文件衝突或無法證實**的內容。列出是為了避免日後誤用，**不要照著改設定**。

| 說法 | 判定 |
|---|---|
| 「`mcp` 的 server 名稱直接放在 `mcp` 底下（keyed by server name）」 | ❌ 錯。V2 是 `mcp.servers` |
| 「`mcp.timeout` 只有 `startup` 與 `request`」 | ❌ 錯。官方為 `startup`、`catalog`、`execution` |
| 「`codemode`、`protocol` 不在 schema 中、不支援」 | ❌ 錯。官方 MCP 文件有這兩個欄位 |
| 「`default_agent` 在 V2 已移除」 | ❌ 錯。官方列為保留欄位，範例 `{ "default_agent": "build" }` |
| 「V2 的欄位叫 `autoupdate` / `attachments`」 | ⚠️ 那是 **V1** 名稱。V2 是 `update` / `media` |
| 「`/mcps` 對話框不存在，`disabled` 只能改檔案」 | ❌ 錯。官方 MCP 文件有 `/mcps`；本機實測也確認可在執行期連線、且不會寫回設定檔 |
| 「專案設定只往上搜尋到 worktree root」 | ❌ 錯。官方是搜尋到**檔案系統根目錄** |
| 「支援 `{file:path}` 變數替換」 | ⚠️ 無法證實。官方文件只記載 `{env:NAME}` |
| 「環境變數 `OPENCODE_CONFIG` / `OPENCODE_CONFIG_DIR` / `OPENCODE_CONFIG_CONTENT`、受管設定目錄、遠端 `.well-known/opencode` 設定」 | ⚠️ 官方文件未記載。可能是原始碼層的機制，**要用之前請先自行驗證** |

> DeepWiki 的內容取自 repo 原始碼（可能領先或落後於你安裝的版本），且同一問題多次詢問會出現自相矛盾的答案。**設定行為一律以官方 V2 文件與本機實測為準。**

---

## 參考連結

- Config：<https://opencode.ai/v2/docs/config>
- MCP servers：<https://opencode.ai/v2/docs/mcp-servers>
- Migrate from V1：<https://opencode.ai/v2/docs/migrate-v1>
- Permissions：<https://opencode.ai/v2/docs/permissions>
- Policies：<https://opencode.ai/v2/docs/policies>
- Agents：<https://opencode.ai/v2/docs/agents>
- Providers：<https://opencode.ai/v2/docs/providers>
- Compaction：<https://opencode.ai/v2/docs/compaction>
- CLI settings（`cli.json`）：<https://opencode.ai/v2/docs/cli/config>
- 設定 schema：<https://opencode.ai/config.json>
