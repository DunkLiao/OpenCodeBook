# BAA / DPA 保密與資料處理協議完整說明

> 適用情境：企業內部系統、AI / SaaS / Cloud 導入、AI Coding、客戶資料、個人資料、金融與醫療等受管制資料  
> 版本日期：2026-09-28  
> 本文件為一般資訊整理，不構成法律意見；正式導入仍應由公司法務、法遵、資安與資料治理單位確認。

---

## 1. 先講結論：為什麼公司資料不能直接丟給外部 AI？

當企業把公司內部資料、程式碼、客戶資料或個人資料傳送給外部服務，例如：

- ChatGPT / OpenAI API
- Claude / Claude Code
- Gemini / Gemini API
- GitHub Copilot
- OpenCode 所串接的模型供應商
- Microsoft 365 Copilot
- SaaS 系統
- 雲端平台
- 外部 API
- 第三方資料分析平台

實際上已經不是單純的「使用一個工具」，而是可能形成：

> **企業 → 外部服務商 → 模型供應商 → 雲端基礎設施 → 次處理商（Subprocessor）**

的資料處理鏈。

此時企業必須先確認：

1. 資料會送到哪裡？
2. 誰可以存取？
3. 是否會被保存？
4. 保存多久？
5. 是否會拿去訓練模型？
6. 是否會用於產品改善？
7. 是否會交給其他次處理商？
8. 資料是否跨境？
9. 能否要求刪除？
10. 發生外洩誰負責？
11. 廠商多久內必須通知？
12. 公司能否取得稽核、資安與合規證據？

這些問題不能只靠廠商網站上的「我們很重視安全」來回答，通常必須透過合約建立具有約束力的責任。

因此企業常要求先完成：

- NDA
- DPA
- BAA（特定美國醫療情境）
- 資訊安全附約
- 雲端服務契約
- 委外契約
- 風險評估
- 資安審查
- 個資影響評估
- 第三方供應商審查

之後才能正式接入公司資料。

---

# 2. NDA、DPA、BAA 到底有什麼不同？

## 2.1 NDA：Non-Disclosure Agreement

中文通常稱：

> **保密協議 / 保密契約**

NDA 的核心是：

> **「你知道了我的秘密之後，不可以未經授權洩漏出去。」**

常見保護範圍包括：

- 商業機密
- 專案文件
- 系統架構
- 原始碼
- 產品 Roadmap
- 內部營運資料
- 報價
- 客戶名單
- 財務資料
- 未公開策略

### NDA 解決的主要問題

是：

> 「你能不能把秘密告訴別人？」

但 NDA 通常沒有完整規範：

- 資料如何處理
- 資料保存多久
- 是否可以建立備份
- 是否可以交給 Subprocessor
- 是否可以拿去訓練 AI
- 是否能跨境
- 如何刪除
- 如何處理資料主體權利
- 個資外洩如何通報

所以：

> **NDA ≠ DPA**

企業導入 AI / SaaS 時，只有 NDA 往往不夠。

---

## 2.2 DPA：Data Processing Agreement

中文常翻譯為：

- 資料處理協議
- 個人資料處理協議
- 資料處理附約

DPA 的核心問題是：

> **「你拿到我的資料後，到底可以怎麼處理？」**

在 GDPR 等資料保護制度下，當 Controller 把個人資料交給 Processor 處理時，通常必須透過契約規範處理關係。

GDPR Article 28 明確要求，受託處理應受到契約或其他具法律拘束力文件規範，並應涵蓋資料處理目的、期間、資料種類、資料主體類型及雙方責任等。

### DPA 常規範

- 處理目的
- 處理資料類型
- 處理期限
- Controller / Processor 角色
- 僅能依客戶指示處理
- 保密義務
- 技術及組織安全措施
- Subprocessor 管理
- 跨境資料傳輸
- 資料刪除 / 返還
- 資安事故通知
- 稽核權
- 資料主體權利協助
- 法規遵循責任

---

# 3. BAA：Business Associate Agreement

BAA 主要出現在：

> **美國 HIPAA 醫療資料環境**

BAA 並不是一般企業都必須簽的文件。

在 HIPAA 架構下，如果 Covered Entity，例如：

- 醫院
- 醫療機構
- Health Plan
- 特定 Health Care Provider

把 Protected Health Information（PHI）交由第三方處理，而該第三方屬於 Business Associate，就通常需要建立符合 HIPAA 要求的 Business Associate Agreement。

美國 HHS 說明，Covered Entity 在允許 Business Associate 處理 PHI 前，必須透過契約或其他書面安排取得其妥善保護資訊的保證。

### BAA 通常規範

- PHI 可以如何使用
- PHI 可以如何揭露
- 不得超出授權用途
- 電子 PHI 的安全措施
- 資安事件通報
- Data Breach 通報
- Subcontractor 管理
- 合約終止後 PHI 的返還或銷毀
- 配合 HIPAA 稽核
- 違約時終止契約

因此可以簡單記：

| 文件 | 核心問題 |
|---|---|
| NDA | 不能把秘密說出去 |
| DPA | 拿到資料後可以怎麼處理 |
| BAA | 美國 HIPAA 醫療 PHI 如何委外處理 |

---

# 4. 為什麼「公司內部專案」也可能不能直接接 AI？

很多人以為：

> 「只要不是客戶個資，就可以丟 AI。」

這是不正確的。

公司資料可能包含：

### 4.1 商業機密

例如：

- 未公開程式碼
- 資料庫 Schema
- API 規格
- 系統拓樸
- 資安架構
- 內部帳務邏輯
- 風控模型
- 定價模型
- 客戶分群模型

即使完全沒有姓名、電話、身分證字號，也可能屬於：

> **Confidential Information / Trade Secret**

---

## 4.2 系統安全資訊

例如：

```text
DB_HOST=
DB_USER=
API_KEY=
TOKEN=
JWT_SECRET=
AWS_SECRET_ACCESS_KEY=
```

這類資料可能直接導致資安事件。

因此：

> Secret / Token / Password 原則上不應直接傳給模型。

---

## 4.3 個人資料

例如：

```text
姓名
電話
Email
身分證
生日
地址
IP
Device ID
帳號
客戶編號
```

即使某些欄位單獨看起來不足以識別個人，和其他資訊組合後仍可能構成可識別資料。

---

## 4.4 敏感或高風險資料

例如金融業常見：

- 帳號
- 交易紀錄
- 信用資料
- 授信資訊
- 資產負債
- 徵信資料
- 客戶風險評級
- 信用模型資料
- KYC 資料
- AML 資料
- 卡號
- 薪資

醫療則包括：

- 病歷
- 診斷
- 藥物
- 檢驗結果
- 醫療影像

這些通常會被列為更高敏感度。

---

# 5. 「接入 AI」到底發生什麼事情？

假設工程師把：

```text
customer.csv
```

傳到 AI Coding Agent，要求：

> 「幫我找出程式錯誤。」

表面看起來只是 AI Coding。

實際資料鏈可能是：

```text
使用者電腦
   ↓
AI Coding Tool
   ↓
API Gateway
   ↓
AI Model Provider
   ↓
Cloud Infrastructure
   ↓
Logging / Monitoring
   ↓
Backup
   ↓
Subprocessor
```

因此真正要問的是：

> 資料在整條供應鏈中去了哪裡？

---

# 6. DPA 裡最重要的 10 類條款

## 6.1 Purpose Limitation

限制資料只能：

> 為指定服務目的使用。

例如：

```text
僅得為提供 AI 程式碼分析服務使用。
```

不能變成：

```text
拿去做廣告
拿去分析客戶
拿去訓練其他模型
拿去改善其他產品
```

---

## 6.2 No Training / No Secondary Use

AI 導入特別重要。

企業通常會確認：

```text
Customer Data is not used to train models.
```

但要注意：

> 「不拿來訓練模型」不等於「完全不保存」。

資料仍可能存在：

- Abuse monitoring logs
- Security logs
- Debug logs
- Backup
- Cache

因此還要看 Retention Policy。

---

# 7. Data Retention：資料保存多久？

例如：

| 服務模式 | 可能政策 |
|---|---|
| Consumer AI | 可能保存對話 |
| Enterprise AI | 可能限制保存 |
| API | 可能保存安全紀錄 |
| Zero Data Retention | 原則上不保留內容 |

企業應確認：

```text
Prompt 保存多久？
Output 保存多久？
File 保存多久？
Log 保存多久？
Backup 保存多久？
```

不要只看：

> Conversation History = Off

因為：

> 關閉歷史紀錄 ≠ Zero Data Retention。

---

# 8. Zero Data Retention（ZDR）

ZDR 是企業 AI 導入非常重要的概念。

通常代表：

> 服務商不持久保存 API 輸入與輸出內容。

但實際適用範圍仍需看服務條款。

可能存在例外：

- 法律要求
- Abuse Monitoring
- Security Investigation
- 特定 API 功能
- Files
- Batch
- Fine-tuning
- Cache

因此不能只看到：

> Zero Retention

四個字就認定所有資料都完全不落地。

---

# 9. Subprocessor 為什麼重要？

假設公司跟：

```text
AI Vendor A
```

簽約。

但 Vendor A 背後可能使用：

```text
Vendor A
 ├─ AWS
 ├─ Azure
 ├─ Cloudflare
 ├─ Datadog
 ├─ Stripe
 └─ Model Provider
```

這些可能都是：

> **Subprocessor**

企業需要知道：

- 有哪些 Subprocessor
- 它們在哪個國家
- 處理什麼資料
- 新增 Subprocessor 是否通知
- 公司能否提出異議

GDPR Article 28 也對 Processor 使用其他 Processor 設有書面授權要求。

---

# 10. Data Residency / Data Location

另一個重要問題：

> 資料到底存在哪一國？

例如：

```text
Taiwan
Singapore
Japan
US
EU
```

Data Residency 會影響：

- 跨境傳輸
- 法律適用
- 監管要求
- 政府存取風險
- 企業政策

因此金融、政府、醫療通常特別關心：

> Region Selection / Data Residency

---

# 11. Data Breach Notification

DPA 通常會規範：

> 發生資料外洩多久內通知客戶？

例如契約可能約定：

```text
Without undue delay
```

或：

```text
24 hours
48 hours
72 hours
```

此外通常還要說明：

- 事故發生時間
- 受影響資料
- 受影響人數
- 初步原因
- 已採取措施
- 後續改善

---

# 12. Audit Rights

企業不能完全只相信供應商口頭承諾。

所以常要求：

- SOC 2 Type II
- ISO/IEC 27001
- ISO/IEC 27701
- Penetration Test
- Security Whitepaper
- Audit Report
- Compliance Report

某些契約也會給客戶一定程度的 Audit Right。

值得注意的是：HIPAA 本身並非在所有情況下直接要求 CSP 必須允許客戶稽核，但客戶可以透過 BAA、SLA 或其他契約另行要求相關證據或保障。

---

# 13. Technical and Organizational Measures（TOMs）

DPA 常附：

> Technical and Organizational Measures

常見項目：

### 身分與權限

- MFA
- RBAC
- SSO
- Least Privilege
- Privileged Access Management

### 加密

- TLS
- Encryption at Rest
- Key Management
- KMS
- HSM

### 系統安全

- Vulnerability Management
- Patch Management
- EDR
- SIEM
- IDS / IPS

### 開發安全

- Secure SDLC
- Code Review
- SAST
- DAST
- Dependency Scanning

### 組織措施

- Security Training
- Background Check
- Incident Response
- Business Continuity
- Disaster Recovery

---

# 14. AI 導入特別要問的問題

傳統 SaaS 問：

> 資料安全嗎？

AI 系統還要多問：

### AI Data Governance

```text
Prompt 是否保存？
Prompt 是否訓練？
Output 是否保存？
上傳檔案是否保存？
Embedding 是否保存？
Vector DB 在哪？
Conversation Memory 是否保存？
Agent Log 是否保存？
```

### AI Model Governance

```text
使用哪個模型？
模型供應商是誰？
會不會自動切換模型？
模型 Routing 是否會送到其他供應商？
```

這對：

- OpenRouter
- AI Gateway
- Multi-model Router
- AI Coding Platform

尤其重要。

---

# 15. AI Coding 的特殊風險

AI Coding 看似只有程式碼，但實際可能取得：

```text
Repository
README
.env
Config
Database schema
SQL
API spec
Architecture
Logs
Test data
Production sample
Git history
```

因此 AI Coding Tool 很可能接觸大量公司機密。

尤其 Agent 型 Coding 工具可能具備：

```text
File Read
File Write
Terminal
Git
Browser
MCP
Database
API
```

這時就不只是：

> AI Chat

而比較像：

> **具有系統操作權限的外部智慧代理。**

所以企業通常需要額外審查：

- Agent Permission
- Sandbox
- MCP Permission
- Terminal Permission
- File Scope
- Network Access
- Secret Management

---

# 16. 為什麼免費版 AI 通常比較容易被公司禁止？

不代表免費版一定不安全。

真正問題是：

> 公司通常無法取得足夠的治理能力。

例如企業版可能提供：

```text
SSO
SCIM
Admin Console
Audit Log
RBAC
DPA
Enterprise Agreement
No Training
Retention Control
Data Residency
```

個人版可能沒有完整提供。

所以公司可能允許：

```text
Enterprise AI
```

但禁止：

```text
Personal AI Account
```

即使兩者背後使用同一個模型。

---

# 17. 金融業為什麼特別嚴格？

銀行、證券、保險等金融機構通常同時面臨：

```text
個資保護
客戶資料保密
資訊安全
委外管理
雲端管理
第三方風險
資安事件管理
營運持續
稽核要求
監理要求
```

因此導入 AI 時通常不會只是 IT 決定。

可能需要：

```text
使用單位
↓
IT
↓
資訊安全
↓
法遵
↓
法務
↓
個資 / Privacy
↓
採購
↓
第三方風險管理
↓
核准
```

最後才允許正式上線。

---

# 18. 一個實際案例

假設某銀行想使用 AI：

```text
Claude / GPT / Gemini
```

分析：

```text
客戶交易異常資料
```

如果直接上傳，可能存在：

```text
客戶資料
↓
AI Vendor
↓
Cloud
↓
Model
↓
Logging
↓
Subprocessor
```

因此銀行至少要確認：

### Legal

```text
DPA
NDA
委外契約
責任限制
Applicable Law
```

### Privacy

```text
Purpose
Retention
Deletion
Cross-border transfer
Subprocessor
```

### Security

```text
Encryption
IAM
MFA
Logging
Incident Response
```

### AI

```text
No Training
Model Provider
Prompt Retention
Model Routing
```

全部確認後才可能核准。

---

# 19. 資料分類與 AI 使用權限

企業可以建立類似：

| Level | 資料 | AI |
|---|---|---|
| L1 | Public | 可使用 |
| L2 | Internal | 核准工具 |
| L3 | Confidential | Enterprise AI |
| L4 | Restricted | 原則禁止外傳 |

例如：

### L1 Public

```text
公開新聞
官方文件
公開程式碼
```

→ 可以使用一般 AI。

### L2 Internal

```text
一般內部文件
內部流程
```

→ 僅允許公司核准 AI。

### L3 Confidential

```text
程式碼
架構
客戶分析
```

→ Enterprise AI + DPA。

### L4 Restricted

```text
密碼
Private Key
卡號
高敏感資料
```

→ 原則上不得送外部 AI。

---

# 20. 公司導入 AI 的理想流程

推薦採：

```text
Step 1
資料分類

↓

Step 2
AI Use Case 評估

↓

Step 3
Vendor Risk Assessment

↓

Step 4
Security Review

↓

Step 5
Privacy Review

↓

Step 6
DPA / NDA / Contract

↓

Step 7
Architecture Review

↓

Step 8
Pilot

↓

Step 9
正式上線

↓

Step 10
持續監控
```

---

# 21. Vendor Security Review Checklist

企業選擇 AI 供應商時，可以使用以下清單。

## Contract

- [ ] NDA
- [ ] DPA
- [ ] SLA
- [ ] Liability
- [ ] Breach Notification
- [ ] Data Deletion

## Data

- [ ] Data Retention
- [ ] Zero Data Retention
- [ ] Data Residency
- [ ] Cross-border Transfer
- [ ] Backup Policy

## AI

- [ ] No Training
- [ ] Prompt Retention
- [ ] Output Retention
- [ ] Model Provider
- [ ] Model Routing

## Security

- [ ] SOC 2
- [ ] ISO 27001
- [ ] Encryption
- [ ] MFA
- [ ] RBAC
- [ ] Audit Log

## Subprocessor

- [ ] Subprocessor List
- [ ] Subprocessor Notification
- [ ] Location
- [ ] Security Responsibility

---

# 22. 如果只是 POC，也需要嗎？

很多企業常見錯誤是：

> 「只是 POC，所以先拿真實資料測試。」

但 POC 一樣可能造成資料外洩。

比較安全的做法：

```text
Synthetic Data
```

或：

```text
Masked Data
```

或：

```text
Anonymized Data
```

例如：

原始：

```text
王小明
A123456789
0912345678
```

測試：

```text
USER001
TEST_ID_001
0900000001
```

這樣可降低 POC 風險。

---

# 23. De-identification / Masking

AI 專案中非常推薦：

```text
Raw Data
↓
Masking
↓
Tokenization
↓
AI
```

例如：

```text
王小明 → CUSTOMER_001
A123456789 → ID_001
0912345678 → PHONE_001
```

AI 可以分析：

```text
CUSTOMER_001 最近交易異常。
```

但模型不知道實際身份。

---

# 24. NDA、DPA、BAA 的關係圖

```text
                 Enterprise Data
                       │
                       ▼
                ┌────────────┐
                │    NDA     │
                │ 保護機密資訊 │
                └─────┬──────┘
                      │
                      ▼
                ┌────────────┐
                │    DPA     │
                │ 規範資料處理 │
                └─────┬──────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
   General Data                HIPAA PHI
                                    │
                                    ▼
                               ┌────────┐
                               │  BAA   │
                               └────────┘
```

---

# 25. 最簡單的記憶方法

### NDA

> **不能說出去。**

### DPA

> **拿到資料後只能按照規則處理。**

### BAA

> **HIPAA 醫療 PHI 的特定委外保護契約。**

---

# 26. 為什麼一定要「簽完才能接」？

因為在簽之前：

```text
企業
↓
資料傳給 Vendor
```

企業可能沒有足夠法律依據控制：

```text
Vendor 可以保存多久
Vendor 可以怎麼使用
Vendor 能否轉交
Vendor 是否拿去訓練
Vendor 如何刪除
發生事故的責任
```

簽署 DPA / BAA 等合約之後：

```text
Business Requirement
        +
Legal Obligation
        +
Security Control
```

才形成比較完整的治理架構。

---

# 27. 對 AI 專案而言，最重要的一句話

企業評估 AI 時，不應只問：

> **「這個模型有多強？」**

更應該問：

> **「資料送出去之後，我們還有沒有控制權？」**

這通常才是：

```text
DPA
BAA
Data Governance
AI Governance
Third-party Risk Management
```

真正要解決的問題。

---

# 28. AI / SaaS 接入公司的快速判斷公式

可以使用以下概念：

```text
資料敏感度
×
外部暴露程度
×
供應商風險
×
模型使用方式
×
資料保存時間
×
跨境風險
```

風險越高，越需要：

```text
Enterprise Contract
+
DPA
+
Security Review
+
Privacy Review
+
Technical Controls
```

---

# 29. 建議企業至少確認的 15 個問題

在核准任何 AI / SaaS 前，至少問：

1. 資料會送到哪裡？
2. 供應商是否保存 Prompt？
3. 保存多久？
4. 是否用於模型訓練？
5. 是否用於產品改善？
6. 是否有 Zero Data Retention？
7. 有哪些 Subprocessor？
8. 資料是否跨境？
9. 可以指定 Data Residency 嗎？
10. 是否支援刪除？
11. 是否加密？
12. 是否支援 SSO / MFA？
13. 是否提供 Audit Log？
14. 發生 Data Breach 多久通知？
15. 合約終止後資料如何處理？

---

# 30. 給 AI Coding 使用者的實務原則

如果是：

```text
OpenCode
Claude Code
Codex
GitHub Copilot
Gemini CLI
AI Coding Agent
```

建議遵循：

### 可以

```text
公開程式碼
開源 Repo
Synthetic Data
測試資料
```

### 需核准

```text
公司 Repo
內部 API
Schema
Architecture
Internal Document
```

### 不應直接送

```text
.env
API Key
Password
Private Key
Production Credential
客戶完整個資
高敏感交易資料
```

---

# 31. 企業 AI Governance 的核心架構

可以簡化成：

```text
                 AI Governance

                       │

        ┌──────────────┼──────────────┐

        │              │              │

     Legal          Security        Privacy

        │              │              │

        └──────────────┼──────────────┘

                       │

                Data Governance

                       │

                AI Platform
```

真正成熟的企業 AI 管理：

> 不是「禁止 AI」。

而是：

> **建立可控、可稽核、可追蹤、可終止的 AI 使用方式。**

---

# 32. 官方參考資料

## HIPAA / BAA

U.S. Department of Health & Human Services — Business Associates  
https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html

HHS — Sample Business Associate Agreement Provisions  
https://www.hhs.gov/hipaa/for-professionals/covered-entities/sample-business-associate-agreement-provisions/index.html

HHS — HIPAA Security Rule Summary  
https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html

## GDPR / DPA

EUR-Lex — General Data Protection Regulation, Article 28  
https://eur-lex.europa.eu/eli/reg/2016/679/oj

---

# 33. 最終摘要

一句話區分：

```text
NDA
= 不准洩漏我的秘密

DPA
= 你拿到我的資料後只能依規定處理

BAA
= HIPAA 醫療 PHI 的特定資料處理契約
```

企業內部專案或客戶資料之所以通常要完成相關協議與核准後才能接 AI / SaaS，是因為：

> **一旦資料離開企業控制邊界，問題就從「工具使用」升級為「第三方資料處理與風險管理」。**

因此企業真正需要建立的是：

```text
Contract Control
+
Data Control
+
Access Control
+
Security Control
+
AI Governance
+
Auditability
```

最終目標不是單純限制工具，而是確保：

> **資料即使進入外部 AI / SaaS 生態系，企業仍然保有足夠的法律、技術與治理控制權。**
