# 旗標科技《AI Harness 駕輕就熟：OpenCode 讓 Vibe Coding 更自由》服務專區 Modify by Dunk

本書讀者的專屬服務專區，收錄書中各章的**實作指令與提示詞整理**，以及可直接取用的 **OpenCode 設定範例、Agent、Command、Skill、Plugin** 與延伸教材。

不論你是剛安裝好 OpenCode 的新手，或想進一步打造自己的 AI 工作系統（Harness），都可以在此找到對應的範例與素材。

---

## 目錄

- [各章範例（ch01–ch09）](#各章範例ch01ch09)
- [延伸教材（my_practice/）](#延伸教材my_practice)
- [可重用設定（.opencode/）](#可重用設定opencode)
- [範例資料（test/）](#範例資料test)
- [快速開始](#快速開始)
- [安全提醒](#安全提醒)
- [官方資源](#官方資源)

---

## 各章範例（ch01–ch09）

每個 `chXX.md` 對應書中一章，整理該章讀者需實際輸入的指令與提示詞，方便複製貼上與對照操作。

| 章節 | 主題 | 檔案 |
| --- | --- | --- |
| 第 1 章 | 認識與安裝 OpenCode：跨平台安裝、開設第一個專案 | [`ch01.md`](ch01.md) |
| 第 2 章 | 實作 PDF 加浮水印工具：AGENTS.md、`/init`、Claude Code 相容、權限切換 | [`ch02.md`](ch02.md) |
| 第 3 章 | 操作全攻略與 Claude Code 無痛切換：斜線指令、接手既有專案、跨 Agent 架構 | [`ch03.md`](ch03.md) |
| 第 4 章 | Agent + Subagent：建立角色分工、並行作業與程式碼審查員 | [`ch04.md`](ch04.md) |
| 第 5 章 | 用 MCP 與 Skills 生出超能力：Browser／Playwright MCP、playwright-cli 與自建 Skill | [`ch05.md`](ch05.md) |
| 第 6 章 | 設定檔與權限：`opencode.json` 結構、權限管理、快捷鍵（`tui.json`）與 Plugin | [`ch06.md`](ch06.md) |
| 第 7 章 | AI 模型選擇與平價方案：Provider 生態、計費方式、把模型接入 OpenCode | [`ch07.md`](ch07.md) |
| 第 8 章 | Harness 思維：從使用者到駕馭者、六層控制力與五種反模式 | [`ch08.md`](ch08.md) |
| 第 9 章 | 實戰案例：打造 WorkDash 浮動工作資訊欄（PRD → 實作 → 完善） | [`ch09.md`](ch09.md) |

---

## 延伸教材（my_practice/）

書中主題的補充教材與實作筆記，依主題分類如下。

### 安裝與 API Key 安全

| 文件 | 說明 |
| --- | --- |
| [`基本環境安裝.md`](my_practice/基本環境安裝.md) | 終端機與基礎開發環境的安裝整理 |
| [`OpenCode_CLI_安裝升級與_API_Key_設定指南.md`](my_practice/OpenCode_CLI_安裝升級與_API_Key_設定指南.md) | OpenCode CLI 安裝、升級與 API Key 設定 |
| [`OpenCode_Git_API_Key_Security_Guide.md`](my_practice/OpenCode_Git_API_Key_Security_Guide.md) | 避免 API Key 等機密資訊進入 Git 的安全實務 |

### OpenCode 設定

| 文件 | 說明 |
| --- | --- |
| [`OpenCode_V2_opencode.jsonc_設定完整參考.md`](my_practice/opencode設定/OpenCode_V2_opencode.jsonc_設定完整參考.md) | `opencode.jsonc` 設定項目完整參考 |
| [`OpenCode_V2_Config_Migration_Guide.md`](my_practice/opencode設定/OpenCode_V2_Config_Migration_Guide.md) | V1 → V2 設定檔遷移指南 |
| [`OpenCode_V2_Plugin_詳細設定指南.md`](my_practice/opencode設定/OpenCode_V2_Plugin_詳細設定指南.md) | V2 Plugin 設定與開發說明 |
| [`OpenCode_V2_OpenPets_設定修正指南.md`](my_practice/opencode設定/OpenCode_V2_OpenPets_設定修正指南.md) | OpenPets 桌寵整合設定修正 |

### Agent 與 Command

| 文件 | 說明 |
| --- | --- |
| [`OpenCode-V2-Agent-Command-Setup-Guide.md`](my_practice/OpenCode-V2-Agent-Command-Setup-Guide.md) | V2 Agent 與自訂 Command 設定指南 |
| [`OpenCode-V2-Code-Reviewer-Agent-Guide.md`](my_practice/OpenCode-V2-Code-Reviewer-Agent-Guide.md) | 建立程式碼審查 Subagent 的完整說明 |
| [`AGENTS_MD_From_CLAUDE_MD_Prompt.md`](my_practice/AGENTS_MD_From_CLAUDE_MD_Prompt.md) | 將 `CLAUDE.md` 轉換為跨 Agent 的 `AGENTS.md` 提示詞 |

### AGENTS.md 專案規範

| 文件 | 說明 |
| --- | --- |
| [`跨 AI Coding Agent 專案：AGENTS.md 應保留哪些資訊.md`](my_practice/跨%20AI%20Coding%20Agent%20專案：AGENTS.md%20應保留哪些資訊.md) | 跨工具共用 `AGENTS.md` 的內容取捨 |
| [`AGENTS設定/AGENTS.md - Agent 行為規範與協同指引.md`](my_practice/AGENTS設定/AGENTS.md%20-%20Agent%20行為規範與協同指引.md) | Agent 行為規範與協同作業範例 |
| [`AGENTS設定/TEMPLATE_AGENTS.md`](my_practice/AGENTS設定/TEMPLATE_AGENTS.md) | 可直接套用的 `AGENTS.md` 範本 |

### Harness 思維

| 文件 | 說明 |
| --- | --- |
| [`Harness/AI_Harness_組成與實務架構.md`](my_practice/Harness/AI_Harness_組成與實務架構.md) | Harness 的組成要素與實務架構 |
| [`Harness/Harness_五種反模式.md`](my_practice/Harness/Harness_五種反模式.md) | 五種常見反模式與修正方式 |
| [`Harness/駕馭者檢核表 (The Driver's Checklist for AI Agents).md`](my_practice/Harness/駕馭者檢核表%20%28The%20Driver%27s%20Checklist%20for%20AI%20Agents%29.md) | 交派任務前的檢核清單 |

### MCP 整合

| 文件 | 說明 |
| --- | --- |
| [`chrome devtools mcp/OpenCode_v2_Chrome_DevTools_MCP_Setup_Guide.md`](my_practice/chrome%20devtools%20mcp/OpenCode_v2_Chrome_DevTools_MCP_Setup_Guide.md) | Chrome DevTools MCP 設定指南 |
| [`Playwright mcp/OpenCode_V2_MCP_Global_Setup_Guide.md`](my_practice/Playwright%20mcp/OpenCode_V2_MCP_Global_Setup_Guide.md) | MCP 全域設定指南 |
| [`Playwright mcp/OpenCode_V2_MCP_Timeout_Fix.md`](my_practice/Playwright%20mcp/OpenCode_V2_MCP_Timeout_Fix.md) | MCP 逾時問題排查與修正 |
| [`Playwright mcp/note.md`](my_practice/Playwright%20mcp/note.md) | Playwright MCP 實作筆記 |

### Telegram 通知 Plugin

| 文件 | 說明 |
| --- | --- |
| [`Telegram/Telegram_Bot_設定與測試.md`](my_practice/Telegram/telegram_bot_setup_and_test.md) | Telegram Bot 建立與測試 |
| [`Telegram/OpenCode_V2_Telegram_通知_Plugin_完整實作指南.md`](my_practice/Telegram/OpenCode_V2_Telegram_通知_Plugin_完整實作指南.md) | 通知 Plugin 完整實作步驟 |
| [`Telegram/OpenCode_V2_Telegram_通知_Plugin_修正與異動說明.md`](my_practice/Telegram/OpenCode_V2_Telegram_通知_Plugin_修正與異動說明.md) | 完成／錯誤事件觸發問題的修正說明 |
| [`Telegram/opencode_v2_telegram_plugin_prompt.md`](my_practice/Telegram/opencode_v2_telegram_plugin_prompt.md) | 產生 Plugin 的提示詞範本 |

### 模型選擇與資料政策

| 文件 | 說明 |
| --- | --- |
| [`模型選擇/AI_Coding_Model_Selection_Guide.md`](my_practice/模型選擇/AI_Coding_Model_Selection_Guide.md) | Coding 模型選擇指南 |
| [`模型選擇/BAA_DPA_企業資料與AI接入保密及資料處理協議完整說明.md`](my_practice/模型選擇/BAA_DPA_企業資料與AI接入保密及資料處理協議完整說明.md) | 企業資料保密與資料處理協議說明 |
| [`模型選擇/note.md`](my_practice/模型選擇/note.md) | 模型選擇筆記 |

### 提示詞模板與 Python 專案

| 文件 | 說明 |
| --- | --- |
| [`AI_Coding_Project_Analysis_Prompt.md`](my_practice/AI_Coding_Project_Analysis_Prompt.md) | 專案分析提示詞模板 |
| [`AI_Coding_PRD_Regression_Verification_Prompt.md`](my_practice/AI_Coding_PRD_Regression_Verification_Prompt.md) | 依 PRD 進行回歸驗證的提示詞模板 |
| [`python/AGENTS.md`](my_practice/python/AGENTS.md) | Python 專案（uv 環境）的 `AGENTS.md` 範例 |

---

## 可重用設定（.opencode/）

把書中示範的 Agent、Command、Skill 與 Plugin 直接放進專案，即可在 OpenCode 中使用。

### Subagent（`.opencode/agents/`）

| Agent | 用途 |
| --- | --- |
| [`code-reviewer.md`](.opencode/agents/code-reviewer.md) | 程式碼審查員，以繁體中文分「需要改善／建議改善」條列回報，無編輯與執行權限 |
| [`technical-translator.md`](.opencode/agents/technical-translator.md) | 將英文技術文件翻成自然、精確的繁體中文，保留程式碼與技術術語原文 |

### 自訂指令（`.opencode/commands/`）

| Command | 用途 |
| --- | --- |
| [`git-commit-summarize.md`](.opencode/commands/git-commit-summarize.md) | `/git-commit-summarize N` 總結最近 N 次提交 |
| [`python-env-init.md`](.opencode/commands/python-env-init.md) | 以 uv 初始化 Python 專案並產生 `AGENTS.md`／`CLAUDE.md` |
| [`translate.md`](.opencode/commands/translate.md) | `/translate <來源> [輸出]` 呼叫 translator Subagent 翻譯技術文件 |

### Skills（`.opencode/skills/`）

| Skill | 用途 |
| --- | --- |
| [`git-commit-push`](.opencode/skills/git-commit-push/SKILL.md) | 檢查變更、草擬訊息、機密安全檢查後 commit 並 push |
| [`playwright-test`](.opencode/skills/playwright-test/SKILL.md) | 以 playwright-cli 對臺灣房價地圖網站進行端到端回歸測試 |

### Plugin（`.opencode/plugins/`）

| Plugin | 用途 |
| --- | --- |
| [`telegram-notify`](.opencode/plugins/telegram-notify/README.md) | 以 OpenCode V2 Plugin API 在任務閒置、等待確認或發生錯誤時發送 Telegram 通知 |

---

## 範例資料（test/）

| 檔案 | 說明 |
| --- | --- |
| `sales_data.csv` | 供 Browser MCP 章節練習填入表單／試算表的範例資料 |
| `technical-translation-test.txt` | 技術翻譯 Subagent 的英文測試原文 |
| `technical-translation-test.zh-TW.txt` | 上述原文的繁體中文翻譯結果 |

---

## 快速開始

1. 依 [`ch01.md`](ch01.md) 安裝並更新 OpenCode。
2. 需要 OpenCode 設定範例時，參考 [`my_practice/opencode設定/`](my_practice/opencode設定)。
3. 想直接取用書中的 Agent、Command 或 Skill，將 `.opencode/` 內的檔案複製到你的專案即可。
4. 各章操作請對照對應的 `chXX.md` 逐項執行。

範例專案與外部素材連結（節錄）：

- 範例 PDF（個人資料保護法）：<http://bit.ly/4twbHPN>
- Claude Code 專案：<https://github.com/FlagTech/ClaudeProjectDemo>
- 臺灣房價地圖範例：<https://github.com/FlagTech/test_buyhouse/tree/update_data>

---

## 安全提醒

- **請勿提交任何機密資訊**：Bot Token、API Key、`.env` 等一律不可進版控。
- 本專案的 [`.gitignore`](.gitignore) 已預設忽略 `.env*`、`node_modules/`、`__pycache__/` 等；僅保留 `*.example` 範例檔。
- 範例中的 Token、API Key 均為示意值，使用前請替換為你自己的設定。

---

## 官方資源

- OpenCode 官方網站：<https://opencode.ai/>
- OpenCode 文件（繁中）：<https://opencode.ai/docs/zh-tw/>
- OpenCode 設定文件：<https://opencode.ai/docs/zh-tw/config/>
- OpenCode Plugin 文件：<https://opencode.ai/docs/zh-tw/plugins/>
- 模型能力查詢：<https://models.dev/>

---

本專案為書籍讀者服務專區，內容版權屬原作者與旗標科技所有，Modify by Dunk。
