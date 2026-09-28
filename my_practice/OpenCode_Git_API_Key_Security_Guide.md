# OpenCode / Git API 金鑰安全管理實務指南

## 1. 核心原則

避免 API 金鑰被提交到 Git，最重要的原則是：

> **Git Repository 只保存「變數引用」與範例設定，真正的 API Key、Token、Password、Secret 必須放在 Git 不追蹤的位置。**

建議將設定拆成三層：

```text
程式碼 / 設定檔
        │
        ├── opencode.jsonc
        ├── source code
        └── .env.example
                │
                ▼
        只引用環境變數名稱
                │
                ▼
        .env / OS Environment / Secret File
                │
                ▼
            真正的金鑰
```

---

# 2. 建議專案結構

```text
my-project/
│
├─ opencode.jsonc
├─ AGENTS.md
├─ .env
├─ .env.example
├─ .gitignore
│
├─ .opencode/
│   ├─ agents/
│   ├─ commands/
│   ├─ plugins/
│   └─ skills/
│
└─ src/
```

其中建議提交 Git：

```text
opencode.jsonc
AGENTS.md
.env.example
.gitignore
.opencode/
src/
```

不應提交：

```text
.env
.env.local
.env.production
*.key
*.pem
*.secret
secrets/
.secrets/
```

---

# 3. `.gitignore` 建議設定

建議在專案根目錄建立：

```text
.gitignore
```

內容：

```gitignore
# ==============================
# Environment / Secrets
# ==============================

.env
.env.*
!.env.example

# ==============================
# Secret files
# ==============================

*.key
*.pem
*.secret

secrets/
.secrets/

# ==============================
# OpenCode local/private config
# ==============================

opencode.local.json
opencode.local.jsonc
```

其中：

```gitignore
.env.*
```

會忽略：

```text
.env
.env.local
.env.production
.env.development
```

但：

```gitignore
!.env.example
```

會允許：

```text
.env.example
```

提交到 Git。

---

# 4. `.env` 保存真正金鑰

例如：

```env
OPENAI_API_KEY=your-real-key
ANTHROPIC_API_KEY=your-real-key
OPENROUTER_API_KEY=your-real-key

TELEGRAM_BOT_TOKEN=your-real-token
TELEGRAM_CHAT_ID=your-real-chat-id
```

`.env` 必須列入 `.gitignore`。

不要將 `.env` commit 到 Git。

---

# 5. `.env.example` 提供變數名稱

`.env.example` 可以提交 Git。

例如：

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

其他開發者取得專案後，可以執行：

Windows CMD：

```cmd
copy .env.example .env
```

PowerShell：

```powershell
Copy-Item .env.example .env
```

然後自行填入真正的 Secret。

---

# 6. OpenCode `opencode.jsonc` 不要寫死 API Key

## 錯誤方式

不要：

```jsonc
{
  "provider": {
    "openrouter": {
      "options": {
        "apiKey": "sk-or-v1-xxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

如果 `opencode.jsonc` 被提交 Git，API Key 就會一起進入 repository。

---

# 7. OpenCode 使用環境變數

OpenCode 設定可使用：

```text
{env:VARIABLE_NAME}
```

例如：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "provider": {
    "openai": {
      "options": {
        "apiKey": "{env:OPENAI_API_KEY}"
      }
    },

    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    },

    "openrouter": {
      "options": {
        "apiKey": "{env:OPENROUTER_API_KEY}"
      }
    }
  }
}
```

這樣 `opencode.jsonc` 本身沒有真正的 API Key，因此可以提交 Git。

架構：

```text
Git Repository
      │
      └── opencode.jsonc
              │
              └── {env:OPENROUTER_API_KEY}
                         │
                         ▼
                OS Environment Variable
                         │
                         ▼
                   真正 API Key
```

---

# 8. Windows 使用者環境變數

如果希望 API Key 完全離開專案資料夾，可以直接存到 Windows User Environment。

PowerShell：

```powershell
[Environment]::SetEnvironmentVariable(
  "OPENROUTER_API_KEY",
  "你的API金鑰",
  "User"
)
```

例如：

```powershell
[Environment]::SetEnvironmentVariable(
  "ANTHROPIC_API_KEY",
  "你的API金鑰",
  "User"
)
```

設定完成後，重新開啟：

```text
PowerShell
CMD
Windows Terminal
VS Code
OpenCode
```

檢查：

```powershell
$env:OPENROUTER_API_KEY
```

OpenCode：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "provider": {
    "openrouter": {
      "options": {
        "apiKey": "{env:OPENROUTER_API_KEY}"
      }
    }
  }
}
```

這是個人開發環境很適合的方式。

---

# 9. 使用 OpenCode `{file:...}` 保存 Secret

另一種做法是將 API Key 放在專案之外的秘密檔案。

例如：

```text
C:\Users\<USERNAME>\.secrets\
```

內容：

```text
.secrets/
├─ openai-key
├─ anthropic-key
└─ openrouter-key
```

例如：

```text
openrouter-key
```

檔案內容：

```text
sk-or-v1-xxxxxxxxxxxxxxxx
```

OpenCode：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "provider": {
    "openrouter": {
      "options": {
        "apiKey": "{file:~/.secrets/openrouter-key}"
      }
    }
  }
}
```

優點：

```text
Project Repository
        │
        └── 不存在真正的 Secret

User Home
        │
        └── .secrets/
                └── API Key
```

即使 repository 公開，也不會包含金鑰。

---

# 10. Global Config 與 Project Config 分離

OpenCode 建議可以把：

```text
Provider
API Key reference
常用模型
Global MCP
```

放在 Global Config。

而專案層只保存：

```text
Agent
Instructions
Command
Skill
Project MCP
專案模型設定
```

概念：

```text
Global OpenCode Config
│
├─ Provider
├─ API Key reference
├─ Global MCP
└─ Common configuration

Project
│
├─ opencode.jsonc
├─ AGENTS.md
└─ .opencode/
```

例如 Global Config：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "provider": {
    "openrouter": {
      "options": {
        "apiKey": "{env:OPENROUTER_API_KEY}"
      }
    },

    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

專案：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "model": "openrouter/anthropic/claude-sonnet-4.5",

  "instructions": [
    "AGENTS.md"
  ]
}
```

這樣專案 Repository 不需要保存真正的 Provider Credential。

---

# 11. MCP Token 也不要寫死

## 錯誤

```jsonc
{
  "mcp": {
    "my-api": {
      "type": "remote",
      "url": "https://example.com/mcp",
      "headers": {
        "Authorization": "Bearer sk-xxxxxxxx"
      }
    }
  }
}
```

如果設定檔進 Git，Authorization Token 也會洩漏。

## 正確

```jsonc
{
  "mcp": {
    "my-api": {
      "type": "remote",
      "url": "https://example.com/mcp",
      "headers": {
        "Authorization": "Bearer {env:MY_MCP_API_KEY}"
      }
    }
  }
}
```

或者：

```jsonc
{
  "mcp": {
    "my-api": {
      "type": "remote",
      "url": "https://example.com/mcp",
      "headers": {
        "Authorization": "Bearer {file:~/.secrets/my-mcp-key}"
      }
    }
  }
}
```

---

# 12. Telegram Plugin 實務

如果 OpenCode Plugin 需要：

```text
Telegram Bot Token
Telegram Chat ID
```

不要寫在 TypeScript：

```ts
const botToken = "123456789:ABCDEF...";
```

應改成：

```ts
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!botToken) {
  throw new Error("TELEGRAM_BOT_TOKEN is not configured");
}

if (!chatId) {
  throw new Error("TELEGRAM_CHAT_ID is not configured");
}
```

`.env`：

```env
TELEGRAM_BOT_TOKEN=your-real-token
TELEGRAM_CHAT_ID=your-real-chat-id
```

`.env.example`：

```env
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

`.gitignore`：

```gitignore
.env
.env.*
!.env.example
```

---

# 13. `.gitignore` 不會自動移除已追蹤的檔案

這是非常常見的錯誤。

假設先執行：

```bash
git add .env
git commit
```

之後才新增：

```gitignore
.env
```

Git 還是會繼續追蹤 `.env`。

必須執行：

```bash
git rm --cached .env
```

然後：

```bash
git commit -m "Stop tracking .env"
```

確認：

```bash
git status
```

---

# 14. API Key 已經 Commit 時怎麼辦？

如果 Secret 已經進入 commit history：

```text
不要只刪除檔案
```

因為 Git 歷史紀錄中可能仍然存在 Secret。

建議順序：

```text
API Key 被 Commit
        │
        ▼
立即 Revoke 舊 Key
        │
        ▼
重新建立新的 Key
        │
        ▼
改用 env / secret file
        │
        ▼
停止 Git Tracking
        │
        ▼
必要時清理 Git History
```

最重要的是：

> **先撤銷舊 Key，再處理 Git。**

因為已經曝光的 Secret 應視為已洩漏。

---

# 15. 提交前檢查

## 查看 Git 狀態

```bash
git status
```

## 查看即將 Commit 的內容

```bash
git diff --cached
```

這一步非常重要。

可以在：

```bash
git commit
```

之前確認是否有：

```text
API Key
Token
Password
Secret
Credential
```

---

# 16. 搜尋 repository 是否出現 Secret

例如：

```bash
git grep -n "sk-"
```

PowerShell：

```powershell
git grep -n -E "API_KEY|TOKEN|SECRET|PASSWORD"
```

也可以搜尋：

```powershell
git grep -n -E "Bearer|Authorization"
```

這些檢查只能作為輔助，不應取代專門的 Secret Scanner。

---

# 17. 推薦的 OpenCode 專案標準

```text
project/
│
├─ opencode.jsonc
├─ AGENTS.md
├─ .env.example
├─ .gitignore
│
├─ .env                 # Git ignored
│
├─ .opencode/
│   ├─ agents/
│   ├─ commands/
│   ├─ plugins/
│   └─ skills/
│
└─ src/
```

推薦 `opencode.jsonc`：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "provider": {
    "openrouter": {
      "options": {
        "apiKey": "{env:OPENROUTER_API_KEY}"
      }
    },

    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  },

  "model": "openrouter/anthropic/claude-sonnet-4.5",

  "instructions": [
    "AGENTS.md"
  ]
}
```

推薦 `.gitignore`：

```gitignore
# Environment
.env
.env.*
!.env.example

# Secrets
*.key
*.pem
*.secret

secrets/
.secrets/

# Local configuration
opencode.local.json
opencode.local.jsonc
```

推薦 `.env.example`：

```env
OPENROUTER_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

---

# 18. 建議安全等級

## 基礎

```text
.env
+
.gitignore
```

適合一般個人專案。

## 推薦

```text
Windows User Environment
+
{env:VARIABLE_NAME}
```

適合 OpenCode 個人開發環境。

## 更嚴格

```text
~/.secrets/
+
{file:path}
```

Secret 完全離開 Repository。

## 團隊 / CI/CD

建議使用：

```text
GitHub Actions Secrets
GitLab CI/CD Variables
Azure Key Vault
AWS Secrets Manager
HashiCorp Vault
1Password Secrets Automation
```

不要把正式環境 Credential 放在 Repository。

---

# 19. 最重要的檢查清單

提交 Git 前確認：

- [ ] `.env` 已加入 `.gitignore`
- [ ] `.env.example` 不包含真正 Secret
- [ ] `opencode.jsonc` 沒有直接寫 API Key
- [ ] Provider 使用 `{env:...}` 或 `{file:...}`
- [ ] MCP Authorization 沒有硬編碼
- [ ] Telegram Bot Token 沒有寫在 TypeScript
- [ ] 執行過 `git status`
- [ ] 執行過 `git diff --cached`
- [ ] 搜尋過 `API_KEY`、`TOKEN`、`SECRET`
- [ ] 已 Commit 過的 Secret 已 revoke
- [ ] 舊 Secret 不再使用

---

# 20. 最佳實務總結

推薦的 OpenCode + Git Secret 管理方式：

```text
Repository
│
├─ opencode.jsonc
│      └── {env:OPENROUTER_API_KEY}
│
├─ .env.example
├─ .gitignore
├─ AGENTS.md
└─ .opencode/

Windows / User Environment
│
├─ OPENROUTER_API_KEY
├─ ANTHROPIC_API_KEY
└─ OPENAI_API_KEY

或

~/.secrets/
│
├─ openrouter-key
├─ anthropic-key
└─ openai-key
```

一句話總結：

> **設定檔可以進 Git，Secret 永遠不要進 Git。**

對 OpenCode、MCP、Plugin、Telegram Bot、AI Provider 等開發都應遵循同一個原則。
