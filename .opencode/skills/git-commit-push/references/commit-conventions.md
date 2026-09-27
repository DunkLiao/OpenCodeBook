# 提交訊息慣例

## 原則

- **一顆 commit 做一件事**：不要把無關的變更混在同一顆。
- **主旨說明「做了什麼」**，body 說明「為什麼」與取捨。
- 主旨 ≤ 72 字元，句尾不加句號。
- 先看 `git log --oneline -10`，跟隨專案既有風格與語言。

## 建議格式

```text
<type>(<scope>): <subject>

<why / 背景 / 取捨>
```

`type` 可在專案慣用時採用 Conventional Commits：

| type | 用途 |
| --- | --- |
| feat | 新增功能 |
| fix | 問題修正 |
| refactor | 重構（不改變行為） |
| docs | 文件 |
| test | 測試 |
| chore | 建置／設定／雜項 |
| style | 格式調整（不影響邏輯） |
| perf | 效能 |

`scope` 可省略。若專案沒有 Conventional Commits 慣例，用自然的單行主旨即可。

## 範例

繁體中文（本專案常見）：

```text
新增技術翻譯 Agent 與 /translate 指令
```

```text
新增 Python 環境管理指南 (uv)
```

```text
修正 push 被拒時未提示先 pull 的問題
```

英文 Conventional Commits：

```text
feat(skill): add git-commit-push skill
docs: explain V2 skill frontmatter fields
fix(cli): handle missing upstream branch
```

## 反例

```text
update
fix bug
修改
WIP
```

這些沒有提供足夠資訊，應避免。
