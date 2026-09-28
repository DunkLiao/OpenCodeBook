# AI Harness 組成與實務架構說明

## 1. 什麼是 AI Harness？

AI Harness 可以理解為：

> 包在大型語言模型（LLM）外面的「執行環境、專案上下文、角色分工、工具、規則、權限與成本治理機制」。

LLM 本身主要負責理解、推理與產生內容；真正決定 AI Agent：

- 知道哪些專案資訊
- 能使用哪些工具
- 可以修改哪些檔案
- 是否能操作 Terminal
- 是否能連線外部服務
- 哪些行為需要使用者同意
- 可以呼叫哪些 Sub Agent
- 要使用哪一種模型
- 如何控制 Token 與 API 成本

的，是外圍的 AI Harness。

簡化來看：

```text
AI Agent 能力
=
LLM
+
Context
+
Tools
+
Skills
+
Permissions
+
Runtime
+
Orchestration
```

因此，同一個模型放在不同 AI Coding 工具中，實際能力可能差異非常大。

---

# 2. AI Harness 的六大組成

本文將 AI Harness 拆成六個核心面向：

1. 專案上下文
2. 平台自由度
3. 角色分工
4. MCP 與 Skills
5. Permission 與 Plugin
6. 模型與成本策略

---

# 3. 專案上下文（Project Context）

專案上下文解決的核心問題是：

> AI 知道什麼？

如果沒有足夠的 Context，即使使用強大的模型，每次啟動 Agent 都很像一位剛加入專案的新工程師。

因此應把重要知識外部化並文件化。

常見結構：

```text
project/
├─ AGENTS.md
├─ README.md
├─ docs/
│  ├─ PRD.md
│  ├─ SPEC.md
│  ├─ ARCHITECTURE.md
│  └─ SECURITY.md
├─ progress.yaml
└─ handoff.yaml
```

## 3.1 AGENTS.md

主要放置「AI Agent 工作規則」。

例如：

```md
# Project Instructions

## 技術棧
- TypeScript
- React
- Vite
- SQLite

## 開發規則
- 不可修改 production configuration
- 新功能必須補測試
- 不可將 API Key 寫入 source code

## 驗證方式
npm run lint
npm test
npm run build
```

AGENTS.md 可以視為：

> AI Agent 的專案操作手冊。

---

## 3.2 README.md

回答：

> 這個專案是什麼？如何安裝與執行？

常見內容：

- 專案簡介
- 安裝方式
- 開發環境
- 啟動方式
- Build 方式
- 常用命令

---

## 3.3 PRD.md

PRD（Product Requirements Document）回答：

> 要做什麼？

主要描述：

- 使用者需求
- 功能需求
- User Story
- Acceptance Criteria
- 非功能需求

---

## 3.4 SPEC.md

SPEC 回答：

> 功能應該如何運作？

例如：

- API 規格
- 資料格式
- 流程
- 狀態轉換
- 邊界條件
- 錯誤處理

---

## 3.5 ARCHITECTURE.md

回答：

> 系統為什麼這樣設計？

適合保存：

- 系統架構
- 模組關係
- Database
- API
- Frontend / Backend 分工
- Design Decisions

---

## 3.6 progress.yaml

回答：

> 專案目前做到哪裡？

例如：

```yaml
project: my-app

completed:
  - login
  - dashboard

in_progress:
  - report-export

pending:
  - audit-log
```

適合跨 Agent、跨 Session 延續專案進度。

---

## 3.7 handoff.yaml

回答：

> 下一個 Agent 接手時需要知道什麼？

例如：

```yaml
current_task: report-export

last_changes:
  - added export service
  - added csv parser

known_issues:
  - large csv causes memory spike

next_steps:
  - add streaming parser
  - run integration test
```

這對跨 Agent 開發特別重要。

---

## 3.8 Context 的核心觀念

Context 不只是：

```text
塞更多 Prompt
```

而是建立：

```text
Project Knowledge
+
Rules
+
Progress
+
Architecture
+
Decisions
+
Handoff
```

也就是：

> 可持續、可交接、可驗證的 AI 專案記憶。

---

# 4. 平台自由度（Agent Autonomy / Runtime Freedom）

平台自由度回答：

> AI 可以自主做到什麼程度？

不同 AI Coding 平台的差異，不只在模型，也在於 Harness 提供多少執行能力。

可以簡化成以下層級：

```text
Level 1
聊天回答

↓
Level 2
讀取程式碼

↓
Level 3
修改程式碼

↓
Level 4
執行 Terminal

↓
Level 5
執行 Test / Build

↓
Level 6
Browser / MCP / API

↓
Level 7
Multi-Agent

↓
Level 8
長流程自主執行
```

---

## 4.1 低自由度

例如只有：

```text
Read
Edit
```

AI 大致只能：

- 閱讀程式
- 修改程式
- 提供建議

---

## 4.2 中度自由

增加：

```text
Bash
Git
Test
Build
```

Agent 可以：

```text
讀取需求
↓
分析 Repo
↓
修改程式
↓
npm test
↓
npm run build
↓
檢查錯誤
↓
重新修改
```

---

## 4.3 高自由度

再加入：

```text
Browser
Playwright
MCP
Sub-Agent
External API
```

可能形成完整自主流程：

```text
讀需求
↓
分析 Repo
↓
修改程式
↓
執行測試
↓
啟動網站
↓
Playwright 驗證
↓
發現 Bug
↓
修改
↓
重新驗證
↓
產生 Git diff
```

因此：

```text
Agent 實際能力
=
Model × Harness
```

而不是單純：

```text
Agent 能力 = Model
```

---

# 5. 角色分工（Agent Roles）

成熟的 Harness 不一定只有一個萬能 Agent。

更常見做法是把工作拆成不同角色。

例如：

```text
                    Main Agent
                        │
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
       Planner        Coder        Reviewer
          │             │             │
       分析需求        實作          Code Review
          │                           │
          └─────────────┬─────────────┘
                        ↓
                     Tester
                        │
                     驗證結果
```

---

## 5.1 Planner

負責：

- 分析需求
- 找出影響範圍
- 研究現有架構
- 產生 Implementation Plan
- 拆分工作項目

通常不需要 Write 權限。

---

## 5.2 Coder

負責：

- 修改 source code
- 新增功能
- Refactor
- 修正 Bug

需要：

```text
Read
Write
Edit
Terminal
```

---

## 5.3 Reviewer

負責：

- Code Review
- 檢查 Regression
- Security Review
- Coding Convention
- 架構一致性

Reviewer 通常只需要：

```text
Read
Git diff
Test
```

不一定需要修改權限。

---

## 5.4 Tester

負責：

```text
lint
unit test
integration test
browser test
E2E test
```

可以搭配：

- Playwright
- Chrome DevTools
- CLI
- API test

---

## 5.5 角色分工的好處

主要有三個：

### 1. Context 更精簡

每個 Agent 只取得必要資訊。

### 2. Permission 更安全

例如 Reviewer 不需要寫檔權限。

### 3. 模型成本更容易控制

不同角色可以使用不同等級模型。

---

# 6. MCP 與 Skills

這兩個概念常被混在一起。

可以用一句話理解：

> MCP 給 AI「工具」；Skill 教 AI「怎麼工作」。

---

# 7. MCP（Model Context Protocol）

MCP 主要負責把外部系統或能力提供給 Agent。

例如：

```text
AI Agent
   │
   ├─ GitHub MCP
   │     └─ Issue / PR / Repo
   │
   ├─ Playwright MCP
   │     └─ Browser
   │
   ├─ Database MCP
   │     └─ SQL
   │
   └─ Internal MCP
         └─ 公司內部 API
```

常見 MCP 類型：

- Browser
- Playwright
- Chrome DevTools
- GitHub
- GitLab
- Database
- Search
- Documentation
- Filesystem
- Internal API

MCP 解決的是：

> Agent 可以操作什麼？

---

# 8. Skills

Skill 通常是一套針對特定任務的 SOP。

常見形式：

```text
skills/
└─ code-review/
   └─ SKILL.md
```

例如：

```md
# Code Review Skill

1. 先閱讀 git diff
2. 找 breaking changes
3. 檢查 security
4. 執行 tests
5. 分成 Critical / Warning / Suggestion
```

Skill 解決的是：

> 面對某一類工作時，AI 應該如何執行？

---

## 8.1 MCP 與 Skill 的差別

可以記成：

```text
MCP
=
手腳

Skill
=
SOP / 經驗 / 工作方法
```

例如：

```text
Playwright MCP
=
AI 可以控制瀏覽器
```

而：

```text
Web Testing Skill
=
告訴 AI：

如何登入
如何測試
如何檢查表單
如何截圖
如何判定 PASS / FAIL
```

真正強大的 Harness 通常會讓兩者搭配。

---

# 9. Permission 與 Plugin

這兩項分別回答：

```text
Permission
→ AI 可以做什麼？

Plugin
→ AI 可以增加哪些能力？
```

---

# 10. Permission

AI Agent 不應該預設擁有全部權限。

常見 Permission 模式：

```text
Allow
Ask
Deny
```

例如：

```yaml
tools:

  allow:
    - Read
    - Glob
    - Test

  ask:
    - Bash
    - git_push

  deny:
    - delete_database
    - production_deploy
```

---

## 10.1 Allow

Agent 可以直接執行。

例如：

```text
讀取檔案
搜尋程式碼
執行 lint
執行 unit test
```

---

## 10.2 Ask

執行前需要使用者確認。

例如：

```text
npm install
git commit
git push
刪除檔案
```

---

## 10.3 Deny

完全禁止。

例如：

```text
Production Deploy
Drop Database
刪除正式環境資料
讀取 Secrets
```

---

## 10.4 推薦權限模型

例如：

```text
讀取          → Allow
修改 source   → Allow
執行測試      → Allow
Build         → Allow

安裝套件      → Ask
Git commit    → Ask
Git push      → Ask

刪除 Database → Deny
正式部署      → Deny
```

這就是：

> Least Privilege for AI Agents

讓 AI 只拿到完成任務所必要的最低權限。

---

# 11. Plugin

Plugin 可以理解為：

> 一整包 Harness 擴充能力。

一個 Plugin 可能包含：

```text
Plugin
├─ Skills
├─ Commands
├─ Agents
├─ MCP
├─ Hooks
└─ Config
```

因此：

```text
Skill
=
單一工作能力

Plugin
=
完整能力套件
```

---

## 11.1 Plugin 範例

例如：

```text
Telegram Notification Plugin
```

可以包含：

```text
Telegram API
notification Skill
idle hook
approval hook
config
```

當 Agent：

```text
完成任務
等待使用者核准
發生錯誤
```

就可以透過 Plugin 通知使用者。

---

# 12. 模型與成本策略（Model Routing）

成熟 AI Harness 不應該所有工作都使用最高階模型。

比較合理的模式是：

```text
                 Task
                   │
          ┌────────┼────────┐
          ↓        ↓        ↓
       簡單任務   一般任務   困難任務
          │        │        │
        免費      平價      旗艦
          │
       敏感資料
          ↓
        Local
```

---

# 13. 免費模型

適合：

- 格式整理
- 簡單翻譯
- 分類
- Markdown
- 大量機械式任務

優點：

- 成本低
- 可大量使用

缺點：

- 複雜推理較弱
- Code Review 品質可能較不穩定

---

# 14. 平價模型

適合：

- 一般 Coding
- 小型 Bug
- 文件產生
- Refactor
- Sub Agent

通常是 AI Coding 的主力模型。

---

# 15. 旗艦模型

適合：

- Architecture
- Complex Debug
- Security Review
- 大型 Refactor
- Code Review
- 跨模組分析

由於成本較高，不建議所有任務都使用。

---

# 16. 本地模型

適合：

- 機敏程式碼
- 內網環境
- 無法將資料送到外部 API
- 高頻簡單任務

優點：

- 資料不離開環境
- 成本容易控制

缺點：

- 需要 GPU
- 模型能力可能較弱
- 維運成本較高

---

# 17. Role Based Model Routing

可以依角色決定模型。

例如：

```text
Planner
→ Flagship

Coder
→ Mid-tier

Tester
→ Cheap

Reviewer
→ Flagship

Documentation
→ Cheap
```

這種方式可以大幅降低 Agent Workflow 成本。

---

# 18. 成本案例

假設一次完整 Coding 任務：

```text
Planning        $0.30
Coding          $0.20
Testing         $0.03
Review          $0.15
Documentation   $0.02

Total           $0.70
```

如果所有工作都使用旗艦模型，成本可能增加數倍。

因此 Harness 應具備：

```text
Model Routing
+
Token Control
+
Context Control
+
Agent Routing
+
Budget Control
```

---

# 19. AI Harness 完整架構

把上述內容整合，可以形成：

```text
┌─────────────────────────────┐
│         AI Harness          │
├─────────────────────────────┤
│ ① Project Context           │
│ AGENTS / PRD / SPEC / Docs  │
├─────────────────────────────┤
│ ② Agent Roles               │
│ Planner / Coder / Reviewer  │
├─────────────────────────────┤
│ ③ Skills                    │
│ SOP / Workflow / Knowledge  │
├─────────────────────────────┤
│ ④ MCP / Tools               │
│ Browser / Git / DB / API    │
├─────────────────────────────┤
│ ⑤ Plugin / Permission       │
│ Extensions / Allow / Ask    │
├─────────────────────────────┤
│ ⑥ Runtime / Platform        │
│ OpenCode / Claude / Copilot │
├─────────────────────────────┤
│ ⑦ Model Routing             │
│ Free / Cheap / Flagship     │
│ Local                       │
└─────────────────────────────┘
```

更完整的資料流：

```text
             ┌──────────────┐
             │     User     │
             └──────┬───────┘
                    ↓
        ┌───────────────────────┐
        │       AI Harness      │
        │                       │
        │ Context               │
        │ Agents                │
        │ Skills                │
        │ MCP                   │
        │ Plugins               │
        │ Permissions           │
        │ Runtime               │
        │ Model Router          │
        └──────────┬────────────┘
                   ↓
          ┌─────────────────┐
          │       LLM       │
          │ GPT / Claude    │
          │ Gemini / Local  │
          └─────────────────┘
```

---

# 20. 六大項目對應的核心問題

| 項目 | 核心問題 |
|---|---|
| 專案上下文 | AI 知道什麼？ |
| 平台自由度 | AI 可以自主做到哪裡？ |
| 角色分工 | 誰負責什麼？ |
| MCP | AI 可以操作什麼工具？ |
| Skills | AI 知道怎麼執行某類任務嗎？ |
| Permission | AI 被允許做到哪裡？ |
| Plugin | 如何批次擴充 Agent 能力？ |
| 模型策略 | 哪種任務使用哪種模型？ |
| 成本策略 | 如何在能力與成本間取得平衡？ |

---

# 21. 一套 AI Coding Harness 的實際範例

例如以 OpenCode 類型的 Agent 平台建立：

```text
project/
│
├─ AGENTS.md
│
├─ docs/
│  ├─ PRD.md
│  ├─ SPEC.md
│  └─ ARCHITECTURE.md
│
├─ skills/
│  ├─ coding/
│  ├─ review/
│  └─ testing/
│
├─ agents/
│  ├─ planner
│  ├─ coder
│  ├─ reviewer
│  └─ tester
│
├─ plugins/
│  └─ telegram-notification
│
├─ progress.yaml
│
└─ handoff.yaml
```

MCP：

```text
Chrome DevTools
Playwright
DeepWiki
GitHub
Database
```

Permission：

```text
Read       → Allow
Edit       → Allow
Test       → Allow

Install    → Ask
Git Commit → Ask
Git Push   → Ask

Production → Deny
Secrets    → Deny
```

模型：

```text
Planner  → Flagship
Coder    → Mid-tier
Tester   → Cheap
Reviewer → Flagship
Docs     → Cheap
```

這就形成一套相對完整的 AI Coding Harness。

---

# 22. 最重要的觀念

不要只把 AI Coding 理解成：

```text
Prompt
+
LLM
```

真正成熟的 AI Coding 架構應該是：

```text
               LLM
                │
        ┌───────┴────────┐
        │   AI Harness   │
        ├────────────────┤
        │ Context        │
        │ Agent Roles    │
        │ Skills         │
        │ MCP            │
        │ Plugins        │
        │ Permissions    │
        │ Runtime        │
        │ Model Routing  │
        │ Cost Control   │
        └────────────────┘
```

因此可以把 AI Harness 定義為：

> **把單純的 LLM，工程化成可持續工作、可管理、可擴充、可治理的 AI Agent 的整套運行框架。**

---

# 23. 實務建議

如果要建立自己的 AI Coding Harness，可以依照以下順序逐步完成：

```text
Step 1
建立 AGENTS.md

Step 2
建立 PRD / SPEC / Architecture 文件

Step 3
建立 progress.yaml / handoff.yaml

Step 4
建立 Planner / Coder / Reviewer / Tester

Step 5
加入 Skills

Step 6
加入 MCP

Step 7
設定 Permission

Step 8
建立 Plugins

Step 9
設定 Model Routing

Step 10
建立 Cost / Token / Audit 管理
```

最終目標不是「讓 AI 權限越大越好」，而是：

> 在足夠自主性、可靠性、安全性與成本之間取得平衡。

---

## 參考資料

- Microsoft Agent Framework — Harness
  - https://learn.microsoft.com/agent-framework/agents/harness

- Harness Protocol — Terminology
  - https://github.com/harnessprotocol/harness-protocol/blob/main/protocol/terminology.md

- Harness Protocol — Permissions
  - https://harnessprotocol.io/docs/security/permissions/
