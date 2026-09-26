# 建立 / 更新 AGENTS.md 的通用提示詞

請先閱讀專案根目錄中的 `CLAUDE.md`，並檢查目前是否已存在 `AGENTS.md`。

你的任務是：

> 將 `CLAUDE.md` 中 **適用於所有 AI Coding Agent** 的專案說明、開發規則與操作方式，整理到專案根目錄的 `AGENTS.md`，讓 Claude Code、Codex、OpenCode、Gemini CLI、GitHub Copilot Agent、Cursor 等不同 Coding Agent 都能理解並遵守。

---

## 一、執行限制

請嚴格遵守以下規則：

1. **不要修改任何程式碼。**
2. 不要修改 application source code、test code、設定檔或 dependency。
3. 不要安裝或更新任何套件。
4. 不要修改 lock file。
5. 不要執行 migration。
6. 不要執行會修改資料庫、檔案或專案狀態的指令。
7. 除 `AGENTS.md` 外，**不要修改任何其他檔案**。
8. 不要刪除、重新命名或移動 `CLAUDE.md`。
9. 不要改變原有規則的語意。
10. 不要自行新增專案不存在的開發規範。

本任務的目的只是：

**整理 Coding Agent 共通規則，而不是重新設計專案規範。**

---

## 二、先分析 CLAUDE.md

請先完整閱讀 `CLAUDE.md`，並將內容區分為以下兩類。

### A. 通用 Coding Agent 規則

適合移至或同步到 `AGENTS.md` 的內容，例如：

- 專案用途與背景
- 技術架構
- 技術棧
- 專案目錄結構
- Application Entry Point
- Build / Run / Dev 指令
- Testing 指令
- Lint / Format 指令
- Coding Style
- 命名規則
- API 開發規則
- 資料夾與模組設計規則
- Error Handling 規範
- Security 規範
- Git / Commit 規範
- 修改程式碼時必須遵守的流程
- 修改前必須閱讀的文件
- 禁止修改的區域
- 必須執行的驗證或測試
- 專案已知限制
- 架構上的重要注意事項

這些內容原則上應整理到 `AGENTS.md`。

### B. Claude 專屬內容

如果內容只與 Claude Code 或 Claude 模型本身有關，應保留在 `CLAUDE.md`，不要強行搬到 `AGENTS.md`。

例如：

- Claude Code 專屬指令
- Claude-specific tool 使用方式
- Claude 特定 prompt 行為
- Claude 模型相關限制
- Claude 專用 workflow
- 只對 Claude 有效的 context / memory 指示

如果不確定某項規則是否屬於 Claude 專屬規則，請優先保留在 `CLAUDE.md`，不要自行泛化。

---

## 三、處理既有 AGENTS.md

如果專案根目錄已經存在 `AGENTS.md`：

1. 先完整閱讀既有 `AGENTS.md`。
2. **不要直接覆蓋。**
3. 保留其中仍然有效、且沒有與 `CLAUDE.md` 衝突的內容。
4. 將 `CLAUDE.md` 中缺少的通用規則補充進去。
5. 移除明顯重複內容。
6. 不要因為重新整理格式而改變規則原意。

如果兩份文件存在衝突：

- 不要自行決定哪個規則正確。
- 優先保留既有內容。
- 在完成報告中列出衝突位置。
- 標記為 **「需要人工確認」**。

如果目前不存在 `AGENTS.md`，則建立新的專案根目錄 `AGENTS.md`。

---

## 四、AGENTS.md 建議結構

請依實際專案內容調整，不需要為了符合模板而建立沒有內容的章節。

建議結構如下：

```markdown
# AGENTS.md

## Project Overview
專案用途、主要目標、使用情境。

## Tech Stack
主要程式語言、Framework、Database、Build Tool、Package Manager 等。

## Project Structure
重要目錄與主要檔案的用途。

## Development Setup
開發環境需求與初始化方式。

## Run Commands
啟動、Build、Dev Server 等指令。

## Testing
測試方式與測試指令。

## Linting and Formatting
Lint、Format、Type Check 等規則與指令。

## Development Rules
專案共通 Coding Rules。

## Architecture Rules
模組、資料流、API、Component、Service 等架構規則。

## Security Rules
Security、Secret、Credential、Environment Variable 等相關規範。

## Modification Guidelines
修改程式碼時應遵守的流程。

## Files to Read First
開發前應優先閱讀的文件。

## Do Not
明確禁止事項。
```

如果 `CLAUDE.md` 本身已有清楚且合理的結構，應優先沿用原有邏輯，不需要硬套上述模板。

---

## 五、內容整理原則

建立或更新 `AGENTS.md` 時：

### 必須做到

- 保留原始規則的實際意思。
- 使用清楚、簡潔、Agent 容易理解的描述。
- 指令、路徑、檔名、環境變數名稱需保留原文。
- Shell command 請使用 code block。
- 重要禁止事項應明確標示。
- 對 Coding Agent 有直接影響的規則應優先呈現。

### 不要做

不要：

- 自行推測不存在的架構。
- 自行發明 Coding Style。
- 自行增加 dependency。
- 自行修改 Build / Test 指令。
- 把建議寫成強制規則。
- 把 TODO 當成正式規範。
- 把 Claude 專屬規則錯誤泛化成所有 Agent 的規則。
- 為了讓文件「看起來完整」而補寫沒有依據的內容。

如果某項資訊無法確認，請不要猜測。

---

## 六、完成後進行驗證

完成 `AGENTS.md` 後，請重新比對：

- `CLAUDE.md`
- `AGENTS.md`

確認：

1. 所有適用於通用 Coding Agent 的重要規則都已涵蓋。
2. 沒有改變原有規則的意思。
3. 沒有遺漏重要禁止事項。
4. 沒有把 Claude 專屬規則錯誤搬入 `AGENTS.md`。
5. 沒有產生互相矛盾的規則。
6. 指令、檔案路徑與技術名稱沒有被誤改。
7. 除 `AGENTS.md` 外沒有修改其他檔案。

---

## 七、完成後輸出報告

完成後請提供簡短報告。

### 1. AGENTS.md 更新內容

說明：

- 新增了哪些主要章節
- 從 `CLAUDE.md` 整理了哪些通用規則
- 是否保留既有 `AGENTS.md` 的內容

### 2. Claude 專屬內容

列出哪些內容仍保留在 `CLAUDE.md`，沒有同步到 `AGENTS.md`，以及原因。

### 3. 規則衝突

如果發現：

- `CLAUDE.md` 與 `AGENTS.md` 規則不一致
- 規則本身互相矛盾
- 指令可能已過期

請列出：

- 文件位置
- 衝突內容
- 建議人工確認的事項

**不要自行修改有疑義的規則。**

### 4. 最後說明兩份文件的責任

請明確說明：

#### `AGENTS.md`

應負責：

**跨 AI Coding Agent 共用的專案知識與開發規範。**

例如：

- Project Overview
- Tech Stack
- Project Structure
- Build / Run / Test
- Coding Rules
- Architecture Rules
- Security Rules
- Modification Guidelines
- Agent 共通禁止事項

#### `CLAUDE.md`

應負責：

**Claude Code 專屬的補充指示。**

例如：

- Claude-specific workflow
- Claude Code tools
- Claude 專屬操作習慣
- Claude 模型特定要求

原則上：

> `AGENTS.md` = 所有 Coding Agent 的共同基準  
> `CLAUDE.md` = Claude Code 在共同基準之上的額外指示

若某項規則適用於所有 Coding Agent，應優先放在 `AGENTS.md`，避免只存在於 `CLAUDE.md`。
