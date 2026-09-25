# OpenCode CLI 安裝、升級與 API Key 設定整理

本文件彙整前述關於 **OpenCode CLI** 的安裝、Scoop 版本切換、錯誤排除，以及 **OpenCode Go API Key** 修改方式。

---

## 1. 一開始出現 `opencode` 不是內部或外部命令

如果在 Windows CMD / PowerShell 輸入：

```cmd
opencode
```

出現：

```text
'opencode' 不是內部或外部命令、可執行的程式或批次檔。
```

代表當時系統找不到 `opencode` 指令，通常是尚未安裝，或執行檔未加入 PATH。

後來執行：

```cmd
scoop install opencode
```

看到：

```text
'opencode' (...) was installed successfully!
```

就代表 **OpenCode 已透過 Scoop 安裝成功**。

可用以下指令確認：

```cmd
opencode --version
```

或直接啟動：

```cmd
opencode
```

---

## 2. Scoop 提示 OpenCode v2 已推出

安裝 OpenCode v1 時，Scoop 可能會提示：

```text
OpenCode v2 is now available via Scoop as `versions/opencode2`.
Its configuration is incompatible with v1...
```

意思是：

- 目前安裝的是 **OpenCode v1**
- Scoop 另外提供 **OpenCode v2**
- v1 與 v2 的設定格式可能不相容
- 如果要改用 v2，建議先移除 v1 再安裝 v2

移除 v1：

```cmd
scoop uninstall opencode
```

---

## 3. 安裝 OpenCode v2

理論上可以透過 Scoop 的 `versions` bucket 安裝：

```cmd
scoop bucket add versions
scoop install versions/opencode2
```

安裝後確認：

```cmd
opencode --version
```

如果顯示 `2.x.x`，代表已切換到 v2。

---

## 4. `versions` bucket 加入失敗

若執行：

```cmd
scoop bucket add versions
```

出現類似：

```text
Checking repo... fatal: fetch-pack: invalid index-pack output
```

代表 Scoop 在從 Git repository 下載 `versions` bucket 時失敗。

之後如果再次執行：

```cmd
scoop bucket add versions
```

卻看到：

```text
The 'versions' bucket already exists
```

表示：

> `versions` bucket 的資料夾可能已建立，但內容並未完整下載。

因此再執行：

```cmd
scoop install versions/opencode2
```

可能會出現：

```text
Couldn't find manifest for 'opencode2' from 'versions' bucket.
```

---

## 5. 修復損壞或不完整的 `versions` bucket

先移除：

```cmd
scoop bucket rm versions
```

再重新加入：

```cmd
scoop bucket add versions
```

成功後可先搜尋：

```cmd
scoop search opencode2
```

若能看到：

```text
versions/opencode2
```

再安裝：

```cmd
scoop install versions/opencode2
```

最後確認：

```cmd
opencode --version
```

---

## 6. 如果 `versions` bucket 無法正常移除

如果：

```cmd
scoop bucket rm versions
```

之後重新加入仍出現：

```text
The 'versions' bucket already exists
```

可手動刪除殘留目錄。

在 CMD 執行：

```cmd
rmdir /s /q "%USERPROFILE%\scoop\buckets\versions"
```

然後重新執行：

```cmd
scoop bucket add versions
scoop search opencode2
scoop install versions/opencode2
```

---

## 7. 如果一直出現 `invalid index-pack output`

若：

```cmd
scoop bucket add versions
```

一直失敗並出現：

```text
fatal: fetch-pack: invalid index-pack output
```

問題通常比較偏向：

- Git 下載 repository 失敗
- GitHub 連線不穩定
- 公司網路 / Proxy / 防火牆限制
- 防毒軟體攔截
- Scoop bucket repository 不完整

這不一定是 OpenCode 本身的問題。

可以先確認 Git：

```cmd
git --version
```

以及 Scoop：

```cmd
scoop update
```

之後再重試加入 bucket。

---

# OpenCode Go API Key 修改

## 8. 在 OpenCode TUI 中重新設定 API Key

最直覺的方法是直接啟動 OpenCode：

```cmd
opencode
```

進入介面後輸入：

```text
/connect
```

接著：

1. 選擇對應的 Provider / OpenCode Go
2. 輸入或貼上新的 API Key
3. 儲存
4. 再使用 `/models` 確認模型是否可正常使用

```text
/models
```

這種方式通常比直接手動修改 credential JSON 更安全。

---

## 9. 用 CLI 查看目前登入狀態

可先執行：

```cmd
opencode auth list
```

用來查看目前有哪些 Provider 已完成認證。

新版 OpenCode CLI 通常也提供：

```cmd
opencode auth login
```

以及：

```cmd
opencode auth logout
```

如果要完全替換舊 API Key，做法通常是：

```cmd
opencode auth list
```

找到目前 Provider 後，先登出，再重新登入。

例如概念上：

```cmd
opencode auth logout <provider>
opencode auth login <provider>
```

實際 Provider 名稱請以：

```cmd
opencode auth list
```

顯示的內容為準。

---

## 10. Credential 儲存位置

OpenCode 的登入資訊通常會存放在使用者資料目錄中的 OpenCode credential / auth 設定檔。

常見路徑形式：

```text
~/.local/share/opencode/auth.json
```

Windows 上實際位置可能依 OpenCode 版本、安裝方式與環境而不同。

建議優先使用：

```text
/connect
```

或：

```cmd
opencode auth login
```

來更新 API Key，而不是直接手動修改 JSON。

---

# 建議操作順序

如果你的目標是：

> 安裝 OpenCode v2，並重新設定 OpenCode Go API Key

建議依序執行。

### Step 1：確認版本

```cmd
opencode --version
```

### Step 2：如果仍是 v1，先移除

```cmd
scoop uninstall opencode
```

### Step 3：修復 `versions` bucket

```cmd
scoop bucket rm versions
scoop bucket add versions
```

### Step 4：搜尋 OpenCode v2

```cmd
scoop search opencode2
```

### Step 5：安裝 v2

```cmd
scoop install versions/opencode2
```

### Step 6：確認版本

```cmd
opencode --version
```

### Step 7：查看認證狀態

```cmd
opencode auth list
```

### Step 8：啟動 OpenCode

```cmd
opencode
```

### Step 9：重新連接 API Provider

在 OpenCode 中：

```text
/connect
```

輸入新的 API Key。

### Step 10：確認模型

```text
/models
```

---

# 常用指令速查

| 用途 | 指令 |
|---|---|
| 啟動 OpenCode | `opencode` |
| 查看版本 | `opencode --version` |
| 安裝 v1 | `scoop install opencode` |
| 移除 v1 | `scoop uninstall opencode` |
| 加入 versions bucket | `scoop bucket add versions` |
| 移除 versions bucket | `scoop bucket rm versions` |
| 搜尋 v2 | `scoop search opencode2` |
| 安裝 v2 | `scoop install versions/opencode2` |
| 查看認證 | `opencode auth list` |
| 登入 Provider | `opencode auth login` |
| 登出 Provider | `opencode auth logout` |
| OpenCode 內設定 Provider | `/connect` |
| OpenCode 內選模型 | `/models` |

---

## 最後提醒

如果安裝 v2 時遇到：

```text
Couldn't find manifest for 'opencode2'
```

先處理 `versions` bucket，而不是一直重複安裝。

如果遇到：

```text
fatal: fetch-pack: invalid index-pack output
```

則應優先檢查 Git / GitHub / Proxy / 防火牆 / 公司網路環境。

如果只是要換 OpenCode Go API Key，通常不需要重裝 OpenCode；直接：

```cmd
opencode
```

然後：

```text
/connect
```

重新設定即可。
