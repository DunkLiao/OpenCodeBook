---
name: Git Commit & Push
description: 檢查工作區變更、草擬提交訊息、做敏感資訊安全檢查後，執行 git commit 並 push 到遠端。當使用者要求「commit & push」、「提交所有變更」、「推送變更」、「git commit」或整理待提交內容時使用。
slash: true
---

# Git Commit & Push

把目前工作區的變更，**安全地**提交並推送到遠端。

## 使用時機

- 使用者說「git commit & push」、「提交所有變更」、「幫我 push」、「推送變更」。
- 完成一段工作後要保存進度到遠端。

若使用者只說「幫我提交」而沒有要 push，預設**只 commit、不 push**，除非使用者明確要求推送。

## 前置檢查（Pre-flight）

先確認環境，再動任何檔案：

```sh
git rev-parse --is-inside-work-tree
git branch --show-current
git status
```

- `rev-parse` 失敗 → **停止**，告知使用者此目錄不是 Git 倉庫。
- 在 detached HEAD（`branch --show-current` 為空）→ **停止**，先問使用者要建立新分支還是切回既有分支。
- 沒有設定 `user.name` / `user.email` → 回報，並詢問是否要設定。

## 檢視變更

```sh
git status --porcelain -uall
git diff --stat
git diff
git diff --cached --stat
```

先看清楚「改了什麼」，再決定提交訊息。

## 安全檢查（務必執行，在 `git add` 之前）

檢查是否混入不該提交的內容：

- **敏感檔名**：`.env`, `*.key`, `*.pem`, `credentials*`, `*secret*`, `id_rsa*`, `*.p12`
- **內容含金鑰**：`api_key`, `apikey`, `token`, `password`, `secret`, `sk-`, `AKIA`
- **產物／大型檔**：`node_modules/`, `dist/`, `build/`, `.venv/`, `*.log`, `*.zip`
- 確認 `.gitignore` 是否已忽略上述項目

Windows PowerShell 檢查：

```powershell
git status --porcelain -uall | Select-String -Pattern '\.env|\.key|\.pem|credential|secret|id_rsa'
```

macOS / Linux：

```sh
git status --porcelain -uall | grep -Ei '\.env|\.key|\.pem|credential|secret|id_rsa'
```

只要疑似敏感檔案或金鑰被追蹤 → **停止並回報**，不要 commit。必要時協助補上 `.gitignore`。

## 擬定提交訊息

1. 讀 `references/commit-conventions.md`。
2. 觀察既有風格：`git log --oneline -10`，保持一致。
3. 主旨單行、聚焦一件事；需要時用 body 說明「為什麼」。
4. 不要只寫 `update`、`fix`、`changes` 這類無資訊的訊息。
5. 語言跟隨專案既有 commit；若無慣例，跟隨使用者語言（本專案多為繁體中文，也接受英文）。

**先把草稿給使用者看**，除非使用者已明確授權直接提交。

## 提交

```sh
git add -A
git status --short
git commit -m "<subject>"
```

多行訊息：

```sh
git commit -m "<subject>" -m "<body>"
```

> 若使用者只要求提交特定檔案，改用 `git add <path> ...`，不要用 `git add -A`。

## 推送

```sh
git push
```

沒有 upstream 時：

```sh
git push -u origin <branch>
```

## 失敗處理

| 狀況 | 處理 |
| --- | --- |
| `nothing to commit` | 回報「無變更」，**不要**建立空 commit |
| push rejected（non-fast-forward） | 先 `git fetch`，向使用者說明；優先 `git pull --rebase`，**不要** `--force` |
| 沒有 remote | 詢問是否要 `git remote add origin <url>` |
| 認證失敗 | 回報並請使用者處理 credentials，**不要**自行保存金鑰或 token |
| commit hook 失敗 | 貼出錯誤，修正後重新 commit，不要用 `--no-verify` 規避 |

## 硬規則

- 未經使用者明確要求，**絕不**使用 `git push --force` / `--force-with-lease`。
- **絕不**提交敏感資訊或金鑰。
- **絕不**執行 `git reset --hard`、`git clean -fd` 或任何改寫歷史的操作。
- 不確定就停下來問，不要猜。
- Windows PowerShell 不支援 `&&`；指令請分開執行或改用 `;`。

## 回報

完成後輸出：

- commit hash 與提交訊息
- 目前分支與 push 結果（例如 `f6bba46..406f4ca  main -> main`）
- 被排除或已警告的檔案（若有）
