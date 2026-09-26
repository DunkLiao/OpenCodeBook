# AI Coding 專案分析通用提示詞

請先完整閱讀並分析目前專案，在完成分析前，**不要修改、建立、刪除、重新命名或格式化任何檔案，也不要執行可能改變專案狀態的指令**。

目前階段僅進行 **Read-Only Project Analysis（唯讀專案分析）**。

請優先閱讀專案根目錄與重要子目錄中的文件與設定，包括但不限於：

- `README.md`
- `AGENTS.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `package.json`
- `pyproject.toml`
- `requirements.txt`
- `Cargo.toml`
- `go.mod`
- `Dockerfile`
- `docker-compose.yml`
- `.env.example`
- CI/CD 設定
- lint / formatter / build / test 設定
- `docs/`、`src/`、`app/`、`scripts/`、`config/` 等主要目錄

如果上述檔案不存在，請依實際專案結構判斷應閱讀的文件。

請整理並回答以下內容：

## 1. 專案用途
說明：
- 這個專案主要解決什麼問題
- 主要使用者或使用情境
- 專案目前的核心目標
- 如果可以判斷，說明目前屬於 prototype、MVP、正式產品、內部工具或其他階段

## 2. 技術架構與技術棧
整理目前實際使用的技術，包括：

- 程式語言
- Framework / Library
- 前端技術
- 後端技術
- Database / Storage
- API / 第三方服務
- Build Tool
- Package Manager
- Testing Framework
- Lint / Formatter
- Deployment / Hosting
- CI/CD
- Container / Docker
- 其他重要工具

請以專案中的實際設定檔為依據，不要只根據檔名或程式碼片段猜測。

## 3. 已具備的功能
整理目前已經實作的主要功能。

請盡量區分：

- 核心功能
- 輔助功能
- 管理功能
- API
- UI / 頁面
- 資料處理
- 匯入 / 匯出
- Authentication / Authorization
- Logging / Monitoring
- Error Handling
- 尚未完成或疑似開發中的功能

如果功能是否完成無法確認，請標示：
**「需進一步確認」**

不要把 TODO、註解或規劃中的內容直接視為已完成功能。

## 4. 專案結構與主要檔案
先簡要整理專案目錄結構，再說明主要檔案或目錄的責任。

建議格式：

| 路徑 | 用途 | 重要程度 |
|---|---|---|
| `src/...` | ... | 高 |
| `config/...` | ... | 中 |

只列出對理解專案架構真正重要的檔案，不需要逐一解釋所有檔案。

另外請指出：
- Application Entry Point
- 主要設定檔
- 核心 Business Logic
- API / Route
- UI Component
- Data Model
- Utility / Helper
- Test
- Build / Deployment 設定

## 5. 專案中的開發規則
搜尋並整理專案內已經記錄的 Coding / Development Rules，例如：

- Coding Style
- 命名規則
- 資料夾結構規則
- Git / Commit 規則
- Testing 規則
- API 規範
- Error Handling 規範
- Security 規範
- AI Coding Agent 指示
- 禁止事項
- 修改程式碼前後需要執行的檢查

特別檢查：

- `AGENTS.md`
- `CLAUDE.md`
- `.github/`
- `.cursor/`
- `.windsurf/`
- `.rules`
- `.instructions`
- `CONTRIBUTING.md`
- README 中的開發說明

請指出每一項規則來自哪個檔案。

如果不同文件的規則互相衝突，也請標示。

## 6. 繼續開發前應先閱讀的文件
請依照優先順序列出。

### P0 — 必讀
開始修改程式碼前一定要閱讀。

### P1 — 建議閱讀
開發特定功能前應閱讀。

### P2 — 參考
需要時再查看。

每份文件請說明：
- 路徑
- 為什麼需要閱讀
- 主要包含什麼資訊

## 7. 開發前風險提醒
另外請指出目前專案中你觀察到的：

- 架構風險
- 技術債
- 缺少文件的地方
- 缺少測試的地方
- 設定或環境依賴風險
- Security 風險
- 容易被 AI Coding Agent 誤改的區域

這一部分只做分析，**不要進行修正**。

## 8. 最後提供「新 AI Agent 快速上手摘要」
最後請整理一份簡短摘要，讓下一個 AI Coding Agent 可以在幾分鐘內了解：

- 專案是做什麼的
- 技術棧
- 核心架構
- 最重要的 5 個檔案
- 修改程式碼前必須遵守的規則
- 建議第一個閱讀的檔案

---

## 分析原則

請遵守以下規則：

1. **目前只讀，不修改任何檔案。**
2. 不要自行重構、修復、格式化或最佳化程式碼。
3. 不要安裝套件。
4. 不要更新 dependency。
5. 不要修改 lock file。
6. 不要執行 migration。
7. 不要執行會寫入資料庫或檔案系統的程式。
8. 可以執行安全的唯讀指令，例如：
   - 查看檔案
   - 搜尋文字
   - 查看目錄
   - 查看 Git 狀態
   - 查看 Git log
9. 所有結論應盡量指出依據的檔案或程式碼位置。
10. 如果無法從目前專案確認，請明確寫：
    **「目前無法從專案內容確認」**
    不要自行猜測。

請先完成整個專案的分析，再輸出完整報告。
