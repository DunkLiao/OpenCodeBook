# OpenCode V2：Agent 與 Command 設定完整指南

本文件整理 OpenCode V2 中自訂 **Agent** 與 **Slash Command** 的設定方式，並以「英文技術文件翻譯成繁體中文」作為實作範例。

> 建議：在 V2 中，直接使用 `.opencode/agents/*.md` 與 `.opencode/commands/*.md` 管理自訂 Agent 與 Command，並將這些檔案納入 Git 版本控制。

---

# 1. 最終目錄結構

假設你的專案為：

```text
D:\VibeCoding\ClaudeProject\Demo
```

建議結構：

```text
Demo/
├─ AGENTS.md
├─ README.md
├─ opencode.jsonc
│
└─ .opencode/
   ├─ agents/
   │  └─ technical-translator.md
   │
   └─ commands/
      └─ translate.md
```

其中：

| 檔案 | 用途 |
|---|---|
| `AGENTS.md` | 專案共用規範與開發說明 |
| `.opencode/agents/technical-translator.md` | 定義技術文件翻譯 Subagent |
| `.opencode/commands/translate.md` | 建立 `/translate` Slash Command |
| `opencode.jsonc` | OpenCode 專案層級設定，可選用 |

---

# 2. OpenCode V2 Agent 的基本概念

OpenCode V2 的 Agent 可以用 Markdown 或 JSONC 定義。

最簡單、最適合專案版本控制的方式，是建立：

```text
.opencode/agents/<agent-name>.md
```

例如：

```text
.opencode/agents/technical-translator.md
```

Agent 的檔名會成為 Agent ID：

```text
technical-translator.md
```

對應：

```text
technical-translator
```

如果使用巢狀目錄：

```text
.opencode/agents/docs/technical-translator.md
```

則 Agent ID 會變成：

```text
docs/technical-translator
```

---

# 3. Agent 可放在哪裡

## 3.1 專案層級

只在目前專案使用：

```text
.opencode/agents/
```

例如：

```text
Demo/.opencode/agents/technical-translator.md
```

這種方式最適合團隊專案，因為可以直接跟專案一起提交到 Git。

---

## 3.2 全域層級

如果希望所有專案都能使用：

```text
~/.config/opencode/agents/
```

例如：

```text
~/.config/opencode/agents/technical-translator.md
```

Windows 上 `~` 代表目前使用者的家目錄。

---

# 4. 建立 technical-translator Subagent

建立：

```text
.opencode/agents/technical-translator.md
```

內容可使用：

```md
---
description: 專門將英文技術文件翻譯成自然、精確的繁體中文，保留程式碼、指令、API、產品名稱與技術術語
mode: subagent
---

# Technical Documentation Translator

你是一個專門處理「英文技術文件 → 繁體中文」的技術翻譯 Agent。

主要任務：

- 將英文技術文件翻譯成繁體中文。
- 使用台灣常用技術用語。
- 保留程式碼。
- 保留 CLI 指令。
- 保留 API endpoint。
- 保留 URL。
- 保留 JSON / YAML key。
- 保留變數、函式、類別、套件名稱。
- 保留產品與框架名稱。
- 不修改原始技術含義。

如果來源是 Markdown，必須保留：

- Heading
- List
- Table
- Code Fence
- Blockquote
- Link
- Front Matter

除非使用者明確要求覆寫原檔，否則建立新的繁體中文版文件。

建議命名：

README.md → README.zh-TW.md

docs/guide.md → docs/guide.zh-TW.md
```

---

# 5. 將 Agent 設定為 Subagent

最重要的是 Front Matter：

```yaml
---
description: 專門將英文技術文件翻譯成繁體中文
mode: subagent
---
```

其中：

```yaml
mode: subagent
```

代表這個 Agent：

- 不作為主要 Agent 使用。
- 由目前 Primary Agent 呼叫。
- 在 child session 執行。
- 具有自己的 context。
- 執行完成後將結果回傳給 Parent Agent。

為避免版本差異，不建議依賴預設 `mode`，請明確寫出：

```yaml
mode: subagent
```

---

# 6. Agent mode 說明

常見模式：

| mode | 用途 |
|---|---|
| `primary` | 作為主要 Agent |
| `subagent` | 只能在 child session 中執行 |
| `all` | 可作為 Primary 或 Subagent |

本例使用：

```yaml
mode: subagent
```

---

# 7. Agent 權限設定

V2 可以透過 `permissions` 控制 Agent 能做什麼。

例如技術翻譯 Agent 不需要執行 Shell：

```yaml
---
description: 技術文件英翻中
mode: subagent

permissions:
  - action: shell
    resource: "*"
    effect: deny

  - action: subagent
    resource: "*"
    effect: deny
---
```

這樣可以避免翻譯 Agent：

- 執行 shell 指令。
- 再呼叫其他 Subagent。

如果希望它能建立翻譯檔案，請不要禁止 `edit`。

---

# 8. Read / Edit / Shell / Subagent 權限

常見權限 action：

```text
read
edit
shell
subagent
glob
grep
webfetch
websearch
skill
```

例如禁止所有檔案修改：

```yaml
permissions:
  - action: edit
    resource: "*"
    effect: deny
```

例如禁止 Shell：

```yaml
permissions:
  - action: shell
    resource: "*"
    effect: deny
```

例如禁止再呼叫其他 Agent：

```yaml
permissions:
  - action: subagent
    resource: "*"
    effect: deny
```

---

# 9. 指定 Agent 使用的 Model

Agent 可以自行指定模型：

```yaml
---
description: 技術文件翻譯
mode: subagent
model: anthropic/claude-sonnet-4-5#high
---
```

實際可用 model ID 請以：

```bash
opencode models
```

顯示結果為準。

如果不指定 `model`，則由 OpenCode 的目前 Session / Parent Agent 模型規則決定。

若沒有特殊需求，建議先不要固定 model。

---

# 10. 測試 Agent 是否載入

進入專案：

```cmd
cd /d D:\VibeCoding\ClaudeProject\Demo
```

啟動：

```cmd
opencode
```

在 TUI 中輸入：

```text
@technical-translator
```

如果 autocomplete 能看到：

```text
technical-translator
```

表示已成功載入。

也可以直接測試：

```text
@technical-translator 請將 README.md 翻譯成繁體中文，輸出為 README.zh-TW.md。
```

---

# 11. 建立自訂 Slash Command

OpenCode V2 支援：

```text
.opencode/commands/<command-name>.md
```

例如：

```text
.opencode/commands/translate.md
```

會建立：

```text
/translate
```

---

# 12. Command 可放在哪裡

## 專案層級

```text
.opencode/commands/
```

例如：

```text
.opencode/commands/translate.md
```

---

## 全域層級

```text
~/.config/opencode/commands/
```

例如：

```text
~/.config/opencode/commands/translate.md
```

只有 `.md` 檔會被當作 Markdown Command 載入。

---

# 13. 建立 `/translate` Command

建立：

```text
.opencode/commands/translate.md
```

推薦內容：

```md
---
description: 將英文技術文件翻譯成繁體中文
agent: technical-translator
subagent: true
---

# Translate Technical Document

請使用 `technical-translator` Subagent 將指定的英文技術文件翻譯成繁體中文。

## 參數

- `$1`：來源文件路徑，必填。
- `$2`：輸出文件路徑，選填。

請將：

`$1`

翻譯成繁體中文。

如果 `$2` 有提供，請將翻譯結果輸出至：

`$2`

如果 `$2` 沒有提供，請依下列規則建立檔名：

- `README.md` → `README.zh-TW.md`
- `guide.md` → `guide.zh-TW.md`
- `docs/install.md` → `docs/install.zh-TW.md`

要求：

- 使用台灣繁體中文。
- 保留 Markdown 結構。
- 不修改程式碼。
- 不修改 CLI 指令。
- 不修改 URL。
- 不修改 API 名稱。
- 不修改 JSON / YAML key。
- 不修改變數與函式名稱。
- 不修改產品與框架名稱。
- 不覆寫原始英文文件。

完成後回報：

1. 原始文件路徑。
2. 產生的繁體中文文件路徑。
3. 是否完整保留 Markdown。
4. 是否完整保留程式碼與指令。
```

---

# 14. Command Front Matter 說明

最重要的設定：

```yaml
---
description: 將英文技術文件翻譯成繁體中文
agent: technical-translator
subagent: true
---
```

說明：

### description

```yaml
description: 將英文技術文件翻譯成繁體中文
```

顯示於 Command 清單與 discovery。

---

### agent

```yaml
agent: technical-translator
```

指定這個 Command 使用：

```text
technical-translator
```

也就是：

```text
.opencode/agents/technical-translator.md
```

---

### subagent

```yaml
subagent: true
```

代表 Command 強制在 child session 中執行。

這樣：

```text
/translate README.md
```

不會直接污染目前主要 Session 的 context。

舊設定可能會看到：

```yaml
subtask: true
```

V2 新設定建議使用：

```yaml
subagent: true
```

`subtask` 為舊版相容欄位。

---

# 15. `$ARGUMENTS` 與 `$1`、`$2`

OpenCode V2 Command 支援：

```text
$ARGUMENTS
```

以及：

```text
$1
$2
$3
...
```

---

## `$ARGUMENTS`

例如 Command：

```text
Review $ARGUMENTS
```

輸入：

```text
/review src/auth.ts
```

會變成：

```text
Review src/auth.ts
```

---

## `$1`、`$2`

例如：

```text
Translate $1 to $2
```

輸入：

```text
/translate README.md README.zh-TW.md
```

則：

```text
$1 = README.md
$2 = README.zh-TW.md
```

對需要明確分開來源與輸出的 Command，建議使用 `$1`、`$2`。

---

# 16. 使用 `/translate`

## 只指定來源

```text
/translate README.md
```

預期輸出：

```text
README.zh-TW.md
```

---

## 指定來源與輸出

```text
/translate README.md README.zh-TW.md
```

---

## 翻譯 docs 文件

```text
/translate docs/installation.md
```

預期：

```text
docs/installation.zh-TW.md
```

---

## 自訂輸出路徑

```text
/translate docs/api.md docs/zh-TW/api.md
```

---

# 17. Agent 與 Command 的關係

整體流程：

```text
使用者
  │
  ▼
/translate README.md
  │
  ▼
.opencode/commands/translate.md
  │
  ├─ agent: technical-translator
  └─ subagent: true
  │
  ▼
technical-translator
  │
  ▼
.opencode/agents/technical-translator.md
  │
  ├─ 讀取 README.md
  ├─ 翻譯
  ├─ 保留程式碼
  ├─ 保留 URL
  ├─ 保留 Markdown
  │
  ▼
README.zh-TW.md
  │
  ▼
結果回傳 Parent Session
```

---

# 18. 為什麼 Agent 與 Command 要分開

建議：

```text
Agent = 能力與角色
Command = 操作入口
```

例如：

```text
technical-translator
```

負責：

```text
如何翻譯
```

而：

```text
/translate
```

負責：

```text
怎麼呼叫
```

這樣可以避免把所有規則都塞進 Slash Command。

---

# 19. 推薦架構

```text
.opencode/
├─ agents/
│  ├─ technical-translator.md
│  ├─ reviewer.md
│  └─ tester.md
│
└─ commands/
   ├─ translate.md
   ├─ review.md
   └─ test.md
```

對應：

```text
/translate
/review
/test
```

---

# 20. 建議與 AGENTS.md 搭配

專案可同時保留：

```text
AGENTS.md
```

它負責：

- 專案目的。
- 專案架構。
- 開發規範。
- Coding Style。
- Build / Test 指令。
- 共同限制。
- 驗收原則。

而：

```text
.opencode/agents/
```

負責：

- 特定角色能力。
- 特定 Agent 系統 Prompt。
- Agent 權限。
- Agent Model。
- Agent mode。

而：

```text
.opencode/commands/
```

負責：

- 建立操作捷徑。
- 將常用工作包裝成 `/command`。
- 傳遞參數。
- 指定要使用的 Agent。

---

# 21. Command 巢狀目錄

可以建立：

```text
.opencode/commands/docs/translate.md
```

對應：

```text
/docs/translate
```

例如：

```text
.opencode/commands/
├─ docs/
│  ├─ translate.md
│  └─ summarize.md
│
└─ code/
   ├─ review.md
   └─ test.md
```

則可以使用：

```text
/docs/translate
/docs/summarize
/code/review
/code/test
```

適合 Command 很多的專案。

---

# 22. Agent 巢狀目錄

也可以：

```text
.opencode/agents/docs/technical-translator.md
```

Agent ID 會是：

```text
docs/technical-translator
```

Command 需指定：

```yaml
agent: docs/technical-translator
```

---

# 23. Command 修改後要不要重啟

V2 會自動重新載入 Command 檔案與設定變更。

通常修改：

```text
.opencode/commands/translate.md
```

儲存後即可使用更新版本，不需要重新啟動 OpenCode。

若 UI 尚未反映，可重新進入 Command 選擇或重啟 TUI 進行排查。

---

# 24. 常見問題排查

## 問題 1：`/translate` 找不到

確認：

```text
.opencode/commands/translate.md
```

不是：

```text
.opencode/command/translate.md
```

新專案建議使用複數：

```text
commands
```

並確認副檔名：

```text
.md
```

---

## 問題 2：Agent 找不到

確認：

```text
.opencode/agents/technical-translator.md
```

並確認 Command：

```yaml
agent: technical-translator
```

名稱必須一致。

---

## 問題 3：Subagent 沒有在 child session 執行

確認 Command：

```yaml
subagent: true
```

同時 Agent：

```yaml
mode: subagent
```

---

## 問題 4：Agent 無法寫入翻譯檔

檢查 Agent 是否設定：

```yaml
permissions:
  - action: edit
    resource: "*"
    effect: deny
```

如果有，代表禁止寫檔。

需要產生：

```text
README.zh-TW.md
```

就不要禁止 `edit`。

---

## 問題 5：Agent 執行了不需要的 Shell

加入：

```yaml
permissions:
  - action: shell
    resource: "*"
    effect: deny
```

---

## 問題 6：Command 參數有空白

可以使用引號：

```text
/translate "docs/My Guide.md" "docs/My Guide.zh-TW.md"
```

`$1` 與 `$2` 會依 positional argument 規則解析。

---

# 25. Windows 建立目錄

PowerShell：

```powershell
New-Item -ItemType Directory -Force .opencode\agents
New-Item -ItemType Directory -Force .opencode\commands
```

或 CMD：

```cmd
mkdir .opencode\agents
mkdir .opencode\commands
```

---

# 26. 建立 Agent 檔案

PowerShell：

```powershell
notepad .opencode\agents\technical-translator.md
```

---

# 27. 建立 Command 檔案

PowerShell：

```powershell
notepad .opencode\commands\translate.md
```

---

# 28. 啟動 OpenCode

在專案根目錄：

```cmd
opencode
```

---

# 29. 最小測試流程

建立一個：

```text
sample.txt
```

內容：

```text
Installation

Run the following command:

npm install example-cli

The API endpoint is:

https://api.example.com/v1/tasks
```

然後：

```text
/translate sample.txt sample.zh-TW.txt
```

預期結果：

```text
安裝

執行以下指令：

npm install example-cli

API endpoint 為：

https://api.example.com/v1/tasks
```

其中：

```text
npm install example-cli
```

與：

```text
https://api.example.com/v1/tasks
```

應保持原樣。

---

# 30. 建議完整 technical-translator Front Matter

推薦：

```yaml
---
description: 專門將英文技術文件翻譯成自然、精確的繁體中文，保留程式碼、指令、API、產品名稱與技術術語
mode: subagent

permissions:
  - action: shell
    resource: "*"
    effect: deny

  - action: subagent
    resource: "*"
    effect: deny
---
```

這個設定允許：

```text
讀取文件
編輯 / 建立翻譯文件
```

但禁止：

```text
執行 Shell
呼叫其他 Subagent
```

很適合專職翻譯 Agent。

---

# 31. 建議完整 translate Command Front Matter

```yaml
---
description: 將英文技術文件翻譯成繁體中文
agent: technical-translator
subagent: true
---
```

不需要在 Markdown Front Matter 中加入：

```yaml
template:
```

因為 Markdown 檔案正文就是 Command template。

---

# 32. 最終推薦結構

```text
Project/
├─ AGENTS.md
├─ opencode.jsonc
│
├─ docs/
│  └─ ...
│
└─ .opencode/
   ├─ agents/
   │  └─ technical-translator.md
   │
   └─ commands/
      └─ translate.md
```

日常只需要：

```text
/translate README.md
```

或：

```text
/translate README.md README.zh-TW.md
```

即可讓：

```text
/translate
```

呼叫：

```text
technical-translator
```

Subagent 執行文件翻譯。

---

# 33. 角色分工總結

```text
AGENTS.md
│
├─ 專案共同規則
├─ 架構
├─ 開發方式
└─ 驗收標準

.opencode/agents/
│
├─ Agent 能力
├─ 系統 Prompt
├─ 權限
├─ Model
└─ Mode

.opencode/commands/
│
├─ Slash Command
├─ Prompt Template
├─ 參數
└─ 指定 Agent
```

簡單記：

```text
AGENTS.md = 專案規則
Agent      = 誰來做
Command    = 怎麼叫它做
```

---

# 34. 官方文件

OpenCode V2 Agents：

https://opencode.ai/v2/docs/agents

OpenCode V2 Commands：

https://opencode.ai/v2/docs/commands

建議未來若 V2 行為有變更，以官方 V2 文件為準。
