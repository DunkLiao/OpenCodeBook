# AI Coding 模型選擇指南

## 前言

在 AI Coding 的實際使用情境中，不需要所有工作都使用最強、最昂貴的模型。

更有效率的策略，是依照任務的：

- 複雜度
- 成本
- 資料敏感度
- 推理需求
- 穩定性要求
- 專案規模

將模型分成四個層級：

1. 免費模型
2. 平價模型
3. 旗艦模型
4. 本地模型

核心概念不是「哪個模型最強」，而是：

> 這個 Task 值得使用哪一個等級的模型？

---

# 一、四種模型快速比較

| 類型 | 核心定位 | 最適合 | 成本 | 能力 |
|---|---|---|---|---|
| 免費模型 | 測試、探索、低風險工作 | 小修改、問答、文件整理 | 低 | 中低～中 |
| 平價模型 | 日常主力 | 一般開發、Debug、重構 | 低～中 | 中高 |
| 旗艦模型 | 複雜問題攻堅 | 架構、大型重構、Hard Debug | 高 | 高 |
| 本地模型 | 隱私、離線、自主控制 | 公司內網、敏感程式碼 | 硬體成本 | 視模型而定 |

---

# 二、免費模型

## 核心定位

免費模型最適合處理：

> 可以失敗、可以重做、風險較低的工作。

它不一定適合獨立完成大型專案，但非常適合大量、重複、簡單的開發工作。

## 適用情境

例如：

- 解釋程式碼
- 產生簡單函式
- Regex
- SQL 基礎查詢
- JSON / YAML 格式轉換
- Markdown 文件整理
- 建立測試資料
- 修改變數名稱
- 補註解
- README
- 基礎 HTML / CSS
- 小型 Bug 修正
- 初步 Code Review
- 產生測試案例
- 探索 Library 使用方式
- 分析專案目錄
- 找出特定功能所在檔案

### 實例

假設正在開發 OpenCode Telegram Notification Plugin：

```text
請閱讀目前專案。

找出：
1. Plugin entry point
2. Telegram 相關程式碼
3. Event handler
4. 設定檔位置

不要修改任何檔案。
```

或：

```text
請閱讀 src/telegram.ts。

說明 sendTelegramMessage() 的作用，
並檢查是否有 TypeScript 型別問題。

不要修改檔案。
```

這類工作通常不需要旗艦模型。

---

## 優點

### 1. 成本低

AI Coding Agent 很容易大量消耗 Token。

因為一次任務可能反覆讀取：

```text
AGENTS.md
package.json
tsconfig.json
src/
tests/
git diff
terminal output
```

如果所有步驟都使用昂貴模型，成本會快速增加。

因此免費模型很適合：

```text
探索專案
↓
閱讀程式
↓
整理資訊
↓
簡單修改
```

### 2. 適合學習 AI Coding

可以放心：

- 試 Prompt
- 試 Agent
- 試 Workflow
- 試工具呼叫
- 試不同模型

不需要太擔心 Token 成本。

### 3. 適合大量低價值任務

例如：

```text
補 README
整理註解
格式轉換
簡單測試
命名建議
程式解釋
```

---

## 缺點

### 1. 穩定性較低

可能發生：

```text
第一次：修對了
第二次：改壞其他功能
第三次：忘記前面的要求
```

### 2. 複雜推理能力較弱

遇到：

```text
跨多檔案修改
複雜 dependency
大型 refactor
architecture decision
database migration
race condition
security
```

成功率通常下降。

### 3. Rate Limit 與可用性

免費模型常有：

- 每日限制
- 每分鐘限制
- Queue
- 服務不穩定
- 免費模型更換
- Endpoint 下架

因此正式專案不宜完全依賴單一免費模型。

---

# 三、平價模型

## 核心定位

平價模型最適合成為：

> AI Coding 的預設模型。

實際上，大部分日常 Coding 工作並不需要旗艦模型。

---

## 適用情境

非常適合：

- 一般 Feature 開發
- CRUD
- REST API
- TypeScript
- Python
- Go
- React Component
- SPA
- SQL
- Unit Test
- Debug
- 小～中型 Refactor
- Docker
- CI/CD
- API 串接
- CLI 工具
- Git 操作
- 文件同步
- Agent 日常 Executor

### 實例

```text
新增 TelegramNotifier 類別。

要求：

1. 從 .env 讀取 BOT_TOKEN
2. 從 .env 讀取 CHAT_ID
3. 使用 Telegram Bot API
4. timeout 為 10 秒
5. 發送失敗 retry 3 次
6. 加入 Vitest 單元測試
```

這就是非常典型的平價模型工作。

---

## 優點

### 1. Price / Performance 高

AI Coding Agent 通常會形成：

```text
Read
→ Think
→ Edit
→ Run
→ Error
→ Read
→ Fix
→ Test
→ Review
```

一個任務可能進行十幾到數十次 Model Call。

因此單次 API 成本差距如果很大，整體成本會被放大。

平價模型很適合作為：

> 大量、穩定、日常性的主力模型。

### 2. 通常速度較快

對於：

- CRUD
- API
- Test
- 小型 Bug
- Component
- 文件

通常不需要長時間 reasoning。

### 3. 可以承擔大部分開發工作

合理的工作配置可以是：

```text
70%～90% 日常工作
→ 平價模型

10%～30% 高難度工作
→ 旗艦模型
```

---

## 缺點

### 1. 全域理解能力有限

例如專案包含：

```text
frontend/
backend/
database/
workers/
plugins/
tests/
docs/
```

要求：

```text
重新設計 Authentication Architecture
```

平價模型可能會「能改」，但不一定能完整掌握整體影響。

### 2. 容易局部最佳化

它可能知道：

> 怎麼修。

但不一定知道：

> 應不應該這樣修。

因此 Architecture Decision 最好由更強模型處理。

---

## 建議工作模式

```text
旗艦模型
→ 設計

平價模型
→ 實作

平價模型
→ 測試

旗艦模型
→ Review
```

這通常是兼顧成本與品質的良好方式。

---

# 四、旗艦模型

## 核心定位

旗艦模型真正的價值不是：

> 寫更多 Code。

而是：

> 做更好的判斷。

---

## 適用情境

特別適合：

- Greenfield 專案架構
- 大型 Legacy Code 理解
- 跨模組重構
- Difficult Bug
- Concurrency
- Race Condition
- Memory Leak
- Security Review
- Architecture Review
- Agent 設計
- MCP / Plugin Framework
- 大型 Dependency Migration
- Database Schema Redesign
- Performance Bottleneck
- 複雜 TypeScript Generic
- Rust Ownership
- 多步驟 Coding Agent
- Root Cause Analysis

### 實例

以 OpenCode Plugin 為例：

```text
目前 Plugin 要監聽：

- task idle
- permission request
- error
- completed

並透過 Telegram 發送通知。

請先閱讀整個專案。

不要修改任何程式。

分析：

1. OpenCode Plugin Lifecycle
2. 哪些 Hooks 可以監聽
3. 是否可能重複通知
4. Concurrency 問題
5. Retry Architecture
6. Telegram Rate Limit
7. Secret Management
8. 建議的 Module Architecture

最後輸出 Implementation Plan。
```

這就是非常適合旗艦模型的工作。

---

## 優點

### 1. 複雜推理能力強

尤其適合處理：

```text
多個 module
多個 dependency
async workflow
event system
database
API
security
```

混在一起的問題。

### 2. 較能找出 Root Cause

例如：

```text
Event Emitter
+
Async Queue
+
Retry
+
Race Condition
```

較弱模型可能持續局部 Patch。

旗艦模型比較適合進行：

```text
Root Cause Analysis
```

### 3. 可以降低錯誤方向造成的成本

如果 Architecture 一開始設計錯誤，後面可能發生：

```text
修改 20 個檔案
↓
跑 30 次 Agent
↓
最後發現方向錯誤
```

所以：

> 在高價值決策上使用昂貴模型，反而可能降低總成本。

---

## 缺點

### 1. API 成本較高

如果 Agent 不斷掃 Repository：

```text
Read
Read
Read
Edit
Test
Read
Fix
```

Token 成本可能快速增加。

### 2. 回應速度可能較慢

例如只是：

```text
把 foo 改成 bar
```

通常沒有必要使用高階 reasoning 模型。

### 3. 可能過度工程

原本：

```text
100 行工具程式
```

可能被設計成：

```text
interface
repository
service
adapter
factory
dependency injection
```

因此 Prompt 可以加入：

```text
Prefer simple solution.

Do not introduce new abstraction unless necessary.

Do not add dependencies unless required.
```

---

# 五、本地模型

## 核心定位

本地模型最重要的優勢並不是：

> 免費。

而是：

> Privacy + Offline + Control。

---

## 適用情境

非常適合：

- 金融業
- 醫療業
- 政府
- 公司內網
- Proprietary Source Code
- 個資
- 機敏 SQL
- NDA 專案
- Offline Coding
- 自架 Coding Assistant
- 無法存取外部 AI API 的環境

例如：

```text
Ollama
+
Qwen / DeepSeek / Coding Model
+
OpenCode
+
公司 Git Repository
```

形成：

```text
Developer
↓
OpenCode
↓
Local Model
↓
Local Git Repository
```

程式碼不需要離開內部環境。

---

## 優點

### 1. 資料控制權高

對企業最重要。

Source Code、SQL、文件與資料都可以留在：

```text
Local Network
```

### 2. 適合大量固定任務

例如：

- Code Completion
- Code Explanation
- Documentation
- Test Generation
- Refactoring
- SQL Analysis

不用每次計算 API Token 費用。

### 3. 模型版本自主控制

下載完成的模型，只要硬體環境支援，就可以持續使用。

不會因為 API 廠商突然：

- 下架模型
- 改版本
- 改價格
- 更改 Rate Limit

而立即影響工作流程。

---

## 缺點

### 1. 硬體要求

模型越大：

```text
7B
14B
32B
70B+
```

對：

- RAM
- VRAM
- GPU
- 推論速度

要求會快速提高。

### 2. Agentic Coding 更吃資源

因為不只是聊天，而是：

```text
長 Context
多輪 Tool Call
大量 Repository
多次推論
```

### 3. 維運成本

自行架設通常需要處理：

```text
Ollama
llama.cpp
vLLM
CUDA
Quantization
Context Window
GPU Memory
Model Update
```

### 4. 能力不一定追得上雲端旗艦模型

尤其：

```text
大型 Repository Reasoning
Complex Bug
Architecture
Agent Planning
Security Review
```

差距通常比較明顯。

---

# 六、實際 AI Coding 工作流程

假設正在使用 OpenCode 開發：

```text
Telegram Notification Plugin
```

可以採以下方式。

---

## Step 1：探索 Repository

使用：

> 免費模型

Prompt：

```text
讀取目前專案。

整理：

1. 專案目錄結構
2. Plugin Entry Point
3. Event Handler
4. Telegram 相關模組
5. 設定檔

不要修改任何程式碼。
```

---

## Step 2：Architecture

使用：

> 旗艦模型

Prompt：

```text
分析 OpenCode Plugin Lifecycle。

規劃 Telegram Notification Architecture。

需要處理：

- idle
- permission request
- completed
- error

請分析：

1. Event Flow
2. Retry
3. Timeout
4. Duplicate Notification
5. Concurrency
6. Secret Management
7. Module Boundary

最後輸出 Implementation Plan。

不要修改任何程式碼。
```

---

## Step 3：Coding

使用：

> 平價模型

Prompt：

```text
按照 Implementation Plan 實作。

一次只完成一個 Milestone。

每完成一項：

1. 執行測試
2. 確認 TypeScript Compile
3. 不修改無關程式碼
4. 說明修改內容
```

---

## Step 4：Routine Fix

使用：

> 免費模型或平價模型

例如：

```text
修正 ESLint。
```

```text
修正 TypeScript Error。
```

```text
補 README。
```

```text
補 Unit Test。
```

---

## Step 5：Final Review

使用：

> 旗艦模型

Prompt：

```text
重新閱讀 Git Diff。

檢查：

1. Architecture
2. Security
3. Secret Handling
4. Error Handling
5. Race Condition
6. Regression
7. Unnecessary Dependency
8. Over-engineering

不要修改程式碼。

先輸出 Findings。
```

---

# 七、四種模型可以理解成不同角色

| 模型 | 類似公司角色 |
|---|---|
| 免費模型 | 實習生 |
| 平價模型 | 開發工程師 |
| 旗艦模型 | Senior Engineer / Tech Lead |
| 本地模型 | 內網工程師 |

核心概念：

```text
不會叫 Tech Lead
去修 README 錯字。

也不會讓實習生
重新設計核心交易系統。
```

AI Coding 模型同樣適合依任務分工。

---

# 八、推薦的 Model Routing 策略

可以把 AI Coding Router 設計成：

```text
                AI Coding Router

                     │
       ┌─────────────┼─────────────┐
       │             │             │
     簡單           一般           困難
       │             │             │
    免費模型       平價模型       旗艦模型
       │             │             │
 README / 解釋     Feature       Architecture
 Regex            Debug         Hard Debug
 小修改           Test          Refactor
 文件             API           Security
```

另外增加一條：

```text
敏感資料
   │
   ↓
本地模型
```

---

# 九、OpenCode 建議配置

如果主要使用：

- OpenCode V2
- TypeScript
- Python
- Web
- CLI
- Plugin
- MCP

推薦：

```text
FREE
→ 文件 / Explore / Repo Scan

CHEAP
→ Build / Fix / Test / Feature

FLAGSHIP
→ Plan / Review / Hard Debug / Architecture

LOCAL
→ Sensitive / Offline / Internal Code
```

---

# 十、最推薦的實務原則

## Default：平價模型

日常 Coding 優先使用：

```text
平價模型
```

因為它通常具有最好的：

```text
Price / Performance
```

---

## Escalation：旗艦模型

遇到：

```text
一直修不好
跨模組
Architecture
Hard Debug
Security
大量 Repository
複雜 Dependency
```

再升級到：

```text
旗艦模型
```

---

## 免費模型：處理低價值、高頻任務

```text
文件
解釋
探索
格式
小修改
```

---

## 本地模型：資料不能離開環境時優先

```text
金融
醫療
政府
內網
敏感資料
公司原始碼
```

---

# 十一、總結

最有效率的 AI Coding 策略通常不是：

```text
所有事情
↓
最強模型
```

而是：

```text
免費模型
↓
大量低成本工作

平價模型
↓
日常開發主力

旗艦模型
↓
少量高價值決策

本地模型
↓
機敏 / 離線 / 內網
```

可以記成一句話：

> 平價模型當 Default，旗艦模型當 Escalation，免費模型處理低風險工作，本地模型處理敏感資料。

這種 Model Routing 策略，在 OpenCode、Claude Code、Cursor、Cline、GitHub Copilot 等 AI Coding 工作流中都相當實用。
