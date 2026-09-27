---
name: playwright-test
description: 使用 playwright-cli 依序驗證臺灣房價地圖網站（Flask，http://127.0.0.1:5000）的核心功能：首頁健康檢查、房價地圖互動（點擊縣市／趨勢圖篩選／型態與屋齡／地圖上色）、買房 vs 租房計算機（地圖點擊／坪數／收入驗證／確認鈕）、API 端點與響應式版面，最後彙整附證據（截圖／console／network）的缺陷報告。當使用者要求「測試房價地圖／買房租房網站」、對本專案做端到端驗證或回歸測試時使用。
allowed-tools: Bash(playwright-cli:*) Bash(npx:*) Bash(npm:*) Bash(uv:*) Bash(curl:*)
---

# 臺灣房價地圖網站 — playwright-cli 端到端測試

以真實瀏覽器（Chromium）依序驗證本專案兩個主要功能頁與後端 API。本 Skill 是可重複執行的 runbook：
照「測試流程」由 A 到 E 逐步執行，逐項以 `--raw eval` 讀取頁面狀態作為證據，最後套用「結果回報模板」。

- 首頁房價地圖：`/`（`app/templates/index.html` + `app/static/js/map.js`）
- 買房 vs 租房：`/buy_or_rent`（`app/templates/buyhouse.html` + `app/static/js/map2.js`）
- 後端路由：`app/views.py`

---

## 0. 前置準備與環境確認

1. 啟動服務（於專案根目錄，背景執行）：`uv run wsgi.py`，預期監聽 `http://127.0.0.1:5000`。
2. 確認可用性與 playwright-cli：
   ```powershell
   curl.exe -s -o NUL -w "HTTP %{http_code}" http://127.0.0.1:5000/
   playwright-cli --version
   ```
   - 若全域 `playwright-cli` 不存在，改用 `npx --no-install playwright cli ...`；再不行則 `npm install -g @playwright/cli@latest`。
3. 建立證據目錄：`New-Item -ItemType Directory -Force test-artifacts | Out-Null`
4. **確認程式碼狀態**（重要）：
   ```powershell
   git status
   git stash list
   ```
   - `git restore .` 會還原所有「已追蹤檔」的修改，可能讓先前修好的缺陷復現。測試前務必確認目前要測的是哪個版本，並在報告中註明。

> **伺服器可能跑舊碼**：Flask 若未開啟 reloader 或程式碼被還原，瀏覽器看到的會是舊行為。若 console 症狀與原始碼不符，先懷疑服務未重啟或版本被還原。

## 0.1 PowerShell 引號與呼叫慣例（Windows 必讀）

- `curl` 是 `Invoke-WebRequest` 的別名，會誤解參數 → 一律用 **`curl.exe`**。
- `eval` 的 JS 用**雙引號包住整個字串**，JS 內層字串改用**單引號**，避免跳脫地獄。
- 需要多行 JS 時，整個 `eval` 引數用雙引號，函式內用單引號與反引號；避免在 JS 內再放雙引號。
- 產物一律寫檔，不要讓長輸出停在終端：
  ```powershell
  playwright-cli --raw snapshot > test-artifacts\snap-home-initial.yml
  playwright-cli screenshot --filename=test-artifacts\home-initial.png
  ```
- 需要短暫等待 AJAX 完成：`Start-Sleep -Seconds 2`（或 `-Milliseconds 500`）。

---

## 1. 測試流程

依序 A → B → C → D → E。每完成一個區塊就記錄結果，最後才寫報告。

### A. 開啟與健康檢查

```powershell
playwright-cli open http://127.0.0.1:5000/ --browser=chromium
```

- 觀察回傳的 `### Page` 區塊：URL、Title（期望 `Rent or Buy a house`）、`Console: N errors`。
- 讀取 console 全文（頁面載入期錯誤）：
  ```powershell
  playwright-cli console
  ```
  或直接讀最新日誌檔：
  ```powershell
  Get-ChildItem .playwright-cli\console-*.log | Sort-Object LastWriteTime | Select-Object -Last 1 | Get-Content
  ```
- 確認模板引用的靜態資源不 404（本專案已知 `js/sb-admin-2.min.js`、`favicon.ico` 為 404 基線）。

**通過標準**：`/` 回 200、標題正確、console 錯誤已被記錄（有無錯誤皆要列出）。

### B. 房價地圖核心功能（`/`）

#### B1. 初始畫面與圖表繪製

```powershell
playwright-cli --raw eval "JSON.stringify({title:document.title, trend:(document.querySelector('#graph_trend').data||[]).length, bar:(document.querySelector('#graph_bar').data||[]).length, box:(document.querySelector('#graph_box').data||[]).length, price:document.querySelector('#price_location').textContent.trim(), rent:document.querySelector('#rent_location').textContent.trim(), areas:document.querySelectorAll('#app [data-name-zh]').length})"
playwright-cli screenshot --filename=test-artifacts\home-initial.png
```

- 期望：`trend/bar/box` 皆 > 0；`areas` = 21（20 個 `<path>` + 金門縣 `<g>`）。
- **已知基線缺陷**：載入後三張圖為 0 traces（`index.html` 用了未定義的 `graphTrend`；`map.js` 以空物件 `{}` 呼叫 `updateChart`）。若為 0 即記錄為缺陷。

#### B2. 點擊縣市（卡片 / 圖表 / 網路）

```powershell
playwright-cli click "#app path[data-name-zh='臺北市']"
Start-Sleep -Seconds 2
playwright-cli --raw eval "JSON.stringify({city:document.querySelector('#city').textContent.trim(), city2:document.querySelector('#city2').textContent.trim(), city3:document.querySelector('#city3').textContent.trim(), price:document.querySelector('#price_location').textContent.trim(), rent:document.querySelector('#rent_location').textContent.trim(), trend:(document.querySelector('#graph_trend').data||[]).length, bar:(document.querySelector('#graph_bar').data||[]).length, box:(document.querySelector('#graph_box').data||[]).length})"
```

- 期望：`city2/city3` 變為該縣市、卡片數字改變、三張圖更新。
- 換測 `高雄市`、`澎湖縣` 確認卡片數字隨縣市改變（每次都要 `Start-Sleep` 等 AJAX）。
- 金門縣為 `<g data-name-zh="金門縣">` 群組，非 `<path>`；用 `#app [data-name-zh='金門縣']` 才能選取，別用 `path[...]`。

#### B3. Hover 與地圖上色

```powershell
playwright-cli hover "#app path[data-name-zh='臺北市']"
Start-Sleep -Milliseconds 500
playwright-cli --raw eval "document.querySelector('#city').textContent.trim()"
playwright-cli --raw eval "JSON.stringify([...document.querySelectorAll('#app path')].map(e=>({n:e.getAttribute('data-name-zh'),f:getComputedStyle(e).fill})).filter(x=>['臺北市','雲林縣','澎湖縣','高雄市'].includes(x.n)))"
```

- 期望：hover 後 `#city` 顯示縣市名；臺北市 `fill` 偏紅（`rgb(255,0,0)`），低價縣市偏綠。

#### B4. 趨勢圖篩選（`#inlineCheckbox1`–`5`）

```powershell
playwright-cli uncheck "#inlineCheckbox1"          # 取消「房價」
Start-Sleep -Seconds 2
playwright-cli --raw eval "(document.querySelector('#graph_trend').data||[]).length"
playwright-cli check "#inlineCheckbox5"            # 勾「物價指數」
Start-Sleep -Seconds 2
playwright-cli --raw eval "JSON.stringify({n:(document.querySelector('#graph_trend').data||[]).length, names:(document.querySelector('#graph_trend').data||[]).map(t=>t.name)})"
```

- 期望：取消房價 → trace 減少；勾物價指數 → 對應 trace 出現。

#### B5. 長條圖篩選（`#inlineCheckbox6`–`10`）

```powershell
playwright-cli check "#inlineCheckbox6"            # 最高五縣市
Start-Sleep -Seconds 2
playwright-cli --raw eval "JSON.stringify((document.querySelector('#graph_bar').data||[]).map(t=>t.x))"
```

- 期望：x 軸僅 5 個縣市（如 臺北市/新北市/新竹市/新竹縣/桃園市）。

#### B6. 建築型態與屋齡（radio）

> radio 是 Bootstrap `.btn-check`（視覺隱藏），**直接 `check` 隱藏 input 可能不會觸發 jQuery 的 click handler**。要模擬真實使用者，請點 `<label for="...">`。

```powershell
playwright-cli click "label[for='btnradio2']"      # 華廈
Start-Sleep -Seconds 3
playwright-cli --raw eval "JSON.stringify({city4:document.querySelector('#city4').textContent.trim(), price:document.querySelector('#price_location').textContent.trim(), box:(document.querySelector('#graph_box').data||[]).length})"
playwright-cli click "label[for='btnradio6']"      # 屋齡：五年以下
Start-Sleep -Seconds 3
playwright-cli --raw eval "JSON.stringify({city5:document.querySelector('#city5').textContent.trim(), price:document.querySelector('#price_location').textContent.trim()})"
```

- 期望：卡片數字與箱型圖隨型態/屋齡改變，`#city4`/`#city5` 顯示選取值。
- 注意：多個 radio 可能同時被標記 `checked`，瀏覽器實際勾選**最後一個**。

#### B7. 快取標頭

```powershell
playwright-cli --raw eval "async () => { const r = await fetch('/'); return JSON.stringify({cc:r.headers.get('cache-control'), pragma:r.headers.get('pragma'), expires:r.headers.get('expires'), status:r.status}); }"
```

- 期望：`no-cache, no-store, must-revalidate` / `no-cache` / `0`。

#### B8. 依序點擊所有縣市（全圖走訪）

目的：確認 SVG 地圖上**每一個**縣市被點擊後，`#city2`、`#price_location`、`#rent_location` 都會更新且對應正確，無任何縣市漏接或無反應。

以單次 `eval` 在頁面內依 DOM 順序依序點擊所有 `#app [data-name-zh]`（金門縣為 `<g>`，取其子 `<path>` 觸發），每次間隔 1.2 秒等 AJAX，回傳逐筆結果：

```powershell
playwright-cli --raw eval "async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const nodes = [...document.querySelectorAll('#app [data-name-zh]')];
  const targets = [];
  const seen = new Set();
  for (const n of nodes) {
    const name = n.getAttribute('data-name-zh');
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const clickable = n.tagName.toLowerCase() === 'path' ? n : n.querySelector('path');
    targets.push({ name, el: clickable || n });
  }
  const out = [];
  for (const t of targets) {
    const before = document.querySelector('#price_location').textContent.trim();
    t.el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    await sleep(1200);
    out.push({
      click: t.name,
      city2: document.querySelector('#city2').textContent.trim(),
      price: document.querySelector('#price_location').textContent.trim(),
      rent: document.querySelector('#rent_location').textContent.trim(),
      matched: document.querySelector('#city2').textContent.trim() === t.name,
      changed: document.querySelector('#price_location').textContent.trim() !== before
    });
  }
  return JSON.stringify(out);
}"
```

> 若要把結果落檔比對，可直接把上面輸出接 `Set-Content test-artifacts\all-cities.json -Encoding UTF8`，或改用逐次指令版本自行累積表格。

**期望結果（2026-09-27 實測基線）**

| 檢查 | 期望 |
| :--- | :--- |
| 點擊的縣市數 | 21 |
| `city2` 與點擊名稱一致 | 20/21（**金門縣** 會被 `CITY_ALIASES` 正規化為 `金門`，屬預期） |
| `price` 每次是否改變（`changed`） | 全部 `true`（連續兩縣市同價則記為可疑） |
| 格式 | `price`/`rent` 為 `$` 開頭數字字串，非空 |
| 已知例外 | 金門縣 `rent_location` = `資料不足`（該型態/屋齡無租金資料） |

判定規則：除金門縣的正規化外，任何 `matched:false`、`changed:false`（連續同價）、空值或非 `$` 格式，皆為缺陷並需附 `test-artifacts/all-cities.json` 佐證。

> 此測試也會連帶觸發每個縣市的 `/plt`、`/cb2`、`/pltbox`、`/pltbar`；若某縣市讓後端 500，該筆 `price` 會維持前值（`changed:false`），一併記錄 console/network 錯誤。

**替代：逐次 Playwright 點擊版**（較慢，21 次程序啟動，但為真實 `click`）

```powershell
$cities = @('臺北市','新北市','桃園市','臺中市','臺南市','高雄市','基隆市','新竹市','新竹縣','苗栗縣','彰化縣','南投縣','雲林縣','嘉義市','嘉義縣','屏東縣','宜蘭縣','花蓮縣','臺東縣','澎湖縣','金門縣')
$rows = @()
foreach ($c in $cities) {
  playwright-cli click "#app [data-name-zh='$c']" | Out-Null
  Start-Sleep -Milliseconds 1200
  $line = playwright-cli --raw eval "document.querySelector('#city2').textContent.trim()+'|'+document.querySelector('#price_location').textContent.trim()+'|'+document.querySelector('#rent_location').textContent.trim()"
  $clean = ($line -join '') -replace '^"|"$',''
  $f = $clean -split '\|'
  $verdict = 'CHECK'
  if ($f[0] -eq $c -or ($c -eq '金門縣' -and $f[0] -eq '金門')) { $verdict = 'OK' }
  $rows += [pscustomobject]@{ 點擊=$c; city2=$f[0]; 房價=$f[1]; 租金=$f[2]; 比對=$verdict }
}
$rows | Format-Table -AutoSize
Write-Output ("總計 " + $rows.Count + " / 不符 " + (($rows | Where-Object {$_.比對 -ne 'OK'}).Count))
```

- **不要**對 `--raw eval` 的輸出直接用 `ConvertFrom-Json`：它是一層 JSON 字串（外層帶引號、內層引號被跳脫），會解析失敗。要嘛在頁面端 `JSON.stringify` 後於 PowerShell 端去引號再處理，要嘛改用上面的 `|` 分隔純字串。
- DOM 順序不等於行政區順序（首個常為 `澎湖縣`），此為正常；「依序」指依地圖上的所有縣市逐一走訪。

### C. 買房 vs 租房核心功能（`/buy_or_rent`）

```powershell
playwright-cli goto http://127.0.0.1:5000/buy_or_rent
Start-Sleep -Seconds 3
playwright-cli console
```

#### C1. 初始卡片與圖表

```powershell
playwright-cli --raw eval "JSON.stringify({total:document.querySelector('#total_price').textContent.trim(), first:document.querySelector('#First_payment').textContent.trim(), loan:document.querySelector('#loan_payment').textContent.trim(), rent:document.querySelector('#rent_payment').textContent.trim(), pie:(document.querySelector('#pie-chart').data||[]).length, line:(document.querySelector('#line-chart').data||[]).length, city2:document.querySelector('#city2').textContent.trim()})"
playwright-cli screenshot --filename=test-artifacts\buyrent-initial.png
```

- 期望：四張卡片有實際金額（非 HTML 寫死的假值）、圓餅/折線皆 > 0 traces。
- **已知基線缺陷**：載入時卡片顯示 HTML 假值（`$1520,000` 等）、`#city2` 為 `-`。

#### C2. 地圖點擊與坪數

```powershell
playwright-cli click "#app path[data-name-zh='臺北市']"
Start-Sleep -Seconds 3
playwright-cli --raw eval "JSON.stringify({city2:document.querySelector('#city2').textContent.trim(), total:document.querySelector('#total_price').textContent.trim(), rent:document.querySelector('#rent_payment').textContent.trim()})"

# 坪數：設定 slider 值後須「按確認」才會重算（除非程式有綁 #sq 的 input 事件）
playwright-cli --raw eval "(() => { const s=document.querySelector('#sq'); s.value=50; s.dispatchEvent(new Event('input',{bubbles:true})); s.dispatchEvent(new Event('change',{bubbles:true})); return s.value; })()"
playwright-cli click "#send"
Start-Sleep -Seconds 3
playwright-cli --raw eval "JSON.stringify({sq:document.querySelector('#sq').value, city5:document.querySelector('#city5').textContent.trim(), total:document.querySelector('#total_price').textContent.trim()})"
```

- 期望：地圖點擊後卡片更新；坪數變更後總價呈等比例變化。
- **已知基線缺陷**：`#sq` 無獨立 input 事件，只拖滑桿不會更新總價；`#send` 的 inline `onclick="verify()"` 會拋 `verify is not defined`。

#### C3. 收入 / 消費輸入與驗證

```powershell
playwright-cli --raw eval "(() => { const i=document.querySelector('#income-input'); i.value=20000; i.dispatchEvent(new Event('input',{bubbles:true})); const c=document.querySelector('#consume-input'); c.value=30000; c.dispatchEvent(new Event('input',{bubbles:true})); return 'set'; })()"
Start-Sleep -Seconds 4
playwright-cli --raw eval "JSON.stringify({errCount:(document.querySelector('#pie-chart').innerHTML.match(/資格/g)||[]).length, pieText:document.querySelector('#pie-chart').textContent.trim().slice(0,80)})"

# 恢復
playwright-cli --raw eval "(() => { const i=document.querySelector('#income-input'); i.value=80000; i.dispatchEvent(new Event('input',{bubbles:true})); return i.value; })()"
Start-Sleep -Seconds 4
playwright-cli --raw eval "JSON.stringify({pie:(document.querySelector('#pie-chart').data||[]).length, line:(document.querySelector('#line-chart').data||[]).length})"
```

- 期望：收入 < 消費+住房成本 → 顯示紅字提示；改回足額 → 提示清除、圖表恢復。
- **已知基線缺陷**：提示訊息重複出現 3–4 次（事件處理器重複綁定）；`/buy_or_rent/charts` 驗證失敗回 **HTTP 200**（而非 400）；恢復後可能殘留舊訊息。

#### C4. 投資報酬率滑桿

```powershell
playwright-cli --raw eval "JSON.stringify({value:document.querySelector('#Range_bar').value, label:(document.querySelector('output')||{}).textContent})"
```

- 期望：`output` 標籤與滑桿值一致（如 value=10 → `10%`）。
- **已知基線缺陷**：初始 `value=10` 但標籤寫死顯示 `5%`；送往後端的 `invest_rate` 單位語意待確認。

#### C5. 確認鈕與導覽

```powershell
playwright-cli click "#send"
Start-Sleep -Seconds 3
playwright-cli console
playwright-cli screenshot --filename=test-artifacts\buyrent-after-send.png

# 側欄回首頁
playwright-cli click "getByRole('link', { name: '房價地圖' })"
Start-Sleep -Seconds 2
playwright-cli --raw eval "location.pathname"
playwright-cli go-back
Start-Sleep -Seconds 2
playwright-cli --raw eval "location.pathname"
```

- 期望：點確認後卡片與圖表更新；側欄連結可回首頁、`go-back` 可返回。

### D. API 端點直接驗證

在同一分頁以 `fetch` 一次跑完，逐一檢視狀態碼與 body：

```powershell
playwright-cli --raw eval "async () => {
  const out = {};
  const j = async (u) => { try { const x = await fetch(u); const t = await x.text(); return {status:x.status, len:t.length, body:t.slice(0,100)}; } catch(e) { return {err:String(e)}; } };
  out.plt_full = await j('/plt?city=臺北市&price=true&rent=true');
  out.plt_price_false = await j('/plt?city=臺北市&price=false&rent=true');
  out.plt_price_bare = await j('/plt?city=臺北市&price&rent=true');
  out.cb2 = await j('/cb2?city=新北市&type=華廈(10層含以下有電梯)&duration=五年至十五年');
  out.cb2_unknown_city = await j('/cb2?city=火星市&type=透天厝&duration=五年以下');
  out.cb2_unknown_duration = await j('/cb2?city=臺北市&type=透天厝&duration=一百年');
  out.buy_cb = await j('/buy_or_rent/cb?city=臺北市&type=住宅大樓(11層含以上有電梯)&duration=五年以下&sq=30');
  out.buy_cb_bad_sq = await j('/buy_or_rent/cb?city=臺北市&sq=abc');
  out.buy_charts_low = await j('/buy_or_rent/charts?city=雲林縣&type=透天厝&duration=三十年以上&sq=30&income=20000&consume=30000&invest_rate=0.1');
  return JSON.stringify(out);
}"
```

檢核表：

| 端點 | 期望 |
| :--- | :--- |
| `/plt`（正常） | 200，JSON 含 `data`/`layout` |
| `/plt?price=false` / `=off` / 有鍵無值 | 房價 trace 不出現（`false/0/off/空字串` 皆視為 False） |
| `/cb2`（正常） | 200，兩個 `$` 金額字串 |
| `/cb2` 未知縣市 / 未知屋齡 | 文件期望 400；**已知基線缺陷**為 500（Werkzeug） |
| `/buy_or_rent/cb`（正常） | 200，四個金額字串 |
| `/buy_or_rent/cb&sq=abc` | 400 `data_not_available` |
| `/buy_or_rent/charts` 收入不足 | **已知基線缺陷**：HTTP 200 但 body `error: validation_failed` |

### E. 響應式與收尾

```powershell
playwright-cli resize 1440 900
Start-Sleep -Seconds 2
playwright-cli --raw eval "JSON.stringify({w:innerWidth, overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth})"
playwright-cli resize 375 800
Start-Sleep -Seconds 2
playwright-cli --raw eval "JSON.stringify({w:innerWidth, scrollW:document.documentElement.scrollWidth, clientW:document.documentElement.clientWidth, overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth})"
playwright-cli screenshot --filename=test-artifacts\mobile-375.png
```

- 期望：1440 與 375 皆 `overflow:false`（無水平溢位）。
- 收尾：`playwright-cli close`（或 `close-all`）。列出產物：
  ```powershell
  Get-ChildItem test-artifacts | Select-Object Name, Length, LastWriteTime
  ```

---

## 2. 常用選擇器速查

| 目標 | 選擇器 |
| :--- | :--- |
| 縣市圖層（含金門） | `#app [data-name-zh='臺北市']` |
| 縣市圖層（僅 path） | `#app path[data-name-zh='臺北市']` |
| 首頁圖表 | `#graph_trend`、`#graph_bar`、`#graph_box` |
| 首頁卡片 | `#price_location`、`#rent_location` |
| 首頁狀態文字 | `#city`、`#city2`、`#city3`、`#city4`、`#city5` |
| 趨勢圖篩選 | `#inlineCheckbox1`–`#inlineCheckbox5` |
| 長條圖篩選 | `#inlineCheckbox6`–`#inlineCheckbox10` |
| 型態 / 屋齡 radio label | `label[for='btnradio1'..'btnradio5']` / `label[for='btnradio6'..'btnradio9']` |
| 買房頁卡片 | `#total_price`、`#First_payment`、`#loan_payment`、`#rent_payment` |
| 買房頁圖表 | `#pie-chart`、`#line-chart` |
| 買房頁輸入 | `#income-input`、`#consume-input`、`#sq`、`#Range_bar`、`#send` |
| 導覽連結 | `getByRole('link', { name: '房價地圖' })` |

---

## 3. 注意事項

- **務必區分「點 label」與「check 隱藏 input」**：Bootstrap `.btn-check` 建議點 label。
- **每次互動後等待 AJAX**，再讀狀態，否則會讀到舊值。
- **`--raw`** 只輸出結果值，適合管道與寫檔；需要頁面快照/狀態時不要加。
- **不要用 PowerShell 的 `curl`**（別名），用 `curl.exe`。
- **`git restore .` 會抹掉未提交的修復**；測試前先確認版本，並在報告註明。
- **snapshot 會產生 `.playwright-cli/*.yml` 檔**，屬暫存產物，勿提交。
- 所有截圖與快照統一到 `test-artifacts/`，命名用 `home-*` / `buyrent-*` / `mobile-*`。

---

## 4. 結果回報模板

```markdown
## 測試環境
- URL：http://127.0.0.1:5000/ ｜ 瀏覽器：Chromium ｜ 視窗：1440×900、375×800
- 版本狀態：（分支 / commit / 是否有未提交修改，有無被 git restore 還原）

## 結果摘要
| 面向 | 結果 |
| :--- | :--- |
| 服務可用性 / 健康檢查 | ✅ / ❌ |
| 房價地圖核心功能 | ✅ / ❌ |
| 買房 vs 租房核心功能 | ✅ / ❌ |
| API 端點 | ✅ / ❌ |
| 響應式版面 | ✅ / ❌ |

## 逐項結果
| 項目 | 結果 | 實測說明 |
| :--- | :--- | :--- |
| A-01 ... |  |  |

## 缺陷清單（附證據）
- [嚴重度] 標題
  - 現象：
  - console：
  - 重現步驟：
  - 證據：`test-artifacts/xxx.png`、`snap-xxx.yml`

## 結論與建議
```

嚴重度分級：**高**（阻斷：頁面無法使用或核心圖表不繪製）、**中**（功能異常但有替代路徑、錯狀態碼、重複請求）、**低**（外觀、假資料、文案不一致）。
