# OpenCode V2 Plugin 詳細設定指南

> 適用：OpenCode V2  
> 重點環境：Windows + Global 全域設定  
> 更新日期：2026-09-27

---

## 目錄

1. [V2 Plugin 是什麼](#1-v2-plugin-是什麼)
2. [V1 → V2 最重要差異](#2-v1--v2-最重要差異)
3. [Plugin 可以做什麼](#3-plugin-可以做什麼)
4. [Global 與 Project 設定位置](#4-global-與-project-設定位置)
5. [推薦的 Windows Global 目錄結構](#5-推薦的-windows-global-目錄結構)
6. [設定檔中的 plugins](#6-設定檔中的-plugins)
7. [npm Plugin 設定](#7-npm-plugin-設定)
8. [Local Plugin 設定](#8-local-plugin-設定)
9. [自動探索 Plugin](#9-自動探索-plugin)
10. [Plugin Options](#10-plugin-options)
11. [Plugin Enable / Disable](#11-plugin-enable--disable)
12. [CLI 管理 Plugin](#12-cli-管理-plugin)
13. [Git / GitHub Plugin](#13-git--github-plugin)
14. [建立自己的 V2 Plugin](#14-建立自己的-v2-plugin)
15. [V2 Plugin API 基本結構](#15-v2-plugin-api-基本結構)
16. [Plugin Lifecycle](#16-plugin-lifecycle)
17. [CLI-only / TUI Plugin](#17-cli-only--tui-plugin)
18. [Plugin Reload](#18-plugin-reload)
19. [驗證 Plugin](#19-驗證-plugin)
20. [更新 Plugin](#20-更新-plugin)
21. [移除 Plugin](#21-移除-plugin)
22. [常見錯誤與除錯](#22-常見錯誤與除錯)
23. [Plugin / Skill / Command / Agent / MCP 差異](#23-plugin--skill--command--agent--mcp-差異)
24. [建議的 Global 實務架構](#24-建議的-global-實務架構)
25. [V1 Plugin 遷移 V2](#25-v1-plugin-遷移-v2)
26. [快速操作清單](#26-快速操作清單)
27. [官方文件](#27-官方文件)

---

# 1. V2 Plugin 是什麼

OpenCode Plugin 是直接在 OpenCode Runtime 內執行的擴充模組。

它比 Skill、Command、Agent 與 MCP 更接近 OpenCode 本身，可以：

- 修改 Agent
- 修改 Model / Provider
- 新增 Tool
- 新增 Command
- 新增 Skill
- 新增 Integration
- 新增 Reference
- 攔截模型請求
- 攔截 Tool 執行
- 呼叫 V2 Client API
- 修改 OpenCode Runtime 行為
- 擴充 CLI / TUI

概念：

```text
OpenCode
│
├─ Agent
├─ Commands
├─ Skills
├─ MCP
└─ Plugins
   ├─ Hooks
   ├─ Tools
   ├─ Providers
   ├─ Models
   ├─ Commands
   ├─ Integrations
   └─ Runtime extensions
```

V2 Plugin API 目前官方仍標示為 **Beta**，因此 entrypoint、hook 與部分設定格式在正式穩定版之前仍可能調整。

---

# 2. V1 → V2 最重要差異

## 2.1 `plugin` 改為 `plugins`

V1：

```jsonc
{
  "plugin": [
    "opencode-example-plugin"
  ]
}
```

V2：

```jsonc
{
  "plugins": [
    "opencode-example-plugin"
  ]
}
```

V2 請一律使用：

```jsonc
"plugins": []
```

---

## 2.2 V1 Plugin 實作不能直接拿到 V2 執行

V1 Plugin 通常是函式：

```ts
export const MyPlugin = async ({ app, client }) => {
  return {
    // hooks
  }
}
```

V2 Plugin 改成：

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "my-plugin",

  async setup(ctx) {
    // setup
  },
})
```

單純把檔案搬到 V2 目錄或把設定鍵改名，**不能完成 V1 → V2 遷移**。

---

## 2.3 V2 package + options 改為 object

V1：

```jsonc
{
  "plugin": [
    [
      "./plugin/local.ts",
      {
        "enabled": true
      }
    ]
  ]
}
```

V2：

```jsonc
{
  "plugins": [
    {
      "package": "./plugin/local.ts",
      "options": {
        "enabled": true
      }
    }
  ]
}
```

---

# 3. Plugin 可以做什麼

V2 Plugin 可擴充：

```text
Agents
Models
Providers
Commands
Skills
Tools
Integrations
References
Model Requests
Tool Execution
V2 Client
CLI / TUI
```

因此若需求只是：

```text
告訴 AI 怎麼做事情
```

通常應使用：

```text
Skill / AGENTS.md
```

如果需求是：

```text
新增 OpenCode 本身的能力
```

才比較適合使用 Plugin。

---

# 4. Global 與 Project 設定位置

## Global 設定

Linux / macOS：

```text
~/.config/opencode/
```

Windows：

```text
%USERPROFILE%\.config\opencode\
```

例如：

```text
C:\Users\YourName\.config\opencode\
```

Global 設定檔：

```text
~/.config/opencode/opencode.jsonc
```

Windows：

```text
C:\Users\YourName\.config\opencode\opencode.jsonc
```

---

## Project 設定

專案根目錄：

```text
project/
├─ opencode.jsonc
└─ src/
```

也可以使用：

```text
project/
└─ .opencode/
   ├─ opencode.jsonc
   └─ plugins/
```

---

# 5. 推薦的 Windows Global 目錄結構

若 OpenCode 大部分功能都希望跨專案共用，建議：

```text
C:\Users\<USERNAME>\.config\opencode\
│
├─ opencode.jsonc
├─ cli.json
├─ AGENTS.md
│
├─ agents\
├─ commands\
├─ skills\
│
└─ plugins\
   ├─ notification\
   │  └─ index.ts
   │
   └─ company-tools\
      └─ index.ts
```

各自用途：

```text
opencode.jsonc
→ OpenCode Server / Runtime 設定

cli.json
→ CLI-only / TUI Plugin 設定

AGENTS.md
→ Global Agent 規則

agents/
→ 自訂 Agent

commands/
→ 自訂 Command

skills/
→ Global Skills

plugins/
→ Global Local Plugins
```

---

# 6. 設定檔中的 plugins

基本：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "plugins": [
    "opencode-acme-plugin"
  ]
}
```

可以混合多種來源：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "plugins": [
    "opencode-acme-plugin",
    "opencode-acme-plugin@1.2.0",
    "@acme/opencode-plugin",

    "./plugins/local",
    "../shared/plugin.ts",
    "C:/Users/user/plugins/plugin.ts",

    {
      "package": "@acme/opencode-plugin",
      "options": {
        "agent": "reviewer",
        "strict": true
      }
    }
  ]
}
```

---

## Relative Path 的基準

例如：

```jsonc
{
  "plugins": [
    "./plugins/company-tools"
  ]
}
```

路徑是相對於：

```text
「包含這個 plugins 設定的 config file」
```

如果設定檔位於：

```text
C:\Users\User\.config\opencode\opencode.jsonc
```

則：

```text
./plugins/company-tools
```

代表：

```text
C:\Users\User\.config\opencode\plugins\company-tools
```

---

# 7. npm Plugin 設定

一般 npm package：

```jsonc
{
  "plugins": [
    "opencode-acme-plugin"
  ]
}
```

指定版本：

```jsonc
{
  "plugins": [
    "opencode-acme-plugin@1.2.0"
  ]
}
```

Scoped package：

```jsonc
{
  "plugins": [
    "@acme/opencode-plugin"
  ]
}
```

Latest：

```jsonc
{
  "plugins": [
    "@acme/opencode-plugin@latest"
  ]
}
```

若是第三方 Plugin，推薦優先使用 CLI：

```bash
opencode plugin add <package>
```

例如：

```bash
opencode plugin add opencode-acme-plugin
```

或：

```bash
opencode plugin add @acme/opencode-plugin@latest
```

---

# 8. Local Plugin 設定

假設：

```text
project/
├─ opencode.jsonc
└─ plugins/
   └─ company-tools/
      └─ index.ts
```

由於：

```text
project/plugins/
```

**不會自動探索**，所以要明確設定：

```jsonc
{
  "plugins": [
    "./plugins/company-tools"
  ]
}
```

---

## 直接指定 TS

```jsonc
{
  "plugins": [
    "./plugins/example.ts"
  ]
}
```

---

## 上一層目錄

```jsonc
{
  "plugins": [
    "../shared/plugin.ts"
  ]
}
```

---

## Windows Absolute Path

建議使用 `/`：

```jsonc
{
  "plugins": [
    "C:/Users/User/opencode-plugins/plugin.ts"
  ]
}
```

也可以使用：

```jsonc
{
  "plugins": [
    "file:///C:/Users/User/opencode-plugins/plugin.ts"
  ]
}
```

---

# 9. 自動探索 Plugin

V2 會自動探索：

```text
.opencode/plugins/
```

例如：

```text
project/
└─ .opencode/
   └─ plugins/
      ├─ concise.ts
      ├─ reviewer.js
      └─ acme-package/
         └─ index.ts
```

不需要在 `opencode.jsonc` 再逐一加入。

Global 自動探索目錄：

```text
~/.config/opencode/plugins/
```

Windows：

```text
%USERPROFILE%\.config\opencode\plugins\
```

例如：

```text
C:\Users\User\.config\opencode\plugins\
```

---

## 注意

這個：

```text
project/plugins/
```

不會自動探索。

這個：

```text
project/.opencode/plugins/
```

才會自動探索。

因此推薦：

```text
.opencode/plugins/
```

或 Global：

```text
~/.config/opencode/plugins/
```

---

# 10. Plugin Options

Plugin 可用 object 格式傳入 options：

```jsonc
{
  "plugins": [
    {
      "package": "@acme/opencode-plugin",
      "options": {
        "agent": "reviewer",
        "strict": true
      }
    }
  ]
}
```

Plugin：

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "acme.example",

  setup(ctx) {
    const strict = ctx.options.strict === true

    console.log("strict:", strict)
  },
})
```

流程：

```text
opencode.jsonc

options
   ↓
ctx.options
```

Plugin 自己應負責：

```text
default values
validation
type checking
```

---

# 11. Plugin Enable / Disable

V2 Plugin 可以依 ID 控制。

例如：

```jsonc
{
  "plugins": [
    "*",
    "-opencode.provider.*",
    "opencode.provider.openai",
    "-acme.reviewer"
  ]
}
```

語意：

```text
*
→ 啟用全部 Plugin

-plugin.id
→ 停用指定 Plugin

-prefix.*
→ 停用符合 prefix 的 Plugin

後面的 entry
→ 可以重新覆寫前面的規則
```

例如：

```jsonc
{
  "plugins": [
    "*",
    "-company.*",
    "company.reviewer"
  ]
}
```

結果：

```text
先啟用全部
↓
停用 company.*
↓
重新啟用 company.reviewer
```

注意：Plugin 控制是依照 Plugin 本身的：

```ts
id
```

不是單純依 npm package 名稱判斷。

---

# 12. CLI 管理 Plugin

V2 有正式的 Plugin CLI。

查看說明：

```bash
opencode plugin --help
```

---

## 安裝

```bash
opencode plugin add opencode-acme-plugin
```

指定版本：

```bash
opencode plugin add opencode-acme-plugin@1.2.0
```

Latest：

```bash
opencode plugin add @acme/opencode-plugin@latest
```

`plugin add` 會將 package 加入 Global 設定。

---

## 查看

```bash
opencode plugin list
```

查看 built-in：

```bash
opencode plugin list --builtin
```

---

## 檢查更新

```bash
opencode plugin check
```

---

## 全部更新

```bash
opencode plugin update
```

---

## 更新指定 Plugin

```bash
opencode plugin update opencode-acme-plugin
```

---

## 移除

```bash
opencode plugin remove opencode-acme-plugin
```

也可以：

```bash
opencode plugin remove opencode-acme-plugin@1.2.0
```

---

# 13. Git / GitHub Plugin

V2 `plugin add` 支援 npm-compatible Git package spec。

GitHub shortcut：

```bash
opencode plugin add github:acme/opencode-plugin
```

SSH：

```bash
opencode plugin add git+ssh://git@github.com/acme/opencode-plugin.git#main
```

Repository subdirectory：

```bash
opencode plugin add "github:acme/plugins#main::path:packages/opencode-plugin"
```

可搭配：

```text
branch
tag
commit
repository subdirectory
```

Private repository 會使用既有 Git credentials。

---

# 14. 建立自己的 V2 Plugin

推薦 Global：

```text
C:\Users\<USERNAME>\.config\opencode\plugins\hello\
```

建立：

```text
index.ts
```

內容：

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "hello",

  async setup(ctx) {
    console.log(
      `Hello Plugin loaded - OpenCode ${ctx.app.version}`
    )
  },
})
```

完整：

```text
C:\Users\User\.config\opencode\
│
├─ opencode.jsonc
└─ plugins\
   └─ hello\
      └─ index.ts
```

由於：

```text
~/.config/opencode/plugins/
```

是 Global 自動探索位置，因此不一定需要再手動加入：

```jsonc
"plugins": [
  "./plugins/hello"
]
```

---

# 15. V2 Plugin API 基本結構

V2 標準：

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "example",

  async setup(ctx) {
    // Plugin initialization
  },
})
```

重點：

```ts
id: "example"
```

每個 Plugin 都需要唯一 ID。

---

## 取得 OpenCode Version

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "example",

  setup(ctx) {
    console.log(ctx.app.version)
  },
})
```

---

## 取得 location

例如：

```ts
setup(ctx) {
  console.log(ctx.location.directory)
  console.log(ctx.location.project)
}
```

---

## Plugin Context

V2 context 可提供：

```text
app
location
options
client
storage
agent APIs
provider APIs
model APIs
tools / hooks / transforms
```

實際可用 API 請以當前 `/v2/docs/build/plugins/` 為準，因為 V2 Plugin API 尚為 Beta。

---

# 16. Plugin Lifecycle

Plugin 初始化：

```ts
setup(ctx)
```

例如：

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "example",

  setup(ctx) {
    console.log("Plugin loaded")
  },
})
```

也可回傳 cleanup：

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "example",

  setup(ctx) {
    console.log("Plugin loaded")

    return () => {
      console.log("Plugin unloaded")
    }
  },
})
```

概念：

```text
Load Plugin
     │
     ▼
setup()
     │
     ▼
Running
     │
     ▼
Reload / Stop
     │
     ▼
cleanup()
```

---

# 17. CLI-only / TUI Plugin

一般 Runtime Plugin：

```text
opencode.jsonc
```

CLI-only Plugin：

```text
cli.json
```

例如：

```jsonc
{
  "plugins": [
    "@example/opencode-tui"
  ]
}
```

Global：

```text
~/.config/opencode/cli.json
```

Windows：

```text
C:\Users\User\.config\opencode\cli.json
```

---

## 何時才需要 cli.json？

若 Plugin 本身已在：

```text
opencode.jsonc
```

啟用，而且 Plugin 同時有 TUI component，CLI 可以從 OpenCode Server 取得 active Plugin list。

此時通常：

**不要再重複加入 `cli.json`。**

只有真正的：

```text
CLI-only Plugin
```

才設定：

```text
cli.json
```

---

## CLI Plugin 開發

CLI/TUI Plugin 使用：

```ts
import { Plugin } from "@opencode/plugin/tui"

export default Plugin.define({
  id: "acme.cli",

  setup(context) {
    context.ui.toast.show({
      message: "CLI plugin loaded",
      variant: "success",
    })
  },
})
```

---

# 18. Plugin Reload

OpenCode 會監控部分設定與 Plugin 目錄。

例如：

```text
.opencode/plugins/
```

以及：

```text
~/.config/opencode/plugins/
```

修改檔案後通常可以 reload。

如果修改的是：

```text
未監控 dependency
package dependency
某些 package revision
```

可能需要：

```bash
opencode service restart
```

---

# 19. 驗證 Plugin

最簡單：

```bash
opencode plugin list
```

Built-in：

```bash
opencode plugin list --builtin
```

檢查 package：

```bash
opencode plugin check
```

若 Plugin 有 console log：

```ts
setup(ctx) {
  console.log("Plugin loaded")
}
```

啟動 OpenCode 時也可確認 log。

---

# 20. 更新 Plugin

先檢查：

```bash
opencode plugin check
```

全部更新：

```bash
opencode plugin update
```

單一：

```bash
opencode plugin update opencode-acme-plugin
```

注意：

```text
Local Plugin
Exact package revision
Full Git commit hash
```

通常不會跟一般未鎖版 package 一樣自動更新。

---

# 21. 移除 Plugin

CLI：

```bash
opencode plugin remove opencode-acme-plugin
```

也可以直接從：

```jsonc
"plugins": []
```

移除對應 entry。

如果是自動探索的 Local Plugin，則移除或搬走：

```text
~/.config/opencode/plugins/<plugin>
```

或：

```text
.opencode/plugins/<plugin>
```

---

# 22. 常見錯誤與除錯

## 問題 1：用了 `"plugin"`

錯：

```jsonc
{
  "plugin": []
}
```

V2：

```jsonc
{
  "plugins": []
}
```

---

## 問題 2：把 Plugin 放在 `plugins/` 期待自動載入

例如：

```text
project/plugins/test.ts
```

不會自動探索。

改成：

```text
project/.opencode/plugins/test.ts
```

或：

```jsonc
{
  "plugins": [
    "./plugins/test.ts"
  ]
}
```

---

## 問題 3：把 V1 Plugin 直接搬到 V2

V1：

```ts
export const Plugin = async (...) => {
  return {}
}
```

V2 要改：

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "example",
  setup(ctx) {},
})
```

---

## 問題 4：Local relative path 找不到

檢查相對路徑是不是以：

```text
opencode.jsonc 所在資料夾
```

為基準。

---

## 問題 5：Plugin 修改後沒有 reload

執行：

```bash
opencode service restart
```

---

## 問題 6：不知道目前到底載入哪些 Plugin

執行：

```bash
opencode plugin list
```

Built-in：

```bash
opencode plugin list --builtin
```

---

## 問題 7：CLI Plugin 與 Runtime Plugin 搞混

Runtime：

```text
opencode.jsonc
```

CLI-only：

```text
cli.json
```

不要無故在兩邊重複設定同一 Plugin。

---

## 問題 8：Plugin Options 寫成舊版 tuple

不要：

```jsonc
[
  "./plugin.ts",
  {
    "strict": true
  }
]
```

V2：

```jsonc
{
  "package": "./plugin.ts",
  "options": {
    "strict": true
  }
}
```

---

# 23. Plugin / Skill / Command / Agent / MCP 差異

| 類型 | 主要用途 |
|---|---|
| AGENTS.md | 專案 / Global Coding 規則 |
| Agent | 建立專門角色或 Subagent |
| Command | `/translate`、`/review` 等快速工作流程 |
| Skill | 可重用的 SOP、知識與操作方式 |
| MCP | 接外部 Tool / Service |
| Plugin | 修改或擴充 OpenCode Runtime |

可以記成：

```text
Agent
→ 誰來做

Command
→ 怎麼快速叫他做

Skill
→ 應該怎麼做

MCP
→ 可以使用什麼外部工具

Plugin
→ OpenCode 本身可以新增或改變什麼能力
```

若只是希望 AI：

```text
「照我的標準做 Code Review」
```

先用：

```text
Skill / Agent / Command
```

不要直接用 Plugin。

若需求是：

```text
「我要攔截 Tool 執行、修改 Provider、增加 Runtime 功能」
```

才使用 Plugin。

---

# 24. 建議的 Global 實務架構

若多個 Coding Project 共用 OpenCode：

```text
~/.config/opencode/
│
├─ opencode.jsonc
├─ cli.json
├─ AGENTS.md
├─ agents/
├─ commands/
├─ skills/
└─ plugins/
```

Windows：

```text
C:\Users\<USERNAME>\.config\opencode\
```

---

## Global 放什麼？

適合：

```text
通用翻譯
通用 Code Review
通用 Coding Rule
共用 MCP
共用 Plugin
共用 Agent
共用 Skill
```

---

## Project 放什麼？

```text
project/
├─ AGENTS.md
└─ .opencode/
   ├─ opencode.jsonc
   ├─ agents/
   ├─ commands/
   ├─ skills/
   └─ plugins/
```

適合：

```text
此專案專屬 Agent
此專案架構規範
此專案 Commands
此專案 Skills
此專案 Plugin
```

---

# 25. V1 Plugin 遷移 V2

V1 Config：

```jsonc
{
  "plugin": [
    "opencode-example-plugin",

    [
      "./plugin/local.ts",
      {
        "enabled": true
      }
    ]
  ]
}
```

V2：

```jsonc
{
  "plugins": [
    "opencode-example-plugin",

    {
      "package": "./plugin/local.ts",
      "options": {
        "enabled": true
      }
    }
  ]
}
```

---

## V1 Code

```ts
export const MyPlugin = async ({ app, client, $ }) => {
  return {
    // hooks
  }
}
```

---

## V2 Code

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "my-plugin",

  async setup(ctx) {
    // hooks / tools / transforms
  },
})
```

V2 官方明確指出：

```text
V1 Plugin implementations do not run in V2.
```

所以升級 V2 時，Plugin code 必須真正 port。

---

# 26. 快速操作清單

## 查看 Plugin

```bash
opencode plugin list
```

---

## 查看內建 Plugin

```bash
opencode plugin list --builtin
```

---

## 安裝 npm Plugin

```bash
opencode plugin add <package>
```

---

## 安裝指定版本

```bash
opencode plugin add <package>@1.2.0
```

---

## GitHub Plugin

```bash
opencode plugin add github:owner/repository
```

---

## 檢查更新

```bash
opencode plugin check
```

---

## 更新全部

```bash
opencode plugin update
```

---

## 更新單一 Plugin

```bash
opencode plugin update <package>
```

---

## 移除

```bash
opencode plugin remove <package>
```

---

## 重啟 OpenCode Service

```bash
opencode service restart
```

---

## Global Plugin 位置

Windows：

```text
%USERPROFILE%\.config\opencode\plugins\
```

Linux / macOS：

```text
~/.config/opencode/plugins/
```

---

## Project Plugin

```text
<project>/.opencode/plugins/
```

---

## Global Config

Windows：

```text
%USERPROFILE%\.config\opencode\opencode.jsonc
```

Linux / macOS：

```text
~/.config/opencode/opencode.jsonc
```

---

# 27. 官方文件

以下以 OpenCode V2 官方文件為準。

## Plugins

https://opencode.ai/v2/docs/plugins

主要內容：

```text
Plugin configuration
Plugin discovery
Plugin enable / disable
Plugin CLI
Plugin reload
Package / Git Plugin
```

---

## Build Plugins

https://opencode.ai/v2/docs/build/plugins

主要內容：

```text
Plugin.define()
id
setup(ctx)
Plugin API
Tools
Hooks
Agent / Provider transformation
```

---

## V1 → V2 Migration

https://opencode.ai/v2/docs/build/plugins/migrate-v1

主要內容：

```text
plugin → plugins
tuple → object options
V1 code → V2 Plugin.define()
```

---

## Config

https://opencode.ai/v2/docs/config

主要內容：

```text
opencode.jsonc
plugins config
providers
models
config hierarchy
```

---

## CLI Plugins

https://opencode.ai/v2/docs/cli/plugins

主要內容：

```text
CLI-only Plugin
cli.json
TUI Plugin
Local CLI Plugin discovery
```

---

## CLI Commands

https://opencode.ai/v2/docs/cli/commands

主要內容：

```text
opencode plugin list
opencode plugin add
opencode plugin check
opencode plugin update
opencode plugin remove
```

---

# 最後建議

如果你的 OpenCode V2 使用方式是：

```text
多個專案
+
Global Agent
+
Global Command
+
Global Skill
+
Global MCP
```

Plugin 也建議採取同一策略：

```text
C:\Users\<USERNAME>\.config\opencode\
│
├─ opencode.jsonc
├─ AGENTS.md
├─ agents\
├─ commands\
├─ skills\
└─ plugins\
```

優先順序：

```text
1. 第三方 Plugin
   → opencode plugin add

2. 自己寫、跨專案使用
   → ~/.config/opencode/plugins/

3. 專案專屬 Plugin
   → <project>/.opencode/plugins/

4. CLI-only / TUI Plugin
   → cli.json
```

並牢記 V2 三個重點：

```text
plugin
↓
plugins

V1 function plugin
↓
Plugin.define({ id, setup })

普通 plugins/ 不會自動探索
↓
.opencode/plugins/ 才會
```

---

**文件版本：OpenCode V2 Plugin Guide / 2026-09-27**
