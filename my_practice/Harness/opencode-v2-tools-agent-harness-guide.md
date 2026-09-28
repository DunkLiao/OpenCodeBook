# OpenCode v2 內建工具與 Agent Harness 設計指南

## 1. 核心概念

在 OpenCode v2 中，`AGENTS.md` 並不是唯一能影響 Agent 使用工具的方式。

實務上可以分成以下幾層：

| 層級 | 主要用途 | 適合控制什麼 |
|---|---|---|
| Prompt | 一次性指令 | 臨時要求 Agent 使用特定工具 |
| AGENTS.md | 專案全域規則 | 專案原則、不可違反的工作規範 |
| Custom Command | 工作流程入口 | `/review`、`/test`、`/handoff` 等固定流程 |
| Skill | 任務 SOP | Review、Testing、Security、PRD 驗收流程 |
| Agent | 角色分工 | Builder、Reviewer、Researcher、Tester |
| Permissions | 系統層級限制 | allow / ask / deny |
| MCP / Plugin | 擴充能力 | 加入新的外部工具或服務 |

建議不要把所有規則全部塞進 `AGENTS.md`，而是建立分層式 Harness。

---

# 2. OpenCode v2 值得推薦的內建工具

## 2.1 最推薦的核心工具

| 工具 | 推薦度 | 用途 |
|---|---:|---|
| `question` | ★★★★★ | 向使用者取得需求、確認決策 |
| `read` | ★★★★★ | 閱讀專案檔案 |
| `grep` | ★★★★★ | 搜尋程式碼內容 |
| `glob` | ★★★★★ | 搜尋檔案與專案結構 |
| `skill` | ★★★★★ | 載入特定工作 SOP |
| `subagent` | ★★★★★ | 啟動子 Agent 分工 |
| `execute` | ★★★★★ | Code Mode、組合或平行執行工具 |
| `shell` | ★★★★☆ | 執行 CLI、測試、Lint、Build |
| `edit` | ★★★★☆ | 修改檔案 |
| `write` | ★★★★☆ | 建立或覆寫檔案 |
| `patch` | ★★★★☆ | 多檔案或複雜修改 |
| `websearch` | ★★★★☆ | 搜尋最新官方文件或技術資訊 |
| `webfetch` | ★★★★☆ | 讀取指定網址內容 |
| `browser` | ★★★★☆ | Web UI 驗收、Console、Network、Lighthouse 等 |

---

# 3. `read + grep + glob`：Coding Agent 的基本三件套

這三個工具非常適合強制放在「修改前調查」階段。

推薦流程：

```text
glob
↓
找出相關檔案

grep
↓
找出功能、函式、API、關鍵字

read
↓
深入閱讀真正相關的程式碼
```

可以在 `AGENTS.md` 中規定：

```markdown
禁止在未調查現有專案的情況下直接修改程式碼。

修改前應優先使用：

glob → grep → read
```

這可以降低 Agent：

- 沒看到既有實作就重新造一套
- 修改錯檔案
- 重複建立已有功能
- 誤判專案架構

---

# 4. `skill`：把 SOP 從 AGENTS.md 拆出去

`skill` 很適合把特定工作的詳細流程模組化。

例如：

```text
skills/
├── code-review/
├── testing/
├── frontend-design/
├── security-review/
├── prd-validation/
└── release-check/
```

`AGENTS.md` 只需要描述何時載入：

```markdown
進行程式碼 Review 前，必須載入 code-review Skill。

修改或新增測試時，必須載入 testing Skill。

完成 PRD 工作後，必須載入 prd-validation Skill 執行驗收。
```

這樣可以避免 `AGENTS.md` 膨脹成數千行。

---

# 5. `subagent`：建立角色分工

對大型專案特別實用。

例如：

```text
Main Agent
│
├─ Explore Agent
│   └─ 分析專案
│
├─ Research Agent
│   └─ 查官方文件與 API
│
├─ Test Agent
│   └─ 執行測試與驗證
│
└─ Review Agent
    └─ 驗證 PRD 與修改內容
```

適合拆分：

- Research
- Repository exploration
- Testing
- Security review
- Code review
- Documentation

但不要過度拆分。

很小的工作如果也啟動 Subagent，可能造成：

- Context 建立成本
- Agent 啟動成本
- 結果整合成本

大於實際平行化收益。

---

# 6. `execute`：適合大型 Repo 與平行工具呼叫

`execute` 可以用 Code Mode 組合或平行呼叫多個工具。

例如原本：

```text
read package.json
read README.md
read tsconfig.json
read vite.config.ts
```

可以概念上改為：

```text
execute
 ├─ read package.json
 ├─ read README.md
 ├─ read tsconfig.json
 └─ read vite.config.ts
```

適合：

- 多個獨立檔案同時讀取
- 大量檔案檢查
- 批次分析
- 避免把不必要的中間結果全部塞回模型 Context

這對大型專案尤其有價值。

---

# 7. `shell`：非常重要，但一定要搭配 Permissions

常用操作：

```bash
git status
git diff
git log
npm test
npm run build
npm run lint
pytest
cargo test
uv run pytest
```

建議安全策略：

### 可以自動允許

```text
git status
git diff
git log
npm test
npm run lint
npm run build
pytest
```

### 建議 Ask

```text
安裝新套件
修改系統環境
資料庫 migration
部署
```

### 建議 Deny

```text
git push
git reset --hard
rm -rf
npm publish
直接刪除正式資料
```

不要只在 `AGENTS.md` 寫：

```text
不要執行 git push
```

更好的方式是 Permission 直接禁止。

---

# 8. `edit`、`write`、`patch`

三者用途不同：

## `edit`

適合：

- 小範圍修改
- 修改既有內容
- 單檔調整

## `write`

適合：

- 新增檔案
- 建立設定檔
- 產生文件

例如：

```text
PRD.md
AGENTS.md
progress.yaml
handoff.yaml
```

## `patch`

適合：

- 多檔修改
- 跨檔 Refactor
- 大型修改

不建議在 `AGENTS.md` 強制要求一定使用 `patch`。

比較好的規則：

```markdown
優先使用最適合目前模型與任務的檔案修改工具。

局部修改優先使用 edit。

建立新檔案時使用 write。

若 patch 可用且適合跨檔修改，可使用 patch。
```

---

# 9. `websearch` 與 `webfetch`

用途不同。

## `websearch`

適合不知道網址時：

```text
查 React 最新 API
查 OpenCode 最新設定
查某個 SDK 最新版本
```

## `webfetch`

適合已知網址時：

```text
讀官方 API Reference
讀 Migration Guide
讀 GitHub Release Note
讀框架官方文件
```

簡單判斷：

```text
不知道 URL
→ websearch

已知道 URL
→ webfetch
```

---

# 10. `browser`：Web App 開發非常實用

如果專案是 Web App，可以建立完整驗收流程：

```text
寫程式
↓
npm run dev
↓
Browser 開 localhost
↓
操作 UI
↓
檢查 Console
↓
檢查 Network
↓
Screenshot
↓
Lighthouse
↓
PRD 驗收
```

比單純：

```text
npm run build 成功
```

更接近真正的功能驗收。

---

# 11. 除了 AGENTS.md，還有哪些方式可以驅動工具？

## 11.1 Prompt

最簡單的一次性方式。

例如：

```text
先使用 glob 找出所有 TypeScript 檔案。

再用 grep 搜尋 fetch()。

只使用 read 閱讀相關檔案。

先不要修改任何程式碼。

分析完成後再詢問我是否開始修改。
```

優點：

- 快速
- 不需設定
- 適合臨時工作

缺點：

- 不持久
- 每次都要重新輸入

---

# 12. Custom Command

推薦大量使用。

例如：

```text
.opencode/commands/
├── init.md
├── analyze.md
├── implement.md
├── review.md
├── test.md
└── handoff.md
```

例如：

```markdown
---
description: 分析專案但不要修改
agent: plan
---

請分析 $ARGUMENTS。

工作流程：

1. 使用 glob 找出相關檔案。
2. 使用 grep 找出相關程式碼。
3. 使用 read 閱讀必要內容。
4. 必要時使用 websearch 查詢官方文件。
5. 不得修改任何檔案。
6. 最後整理發現與修改建議。
```

使用：

```text
/analyze 登入功能
```

非常適合建立固定 Harness 入口。

推薦 Commands：

```text
/init
/analyze
/implement
/review
/test
/security-review
/handoff
```

---

# 13. Skill

Skill 適合描述：

> 某類工作到底應該怎麼做。

例如：

```text
.opencode/skills/code-review/SKILL.md
```

內容：

```markdown
---
name: Code Review
description: Review current code changes for correctness, regressions and security risks.
---

執行 Code Review：

1. 使用 shell 執行：
   - git status
   - git diff

2. 使用 grep 搜尋：
   - TODO
   - FIXME
   - console.log
   - hardcoded secrets

3. 使用 read 閱讀修改過的檔案。

4. 必要時使用 websearch 查官方文件。

5. 不得使用 edit、write 或 patch。

6. 輸出：
   - Critical
   - Warning
   - Suggestion
```

---

# 14. Custom Agent

Agent 適合定義角色。

例如：

```text
.opencode/agents/
├── builder.md
├── researcher.md
├── reviewer.md
└── tester.md
```

Reviewer：

```markdown
---
description: Review code without changing files
mode: subagent
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: ask
---

Review the current changes.

Use read, grep and glob to understand the implementation.

Do not modify files.
```

這跟只在 Prompt 寫：

```text
不要修改檔案
```

不同。

Permission 是系統層級限制。

---

# 15. Permissions：最重要的安全控制

Permission 適合控制：

```text
allow
ask
deny
```

例如：

```json
{
  "$schema": "https://opencode.ai/config.json",

  "permissions": [
    {
      "action": "read",
      "resource": "*",
      "effect": "allow"
    },
    {
      "action": "glob",
      "resource": "*",
      "effect": "allow"
    },
    {
      "action": "grep",
      "resource": "*",
      "effect": "allow"
    },
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

建議安全模型：

```text
Read-only
→ allow

低風險驗證
→ allow

可能修改系統或專案狀態
→ ask

不可逆或高風險操作
→ deny
```

---

# 16. Agent-specific Permission

不同 Agent 應該有不同權限。

例如：

```text
Research Agent
read      allow
grep      allow
glob      allow
websearch allow
edit      deny
shell     deny
```

```text
Reviewer Agent
read      allow
grep      allow
glob      allow
shell     ask
edit      deny
```

```text
Builder Agent
read      allow
grep      allow
glob      allow
edit      allow
write     allow
shell     ask
```

```text
Deploy Agent
shell     ask
```

這會比讓所有 Agent 擁有完全相同權限安全得多。

---

# 17. Command + Agent + Skill 的推薦組合

例如：

```text
/review
```

流程：

```text
/review Command
       ↓
Reviewer Agent
       ↓
code-review Skill
       ↓
glob
grep
read
shell git diff
       ↓
Review Report
```

這是非常適合 OpenCode v2 的架構。

---

# 18. 建議的 Harness 分層

推薦架構：

```text
┌─────────────────────────────┐
│ AGENTS.md                   │
│ Project Constitution        │
│                             │
│ 專案全域原則                │
│ PRD 是唯一需求來源          │
│ 不可自行修改需求            │
│ Session 開始/結束規則       │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Commands                    │
│                             │
│ /init                       │
│ /analyze                    │
│ /implement                  │
│ /review                     │
│ /test                       │
│ /handoff                    │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Agents                      │
│                             │
│ builder                     │
│ researcher                  │
│ reviewer                    │
│ tester                      │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Skills                      │
│                             │
│ prd-analysis                │
│ code-review                 │
│ testing                     │
│ security-review             │
│ prd-validation              │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│ Permissions                 │
│                             │
│ read        allow           │
│ grep        allow           │
│ glob        allow           │
│ shell       ask             │
│ git status  allow           │
│ git push    deny            │
└─────────────────────────────┘
```

---

# 19. 各層應負責什麼

最簡單的記法：

```text
AGENTS.md
= What / Rules
= 必須遵守什麼

Command
= Entry Point
= 我要開始做什麼

Skill
= How
= 這類工作怎麼做

Agent
= Who
= 誰來做

Permissions
= Can / Cannot
= 實際允許做什麼
```

---

# 20. 與 PRD / progress / handoff 的整合

如果採用：

```text
PRD.md
.harness/progress.yaml
.harness/handoff.yaml
```

推薦流程：

```text
使用者提出需求
        ↓
question
        ↓
需求訪談
        ↓
建立 / 更新 PRD.md
        ↓
建立 progress.yaml
        ↓
glob → grep → read
        ↓
必要時 Skill
        ↓
必要時 Subagent
        ↓
edit / write / patch
        ↓
shell
test / lint / build
        ↓
browser
UI / 功能驗收
        ↓
PRD Acceptance Criteria 驗證
        ↓
更新 progress.yaml
        ↓
更新 handoff.yaml
```

核心原則：

```text
PRD.md
= 需求唯一來源

progress.yaml
= 現在做到哪裡

handoff.yaml
= 下一個 Session 需要知道什麼
```

Agent 不應自行：

- 猜需求
- 擴充需求
- 改寫 Acceptance Criteria
- 修改 PRD 意圖
- 把自己的實作偏好當成需求

若需求不明確：

```text
question
↓
詢問使用者
```

而不是自行推論。

---

# 21. 最推薦優先導入的工具

若只挑七個：

```text
question
read
grep
glob
skill
subagent
execute
```

執行層再搭配：

```text
shell
edit
write
patch
websearch
webfetch
browser
```

---

# 22. 最終推薦架構

對大型 OpenCode 專案，不建議：

```text
所有規則
↓
全部塞 AGENTS.md
```

建議：

```text
AGENTS.md
↓
只放專案憲法

Commands
↓
建立工作入口

Agents
↓
定義角色

Skills
↓
封裝 SOP

Permissions
↓
限制工具能力

PRD.md
↓
需求唯一來源

progress.yaml
↓
追蹤進度

handoff.yaml
↓
跨 Session 交接
```

最終形成：

```text
User
 ↓
Command
 ↓
Agent
 ↓
AGENTS.md
 ↓
PRD.md
 ↓
Skill
 ↓
Tools
 ↓
Permissions
 ↓
Validation
 ↓
progress.yaml
 ↓
handoff.yaml
```

這樣才是一套完整的 OpenCode Agent Harness，而不只是單純的 Prompt Engineering。

---

# 23. 官方文件

OpenCode 官方文件：

- Tools  
  https://opencode.ai/v2/docs/tools/

- Agents  
  https://opencode.ai/v2/docs/agents/

- Commands  
  https://opencode.ai/v2/docs/commands/

- Skills  
  https://opencode.ai/v2/docs/skills/

- Permissions  
  https://opencode.ai/v2/docs/permissions/

- Configuration  
  https://opencode.ai/docs/zh-tw/config/
