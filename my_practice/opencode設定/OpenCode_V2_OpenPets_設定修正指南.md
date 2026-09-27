# OpenCode V2 + OpenPets 設定修正指南

> 適用情境：OpenCode V2 使用 OpenPets 時出現 Server Plugin error  
> 錯誤套件：`@open-pets/opencode@4.0.0`  
> 更新日期：2026-09-27

---

## 1. 問題現象

OpenCode 啟動時出現：

```text
Server plugin error
Plugin: @open-pets/opencode@4.0.0
Status: failed
Runtime: server
Source: @open-pets/opencode@4.0.0
Error: Plugin must export a default definition with an id and an effect or setup function.
Reference: err_e2f0c33f
```

這表示 OpenCode 已經成功找到並嘗試載入：

```text
@open-pets/opencode@4.0.0
```

但該 Plugin 的 export 格式不符合目前 OpenCode V2 Server Plugin loader 的要求。

V2 期待的 Plugin 形式概念上類似：

```ts
import { Plugin } from "@opencode/plugin"

export default Plugin.define({
  id: "example",

  async setup(ctx) {
    // plugin logic
  },
})
```

也就是至少需要：

```text
default export
+
id
+
setup 或 effect
```

因此目前這個錯誤不是 API Key、Node.js、路徑或 MCP command 本身造成，而是 Plugin contract 不相容。

---

## 2. 原始設定的三個問題

原本設定：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "mcp": {
    "timeout": {
      "startup": 60000
    },
    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": [
          "npx",
          "-y",
          "chrome-devtools-mcp@1.10.1"
        ],
        "disabled": true
      },
      "playwright": {
        "type": "local",
        "command": [
          "npx",
          "-y",
          "@playwright/mcp@0.0.82"
        ],
        "disabled": true
      },
      "deepwiki": {
        "type": "remote",
        "url": "https://mcp.deepwiki.com/mcp",
        "disabled": true
      }
    },
    "openpets": {
      "type": "local",
      "command": [
        "node",
        "D:\\Programs\\openpets\\resources\\app.asar.unpacked\\node_modules\\@open-pets\\cli\\dist\\index.js",
        "mcp"
      ],
      "enabled": true
    }
  },

  "instructions": [
    "C:\\Users\\user\\.config\\opencode\\openpets.md"
  ],

  "plugin": [
    "@open-pets/opencode@4.0.0"
  ]
}
```

主要有三個問題。

---

## 3. 問題一：`plugin` 應改為 `plugins`

OpenCode V2 使用：

```jsonc
"plugins": []
```

而不是：

```jsonc
"plugin": []
```

也就是：

```text
V1 / 舊格式
plugin

V2
plugins
```

不過即使改成：

```jsonc
"plugins": [
  "@open-pets/opencode@4.0.0"
]
```

目前 `@open-pets/opencode@4.0.0` 仍可能因為 Plugin export contract 不相容而載入失敗。

因此目前建議：

```text
先暫時不要載入 @open-pets/opencode@4.0.0
```

只保留 OpenPets MCP。

---

# 4. 問題二：OpenPets MCP 放錯層級

原本：

```jsonc
"mcp": {
  "servers": {
    "chrome-devtools": {},
    "playwright": {},
    "deepwiki": {}
  },

  "openpets": {
    ...
  }
}
```

這樣的：

```text
mcp.openpets
```

層級不正確。

OpenPets 應該和其他 MCP Server 一樣，放進：

```text
mcp.servers
```

正確結構：

```jsonc
"mcp": {
  "servers": {
    "chrome-devtools": {},
    "playwright": {},
    "deepwiki": {},
    "openpets": {}
  }
}
```

所以：

```text
錯：
mcp.openpets

對：
mcp.servers.openpets
```

---

# 5. 問題三：`enabled: true` 改成 `disabled: false`

原本：

```jsonc
"openpets": {
  "enabled": true
}
```

V2 MCP 建議使用：

```jsonc
"disabled": false
```

實際上 Server 預設就是啟用，因此也可以直接省略 `disabled`。

例如：

```jsonc
"openpets": {
  "type": "local",
  "command": [
    "node",
    "..."
  ]
}
```

即可。

為了讓設定意圖更明確，本文件使用：

```jsonc
"disabled": false
```

---

# 6. 建議的修正版 `opencode.jsonc`

目前最穩定的策略是：

```text
OpenPets MCP
→ 保留

OpenPets instructions
→ 保留

@open-pets/opencode@4.0.0
→ 暫時移除
```

建議修改成：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "mcp": {
    "timeout": {
      "startup": 60000
    },

    "servers": {
      "chrome-devtools": {
        "type": "local",
        "command": [
          "npx",
          "-y",
          "chrome-devtools-mcp@1.10.1"
        ],
        "disabled": true
      },

      "playwright": {
        "type": "local",
        "command": [
          "npx",
          "-y",
          "@playwright/mcp@0.0.82"
        ],
        "disabled": true
      },

      "deepwiki": {
        "type": "remote",
        "url": "https://mcp.deepwiki.com/mcp",
        "disabled": true
      },

      "openpets": {
        "type": "local",
        "command": [
          "node",
          "D:\\Programs\\openpets\\resources\\app.asar.unpacked\\node_modules\\@open-pets\\cli\\dist\\index.js",
          "mcp"
        ],
        "disabled": false
      }
    }
  },

  "instructions": [
    "C:\\Users\\user\\.config\\opencode\\openpets.md"
  ]
}
```

---

# 7. 修改後的架構

設定完成後：

```text
OpenCode V2
│
├─ MCP
│  │
│  ├─ chrome-devtools
│  │   └─ disabled
│  │
│  ├─ playwright
│  │   └─ disabled
│  │
│  ├─ deepwiki
│  │   └─ disabled
│  │
│  └─ openpets
│      └─ enabled
│
├─ Instructions
│  └─ openpets.md
│
└─ Plugins
   └─ OpenPets Plugin 暫時不載入
```

---

# 8. 修改後驗證方式

完成 `opencode.jsonc` 修改後，先完全關閉再重新啟動 OpenCode。

接著執行：

```powershell
opencode mcp list
```

預期應該看到類似：

```text
chrome-devtools   disabled
playwright        disabled
deepwiki          disabled
openpets          connected
```

重點是：

```text
openpets
→ connected
```

---

# 9. 如果 OpenPets MCP 還是連不上

可以直接單獨執行 OpenPets MCP command：

```powershell
node "D:\Programs\openpets\resources\app.asar.unpacked\node_modules\@open-pets\cli\dist\index.js" mcp
```

這可以協助區分問題來源。

如果這條指令直接執行就失敗：

```text
OpenPets CLI / MCP 本身問題
```

如果這條指令能正常啟動，但：

```powershell
opencode mcp list
```

仍然顯示連線失敗：

```text
OpenCode MCP 設定或環境問題
```

---

# 10. OpenPets 自己的診斷

也可以執行：

```powershell
npx @open-pets/cli doctor
```

用來檢查 OpenPets integration 狀態。

---

# 11. 目前不要做的事情

不建議直接修改：

```text
~/.cache/opencode/node_modules/@open-pets/opencode/
```

或 Windows 對應的 OpenCode cache package。

原因：

```text
1. cache 重建後修改會消失
2. Plugin update 後會被覆蓋
3. 無法真正解決 V2 Plugin contract 不相容問題
```

正確作法應該是：

```text
等待 OpenPets Plugin 相容 OpenCode V2
```

或自行 fork / port Plugin 到 V2 API。

---

# 12. 如果之後 OpenPets Plugin 更新相容 V2

未來如果 OpenPets 已修正 V2 Plugin export，可以重新加入：

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  "plugins": [
    "@open-pets/opencode@4.0.0"
  ]
}
```

注意：

```text
一定是 plugins
```

不是：

```text
plugin
```

若有新版，例如：

```text
@open-pets/opencode@4.1.0
```

可改為：

```jsonc
{
  "plugins": [
    "@open-pets/opencode@4.1.0"
  ]
}
```

或透過 CLI：

```powershell
opencode plugin add @open-pets/opencode@4.1.0
```

---

# 13. 最終建議設定策略

目前：

```text
Chrome DevTools MCP
→ 保留
→ disabled: true

Playwright MCP
→ 保留
→ disabled: true

DeepWiki MCP
→ 保留
→ disabled: true

OpenPets MCP
→ 移進 mcp.servers
→ disabled: false

OpenPets instructions
→ 保留

@open-pets/opencode@4.0.0 Plugin
→ 暫時移除
```

推薦架構：

```text
OpenCode V2
│
├─ MCP
│  ├─ Chrome DevTools
│  ├─ Playwright
│  ├─ DeepWiki
│  └─ OpenPets
│
├─ Global Instructions
│  └─ openpets.md
│
└─ Plugins
   └─ 等待 OpenPets V2-compatible Plugin
```

---

# 14. 最重要的三個修正

## 修正 1

```text
plugin
↓
plugins
```

但目前 OpenPets Plugin 先移除。

---

## 修正 2

```text
mcp.openpets
```

改成：

```text
mcp.servers.openpets
```

---

## 修正 3

```text
enabled: true
```

改成：

```text
disabled: false
```

或直接省略。

---

# 15. 建議驗證順序

依序執行：

```powershell
opencode mcp list
```

↓

確認：

```text
openpets connected
```

↓

若失敗：

```powershell
node "D:\Programs\openpets\resources\app.asar.unpacked\node_modules\@open-pets\cli\dist\index.js" mcp
```

↓

再執行：

```powershell
npx @open-pets/cli doctor
```

這樣可以逐層確認：

```text
OpenPets CLI
↓
OpenPets MCP
↓
OpenCode MCP
↓
OpenCode Runtime
```

---

## 結論

目前最穩定的設定不是強行讓：

```text
@open-pets/opencode@4.0.0
```

在 OpenCode V2 Server Runtime 中執行，而是：

```text
保留 OpenPets MCP
+
保留 openpets.md
+
暫時移除 OpenPets Server Plugin
```

等 OpenPets Plugin 更新成符合 OpenCode V2：

```text
default export
+
id
+
setup / effect
```

的 Plugin contract 後，再重新加入 `plugins` 即可。
