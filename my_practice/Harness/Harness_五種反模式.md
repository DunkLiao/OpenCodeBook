# 8-3 當 Harness 走偏時：五種反模式

AI Harness 的目的，不是「讓 Agent 做越多事越好」，而是建立一套 **可控、可重現、可驗證、成本合理** 的 AI 工作機制。

一個好的 Harness，通常會同時處理以下幾件事：

- 給 Agent 足夠但不過量的專案上下文
- 定義哪些事情可以自主執行
- 決定何時需要拆分 Subagent
- 配置 MCP、Skills、Plugin 與工具權限
- 選擇適合的模型與成本層級
- 設計驗收、測試與人工介入節點

問題是，Harness 很容易從「提高效率」變成「增加流程複雜度」。

下面這五種反模式，本質上都是同一件事：

> Harness 本來是為了解決工作問題，最後卻開始製造新的工作。

---

## 五種反模式簡表

| 反模式 | 看得見的症狀 | 付出的代價 | 修正方式 |
|---|---|---|---|
| 過度拆分 | 很小工作也使用多 Subagent | 啟動、讀取上下文與整合報告的成本超過並行收益 | 只拆分獨立且有足夠工作量的任務 |
| 迷信模型能力 | 小修改也用旗艦模型，失敗就繼續換更強模型 | 費用增加，模糊需求與錯誤上下文仍未解決 | 先修正規格、上下文與驗收，再依能力門檻升級 |
| 微管理 | 人類逐次核准低風險步驟，盯著每個工具的呼叫過程 | 人類成為流程瓶頸，Agent 無法連續完成工作 | 事前設定安全邊界，只在高風險、異常與完成節點介入 |
| 放棄理解 | AI 說完成就直接接受，沒有理解設計邏輯或測試範圍 | 問題進入正式環境後，團隊無法判斷與維修 | 保留人工審查，要求可重現的測試與證據 |
| 無底洞除錯 | 對同一錯誤反覆改寫 prompt，沒有取得新資訊 | Token 與時間持續消耗，對話上下文越來越亂 | 連續兩次同型修正失敗就停手，重新蒐集證據 |

---

# 1. 過度拆分：不是 Agent 越多，速度就越快

多 Agent 架構最容易出現的誤解，就是把「平行處理」等同於「高效率」。

例如一個需求只是：

> 修改設定檔，新增 Telegram 通知功能。

卻拆成：

- Agent A：研究 Telegram API
- Agent B：研究 `.env`
- Agent C：研究 OpenCode Plugin
- Agent D：寫 TypeScript
- Agent E：寫測試
- Agent F：整合結果
- Agent G：Review

看起來很完整，但實際工作量可能只需要一名 Agent 就能完成。

真正的成本反而出現在 Agent 之間。

每個 Subagent 都需要：

1. 啟動
2. 讀取 `AGENTS.md`
3. 理解專案
4. 讀取相關檔案
5. 建立自己的上下文
6. 執行工作
7. 回傳結果
8. 主 Agent 再讀取結果
9. 解決不同 Agent 之間的假設衝突
10. 最後整合

因此，多 Agent 有一個很容易被忽略的公式：

```text
總成本 = 實際工作成本 + 協調成本
```

如果工作本身只需要 10 分鐘，但拆分之後產生 20 分鐘的協調成本，就完全失去意義。

## 什麼任務才值得拆？

### 第一，任務之間是否真的獨立

例如：

```text
Agent A：分析 Backend
Agent B：分析 Frontend
Agent C：分析 Database Schema
```

如果三者可以各自研究，最後才整合，就適合並行。

但如果是：

```text
Agent A：設計 API
Agent B：依照 API 寫 Frontend
```

B 高度依賴 A 的輸出，其實並不能真正平行。

### 第二，工作量是否足夠大

如果只是：

```text
修改一個 JSON 欄位
```

完全沒有必要啟動 Subagent。

但如果是：

```text
掃描 200 個 source files，
分別檢查 Security、Performance、Architecture。
```

拆成不同專業 Agent 就很合理。

### 第三，整合成本是否低於平行收益

例如：

```text
Agent A → Security Report
Agent B → Performance Report
Agent C → Dependency Report
```

最後只需要合併報告。

這類型非常適合並行。

相反地，如果三個 Agent 都修改同一組檔案：

```text
src/app.ts
src/config.ts
src/server.ts
```

最後可能產生大量衝突。

## 一個實用判斷規則

> 如果「說明任務給 Subagent」所花的時間，已經接近「自己完成任務」的時間，就不要拆。

Harness 不應追求：

```text
更多 Agent
```

而應追求：

```text
最少必要 Agent 數量
```

---

# 2. 迷信模型能力：不是失敗就換更大的模型

另一個非常常見的 Harness 反模式是：

```text
模型失敗
↓
換更強模型
↓
又失敗
↓
換最貴模型
```

例如：

```text
免費／小型模型
↓
中階模型
↓
旗艦模型
```

但真正的問題可能根本不是模型能力。

更常見的是：

```text
需求不清楚
上下文錯誤
文件過期
測試條件缺失
Agent 看錯檔案
Repository 狀態不一致
```

這時候換模型，只是：

> 用更昂貴的模型理解一份同樣錯誤的資訊。

## 模型能力只是 Harness 的其中一層

可以把 Agent 成功率概念化為：

```text
成功率
≈
模型能力
×
上下文品質
×
任務定義
×
工具可用性
×
驗證機制
```

如果上下文品質很差，那麼即使模型能力提升，整體成功率也可能只改善有限。

## 常見案例

使用者要求：

> 幫我修登入功能。

Agent 改了三次還失敗。

直覺可能會認為：

> 模型不夠強。

但真正缺少的資訊可能是：

```text
登入是哪一種？

OAuth？
JWT？
Session？
LDAP？
SSO？

失敗情況是？

401？
403？
Token refresh？
Cookie？
CORS？
```

旗艦模型也不能憑空知道。

## 正確的升級順序

比較成熟的 Harness 應採用：

```text
Step 1
確認問題描述

↓

Step 2
確認上下文

↓

Step 3
取得 Error / Log / Test Result

↓

Step 4
確認驗收條件

↓

Step 5
才判斷是不是模型能力不足
```

最後才進行模型升級：

```text
Cheap Model
↓
Mid-tier Model
↓
Flagship Model
```

也就是：

> Model Escalation 應該是最後手段，而不是第一反應。

## 可以建立 Model Escalation Policy

```yaml
model_policy:
  simple:
    model: cheap

  coding:
    model: standard

  architecture:
    model: strong

  escalation:
    allowed_when:
      - reasoning_complexity_high
      - context_verified
      - requirements_clear
      - repeated_failure_with_new_evidence
```

這種設計可以避免：

```text
「反正用最強模型就好」
```

造成成本失控。

---

# 3. 微管理：Human-in-the-loop 不是 Human-in-every-step

很多人第一次導入 Agent 時會非常不放心。

因此流程變成：

```text
Agent：我要讀 README，可以嗎？

User：可以。

Agent：我要讀 package.json，可以嗎？

User：可以。

Agent：我要執行 npm test，可以嗎？

User：可以。

Agent：我要修改一個檔案，可以嗎？

User：可以。
```

這其實已經不是 Agent，而是：

> AI 遙控機器人。

Agent 最大的價值之一，就是能夠：

```text
Plan
→ Execute
→ Observe
→ Adjust
→ Continue
```

如果每個步驟都要人工核准：

```text
AI latency
+
Human latency
+
Context switching
```

整個流程反而可能比人工操作更慢。

## Human-in-the-loop 的正確位置

比較合理的是按照「風險」介入，而不是「每一步」介入。

| 行為 | 風險 | 是否需要核准 |
|---|---:|---|
| 讀取程式碼 | 低 | 否 |
| 搜尋 Repository | 低 | 否 |
| 執行 Unit Tests | 低 | 否 |
| 建立暫存檔 | 低 | 否 |
| 修改 Source Code | 中 | 視環境 |
| Git Commit | 中 | 視政策 |
| Push Remote | 高 | 是 |
| Production Deploy | 高 | 是 |
| 刪除 Production Database | 極高 | 必須 |

因此真正的設計應該是：

```text
Permission Boundary
```

而不是：

```text
Permission Every Step
```

## 理想流程

```text
任務開始
   ↓
Agent 自主分析
   ↓
讀檔
   ↓
修改
   ↓
測試
   ↓
測試失敗 → 自主修正
   ↓
測試成功
   ↓
Human Review
   ↓
Deploy Approval
```

人類只出現在真正需要判斷的地方。

可以把這種設計理解成：

```text
Human-on-the-loop
```

而不是：

```text
Human-in-every-loop
```

---

# 4. 放棄理解：不要把「AI 說完成」當成驗收

這是 AI Coding 最危險的反模式之一。

典型流程：

```text
User：
修好登入問題。

Agent：
已完成。

User：
OK。
```

但 Agent 的「完成」可能只表示：

```text
我已經修改程式碼。
```

不一定代表：

```text
功能真的可以使用。
```

甚至不一定代表：

```text
程式可以 Compile。
```

## AI Output 不等於 Evidence

Harness 必須把：

```text
Agent Statement
```

和：

```text
Execution Evidence
```

分開。

例如 Agent 說：

> 所有測試都通過。

Harness 應該最好能看到：

```text
npm test

128 passed
0 failed
```

而不是只接受 Agent 的自然語言描述。

## 良好的 Done Definition

不要定義：

```text
Done = AI 說完成
```

應該定義：

```text
Done =
Code Complete
+
Tests Passed
+
Acceptance Criteria Passed
+
Changes Reviewed
```

甚至可以加入：

```text
Regression Test Passed
Security Check Passed
Lint Passed
Build Passed
```

## 要求 Agent 交付證據

例如任務完成報告可以固定要求：

```markdown
## Changes

修改：
- src/auth.ts
- src/login.ts

## Reason

修正 refresh token expiration handling。

## Verification

執行：

npm test

結果：

128 passed
0 failed

## Remaining Risks

尚未驗證：
- Safari browser
- production OAuth callback
```

這種報告比：

> 已完成所有修改。

可靠得多。

## 更重要的是團隊仍然要理解架構

AI 可以產生：

```text
Code
Tests
Documentation
```

但團隊至少應知道：

```text
為什麼這樣設計？
資料流怎麼走？
失敗模式是什麼？
哪個 component 負責什麼？
如何 debug？
```

否則半年後可能變成：

```text
「這段程式是 AI 寫的，
沒有人敢動。」
```

這其實會形成新的 Technical Debt，甚至可以稱為：

> AI-generated Technical Debt

---

# 5. 無底洞除錯：Prompt 不是萬能 Debugger

這是 Agent 系統裡非常典型的 Token 黑洞。

例如：

```text
User：
修這個 Error。

Agent：
修改 A。

失敗。

User：
還是不行，再修。

Agent：
修改 B。

失敗。

User：
再試一次。

Agent：
修改 C。

失敗。
```

整個過程沒有新增任何資訊。

沒有：

```text
新的 Log
新的 Stack Trace
新的測試結果
新的 Runtime Observation
```

只是一直：

```text
Guess → Modify → Guess → Modify
```

這種模式可以稱為：

> Blind Debugging Loop

## 為什麼會越修越亂？

因為每次修正都會增加上下文。

例如：

```text
第一次：
5000 tokens

第二次：
9000 tokens

第三次：
15000 tokens

第四次：
24000 tokens
```

Agent 不但沒有得到新證據，還要理解：

```text
原始程式
第一次修改
第二次修改
第三次修改
四輪對話
```

最後 Signal-to-Noise Ratio 越來越低。

## 「兩次規則」

一個非常實用的 Harness 規則是：

> 同一種類型的修正連續失敗兩次，就停止猜測。

例如：

```text
Attempt 1
修改 Configuration
→ Failed

Attempt 2
修改 Configuration
→ Failed
```

這時候禁止：

```text
Attempt 3
再猜另一個 Configuration
```

應切換為：

```text
Evidence Collection Mode
```

## Evidence Collection Mode

Agent 接下來應優先做：

```text
讀 Log
取得 Stack Trace
查 Runtime State
執行 Diagnostic Command
建立 Minimal Reproduction
檢查 Dependency Version
比對官方 Documentation
```

而不是繼續盲目修改程式。

流程變成：

```text
Failure
↓
Failure
↓
STOP
↓
Collect Evidence
↓
Form New Hypothesis
↓
Change
↓
Verify
```

這其實就是傳統工程裡的：

```text
Scientific Debugging
```

---

# 五種反模式其實可以分成三個層次

## 第一類：資源配置錯誤

包括：

```text
過度拆分
迷信模型能力
```

核心問題是：

> 用太多資源解決太小、太模糊，或根本尚未定義清楚的問題。

---

## 第二類：控制權配置錯誤

包括：

```text
微管理
放棄理解
```

兩者看起來相反，其實是同一條光譜。

左邊是：

```text
人控制所有事情
```

右邊是：

```text
AI 控制所有事情
```

真正合理的位置在中間：

```text
AI Autonomous Execution
+
Human Governance
```

---

## 第三類：回饋機制失效

就是：

```text
無底洞除錯
```

Agent 沒有從環境取得新的 Evidence。

因此整個 Loop 變成：

```text
Reason
→ Guess
→ Modify
→ Reason
→ Guess
→ Modify
```

而正常 Agent Loop 應該是：

```text
Reason
→ Act
→ Observe
→ Update Belief
→ Act
```

其中最重要的其實是：

> **Observe**

沒有 Observe，就不是真正的 Agent Loop。

---

# 五條 Harness 操作原則

最後，可以把整章濃縮成五條操作原則：

```text
1. 能不拆 Agent，就不要拆。
2. 能先改善 Context，就不要先升級 Model。
3. 能用 Policy 控制，就不要逐步人工核准。
4. 能用 Evidence 驗證，就不要相信 Agent 自我宣告。
5. 沒有新 Evidence，就不要繼續 Debug。
```

也可以進一步形成一套 Harness 的設計哲學：

> **最少必要 Agent、最低足夠模型、最大合理自主權、可驗證交付，以及證據驅動除錯。**

如果把這五件事情控制好，AI Harness 才會真正從「一堆 Agent、工具與模型的集合」，變成一套可以長期維護的工程系統。
