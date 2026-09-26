# 跨 AI Coding Agent 專案：AGENTS.md 應保留哪些資訊

如果你的目標是讓 **Claude Code、OpenCode、Codex、GitHub Copilot、Gemini CLI 等不同 Coding Agent** 都能接手同一個專案繼續開發，那麼 `AGENTS.md` 應該保留「任何新的 Agent 接手後，都能快速理解專案並安全修改」所需要的資訊。

---

## 一、AGENTS.md 建議保留的 8 類核心資訊

### 1. 專案目的與範圍

至少說明：

- 這個專案解決什麼問題
- 主要使用者是誰
- 核心功能有哪些
- 哪些功能明確不在目前範圍內
- 專案目前所處階段，例如 MVP、正式版、維護期

這能避免 Agent 因為不了解專案邊界，而自行擴張需求或加入不必要功能。

---

### 2. 技術棧與執行環境

建議列出：

- 前端框架
- 後端框架
- Database
- Runtime
- Node.js / Python / Rust 等版本
- 套件管理工具
- 作業系統限制
- 瀏覽器支援需求
- 是否必須離線執行
- 是否允許使用外部 API
- 是否有企業內網、資安或部署限制

例如：

```markdown
## Tech Stack

- Frontend: React + TypeScript
- Build Tool: Vite
- Package Manager: npm
- Runtime: Node.js 22+
- Storage: IndexedDB
- Deployment: Offline SPA
- Supported OS: Windows 10 / 11
```

---

### 3. 專案結構

不要要求 Agent 自己猜目錄用途。

建議標示重要目錄：

```text
src/          核心程式
components/   UI 元件
lib/          共用工具
services/     外部服務與資料層
docs/         PRD、架構與規格文件
tests/        測試
scripts/      建置與維護腳本
public/       靜態資源
```

如果有特別重要的檔案，也可以標示：

```text
docs/PRD.md              功能需求與驗收條件
docs/ARCHITECTURE.md     系統架構
src/main.ts              Application entry point
src/services/storage.ts  資料存取層
```

---

### 4. 開發、執行與測試指令

這一段對 Coding Agent 很重要。

例如：

```bash
npm install
npm run dev
npm run build
npm test
npm run lint
npm run typecheck
```

如果 Windows 與 Linux/macOS 指令不同，也要標示。

建議明確說明：

- 安裝 dependency 的方式
- Development server 啟動方式
- Build 指令
- Test 指令
- Lint 指令
- Type check 指令
- 格式化指令
- E2E 測試方式

---

### 5. 架構與重要設計決策

這是跨 Agent 專案最容易漏掉、但最重要的內容之一。

例如：

- 為什麼使用 SPA
- 為什麼採離線架構
- 為什麼資料存在 IndexedDB
- 為什麼沒有 Backend
- 哪一層負責資料存取
- 狀態管理方式
- API 邊界
- Module dependency 規則
- 哪些元件不能直接互相依賴

例如：

```markdown
## Architecture Rules

- UI component 不得直接存取 IndexedDB。
- 所有資料操作必須經由 `src/services/`。
- Business logic 不得放在 UI component。
- 不得在 feature module 間建立 circular dependency。
```

保留「為什麼這樣設計」也很重要。

否則不同 AI Agent 很容易覺得：

> 「我有更好的做法。」

然後直接把原本架構改掉。

---

### 6. 開發規則與禁止事項

建議使用非常明確的語句。

例如：

```markdown
## Development Rules

- 不得任意新增大型 dependency。
- 修改功能前必須先閱讀 `docs/PRD.md`。
- 不得破壞既有資料格式。
- 不得直接修改 generated files。
- 不得刪除既有功能以簡化實作。
- 不得修改 public API，除非需求明確要求。
- 優先修改既有模組，不要重寫整個架構。
- 不得進行與此次需求無關的大型 refactor。
- 不得因測試失敗而直接刪除測試。
```

如果專案有資安需求，也可以加入：

```markdown
- 禁止將 API Key、Token、Password 寫入程式碼。
- Secret 必須透過環境變數管理。
- 不得將使用者敏感資料送往未核准的第三方服務。
```

---

### 7. 驗證方式與 Definition of Done

Coding Agent 最常見的問題之一是：

> 「程式寫完了」被當成「需求完成了」。

因此建議明確定義完成條件。

例如：

```markdown
## Definition of Done

完成任何修改前必須：

1. 執行 lint。
2. 執行 type check。
3. 執行 unit tests。
4. 執行 build。
5. 確認既有測試沒有 regression。
6. 對照 `docs/PRD.md` 的驗收條件。
7. 確認沒有移除既有功能。
8. 回報修改檔案與驗證結果。
```

如果某些測試因環境限制無法執行，也應要求 Agent 明確說明。

例如：

```markdown
若無法執行某項驗證，必須說明：

- 未執行項目
- 無法執行原因
- 可能造成的風險
```

---

### 8. 文件與規格的優先順序

多 Agent 協作時，最容易遇到：

- README 說 A
- PRD 說 B
- 程式碼目前是 C
- 使用者現在要求 D

因此建議明確定義 Source of Truth。

例如：

```markdown
## Source of Truth

當文件或現有程式碼內容衝突時，依下列優先順序判斷：

1. 使用者目前明確提出的需求
2. `docs/PRD.md`
3. `AGENTS.md`
4. `docs/ARCHITECTURE.md`
5. 現有程式碼行為
6. `README.md`
```

這能大幅降低不同 Agent 對規格的解讀差異。

---

# 二、建議加入「Agent 接手專案流程」

對 Claude Code、OpenCode、Codex、Copilot 等 Coding Agent 特別有效。

建議放入：

```markdown
## Agent Workflow

開始任何修改前：

1. 閱讀 `AGENTS.md`。
2. 閱讀 `docs/PRD.md` 中與此次需求相關的段落。
3. 檢查目前專案結構與相關程式碼。
4. 先確認需求影響範圍。
5. 優先進行最小必要修改。
6. 不要順便重構與需求無關的程式碼。
7. 完成後執行既有測試、lint、type check 與 build。
8. 對照 PRD 驗證沒有破壞既有功能。
9. 回報修改內容與驗證結果。
```

建議要求 Agent 最後至少回報：

```markdown
## Completion Report

- 修改內容
- 修改檔案
- 測試結果
- Build 結果
- 是否影響既有功能
- 尚存風險
- 尚未驗證項目
```

---

# 三、不同文件的職責如何切分

建議不要把所有資訊全部塞進 `AGENTS.md`。

可以採用以下文件分工：

```text
AGENTS.md
→ 所有 AI Coding Agent 共用的專案規則與開發守則

CLAUDE.md
→ Claude Code 專屬設定、習慣與 Claude-specific instruction

docs/PRD.md
→ 功能需求、User Story、Business Rule、Acceptance Criteria

README.md
→ 給人類看的專案介紹、安裝方式與基本操作

docs/ARCHITECTURE.md
→ 系統架構、模組關係、資料流、技術設計

docs/DECISIONS/
→ ADR，記錄重要技術決策與原因

docs/API.md
→ API contract 與接口說明

docs/DATA_MODEL.md
→ Database / Schema / Local Storage / IndexedDB 資料結構
```

---

# 四、AGENTS.md 不應該變成第二份 PRD

`AGENTS.md` 的目的不是保存所有專案文件。

核心原則是：

> `AGENTS.md` 應保存「AI 如果不知道，就很可能做錯事」的資訊。

因此適合放：

- 開發規則
- 架構限制
- 專案結構
- 關鍵路徑
- 禁止事項
- 驗證方式
- Build / Test 指令
- 文件優先順序
- Agent 工作流程

不適合大量放入：

- 完整 PRD
- 長篇 User Story
- 完整 API Reference
- 歷史會議紀錄
- 大量需求討論
- 所有 Bug 歷史
- 完整資料字典

這些內容應該放在 `docs/`，由 `AGENTS.md` 指向即可。

例如：

```markdown
## Required Documentation

修改功能前，依需求閱讀：

- Product requirement: `docs/PRD.md`
- Architecture: `docs/ARCHITECTURE.md`
- API specification: `docs/API.md`
- Data model: `docs/DATA_MODEL.md`
```

---

# 五、建議 AGENTS.md 的大小

如果是跨多個 Coding Agent 共用：

**建議控制在約 150～400 行。**

太短：

- Agent 無法理解架構與限制。

太長：

- Agent 可能抓不到真正重要的規則。
- 容易與 PRD、README 重複。
- 未來維護困難。
- 文件容易產生規格衝突。

因此建議：

```text
AGENTS.md
   ↓
提供索引、規則、限制、流程

docs/
   ↓
保存完整需求與技術細節
```

---

# 六、推薦的 AGENTS.md 標準結構

可以採用以下結構：

```markdown
# AGENTS.md

## 1. Project Overview

## 2. Project Scope

## 3. Tech Stack

## 4. Runtime & Environment

## 5. Project Structure

## 6. Architecture

## 7. Development Rules

## 8. Coding Conventions

## 9. Security Rules

## 10. Commands

## 11. Testing

## 12. Definition of Done

## 13. Source of Truth

## 14. Agent Workflow

## 15. Required Documentation

## 16. Prohibited Changes

## 17. Completion Report
```

---

# 七、建議加入「最小修改原則」

AI Coding Agent 很容易在處理小需求時順便重構。

建議直接加入：

```markdown
## Minimal Change Principle

執行需求時應遵守以下原則：

1. 只修改完成需求所必要的檔案。
2. 不主動進行與需求無關的 refactor。
3. 不主動更換 framework、library 或 architecture。
4. 不因個人偏好重新格式化整個專案。
5. 不修改與需求無關的 API。
6. 不刪除看似未使用但用途不明的程式碼。
7. 若發現其他問題，先回報，不要自行擴大修改範圍。
```

這一段非常適合 Vibe Coding / Agentic Coding 專案。

---

# 八、建議加入「修改前先理解」

可以要求 Agent 在動手之前：

```markdown
## Before Editing

修改任何程式碼前：

1. 找出需求涉及的檔案。
2. 找出相關 function、module、component。
3. 了解目前資料流。
4. 檢查是否已有類似實作。
5. 檢查現有測試。
6. 確認 PRD 驗收條件。
7. 再進行修改。
```

這可以降低 AI 重複造輪子或修改錯誤模組的機率。

---

# 九、推薦的跨 Agent 文件架構

推薦專案最後整理成：

```text
project/
│
├─ AGENTS.md
├─ CLAUDE.md
├─ README.md
│
├─ docs/
│   ├─ PRD.md
│   ├─ ARCHITECTURE.md
│   ├─ API.md
│   ├─ DATA_MODEL.md
│   │
│   └─ DECISIONS/
│       ├─ ADR-001.md
│       ├─ ADR-002.md
│       └─ ...
│
├─ src/
├─ tests/
└─ ...
```

其中：

```text
AGENTS.md
     ↓
所有 Agent 共通規則

CLAUDE.md
     ↓
Claude Code 專屬規則

PRD.md
     ↓
產品需求

ARCHITECTURE.md
     ↓
系統架構

ADR
     ↓
為什麼當初這樣設計
```

---

# 十、最重要的設計原則

如果整份文件只能記住一個原則，就是：

> **AGENTS.md 不需要保存所有專案知識，但必須保存「AI 不知道就可能做錯事」的資訊。**

跨 Agent 專案真正重要的不是讓 AI 「知道很多」，而是讓不同 Agent 都能知道：

- 這個專案是做什麼的
- 哪些東西不能改
- 修改之前要看什麼
- 應該修改哪一層
- 哪些規則必須遵守
- 怎樣才算完成
- 修改完成後如何驗證
- 規格衝突時聽誰的

只要這些資訊清楚，即使換成不同 Coding Agent，也能大幅降低：

- 架構被亂改
- 功能 regression
- 重複造輪子
- 大型無關 refactor
- PRD 被忽略
- Agent 各自理解不同
- 「程式能跑」但需求沒有完成

等常見問題。
---

# 十一、progress.yaml 與 handoff.yaml 的用途

在跨 Coding Agent、跨 Session、長期持續開發的專案中，除了 `AGENTS.md` 之外，也可以加入：

```text
progress.yaml
handoff.yaml
```

兩者的職責不同：

```text
progress.yaml
→ 現在做到哪裡

handoff.yaml
→ 下一個 Agent 接手時，需要知道什麼
```

可以把它們視為兩種不同層次的工作狀態文件。

---

## 11.1 progress.yaml：專案進度與工作狀態

`progress.yaml` 比較像「專案開發進度表」或「目前工作狀態快照」。

它的核心問題是：

> **目前做到哪裡？**

建議保存：

- 現在正在處理哪個需求
- 已完成哪些項目
- 哪些項目正在進行
- 哪些項目尚未開始
- 哪些項目被阻塞
- Test 執行情況
- Build 執行情況
- Lint / Type Check 狀態
- 哪些 Acceptance Criteria 已驗證
- 最後更新時間

例如：

```yaml
version: 1

project: my-project

current_task:
  id: FEATURE-001
  title: "新增 CSV 匯入功能"
  status: in_progress

progress:
  completed:
    - "CSV parser"
    - "欄位驗證"
    - "unit tests"

  in_progress:
    - "ImportDialog UI"

  pending:
    - "大檔案測試"
    - "PRD 驗收"

  blocked: []

validation:
  lint: passed
  typecheck: passed
  unit_tests: passed
  build: not_run
  e2e: not_run

last_updated: "2026-09-26"
```

建議狀態值固定，不要讓不同 Agent 自行發明：

```yaml
status:
  - todo
  - in_progress
  - blocked
  - completed
```

這樣未來可以：

- 被不同 Agent 一致理解
- 被 Script 自動解析
- 被 CI / Dashboard 使用
- 降低不同 Agent 對狀態文字的解讀差異

---

## 11.2 progress.yaml 解決什麼問題

假設今天使用 Claude Code 開發，明天改用 OpenCode 或 Codex。

如果沒有 `progress.yaml`，新的 Agent 往往要重新掃描整個 Repository 才知道：

- 哪些功能已完成
- 哪些功能還沒做
- 哪些 Test 已經跑過
- 哪些驗收還沒完成

有了 `progress.yaml`，Agent 可以快速取得類似下面的資訊：

```text
需求完成約 70%
Parser 已完成
UI 尚未完成
Unit Test 已通過
Build 尚未執行
E2E 尚未驗證
```

因此 `progress.yaml` 本質上可以視為：

> **Machine-readable Project Status**

---

# 十二、handoff.yaml：跨 Agent 與跨 Session 交接

`handoff.yaml` 的目的不是單純追蹤進度，而是保存「交接上下文」。

它的核心問題是：

> **如果現在換一個 Agent，它接下來需要知道什麼？**

例如：

```yaml
version: 1

handoff:
  task:
    id: FEATURE-001
    title: "新增 CSV 匯入功能"

  summary: >
    CSV parser 與資料驗證已完成，
    目前剩下 UI 錯誤提示與大檔案測試。

  changed_files:
    - "src/services/csvParser.ts"
    - "src/components/ImportDialog.tsx"
    - "tests/csvParser.test.ts"

  important_files:
    - path: "docs/PRD.md"
      reason: "功能與驗收條件"

    - path: "src/services/csvParser.ts"
      reason: "CSV parsing 核心邏輯"

  decisions:
    - decision: "CSV parsing 必須放在 service layer"
      reason: "避免 UI component 承擔 business logic"

  known_issues:
    - "Big5 encoding 尚未支援"
    - "50MB 以上檔案尚未測試"

  next_steps:
    - "完成 ImportDialog error states"
    - "執行 npm test"
    - "執行 npm run build"
    - "對照 docs/PRD.md 驗收"

  warnings:
    - "不要改變現有 data schema"
    - "不要移除既有 CSV parser tests"
```

---

## 12.1 handoff.yaml 建議保存的資訊

建議包含：

- 本次 Task
- 工作摘要
- 已修改檔案
- 重要檔案
- 已做出的技術決策
- 每個重要決策的原因
- Known Issues
- 尚未完成的項目
- 下一步
- 不應修改的內容
- 尚未驗證的風險

尤其推薦保留：

```yaml
decisions:
  - decision: "..."
    reason: "..."
```

原因是不同 Coding Agent 最常遇到的問題，不是看不懂程式，而是：

> 看得懂程式，但不知道前一個開發者或 Agent 為什麼故意這樣設計。

例如：

```yaml
decisions:
  - decision: "CSV parsing 放在 service layer"
    reason: "避免 UI component 承擔 parsing 與 business logic"
```

這比單純寫：

```text
CSV parser 已完成
```

更有交接價值。

---

# 十三、progress.yaml 與 handoff.yaml 的差異

| 項目 | `progress.yaml` | `handoff.yaml` |
|---|---|---|
| 核心問題 | 做到哪裡？ | 下一個 Agent 要知道什麼？ |
| 性質 | 狀態追蹤 | 上下文交接 |
| 更新頻率 | 較頻繁 | Session 結束或切換 Agent 時 |
| 主要內容 | completed / pending / blocked / validation | decisions / important files / next steps / warnings |
| 主要用途 | 工作進度 | Context Transfer |
| 是否保存決策原因 | 通常不需要 | 建議保存 |
| 是否適合自動解析 | 非常適合 | 適合 |

可以用一句話區分：

```text
progress.yaml
「CSV parser 已完成。」

handoff.yaml
「CSV parser 已完成，而且刻意放在 service layer，
不要搬到 component，因為 UI 不應直接負責 parsing。」
```

---

# 十四、AGENTS.md、progress.yaml、handoff.yaml 的關係

三份文件建議分工如下：

```text
AGENTS.md
→ 長期、不容易改變的專案規則

progress.yaml
→ 目前做到哪裡

handoff.yaml
→ 最近一次工作留下來的上下文與交接資訊
```

也可以理解為三種時間尺度：

```text
AGENTS.md
長期規則
   ↓

progress.yaml
目前狀態
   ↓

handoff.yaml
最近一次 Session / Agent 的工作上下文
```

推薦專案結構：

```text
project/
│
├─ AGENTS.md
├─ progress.yaml
├─ handoff.yaml
├─ CLAUDE.md
├─ README.md
│
├─ docs/
│   ├─ PRD.md
│   ├─ ARCHITECTURE.md
│   ├─ API.md
│   ├─ DATA_MODEL.md
│   │
│   └─ DECISIONS/
│
├─ src/
├─ tests/
└─ ...
```

---

# 十五、不要把 progress.yaml / handoff.yaml 當成 Source of Truth

`progress.yaml` 與 `handoff.yaml` 都屬於：

> **工作狀態層**

它們不應成為產品需求或系統架構的最終權威來源。

真正的 Source of Truth 仍然應該是：

```text
docs/PRD.md
→ 功能需求與 Acceptance Criteria

docs/ARCHITECTURE.md
→ 系統架構與技術設計

AGENTS.md
→ Agent 開發規則與限制

程式碼
→ 實際 Implementation
```

而：

```text
progress.yaml
handoff.yaml
```

主要負責描述：

```text
目前做到哪裡
上一個 Agent 做了什麼
下一個 Agent 應該從哪裡繼續
```

避免讓 `handoff.yaml` 長期累積成另一份 PRD。

---

# 十六、推薦的跨 Agent Session 流程

如果要建立穩定的 Agent Development Protocol，可以要求所有 Coding Agent 遵守下面的流程。

## Session 開始

```text
1. Read AGENTS.md
2. Read progress.yaml
3. Read handoff.yaml
4. Read relevant sections of docs/PRD.md
5. Read relevant architecture documents
6. Inspect related code
7. Inspect related tests
8. 確認此次修改範圍
9. 開始工作
```

可直接寫入 `AGENTS.md`：

```markdown
## Session Start

開始開發前：

1. 閱讀 `AGENTS.md`。
2. 閱讀 `progress.yaml`。
3. 閱讀 `handoff.yaml`。
4. 閱讀此次需求相關的 `docs/PRD.md`。
5. 閱讀必要的架構與技術文件。
6. 檢查相關程式碼與測試。
7. 確認需求與修改範圍後再開始修改。
```

---

## Session 結束

```text
1. 執行 tests
2. 執行 lint
3. 執行 type check
4. 執行 build
5. 對照 PRD 驗收條件
6. 更新 progress.yaml
7. 更新 handoff.yaml
8. 回報修改內容與驗證結果
```

可寫成：

```markdown
## Session End

完成工作前：

1. 執行既有測試。
2. 執行 lint。
3. 執行 type check。
4. 執行 build。
5. 對照 `docs/PRD.md` 驗證 Acceptance Criteria。
6. 更新 `progress.yaml`。
7. 更新 `handoff.yaml`。
8. 回報：
   - 修改內容
   - 修改檔案
   - 測試結果
   - Build 結果
   - 尚未完成項目
   - Known Issues
   - 尚存風險
```

---

# 十七、推薦的 progress.yaml 標準 Schema

建議固定格式，避免 Claude Code、OpenCode、Codex、Copilot 等工具各自使用不同格式。

```yaml
version: 1

project: my-project

current_task:
  id: FEATURE-001
  title: "新增 CSV 匯入功能"
  status: in_progress

progress:
  completed: []
  in_progress: []
  pending: []
  blocked: []

acceptance_criteria:
  passed: []
  pending: []
  failed: []

validation:
  lint: not_run
  typecheck: not_run
  unit_tests: not_run
  integration_tests: not_run
  e2e: not_run
  build: not_run

notes: []

last_updated: "YYYY-MM-DD"
```

建議 validation 狀態固定：

```text
not_run
passed
failed
blocked
not_applicable
```

---

# 十八、推薦的 handoff.yaml 標準 Schema

```yaml
version: 1

handoff:
  task:
    id: ""
    title: ""

  summary: ""

  changed_files: []

  important_files:
    - path: ""
      reason: ""

  decisions:
    - decision: ""
      reason: ""

  known_issues: []

  next_steps: []

  warnings: []

  do_not_change: []

  validation:
    completed: []
    not_run: []
    failed: []

  context_notes: []

last_updated: "YYYY-MM-DD"
```

---

# 十九、progress.yaml 與 handoff.yaml 的維護原則

建議再加入以下規則：

```markdown
## Progress and Handoff Rules

- `progress.yaml` 必須反映目前真實狀態。
- 完成 Task 後必須同步更新 `progress.yaml`。
- Session 結束前必須更新 `handoff.yaml`。
- 不得在 `handoff.yaml` 中重新定義 PRD。
- 不得使用 `handoff.yaml` 覆蓋 `AGENTS.md` 的規則。
- 重大架構決策應寫入 ADR，不應只存在 `handoff.yaml`。
- 已失效的 handoff 資訊應更新或移除。
- 不得將 Secret、Token、API Key 寫入任何 YAML 文件。
```

如果某個決策具有長期影響，例如：

- 更換 Database
- 更換 Framework
- 改變資料格式
- 修改 API Contract
- 更換 Auth 流程

則應將決策移到：

```text
docs/DECISIONS/
```

保存為 ADR，而不是只留在 `handoff.yaml`。

---

# 二十、完整的跨 Agent 文件模型

最終推薦可以形成以下分層：

```text
┌──────────────────────────────┐
│          docs/PRD.md         │
│      What should be built    │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│    docs/ARCHITECTURE.md      │
│       How it is designed     │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│          AGENTS.md           │
│      How agents should work  │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│        progress.yaml         │
│       Where we are now       │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│         handoff.yaml         │
│      What the next agent     │
│        needs to know         │
└──────────────────────────────┘
```

可以簡化成：

```text
PRD
→ 要做什麼

ARCHITECTURE
→ 系統應該怎麼設計

AGENTS
→ AI 應該怎麼工作

progress
→ 現在做到哪裡

handoff
→ 下一個 AI 從哪裡接手
```

這樣可以形成一套相對完整的 **跨 Coding Agent 專案開發協定**。
