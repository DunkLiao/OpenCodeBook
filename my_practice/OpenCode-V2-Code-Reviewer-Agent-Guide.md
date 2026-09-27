# OpenCode V2：Code Reviewer Subagent 設定指南

本文件說明本專案中 **`code-reviewer`（程式碼審查員）** Subagent 的設計、設定與使用方式。

`code-reviewer` 用於審查專案內**指定範圍**的程式碼，以**繁體中文條列式**回報，並區分「**需要改善**」與「**建議改善**」兩類。

> 相關背景請先參閱：`OpenCode-V2-Agent-Command-Setup-Guide.md`（Agent 與 Command 的通用設定方式）。

---

# 1. 最終目錄結構

```text
OpenCodeBook/
├─ AGENTS.md
├─ README.md
│
└─ .opencode/
   ├─ agents/
   │  ├─ technical-translator.md
   │  └─ code-reviewer.md          ← 本文件的主角
   │
   └─ commands/
      └─ translate.md
```

| 檔案 | 用途 |
|---|---|
| `.opencode/agents/code-reviewer.md` | 定義程式碼審查 Subagent（唯讀） |
| Agent ID | `code-reviewer` |

Agent ID 取自檔名（`code-reviewer.md` → `code-reviewer`），因此呼叫時使用的名稱就是 `code-reviewer`。

---

# 2. 為何要獨立成 Subagent

把程式碼審查獨立成 Subagent 有幾個好處：

- **不污染主 Session 的 context**：審查會讀取大量程式碼，於 child session 執行完後只把結論回傳。
- **可固定使用不同模型**：例如指定免費模型，避免佔用主 Session 的付費模型額度。
- **權限可收斂為唯讀**：審查員只讀不寫，降低誤改程式碼的風險。
- **角色單一**：System Prompt 專注於審查規則，輸出格式穩定。

---

# 3. Agent 完整內容

檔案：`.opencode/agents/code-reviewer.md`

```md
---
description: 審查專案內指定的程式碼，找出錯誤、風險與可改進之處，以繁體中文條列式回報，並區分「需要改善」與「建議改善」
mode: subagent
# 免費模型（限時供應）。V2 沒有內建的自動退回機制：若此模型不可用或達速率限制，
# subagent 會直接回報模型／請求錯誤，不會自動改用主 session 的模型。
# 處理方式（擇一）：
#   1. 手動改成本行其他模型，例如 opencode/muse-spark-1.3-contributor-free#high（勿用於機密程式碼）
#   2. 刪除本行 `model`，讓 subagent 沿用主 session 的模型
#   3. 需要自動 fallback，請安裝第三方外掛（例如 opencode-rate-limit-fallback）
model: opencode/space-bunny-free#high
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
  - action: subagent
    resource: "*"
    effect: deny
---

# Code Reviewer（程式碼審查員）

你是一個專門審查程式碼的 Review Agent。

你的任務是審查**使用者指定範圍**內的專案程式碼，找出真正的問題與可改進之處，並以**繁體中文條列式**回報。

你**只負責審查**，不修改任何檔案。

（以下省略，完整內容見檔案本體）
```

> 正文（Markdown body）就是這個 Agent 的 System Prompt。撰寫重點見第 4 節。

---

# 4. 審查規則設計

System Prompt 的核心規則如下。

## 4.1 核心原則

- 只審查使用者指定的範圍。
- 先完整閱讀目標程式碼，必要時追蹤相依檔案，再下判斷。
- 只回報**有依據**的問題，並附上 `檔案:行號`。
- 不確定時標示為「需確認」，不當成確定結論。
- 一律使用繁體中文，程式碼／指令／API／產品名稱保留原文。

## 4.2 分類規則

強制分成兩大類，且不可合併：

| 類別 | 判斷標準 | 例子 |
|---|---|---|
| **需要改善** | 會造成實際危害或正確性問題，應優先處理 | 功能錯誤、安全漏洞、機密外洩、未處理例外、資源洩漏、競態條件、嚴重效能問題 |
| **建議改善** | 不影響正確性，但能讓程式碼更好 | 命名不清、重複程式碼、死碼、註解不足、微小優化、測試補充、風格一致性 |

判斷原則：

- 會導致**錯誤結果、安全風險或執行失敗** → 「需要改善」。
- 只是**風格、可讀性、維護性**上的提升 → 「建議改善」。
- 同一處若同時涉及兩者，拆成兩條各自歸類。

## 4.3 輸出格式

```markdown
## 審查範圍
- 審查的檔案／目錄／模組：...
- 審查面向：...

## 需要改善
- **`檔案:行號`** — 問題描述
  - 影響：...
  - 建議：...

## 建議改善
- **`檔案:行號`** — 問題描述
  - 建議：...

## 總結
- 需要改善：N 項
- 建議改善：M 項
- 整體風險與建議處理順序
```

規則：

- 兩類皆為條列式，每條以項目符號開頭。
- 每條附上 `檔案:行號`。
- 「需要改善」需說明「影響」與「建議」。
- 某類別無項目時寫「無」，不得硬湊問題。

---

# 5. 權限設計

```yaml
permissions:
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
  - action: subagent
    resource: "*"
    effect: deny
```

| 權限 | 效果 | 理由 |
|---|---|---|
| `edit` | deny | 審查員只能讀，不得修改、新增或刪除檔案 |
| `shell` | deny | 維持唯讀安全，不執行任何指令 |
| `subagent` | deny | 不再向下呼叫其他 Subagent，避免遞迴 |

仍可使用的工具：`read`、`glob`、`grep` 等唯讀探索工具。

> 注意：因為關閉了 `shell`，審查員**無法自行執行 `git diff`**。若要審查「本次變更」，請由主 Agent 先取得 diff，或直接指明要審查的檔案／目錄。

---

# 6. 模型選擇

## 6.1 為何指定免費模型

- 審查會讀取大量程式碼，token 消耗可觀。
- 指定免費模型可避免佔用主 Session 的付費模型額度。

## 6.2 目前設定

```yaml
model: opencode/space-bunny-free#high
```

選擇理由：

| 理由 | 說明 |
|---|---|
| 1.0M 脈絡 | 審查常需一次讀入多個檔案 |
| 零留存、不用於訓練 | 程式碼審查會送出原始碼，隱私較有保障 |
| 有 reasoning 變體 | `#high`／`#max` 提高推理強度 |
| 免費 | 不佔用付費額度 |

## 6.3 OpenCode Zen 免費模型清單

以下為 OpenCode Zen 目前提供的免費模型（**限時供應**，請以 `opencode models` 實際結果為準）：

| 模型 ID | 脈絡 | Reasoning 變體 | 隱私 | 備註 |
|---|---|---|---|---|
| `opencode/space-bunny-free` | 1.0M | `low`–`max` | ✅ 零留存 | 社群使用率高 |
| `opencode/muse-spark-1.3-contributor-free` | 1.0M | `minimal`–`xhigh` | ⚠️ 用於訓練 Meta 模型 | 品質高，**勿用於機密程式碼** |
| `opencode/longcat-2.5-preview-free` | — | 無 | ✅ 零留存 | 預覽版 |
| `opencode/mimo-v2.6-flash-free` | — | 無 | ⚠️ 可能用於改進模型 | 限時免費 |
| `opencode/nemotron-3.5-lightning-free` | — | 無 | — | 限時免費 |
| `opencode/ling-3.0-flash-fin-free` | — | 無 | — | 限時免費 |
| `opencode/big-pickle` | 200K | 無 | ⚠️ 可能用於改進模型 | 較舊的匿蹤模型 |

> 若要審查**機密 / 私有程式碼**，優先選「零留存」的模型（Space Bunny、LongCat）。

## 6.4 模型容錯（重要）

**OpenCode V2 沒有內建的自動 fallback 機制。**

- 一旦設定了 `model`，Subagent 就固定使用該模型。
- 若該模型不可用或達速率限制，Subagent 會直接回報錯誤，**不會**自動切換模型。
- 只有**不設定** `model` 時，Subagent 才會「沿用」主 Session 的模型（屬繼承，非失敗退回）。

可選的處理方式：

| 方式 | 做法 |
|---|---|
| 手動換模型 | 修改 `model:` 那一行 |
| 沿用主模型 | 刪除 `model:` 整行 |
| 自動 fallback | 安裝第三方外掛，例如 `opencode-rate-limit-fallback`（社群套件，非官方） |

---

# 7. 驗證 Agent 是否載入

## 7.1 列出所有 Agent

```bash
opencode debug agents
```

輸出中應可看到：

```json
{
  "id": "code-reviewer",
  "name": "code-reviewer",
  "model": {
    "id": "space-bunny-free",
    "providerID": "opencode",
    "variant": "high"
  },
  "mode": "subagent"
}
```

若 `model` 正確解析，代表模型設定有效。

## 7.2 查看可用模型

```bash
opencode models
```

用來確認免費模型的實際 ID 與可用狀態。

> 註：`opencode agents` 不是有效指令，請使用 `opencode debug agents`。

---

# 8. 使用方式

直接在對話中請主 Agent 呼叫：

```text
請用 code-reviewer subagent 審查 src/ 底下的程式碼。
```

```text
請用 code-reviewer subagent 審查 src/auth/session.ts。
```

```text
請用 code-reviewer subagent 審查 lib/ 整個目錄。
```

建議在指令中明確指出**檔案或目錄範圍**，因為審查員無法自行執行 `git diff`。

---

# 9. 實測範例

以一個刻意植入問題的範例檔測試，審查員正確輸出：

- 「需要改善」8 項：SQL Injection、硬編碼金鑰、off-by-one、`fs` 未 require、缺錯誤處理等。
- 「建議改善」6 項：死碼、缺 JSDoc、`SELECT *`、未指定 encoding 等。

輸出為繁體中文、條列式、附 `檔案:行號`，並在總結標註項數與優先處理順序，符合設計預期。

---

# 10. 常見問題排查

## 問題 1：找不到 `code-reviewer`

確認檔案路徑與檔名：

```text
.opencode/agents/code-reviewer.md
```

不是：

```text
.opencode/agent/code-reviewer.md
```

新專案建議使用複數 `agents`，且副檔名為 `.md`。

## 問題 2：Subagent 回報模型錯誤

原因可能是免費模型已下架或達速率限制。處理方式：

- 用 `opencode models` 確認模型仍存在。
- 修改 `model:` 為其他模型。
- 或刪除 `model:` 讓它沿用主 Session 模型。

## 問題 3：審查員無法執行 `git diff`

這是刻意設計（`shell` 已 deny）。請由主 Agent 取得變更清單，或直接指定要審查的檔案。

## 問題 4：輸出沒有分成兩類

確認 System Prompt 中「輸出格式」與「分類規則」段落是否完整；本 Agent 的正文即為 System Prompt。

---

# 11. 修改後是否需要重啟

V2 會自動重新載入 Agent 與 Command 檔案。修改 `code-reviewer.md` 儲存後通常即可生效；若 UI 未反映，可重新選擇 Agent 或重啟 TUI。

---

# 12. 官方文件

- OpenCode V2 Agents：<https://opencode.ai/v2/docs/agents>
- OpenCode V2 Models：<https://opencode.ai/v2/docs/models>
- OpenCode V2 Config：<https://opencode.ai/v2/docs/config>
- OpenCode Zen 模型與定價：<https://opencode.ai/docs/zen/>

> V2 行為若有變更，請以官方 V2 文件為準。
