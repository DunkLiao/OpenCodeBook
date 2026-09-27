# OpenCode V2 設定修改重點整理

> 更新日期：2026-09-27  
> 目的：彙整 OpenCode V1 → V2 的設定檔變更，並整理 Global Agent、Command、Skill、MCP、AGENTS.md 等常用配置。

---

## 1. 官方文件

### OpenCode 設定文件（繁體中文）
- https://opencode.ai/docs/zh-tw/config/

### OpenCode V1 → V2 Migration
- https://opencode.ai/v2/docs/migrate-v1

### OpenCode V2 文件首頁
- https://opencode.ai/v2/docs/

### OpenCode Config JSON Schema
- https://opencode.ai/config.json

> [!IMPORTANT]
> `https://opencode.ai/docs/zh-tw/config/` 目前仍可看到部分舊版／相容格式範例，例如 `mcp.<name>`、`enabled`、`autoupdate` 等。
>
> 如果目標是建立 **V2 原生設定**，欄位遷移應優先參考：
>
> `https://opencode.ai/v2/docs/migrate-v1`

---

# 2. V2 修改重點總表

| 項目 | V1 | V2 |
|---|---|---|
| Agent 集合 | `agent` | `agents` |
| Agent system prompt | `prompt` | `system` |
| Agent 停用 | `disable` | `disabled` |
| Agent 權限 | `permission` | `permissions` |
| Bash 權限 action | `bash` | `shell` |
| Task 權限 action | `task` | `subagent` |
| Write / Patch | `write` / `patch` | `edit` |
| Command 集合 | `command` | `commands` |
| Command subtask | `subtask` | `subagent` |
| MCP servers | `mcp.<name>` | `mcp.servers.<name>` |
| MCP enable | `enabled: true` | `disabled: false` |
| MCP timeout | 單一整數 | `catalog` / `execution` |
| Skills 額外來源 | `skills.paths` + `skills.urls` | `skills: []` |
| Reference | `reference` | `references` |
| Provider | `provider` | `providers` |
| Snapshot | `snapshot` | `snapshots` |
| Attachment | `attachment` | `media` |
| TUI 設定 | `tui.json(c)` | Global `cli.json` |
| Auto share | `autoshare` | `share` |
| Agent max steps | `maxSteps` | `steps` |
| Model variant | 獨立 `variant` | `model#variant` |

---

# 3. Agent 設定變更

V2 將：

```text
agent
```

改成：

```text
agents
```

Agent 內部常用欄位也有變更：

```text
prompt      → system
disable     → disabled
permission  → permissions
maxSteps    → steps
```

## V1 範例

```jsonc
{
  "agent": {
    "reviewer": {
      "prompt": "Review for correctness and missing tests.",
      "model": "anthropic/claude-sonnet-4-5",
      "variant": "high",
      "disable": false,
      "permission": {
        "edit": "deny"
      }
    }
  }
}
```

## V2 範例

```jsonc
{
  "agents": {
    "reviewer": {
      "system": "Review for correctness and missing tests.",
      "model": "anthropic/claude-sonnet-4-5#high",
      "disabled": false,
      "permissions": [
        {
          "action": "edit",
          "resource": "*",
          "effect": "deny"
        }
      ]
    }
  }
}
```

## Variant 改法

V1：

```json
{
  "model": "anthropic/claude-sonnet-4-5",
  "variant": "high"
}
```

V2：

```json
{
  "model": "anthropic/claude-sonnet-4-5#high"
}
```

另外，原本 Agent 中的：

```text
temperature
top_p
provider-specific options
```

V2 會移到：

```text
request.body
```

---

# 4. Permission 權限系統大改

這是 V2 最重要的變更之一。

V1 使用依 Tool 分組的權限設定：

```jsonc
{
  "permission": {
    "bash": {
      "git push *": "ask"
    },
    "edit": "allow"
  },
  "tools": {
    "websearch": false
  }
}
```

V2 改成 ordered rules：

```jsonc
{
  "permissions": [
    {
      "action": "shell",
      "resource": "git push *",
      "effect": "ask"
    },
    {
      "action": "edit",
      "resource": "*",
      "effect": "allow"
    },
    {
      "action": "websearch",
      "resource": "*",
      "effect": "deny"
    }
  ]
}
```

## Action 名稱修改

```text
bash  → shell
task  → subagent
write → edit
patch → edit
```

V2 的 Permission 是有順序的規則，因此可以設定：

```jsonc
{
  "permissions": [
    {
      "action": "shell",
      "resource": "*",
      "effect": "ask"
    },
    {
      "action": "shell",
      "resource": "git status *",
      "effect": "allow"
    },
    {
      "action": "shell",
      "resource": "git diff *",
      "effect": "allow"
    },
    {
      "action": "shell",
      "resource": "git push *",
      "effect": "deny"
    }
  ]
}
```

這種方式比 V1 更適合做精細的 CLI 權限控制。

---

# 5. MCP 設定結構變更

V2 MCP 的主要修改：

```text
mcp.<name>
↓
mcp.servers.<name>
```

以及：

```text
enabled
↓
disabled
```

注意兩者語意相反：

```text
enabled: true
```

等同 V2：

```text
disabled: false
```

---

## V1 MCP

```jsonc
{
  "mcp": {
    "playwright": {
      "type": "local",
      "command": [
        "npx",
        "@playwright/mcp"
      ],
      "enabled": true,
      "timeout": 30000
    }
  }
}
```

## V2 MCP

```jsonc
{
  "mcp": {
    "servers": {
      "playwright": {
        "type": "local",
        "command": [
          "npx",
          "@playwright/mcp"
        ],
        "disabled": false,
        "timeout": {
          "catalog": 30000,
          "execution": 30000
        }
      }
    }
  }
}
```

---

# 6. MCP Timeout 拆分

V1：

```json
{
  "timeout": 30000
}
```

V2：

```json
{
  "timeout": {
    "catalog": 30000,
    "execution": 30000
  }
}
```

意義上可分成：

- `catalog`：載入 MCP Tool Catalog 的等待時間
- `execution`：實際執行 MCP Tool 的等待時間

---

# 7. Remote MCP OAuth 欄位

Remote MCP 的 OAuth 欄位改為 snake_case：

```text
clientId      → client_id
clientSecret  → client_secret
callbackPort  → callback_port
redirectUri   → redirect_uri
```

---

# 8. V2 Global MCP 範例

例如 DeepWiki + Playwright：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "mcp": {
    "servers": {
      "deepwiki": {
        "type": "remote",
        "url": "https://mcp.deepwiki.com/mcp",
        "disabled": false
      },

      "playwright": {
        "type": "local",
        "command": [
          "npx",
          "-y",
          "@playwright/mcp@latest"
        ],
        "disabled": false
      }
    }
  }
}
```

如果還要加入 Chrome DevTools MCP，也應放在：

```text
mcp.servers
```

底下，而不是 V1 的：

```text
mcp.<server-name>
```

---

# 9. Command 改成 commands

V1：

```jsonc
{
  "command": {
    "review": {
      "template": "Review the current changes.",
      "subtask": true
    }
  }
}
```

V2：

```jsonc
{
  "commands": {
    "review": {
      "template": "Review the current changes.",
      "subagent": true
    }
  }
}
```

主要修改：

```text
command → commands
subtask → subagent
```

如果 Command 有 Model Variant：

V1：

```yaml
model: anthropic/claude-sonnet-4-5
variant: high
```

V2：

```yaml
model: anthropic/claude-sonnet-4-5#high
```

Markdown Command 仍然支援。

V2 建議目錄：

```text
.opencode/commands/
```

Global：

```text
~/.config/opencode/commands/
```

---

# 10. Skill 設定變更

V1 額外 Skill 來源：

```jsonc
{
  "skills": {
    "paths": [
      "./team-skills"
    ],
    "urls": [
      "https://example.com/skills/"
    ]
  }
}
```

V2 合併成單一 Array：

```jsonc
{
  "skills": [
    "./team-skills",
    "https://example.com/skills/"
  ]
}
```

---

# 11. Skill 目錄

V2 仍可發現：

```text
.opencode/skill/
```

與：

```text
.opencode/skills/
```

但官方建議 V2 使用：

```text
.opencode/skills/<skill-id>/SKILL.md
```

Global：

```text
~/.config/opencode/skills/<skill-id>/SKILL.md
```

例如：

```text
~/.config/opencode/
└─ skills/
   └─ playwright-cli/
      └─ SKILL.md
```

如果 Skill 內還有：

```text
scripts/
references/
templates/
assets/
```

移動 Skill 時應整個資料夾一起移動，不要只複製 `SKILL.md`。

---

# 12. Agent / Command / Skill 目錄改用複數

官方目前建議：

```text
.opencode/
├─ agents/
├─ commands/
├─ modes/
├─ plugins/
├─ skills/
├─ tools/
└─ themes/
```

Global：

```text
~/.config/opencode/
├─ agents/
├─ commands/
├─ skills/
├─ plugins/
├─ tools/
└─ themes/
```

為了相容舊版，單數名稱目前仍可使用，例如：

```text
agent/
command/
skill/
```

但 V2 建議統一改為：

```text
agents/
commands/
skills/
```

---

# 13. AGENTS.md 的重要變更

V2 會發現：

```text
~/.config/opencode/AGENTS.md
```

以及專案目錄向上的：

```text
AGENTS.md
```

官方 V2 migration 特別指出：

> V2 目前只會自動發現 AGENTS.md。

因此若 V1 曾依賴：

```text
CLAUDE.md
```

fallback，建議把 Coding Agent 共通規則移到：

```text
AGENTS.md
```

---

# 14. 建議的 Global OpenCode V2 結構

```text
~/.config/opencode/
│
├─ opencode.json
├─ AGENTS.md
│
├─ agents/
│  └─ translator.md
│
├─ commands/
│  └─ translate.md
│
├─ skills/
│  └─ playwright-cli/
│     └─ SKILL.md
│
├─ plugins/
└─ tools/
```

這樣可以把：

- 全域 Agent
- `/translate` Command
- Playwright Skill
- DeepWiki MCP
- Playwright MCP
- Chrome DevTools MCP

全部整理在 V2 原生架構中。

---

# 15. TUI 設定改成 cli.json

V2 有三項官方明確標記的 breaking changes，其中一項就是 Terminal Client Config。

V1：

```text
tui.json
tui.jsonc
```

V2：

```text
~/.config/opencode/cli.json
```

V2 的 Terminal Client Config 是：

```text
Global only
```

不再使用多層 project-local `tui.json`。

如果 `cli.json` 不存在，第一次啟動 V2 Terminal Client 時，OpenCode 會嘗試自動遷移支援的 Global TUI 設定。

---

# 16. Compaction 修改

V1：

```jsonc
{
  "compaction": {
    "preserve_recent_tokens": 8000,
    "reserved": 20000
  }
}
```

V2：

```jsonc
{
  "compaction": {
    "keep": {
      "tokens": 8000
    },
    "buffer": 20000
  }
}
```

對照：

```text
preserve_recent_tokens
→ keep.tokens

reserved
→ buffer
```

另外：

```text
tail_turns
prune
```

沒有 V2 原生對應欄位，legacy 欄位會被忽略並產生 warning。

---

# 17. Provider 變更

主要變更：

```text
provider
↓
providers
```

另外 Provider 定義也重新整理：

```text
npm
→ package

api
→ settings.baseURL
```

例如 V2：

```jsonc
{
  "providers": {
    "acme": {
      "package": "aisdk:@ai-sdk/openai-compatible",
      "settings": {
        "baseURL": "https://llm.example.com/v1"
      }
    }
  }
}
```

---

# 18. 其他欄位改名

## Snapshot

```text
snapshot
→ snapshots
```

## Attachment

```text
attachment
→ media
```

## Reference

```text
reference
→ references
```

## Plugin

```text
plugin
→ plugins
```

## Auto Share

V1：

```json
{
  "autoshare": true
}
```

V2：

```json
{
  "share": "auto"
}
```

V2 可使用：

```text
manual
auto
disabled
```

---

# 19. V2 三項官方 Breaking Changes

官方 Migration 文件明確列出三大 Breaking Changes：

1. Plugin API 改版
2. Server API / Client contracts 改版
3. Terminal Client 設定由 layered `tui.json(c)` 改成 Global `cli.json`

因此如果只是：

- Agent
- Command
- MCP
- Skill
- Permissions

多數情況屬於「設定格式 migration」。

但如果你有自行開發：

```text
OpenCode Plugin
OpenCode Server API Client
```

就不是單純改 JSON Key，需要另外進行程式碼層級的 migration。

---

# 20. V1 / V2 混用注意事項

V2 為了相容舊版，仍可解析部分 V1 設定。

但不建議長期：

```text
V1 + V2 混著寫
```

尤其 Agent、Provider、Command、Model 等 nested entry，不應在同一 entry 裡混用兩種格式。

例如不要這樣：

```jsonc
{
  "agents": {
    "reviewer": {
      "prompt": "...",
      "disabled": false,
      "permission": {}
    }
  }
}
```

因為：

```text
agents
disabled
```

是 V2，而：

```text
prompt
permission
```

是 V1。

建議整個 entry 一次改成完整 V2 格式。

---

# 21. 最值得記住的 V2 修改

如果只記核心變更，可以先記這些：

```text
agent       → agents
prompt      → system
permission  → permissions[]
bash        → shell
task        → subagent
write       → edit
patch       → edit

command     → commands
subtask     → subagent

mcp.xxx
→ mcp.servers.xxx

enabled
→ disabled（語意反轉）

skill/
→ skills/（推薦）

command/
→ commands/（推薦）

agent/
→ agents/（推薦）

tui.json
→ ~/.config/opencode/cli.json
```

Model Variant：

```text
model + variant
↓
model#variant
```

例如：

```text
anthropic/claude-sonnet-4-5#high
```

---

# 22. 建議的 V2 opencode.json 骨架

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "model": "provider/model",

  "agents": {},

  "commands": {},

  "permissions": [],

  "skills": [],

  "mcp": {
    "servers": {}
  }
}
```

之後依實際需求加入：

```text
providers
plugins
references
compaction
snapshots
media
```

等設定。

---

# 23. 建議 Migration 流程

建議不要直接覆寫原本 V1。

比較安全的方式：

```text
Step 1
備份目前 ~/.config/opencode/

Step 2
先轉換 opencode.json

Step 3
轉換 MCP

Step 4
轉換 Agents

Step 5
轉換 Commands

Step 6
把 skill/ agent/ command/
整理成複數目錄

Step 7
確認 AGENTS.md

Step 8
啟動 OpenCode V2

Step 9
逐一驗證：
- Model
- Provider
- Agent
- Subagent
- Command
- Skill
- Permission
- MCP
- Plugin

Step 10
確認所有 V2 功能正常後再淘汰 V1 設定
```

官方也建議：完成 V2 驗證之前保留 V1 設定，不要讓 V1 讀取已轉成 V2 原生格式的設定檔。

---

# 24. 與目前實際使用情境對應

若目前主要使用：

```text
OpenCode V2
├─ Global AGENTS.md
├─ 自訂 Agent
├─ /translate Command
├─ Playwright Skill
├─ DeepWiki MCP
├─ Microsoft Playwright MCP
└─ Chrome DevTools MCP
```

建議直接全面統一 V2：

```text
~/.config/opencode/
├─ opencode.json
├─ AGENTS.md
├─ agents/
├─ commands/
└─ skills/
```

而 MCP：

```text
opencode.json
└─ mcp
   └─ servers
      ├─ deepwiki
      ├─ playwright
      └─ chrome-devtools
```

這樣未來新增 Agent、Command、Skill、MCP 都會比較容易管理。

---

# 25. 官方文件快速入口

## Configuration
https://opencode.ai/docs/zh-tw/config/

## V1 → V2 Migration
https://opencode.ai/v2/docs/migrate-v1

## V2 Documentation
https://opencode.ai/v2/docs/

## Config Schema
https://opencode.ai/config.json

---

# 26. 結論

OpenCode V2 的設定修改可以概括成四個方向：

1. **命名正規化**
   - 大量單數 Key 改成複數。
   - 例如 `agent → agents`、`command → commands`。

2. **權限模型正規化**
   - 改為 ordered `permissions[]`。
   - `bash → shell`。
   - `task → subagent`。

3. **MCP 結構化**
   - MCP Servers 統一放入 `mcp.servers`。
   - Timeout 拆成 catalog / execution。

4. **Global Coding Agent 結構標準化**
   - `AGENTS.md`
   - `agents/`
   - `commands/`
   - `skills/`

如果已經全面採用 OpenCode V2，建議直接使用 V2 原生格式，而不是依賴 V1 Compatibility Layer。
