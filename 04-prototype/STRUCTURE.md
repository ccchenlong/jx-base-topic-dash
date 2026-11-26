# 04-prototype/ 结构说明（build-2.4.18，N6 r22 / PRD v2.0.1 研发交付版）

## N4 r2 产出形态（用户裁决：原型 + PRD 的结果）

| 文件 | 角色 |
| --- | --- |
| `index.html` | 活原型 build-2.4.16（**r20 大迭代：① 数据接入页移除「字段结构预览」「数据量构成」模块（`#accExtra` 删，目录容器 `flex:1;min-height:120px`）、目录分页 20 条（`DIR_PAGESZ`/`dirPage` + `#dirPager` 页脚「共 N 条目录 · 第 x / y 页（每页 20 条）」+ 上一页/下一页，单位切换重置第 1 页）、目录抽屉改两 Tab（`dirTab(0)` 目录信息 / `dirTab(1)` 已接入字段 N；物理表/源表行、治理表行、数据表 Tab 移除，`dirTablesOf` 保留供 F-049 弹窗）；② 治理页新增「字段级规则（导入）」区块（`#impRuleSec` 插入 ruleMeta 行后 + `renderGovRules()`，逐条展示 规则编号/库名称/库类型/目标表/字段/规则描述/状态，行点击抽屉详情，导入即刷新、未导入隐藏）；③ `impOnFile` 全量重写——五 sheet 按 sheet 名定位（`S(name)`）、列名去 \* 映射（`impIdx`）、表头级校验（`hdrCheck`，rows[1] 为表头，8/6/4/4/5 列缺列文件级阻止）、示例行统一跳过（任一单元格含「示例」整行跳过）、仅 .xlsx（CSV 不再支持）；`impCommit` 重写——数据接入按库名称写 `IMP_LIB_SUM`（键复用 libRecords/libCatalogs/libFields/libSrcTables，libName/libType/libUnit/libScope 随行写入）、数据治理逐条写 `IMP_GOV_RULES`、成果/场景全局一行写 `IMP_ACH`/`IMP_SCENE`、字段明细合并目标扩展 LEDGER_CATS + DIRS 全部快照目录、五视图刷新（`renderUnits`/`renderAccess`/`renderGovRules`/`renderAch`/`renderSceneKpis`）+ 分段回执；④ P3/P6/P7 渲染 per-key fallback（`gv=(k,fb)=>(s&&s[k]!=null)?Number(s[k]):fb`：接入数据量/应建目录数/数据字段数/源表数/成果四 KPI/场景四 KPI 可替换，供数单位/治理规则数/订阅/TOP5 保持快照；popKpisRows 仅 接入数据量/数据字段 可替换）；⑤ 全局声明（`IMP_GOV_RULES`/`IMP_ACH`/`IMP_SCENE`/`DIR_PAGESZ`/`dirPage`）前移至 `curUnit` 前修 TDZ**；r19：通用版「指标数值」解析与展示替换——`impMapIndHeader` 31 列表头校验、行级库名称六库匹配 + 26 项数值校验、示例行/未填报预填行静默跳过、`IMP_LIB_SUM` 写入与 P2/P3/P6/P7 展示替换、countUp 下界钳制**；r18：模板 14 列导入解析与展示映射；r17：表头级全要素校验；r9–r16：导入弹窗交互 / 图标 / 下钻 / 单 sheet / 字段明细 / 英文类型 / 9 列 / 全要素必填逐轮演进。业务快照数据零改动） |
| `templates/导入模板-通用版.xlsx` + `导入模板.zip` | **r20 重构（v1.8.0）：五工作表通用版 + 统一三行结构**——①「数据接入」8 列全部必填（单位\*/覆盖范围\*/库名称\*/库类型\*/库接入数据量\*/应建目录数\*/库数据字段数\*/库接入源表数\*，六库一类一行 21 行预填，示例社会信用基础库（示例）4 行、首行 210,000,000/13/612/18）；②「数据治理」6 列全部必填（规则编号\*/库名称\*/库类型\*/目标表\*/字段\*/规则描述\*，规则细化到字段；示例 4 条 XY-R00x（示例））；③「治理成果」4 列全局一行（流程节点数/治理字段次数/结果表数量/沉淀文档数；示例 452（示例）/851（示例）/45（示例）/7（示例））；④「场景服务」4 列全局一行（累计订阅次数/接口调用次数/服务接口数/规划场景数；示例 746（示例）/125,740,861（示例）/5（示例）/8（示例））；⑤「字段明细」6 列（所属数据目录\*/数据源单位\*/字段名称\*/字段类型\*/字段长度\*/字段说明，示例 5 条引用失信被执行人名单（示例），varchar/int/decimal/date/datetime 全枚举）；**统一三行结构：第 1 行说明行（逐列含义+格式+必填）、第 2 行表头（底色加粗 s=1）、第 3 行起数据**；示例数据统一信用库；删除「指标数值」「数据目录」sheet；zip 重打包（1 member，testzip 通过）；手写最小 xlsx zip（无 openpyxl 依赖）；历史：r19 三工作表（指标数值 31 列一类一行 21 行 / 数据目录 14 列 / 字段明细，示例仅人口库）→ r9–r18 分库模板演进（已删除） |
| `prototype-prd.html` | **原型 + PRD 对照页（r8：锚点滚动根治）**：全页仅两栏 —— 左活原型 + 右 400px 可折叠 PRD 面板，可同时查看。**页面切换不设独立导航，完全使用原型自带菜单**：`#mainnav`（总览驾驶舱 / 库资源门户 / 资源清单）、库资源门户入口卡、`#libTabs`（数据总览 / 数据接入 / 数据治理 / 治理成果 / 场景服务）；500ms 轮询读原型 `.page.active` / 管理侧 `.tabs button.on`，右侧 PRD 自动跟随当前页。管理侧 2 页（大屏原型无入口）保留为 PRD 面板脚注两个小链接；全站公共行为 / 五态表 / R-xx 总表改为每页常驻的「全局口径参考」折叠区块，不再占导航。3 路 iframe 全预加载（`index.html` / `management.html?page=tasks` / `management.html?page=status`），切页只做显隐、零导航，均带 `allowfullscreen`。**iframe 100%×100% 铺满舞台容器**（`framewrap{position:absolute;inset:0}`，纯 CSS，不做任何尺寸计算、不缩小、不加外框 / 灰底 / padding），原型完全按自身 `#viewport` 居中与 `scaleStage()` 渲染，等同独立打开。**顶栏裁切根因**：此前 iframe `src="index.html#page-overview"`，浏览器把锚点元素滚进视口，令 `overflow:hidden` 的 `#stage` 产生 `scrollTop≈22`，顶栏上半被裁、上方露出灰带。**根治**：① `src` 改为 `index.html`（去 hash）；② `ensureNoScroll()` 向大屏原型 iframe 注入 `#stage{overflow:hidden!important;overflow:clip!important}` 并把 `scrollTop` 归零，从根上禁止舞台滚动；③ 撤销 r6/r7 全部错误补丁（16:9 缩小+灰底、`padding-top:26`、`transform-origin:top center`、接管 `scaleStage`）；④ `fit()` 主动调用原型自身 `scaleStage()` 一次，补 PRD 切换改变 iframe 宽度时 resize 未派发的时序。**两个按钮各司其职**：「收起 PRD」在右侧 PRD 面板头部（`.prd-fold`，PRD 可见时出现），「展开 PRD」在原型顶栏下方图例行右端（`.prd-toggle` top:72px/right:5%，仅 `.prd-off` 时显示，不遮挡顶栏时钟 / 巡播 / ⛶ 全屏）。同源 http 双向联动、元素映射悬停高亮；file:// 降级为单向联动。r20：头部/页脚 v1.8.0 + build-2.4.16、P4/P5/P6/P7 六要素重写、R-11/R-12/R-13 r20 口径 |
| `verify-rules.js` | R-01–R-13 双口径校验（R-11 断言 build-2.4.16 + hash 导航；R-12 断言「数据接入导入结果」+ 五工作表通用版模板；**R-13（r20 全量重写）：模块移除断言（`!src.includes('accExtra'/'字段结构预览'/'数据量构成')`）+ 分页断言（`DIR_PAGESZ`/「每页 20 条」/`dirPage=1`）+ 抽屉两 Tab 断言（`dirTab(0)`/`dirTab(1)`，`!src.includes('dirTab(2)')`）+ 五 sheet 断言（`S('数据接入')` 等五个、`IMP_GOV_RULES`/`IMP_ACH`/`IMP_SCENE`）+ 模板 zip 解压断言——workbook.xml sheet 名序列 === ['数据接入','数据治理','治理成果','场景服务','字段明细']、8/6/4/4/6 列带 \* 表头、B 列一类一行（matchAll B 列行号 filter row≥3，说明行不计）、示例标记（「社会信用基础库（示例）」/「452（示例）」/「746（示例）」）、s2 含「细化到字段」、s5 含 varchar/int/decimal/date/datetime 与「失信被执行人名单（示例）」；ls 过滤排除 `~$` 锁文件与「 - 副本」副本；历史：r19 指标解析与展示替换断言 + 31/14/5 列解压断言、r18 14 列断言、r17 表头级断言、r16 全要素断言；渲染环节最多 3 次重试消除无头抖动） |
| `management.html` | 管理侧配套页（P9 建设任务与时限 / P10 数据口径与状态，由 `?page=tasks\|status` 进入）。**产物副本专属改动**：追加 `.page.on,.tcard{animation:none!important}`，避免预加载 iframe 在 display:none 下入场动画卡在起始帧导致内容半透明；产品源未改动 |
| `STRUCTURE.md` | 本文件 |

## 结构形态裁决说明（D-03）

skill 的 N4 规范默认 `index.html + app.js + data-pages-*.js` 三分文件结构；
本产品经用户裁决（挂接说明.txt）为**单文件 HTML 交付**：样式、脚本、图标、内嵌数据全部在
`index.html` 中，无 CDN / 后端 / 数据库依赖，便于平台静态目录挂接与 iframe 嵌入。
故本目录不拆分 app.js / data-pages-*.js，结构与规范差异见下表，Gate 时请一并裁决确认。

| 规范要求 | 本产物落地 | 说明 |
| --- | --- | --- |
| `index.html` 壳层与样式 | `index.html`（约 250KB，8 页 section + 全部样式脚本） | 单文件形态，含产品全部功能 |
| `app.js` 渲染与交互 | 内嵌于 `index.html` 单 `<script>` 块 | 拆分会破坏挂接交付形态（D-03） |
| `data-pages-*.js` 页面数据 | 内嵌数据常量（LEDGER_CATS / AUTH / SERVICE_APIS / UNITS / RULES / SCENES 等，快照 2026-11-16） | 数据与逻辑在源码内分区注释清晰（`/* ===== */` 分块） |
| 校验函数 | **`verify-rules.js`（本目录）**：无头 Chrome 渲染后按 R-01–R-13 双口径校验（渲染 DOM 管界面 / 源码管数据常量；R-13 另检查 6 个模板 xlsx 的 4-sheet 结构），失败回引 03-prd.md 规则原文，`node verify-rules.js` 一条命令可跑 | 另有开发侧 `verify.py`（proto_shots，10 页 74 项 DOM 断言，TOTAL FAIL: 0） |

## 与源原型的关系

- `index.html` 与工作区 `prototypes/基础库专题库大屏/index.html`（历史版本）同源，产物级差异累计：
  顶栏 `build-2.4.7` 版本标识（`#buildTag`）、hash 导航（init 读 `location.hash` + `hashchange` 监听）、
  `window.setPage=setPage` 暴露（供对照页同源联动）、r9 数据接入 Excel 导入与台账多库化、r10 导入弹窗交互（`#modal` + 导入后结果预览 + 错误提示规则）、
  **r11 模板「数据表」sheet + `DATA_TABLES` 派生/导入表 + `LIB_ICONS` 库卡图标 + 目录详情三 Tab（数据表下钻）+ `openAllDataModal()` 全量查询弹窗**；
  业务快照内容与数据常量未改动（导入仅写入内存态，刷新还原为 71 条人口库快照）。
- 后续评审修改（N6）直接在本目录升 build 号迭代，产品侧原型按 N7 同步。

## 五态验收表（详见 project-spec.md「状态名与五态」）

| 状态 | 结论 | 依据 |
| --- | --- | --- |
| normal 正常 | ✓ 满足 | 8 页全量渲染，浏览器抽查无异常值 |
| empty 空态 | ✓ 满足 | 切库即触发「明细待导入」空态、空单位、空规则表，真实可切换 |
| partial 缺项 | ✓ 满足 | 「—」/「待补充」/「部分填报」，未知≠0（R-02） |
| loading 加载 | △ Mock | 页面切换 300ms 淡入 + countUp 入场；静态内嵌数据无网络请求，无骨架屏 |
| error 错误重试 | △ Mock | 刷新 = 重载内嵌数据，网络层失败不存在（挂接平台由浏览器处理） |
| forbidden 403 | — 豁免 | 无登录/权限体系（PRD §12 已知限制、D-01） |

## 验证记录（2026-11-24，build-2.4.4 / r8 锚点滚动根治复验）

- `node verify-rules.js`：R-01–R-11 **11/11 PASS**（exit 0）；`verify.py` 10 页 74 项断言 TOTAL FAIL: 0（产品源原型未动）
- div 平衡 20/20（对照页）、内嵌脚本 `node --check` 通过；`__protoSafeTop` / `__protoFitPatched` / `padding-top:26` / `transform-origin:top center` / `SAFE` / 16:9 计算全部无残留；`allowfullscreen` × 3；`prdToggle` / `prdFold` 各 1
- **排查方法**：此前均在本地 `http.server 8899` 验证；本轮把几何探针临时嵌进产物、通过用户真实预览地址 `127.0.0.1:52481/static-html/...` 加载，才复现现象
- **真因探针**：`.topbar` 的 `computedTop=0 / transform=none / offsetTop=0`（顶栏本身无偏移），但 **`#stage.scrollTop=22`** —— iframe `src` 带 `#page-overview` 锚点，浏览器把锚点滚进视口，令 `overflow:hidden` 的舞台滚动 22px，顶栏上半被裁、上方露出灰带。r6/r7 误判为「顶栏 17~22px 内部偏移」，全是错补丁
- **根治后几何探针（均走用户预览地址，窗口 1920×1143 / 视口 1896×988）**：
  - 展开 PRD：iframe 1496×988（100% 铺满）、`#viewport align=center padTop=0`、`#stage` top=73.3 / scale(0.779167) / origin=960px 540px、`.topbar` **top=73.3**（完整）
  - 收起 PRD：iframe 1896×988（100% 铺满）、`#stage` top=0 / left=69.8 / w=1756.4 / h=988 / bottom=988 / scale(0.914815)、`.topbar` **top=0**（贴顶完整）
  - 两态 `scrollTop=0`、`overflow=clip`、`legacyPatch=false`
- Chrome headless 截图目检（用户预览地址）：收起态 logo / 中文标题 / 英文副标题 / 主导航 / 时钟 / ▶ / ⛶ 全部完整、顶栏紧贴顶部、**无灰带**；展开态顶栏完整、PRD 头部有「收起 PRD」、原型区无展开按钮
- dump-dom 联动复验：点原型 `#mainnav`「库资源门户」→ PRD「库资源门户 P2」，收起按钮「收起 PRD」在 PRD 头部、展开按钮 `display:none`
- 探针与全部临时页已清理，本目录仅余 5 个正式文件（r9 起另含 `templates/` 六库模板）

## 验证记录（2026-11-24，build-2.4.5 / r9 数据接入 Excel 导入）

- `node verify-rules.js`：R-01–R-12 **12/12 PASS**（R-12 为 r9 新增导入断言）；开发侧重抓 8 页 DOM 后 `verify.py` TOTAL FAIL: 0
- 两页内嵌脚本 `node --check` 通过；对照页 P4 面板经注入切换渲染确认 F-046 / F-047 / R-12 / 「零依赖解析」/「导入计入台账态」全部可见；全局口径折叠区同步为 R-01 – R-12
- **端到端实测**（同源 http harness，假 File 触发真实 `impOnFile` 链路）：
  - xlsx：三工作表识别（目录导入 / 字段明细 / 填写说明），3 行解析，单元格与数值正确（「企业基本信息」/ 1850000 / 24 / 每日），备注含「示例行」的 2 行自动跳过
  - csv：标准表头 1 行有效 → 死亡人员专题库台账 +1；非法频率「每小时」被拒（异常行标红、确认按钮禁用）
  - 导入后：`curLib=legal` 目录表显示 2 行（企业基本信息 / 社会组织信息），左侧六库计数 42/2，双口径「台账态 · 明细 73 条（含导入 2 条）」，3D 环 / 更新频率 / 提供方式统计随台账动态更新
  - 截图目检（导入抽屉、导入后资源清单）无灰底 / 无错位 / 无内容缺失
- **实现约束**：D-03 单文件交付，无 CDN / 后端 / 数据库；xlsx 用浏览器原生 `DecompressionStream('deflate-raw')` 解 zip 中央目录 + `DOMParser` 解 XML（inlineStr 与 sharedStrings 双兼容），csv 用引号状态机；导入仅内存态，刷新还原快照，不写盘
- 口径保持：导入内容计入台账态明细，与清单态应建 134 条并列不调平（R-01）；空值显示「—」不计 0（R-02）；模板示例行不参与导入
- 临时 harness / 调试页 / 注入探针全部清理，本目录为 5 个正式文件 + 6 个模板 xlsx

## PRD v1.5.0 关联（r10，位于上两级 `output/基础库专题库大屏/`）

- `03-prd.md`：按模块组织的 PRD 全文（§1 全局总则 / §2 P1 九功能块逐块六要素与更新规则推导 / §3 P2 实时六库 / §4 P3 六指标来源与空值处理 / §5 P4 弹窗交互 / §6 导入错误提示规则全表 / §7 P5–P10 六要素简表 / §8 版本关系）
- 权威 `PRD-基础库专题库数据地图.md`（工作区根）升 v1.5.0，增补 §19 模块级 PRD 与导入弹窗、§20 变更记录；`03-prd-功能清单.md` 47 条、`03-prd-preview.html`、`project-spec.md`（PRD v1.5.0 ↔ build-2.4.6、R-12）同步
- 对照页 `prototype-prd.html` 的 `renderPrd` 新增全模块「模块说明（v1.5.0 · 六要素）」区块；P1 定制「全部来自六库资源」与逐块更新规则推导、P2 实时六库、P3 六指标来源与空值、P4 弹窗交互；PRD 面板页脚显示 v1.5.0

## 验证记录（2026-11-24，build-2.4.6 / r10 导入弹窗 + PRD v1.5.0）

- `node verify-rules.js`：R-01–R-12 **12/12 PASS**（R-11 升 2.4.6、R-12 断言 `openImportModal` / `#modal` / 「导入结果预览」）；重抓 8 页 DOM 后 `verify.py` TOTAL FAIL: 0；两页内联 JS `node --check` 通过
- **弹窗端到端**（同源 http harness）：① 弹窗打开且 Escape 关闭 ✅ ② 仅示例行 xlsx → 0 有效行确认禁用 ✅ ③ CSV 2 行 → 导入完成、结果预览表渲染、按钮「已导入」禁用 ✅ ④ 重复导入同文件 → 2 条判定「更新」、台账不重复 ✅
- 截图目检：`n4r18_modal_err.png`（弹窗居中完整、非法频率行标红 + 汇总级错误提示）、`n4r19_modal_result.png`（导入结果预览含新增/更新明细与内存态说明）
- 对照页探针：P1/P4 六要素区块、六库来源、更新规则推导、弹窗描述、PRD v1.5.0 全部命中
- 弹窗实现：`#modal` / `#mmask` + `openModal()` / `closeModal()`；显式关闭按钮 / 遮罩点击 / Escape（扩展全局 keydown）/ 焦点约束（F-042）；`impCommit()` 结果视图含新增/更新明细、跳过示例行/异常未导入回执
- 临时 harness / 探针页 / 本地服务全部清理

## PRD v1.5.1 关联（r11，位于上两级 `output/基础库专题库大屏/`）

- `03-prd.md` 升 v1.5.1：§3 P2 新增「库卡元素图标」六要素行；§5 P4 模板 3→4 工作表 + 写入规则扩展（目录编码 + `DATA_TABLES`）；**新增 §5.1「数据表下钻与全量查询」两功能块六要素表**；§6 错误提示规则补 4 类（文件级「数据表」表头缺失 / 行级必填与表类型枚举 / 汇总级双区段统计 / 结果级数据表张数）；§8 增加 v1.5.1 变更摘要
- 权威 `PRD-基础库专题库数据地图.md` 升 v1.5.1：§19.3 模板四工作表与写入规则扩展，新增 §21 变更记录；`03-prd-功能清单.md` 47→49 条（F-048/F-049，F-016 改三 Tab）、`03-prd-preview.html`、`project-spec.md`（PRD v1.5.1 ↔ build-2.4.7、R-13）同步
- 对照页 `prototype-prd.html`：P2 补 F-048/R-13/图标映射，P4 补 F-049/三 Tab/四工作表/全量查询/R-13 与两条元素映射，RULES 增 R-13、R-11 升 2.4.7，全模块六要素区块与全局口径参考同步 v1.5.1 / R-01–R-13

## 验证记录（2026-11-24，build-2.4.7 / r11 数据表下钻 + 全量查询 + 库卡图标 + 模板 4 sheet）

- `node verify-rules.js`：**R-01–R-13 13/13 PASS**（R-11 升 2.4.7；R-13 断言 6 个模板 xlsx 均含 `xl/worksheets/sheet4.xml` 即 4 工作表，且过滤 Office 打开时产生的 `~$` 临时锁文件）；两页内联 JS 与校验脚本 `node --check` 通过；对照页注入探针 P2/P4 共 14/14 命中（F-048/F-049/三 Tab/四工作表/全量查询/R-13/v1.5.1 六要素/RULES 13 条）
- 模板生成脚本 `gen_r9_tpl.py` 重新生成六库 xlsx；`check_tpl_r11.py` 校验 6/6 均为「目录导入 / 字段明细 / 数据表 / 填写说明」四 sheet，数据表表头 11 列正确
- **同源 http harness 端到端 23/23 PASS**：① 六库卡图标 SVG×6 + halo×6 ② `LIB_ICONS` 六 key 齐全 ③ `DATA_TABLES` 派生源表/治理表 ④ 目录详情抽屉三 Tab 可切换且数据表 pane 有行 / 字段 pane chips ⑤ 全量弹窗行数 = 全量表数、按「养老保险」搜索命中数正确 ⑥ 4-sheet fixture 解析（目录 2 行 + 数据表 3 行全部 ok）⑦ `impCommit()` 写入 3 张导入表（源表/治理表/结果表 type 正确）⑧ 目录编码 `POP-TEST-001` 存入台账 ⑨ 导入表按目录编码关联抽屉 ⑩ 导入表进入全量查询 ⑪ build 标识 2.4.7
- **排查记录**：`parsed.sheets` 为表名字符串数组，r11 初版误用 `find(s=>s.name==='数据表')` 恒 false（与 r9 目录 sheet 同款问题，目录行靠 `||sheets[0]` 兜底才未暴露）；已统一改为 `parsed.sheets.includes('数据表')`。另截图时 headless 虚拟时间快进 JS 但 CSS 动画按真实时间推进，抽屉/页面截图抓到动画起点 → 临时 shot 页注入 `animation:none/transition:none` 样式后取终态
- 截图目检：`n4r20_libicons.png`（六库卡右上角虚线环内各嵌库元素图标、无文字重叠）、`n4r21_dir_drawer.png`（目录详情三 Tab、数据表 Tab 选中、源表/治理表两行）、`n4r22_all_data.png`（全量弹窗居中、搜索框 + 全量统计「全部 72 张（源表 36 · 治理表 36）」+ 表格无溢出）
- 临时 harness / 探针 / fixture / shot 页与本地 8899 服务全部清理

## PRD v1.6.0 关联（r12，位于上两级 `output/基础库专题库大屏/`）

- `03-prd.md` 升 v1.6.0：§0 版本绑定（功能点 49→42，F-001–F-007 随 P1 移除）；**§2 改为「P1 总览驾驶舱展示入口已移除」存档说明**（原 §2.1–§2.9 六要素转 details 存档）；§5 P4 模板单工作表 12 列 + 写入规则 v1.6.0（一律「已接入」/ items / start/end）；**新增 §5.2 目录抽屉「数据时间范围」**；§5.1 数据来源改「仅目录台账派生」；§6 错误提示规则修订单工作表口径（新增日期格式行级校验、示例/说明行跳过）；§8 增加 v1.6.0 变更摘要
- 权威 `PRD-基础库专题库数据地图.md` 升 v1.6.0：§19.3 修订单工作表与写入规则，新增 §22 变更记录；`03-prd-功能清单.md` 49→42 条（F-001–F-007 移除占位行、F-046/F-047 单 sheet、F-049 加数据时间范围）、`03-prd-preview.html`（42/13 + R-11 2.4.8）、`project-spec.md`（v1.6.0 ↔ build-2.4.8、R-13 修订、P1/P2 行说明）同步
- 对照页 `prototype-prd.html`：页脚 v1.6.0 / build-2.4.8；PAGES 删 P1（9 页）；P2 补「系统默认页」验收项；P4 六要素全量改单 sheet 口径（含数据时间范围映射行）；RULES R-11 升 2.4.8、R-12/R-13 修订单 sheet

## 验证记录（2026-11-24，build-2.4.8 / r12 总览入口移除 + 模板单 sheet 化）

- `gen_r9_tpl.py` 重写为单工作表「数据目录」（12 列 + 3 示例/库 + 18 行说明随 sheet）；`check_tpl_r12.py` 校验 **5/6 通过**（人口库模板被面板预览锁定 SKIPPED(locked)，仍为旧 4-sheet 版——用户关闭预览后重跑即恢复 6/6）
- **同源 http harness 端到端 19/19 PASS**：① 默认页 `currentPage='page-libraries'` ② 主导航无「总览驾驶舱」按钮 ③ `page-overview` section 与 `PAGE_META` 条目保留（hash 直达不崩）④ CSV fixture 解析 3 行（1 有效 · 1 目录+单位重复 · 1 频率+日期非法）、跳过示例与说明行 2 行 ⑤ 确认导入写入 `st='已接入' / start / end / items` ⑥ 按钮态「确认导入（1 行 → …）」→「已导入」⑦ 真实法人库模板解析 18 行全跳过、0 有效、确认禁用 ⑧ 坏表头文件「解析失败」提示 ⑨ 导入目录抽屉展示「数据时间范围 2020-01-01 ~ 2026-01-01」⑩ `LIB_ICONS` 六 key ⑪ `DATA_TABLES` 72 张（仅派生）⑫ 全量弹窗与 `btnAllData` 保留 ⑬ buildTag build-2.4.8
- `node verify-rules.js`：**12/13 PASS**（R-01–R-12 全过、R-11 升 2.4.8；R-13 因人口库模板未重生成 FAIL，重生成后自动恢复）；`dump_pages.py` 重抓 10 页后 `verify.py` **TOTAL FAIL: 0**（P1 section 存档保留使 R-01–R-10 渲染断言不受入口移除影响）；两页内联 JS `node --check` 通过
- **排查记录**：r11 遗留 `impMapTblHeader` 仅调用无定义的潜在 ReferenceError（「数据表」sheet 解析段），随 r12 删除该段自然消除；模板 sheet 底部 18 行填写说明会被解析为数据行报错 → `impOnFile` 增加 `isGuide` 正则（「填写说明 / 一、二、三、 / N. / ·」起始文本）静默跳过并计入「自动跳过示例/说明行」
- 截图目检：`n4r23_r12_libraries.png`（默认页库资源门户、导航无总览、六库卡右上角图标齐全、布局无异常）、`n4r24_r12_import.png`（Excel 导入弹窗居中完整、build-2.4.8、目标库/文件选择/状态区正常）
- 临时 harness / shot 页 / 8899 服务全部清理

## PRD v1.7.0 关联（r13，位于上两级 `output/基础库专题库大屏/`）

- `03-prd.md` 升 v1.7.0：§0 功能点 42→43（F-050）；§5 模板双工作表 + 写入规则 v1.7.0（字段合并写入 items）；**新增 §5.3 字段明细导入六要素**；§6 补字段相关错误行（文件级表头 / 行级必填·未登记·重复·长度）；§8 增加 v1.7.0 变更摘要
- 权威 `PRD-基础库专题库数据地图.md` 升 v1.7.0：§19.3 修订双工作表与字段写入规则，新增 §23 变更记录；`03-prd-功能清单.md` 42→43 条（F-050）、`03-prd-preview.html`（43 条 + R-11 2.4.9）、`project-spec.md`（v1.7.0 ↔ build-2.4.9、R-13 再修订）同步
- 对照页 `prototype-prd.html`：页脚 v1.7.0 / build-2.4.9；P4 六要素全量改双工作表口径（F-050 / 字段合并 / map 弹窗行）；RULES R-11 升 2.4.9、R-12/R-13 再修订

## 验证记录（2026-11-24，build-2.4.9 / r13 字段明细 sheet + 字段导入全链路）

- `gen_r9_tpl.py` 增 FLD_HDR 6 列 + 每库 11 条示例字段（FLD_SAMPLES，首目录 5 字段、其余各 3）+ 双 sheet HOWTO；六库模板 **6/6 生成**（r12 悬留解除：人口库模板已随本轮重生成）；抽检法人库 sheet2 表头 6 列正确
- **同源 http harness 端到端 23/23 PASS**：① 默认页/导航/section 保留（D1×4）② CSV fixture 回归（3 行 1 有效 2 异常 2 跳过 + 「未含「字段明细」工作表」提示 + 确认启用）③ CSV 提交写入 st/start/items ④ 真实法人双 sheet 模板：目录 24 行全跳过 + 字段 11 行全跳过（引用示例目录）+ 确认禁用 ⑤ 坏表头 CSV 失败 ⑥ **字段明细坏表头 xlsx 文件级失败** ⑦ **字段 fixture：5 行（2 有效 / 2 异常 / 1 跳过）、错误原因（重复/长度非数字/所属目录未登记）、导入前预览双区段渲染、按钮「目录 1 行 · 字段 2 条」、提交后 items=['字段A','字段F'] 去重合并正确、状态含「字段登记 2 条」** ⑧ 抽屉数据时间范围 + 字段 chips 含合并字段 ⑨ LIB_ICONS 6 / DATA_TABLES 72 / 全量弹窗 / build-2.4.9
- `node verify-rules.js`：**R-01–R-13 13/13 PASS**（R-11 升 2.4.9；R-13 改双 sheet 二进制检查——sheet1+sheet2 存在且无 sheet3，含 `impMapFldHeader`/`idx['字段名称']`/`idx['字段类型']`/`idx['字段长度']`/`sheets.includes('字段明细')` 断言）；`dump_pages.py` 重抓后 `verify.py` **TOTAL FAIL: 0**；两页内联 JS `node --check` 通过
- **排查记录**：① 块注释内列名分隔 `*/` 提前闭合注释致语法错误 → 改顿号分隔；② `impPreview` 拼接 `rows.length?A:B+字段区段` 三元优先级致字段区段只绑定 false 分支（状态/按钮有字段统计但预览缺失）→ 探针量 `innerHTML` 401→1836 定位，三元整体加括号根治 + harness 补断言；③ `isGuide` 由目录循环局部提升至顶层供字段行复用；④ 字段 sheet 全跳过时不再误显示「未含「字段明细」工作表」
- 截图目检：`n4r25_r13_libraries.png`（默认页库资源门户、导航无总览、build-2.4.9）、`n4r26_r13_import_fields.png`（导入弹窗双区段预览：目录区段 + 字段明细预览 5 行、异常行标红原因、build-2.4.9）
- 临时 harness / fixture / shot 页 / 8899 服务全部清理

## PRD v1.7.1 关联（r14，位于上两级 `output/基础库专题库大屏/`）

- `03-prd.md` 升 v1.7.1：§0 版本绑定（PRD v1.7.1 ↔ build-2.4.10）；§5 ③ 字段类型建议改英文枚举（varchar / int / decimal / date / datetime / boolean / text，金额用 decimal；varchar 为最大长度、int / decimal 为精度）；§5.3 功能描述补英文类型名；§8 增加 v1.7.1 变更摘要
- 权威 `PRD-基础库专题库数据地图.md` 升 v1.7.1：§19.3 补字段类型英文口径，**新增 §24 变更记录**；`03-prd-功能清单.md`（F-046/F-050 文案补英文类型）、`03-prd-preview.html`（v1.7.1 / 2.4.10 + R-11 / R-13 行）、`project-spec.md`（v1.7.1 ↔ build-2.4.10、R-13 加 r14 修订）同步
- 对照页 `prototype-prd.html`：页脚 v1.7.1 / build-2.4.10；P4 F-050 补英文类型名；RULES R-11 升 2.4.10、R-12/R-13 加 r14 修订

## 验证记录（2026-11-24，build-2.4.10 / r14 字段类型改英文类型名）

- `gen_r9_tpl.py` 的 FLD_SAMPLES 类型由中文枚举改英文（字符→varchar / 数值→int / 日期→date / 日期时间→datetime / 金额→decimal），HOWTO 类型建议与长度口径同步；六库模板 **6/6 重生成**（双工作表结构不变），按 `<row>` 分组抽检法人库 sheet2 类型列 `varchar / decimal / date` 确认写入
- **同源 http harness 25 项断言全绿**：D1 默认页/导航/section 保留（4 项）、T1 CSV fixture 3 行 1 有效 2 异常 2 跳过 + 「未含字段明细」提示 + 确认启用、T2 提交写入 st/start/items、T3 真实法人模板目录 24 行 + 字段 11 行全跳过且禁用确认 + **buildTag build-2.4.10**、T4 坏表头 CSV 失败、T7 字段坏表头 xlsx 文件级失败、T6 字段 fixture 5 行（2 有效 / 2 异常 / 1 跳过，英文类型 varchar/int）、错误原因（重复/长度非数字/所属目录未登记）、导入前预览双区段、按钮「目录 1 行 · 字段 2 条」、提交后 items=['字段A','字段F'] 去重合并、状态含「字段登记 2 条」、T5 抽屉数据时间范围 + 字段 chips、D2 LIB_ICONS 6 / DATA_TABLES 72 / 全量弹窗
- `node verify-rules.js`：**13/13 PASS**（R-11 升 build-2.4.10；R-13 追加英文类型断言——手写 xlsx sheet 内容 deflate 压缩，按 zip 中央目录 + 本地头 `inflateRawSync` 解出 sheet2.xml 后校验，每库含 varchar、六库合并覆盖 varchar/int/decimal/date/datetime）；`index.html` 与 `prototype-prd.html` 内联 JS `node --check` 通过
- **排查记录**：① 抽检按「全文档每 6 个 `<t>` 取 1」取列错位误判类型未写入（按 `<row>` 分组重抽排除）；② verify-rules 单次 R-03 FAIL 为无头 Chrome 渲染时序抖动（KPI 计数动画未完成即 dump-dom，复跑两次均 13/13）→ 渲染环节加最多 3 次重试根治，连续 5 次复跑 13/13；③ R-13 初版英文断言直接搜 xlsx 二进制明文失败（sheet 内容压缩），改 zip 解压后校验；④ 各库示例字段类型集合不同（仅人口库含 datetime），断言按「每库 varchar + 六库合并覆盖全枚举」设计
- 截图目检：`n4r27_r14_libraries.png`（默认页库资源门户、导航无总览、六库图标齐全）、`n4r28_r14_import_fields.png`（导入弹窗 build-2.4.10、字段明细预览 5 行显示 varchar / int 英文类型、异常行标红原因完整）
- 临时 harness / fixture / shot 页 / 8899 服务全部清理

## PRD v1.7.2 关联（r15，位于上两级 `output/基础库专题库大屏/`）

- `03-prd.md` 升 v1.7.2：§0 版本绑定（PRD v1.7.2 ↔ build-2.4.11）；§5 ③ 列清单改 9 列（去掉主要字段 1–3）、写入规则改为「items 仅由「字段明细」sheet 合并」；§5.3 去重口径去主要字段来源；§6 文件级错误文案修为「数据目录 9 列 + 可选字段明细 6 列双工作表」；§8 增加 v1.7.2 变更摘要
- 权威 `PRD-基础库专题库数据地图.md` 升 v1.7.2：§19.3 模板与写入规则改 9 列口径，**新增 §25 变更记录**；`03-prd-功能清单.md`（F-046/F-047 文案）、`03-prd-preview.html`（v1.7.2 / 2.4.11 + R-11/R-12/R-13 行）、`project-spec.md`（v1.7.2 ↔ build-2.4.11、R-13 修订）同步
- 对照页 `prototype-prd.html`：页脚 v1.7.2 / build-2.4.11；P4 F-046 / scene / mod.src / stat 全量改 9 列口径；RULES R-11 升 2.4.11、R-12/R-13 加 r15 修订

## 验证记录（2026-11-25，build-2.4.11 / r15 「数据目录」去主要字段 1–3）

- `gen_r9_tpl.py` 的 CAT_HDR 12→9 列、六库示例行去掉 3 个主要字段值、HOWTO 删除主要字段条款、列宽 12→9 项；六库模板 **6/6 重生成**，抽检 sheet1 表头 9 列、无「主要字段」字样；sheet2 6 列与英文类型不变
- **同源 http harness 26 项断言全绿**：D1 默认页/导航/section 保留（4 项）、T1 9 列 CSV fixture（3 行 1 有效 2 异常 2 跳过 + 未含字段明细提示 + 确认启用）、**T2 CSV 导入后 items=[]（主要字段不再写入）、st/start 正确**、T3 真实法人 9 列模板目录 23 行 + 字段 11 行全跳过且禁用确认 + **模板弹窗 9 列文案且无「主要字段」+ buildTag build-2.4.11**、T4 坏表头 CSV 失败、T7 字段坏表头 xlsx 文件级失败、T6 字段 fixture 5 行（2 有效 / 2 异常 / 1 跳过，varchar/int）、导入前预览双区段、按钮「目录 1 行 · 字段 2 条」、提交后 items=['字段A','字段F'] 合并正确、状态含「字段登记 2 条」、T5 抽屉数据时间范围 + 字段 chips、D2 LIB_ICONS 6 / DATA_TABLES 72 / 全量弹窗
- `node verify-rules.js`：**13/13 PASS**（R-11 升 build-2.4.11；R-13 修订 9 列口径并断言 `idx['主要字段1']` / `f1:get(map.f1)` / `items:[r.f1` 已移除；sheet2 英文类型解压断言保留）；`index.html` 与 `prototype-prd.html` 内联 JS `node --check` 通过；`dump_pages.py` 重抓 10 页后 `verify.py` **TOTAL FAIL: 0**
- 截图目检：`n4r29_r15_libraries.png`（默认页库资源门户、导航无总览、六库图标齐全）、`n4r30_r15_import_fields.png`（导入弹窗 build-2.4.11、目录 + 字段明细双区段预览、字段类型 varchar / int、异常行标红原因完整）
- 临时 harness / fixture / shot 页 / 8899 服务全部清理

## PRD v1.7.3 关联（r16，位于上两级 `output/基础库专题库大屏/`）

- `03-prd.md` 升 v1.7.3：§0 版本绑定（PRD v1.7.3 ↔ build-2.4.12）；§5 ③ 模板 9 列全部必填 / 字段明细 5 列必填 + 全要素必填条款、④ 写入规则（9 项逐项校验、`last` 入库、精确到个位、三视图即时刷新）；§5.3 字段类型/长度必填；**新增 §5.4 全要素必填与展示数据映射六要素**；§6 新增全要素缺失行级与汇总级文案；§7 P5/P8 口径；§8 增加 v1.7.3 变更摘要
- 权威 `PRD-基础库专题库数据地图.md` 升 v1.7.3：§19.3 全要素必填与展示映射口径，**新增 §26 变更记录**；`03-prd-功能清单.md`（F-046/F-047/F-050）、`03-prd-preview.html`（v1.7.3 / 2.4.12 + R-11/R-12/R-13 行）、`project-spec.md`（v1.7.3 ↔ build-2.4.12、R-13 r16 修订）同步
- 对照页 `prototype-prd.html`：页脚 v1.7.3 / build-2.4.12；P4 头部 / scene / funcs / accept / mod / map 全量改全要素必填与展示映射口径（新增单位列表 / 更新机制两条元素映射）；P5 F-020 与 accept 补更新机制合并；RULES R-11 升 2.4.12、R-12/R-13 加 r16 修订
- `verify-rules.js`：R-11 升 build-2.4.12 / PRD v1.7.3；R-13 追加 9 项全要素必填源码断言、5 项展示映射源码断言（`function impRowsOf` / `function allUnits` / `impRowsOf(u.n)` / `imp=!!d.imported` / `upRows`）与六库模板 9 列 / 5 列全星标表头解压断言，保留 zip inflate sheet2 英文类型断言与最多 3 次渲染重试

## 验证记录（2026-11-25，build-2.4.12 / r16 全要素必填 + 展示映射）

- `gen_r9_tpl.py` 的 CAT_HDR 9 列全部标 \*、FLD_HDR 字段类型*/字段长度* 标 \*、HOWTO 新增全要素必填条款与必填说明、导入规则条款改「全部要素校验通过方可导入 + 导入成功后大屏基于完整数据展示接入与治理情况」；六库模板 **6/6 重生成**
- **同源 http harness 41 项断言全绿**：D1 默认页/导航/section 保留（4 项）、T1 全星标 9 列 CSV fixture（3 行 1 有效 2 异常 2 跳过 + 未含字段明细提示）、**T8 重复行「目录在文件内重复」+ 缺失行「缺数据开始时间|缺数据截止时间|缺最后更新日期」逐项提示且预览标红**、T2 有效行入库含 `last='2026-01-02'` 且异常行 `测试目录B` 不入库、T3 真实法人模板目录 23 行 + 字段 11 行全跳过且模板弹窗「9 列全部必填 / 阻止导入」、buildTag build-2.4.12、T4 坏表头 CSV 失败、T7 字段坏表头 xlsx 文件级失败、T6 字段 fixture 5 行（2 有效 / 3 异常 / 1 跳过，标红 `缺字段长度|字段在文件内重复` / `字段长度非数字` / `所属目录未登记或为异常行`）、提交后 items=['字段A','字段F']、T5 抽屉数据时间范围 / chips / 最后更新 / **无 undefined** / 「待治理登记」、**T9 `allUnits().length>UNITS.length` / `impRowsOf('省测试委').length=2` / 单位卡片「含导入」/ 目录表「测试目录X + 导入」/ 统计含导入 / accTitle 省测试委**、**T10 导入省医保局完整目录后 `#upCnt='3 条目录'`（快照 2 + 导入 1）、`#updateBody` 含「医保结算清单目录（导入）」**、D2 LIB_ICONS 6 / DATA_TABLES 72 / 全量弹窗
- `node verify-rules.js`：**13/13 PASS**；`index.html` / `prototype-prd.html` 内联 JS 与 `verify-rules.js` 均 `node --check` 通过；`verify.py` **TOTAL FAIL: 0**
- 截图目检：`n4r31_r16_libraries.png`（默认页六库门户、无 undefined）、`n4r32_r16_import_fields.png`（导入弹窗 build-2.4.12、全要素校验异常行标红「缺字段长度 / 字段在文件内重复」等）、`n4r33_r16_access_merged.png`（数据接入页省测试委「含导入 1」、目录表「测试目录X 导入」、统计含导入、数据量构成标注）、`n4r34_r16_update_merged.png`（治理-更新机制「3 条目录」含导入目录、频率/最后更新/状态完整）
- **已知边界**：治理规则 117 与治理成果 452/7/851/45 仍为快照口径（R-05/R-07），导入数据驱动数据接入台账 / 单位接入视图 / 目录治理下钻 / 更新机制，不改动规则与成果统计；导入仅内存态，刷新还原快照
- 临时 harness / fixture / shot 页 / 8899 服务全部清理


## PRD v1.7.4 关联（r17，位于上两级 `output/基础库专题库大屏/`）

- `03-prd.md` 升 v1.7.4：§0 版本绑定（PRD v1.7.4 ↔ build-2.4.13）；§5 ③ 表头完整条款；§5.4 功能描述 / 统计规则 / 异常空值补表头级口径（`CAT_COLS` / `FLD_COLS` 前置校验、缺列文件级阻止）；§6 新增 2 行文件级表头缺列错误文案；§8 新增 v1.7.4 变更摘要（含 zip 旧包顺带修复）
- 权威 `PRD-基础库专题库数据地图.md` 升 v1.7.4：§19.3 表头级全要素条款 + 表头级前置校验写入规则 + 错误提示规则补表头缺列，**新增 §27 变更记录**；`03-prd-功能清单.md`（F-046/F-047/F-050 补表头级）、`03-prd-preview.html`（v1.7.4 / 2.4.13 + F-046/F-047/F-050 + R-11/R-12/R-13 行）、`project-spec.md`（v1.7.4 ↔ build-2.4.13、R-13 r17 修订）同步
- 对照页 `prototype-prd.html`：页脚 v1.7.4 / build-2.4.13；P4 scene / funcs / accept / exception / mod 补表头级全要素；RULES R-11 升 2.4.13、R-12/R-13 加 r17 修订
- `verify-rules.js`：R-11 升 build-2.4.13 / PRD v1.7.4；R-13 name 追加「表头级全要素（PRD v1.7.4）」并新增 `CAT_COLS` / `FLD_COLS` 与两条文件级错误文案源码断言

## 验证记录（2026-11-25，build-2.4.13 / r17 表头级全要素）

- `node verify-rules.js` **13/13 PASS**（R-11 升 build-2.4.13；R-13 name 加表头级全要素 + 4 条新源码断言；r16 必填 / 展示映射 / 模板解压断言全保留）
- **同源 http harness 37 项断言全绿**：H1 全星标表头文件正常解析（目录 3 行 1 有效 + 字段区段）、**H2 缺「最后更新日期*」列文件级阻止（错误提示含缺失列名「表头缺少「最后更新日期*」列」、导入状态置空、确认按钮禁用）**、H3 缺「记录条数*」列提示（列出全部缺失列）、**H4 字段明细缺「字段长度*」列文件级阻止**；T1–T10/D2 全回归（r16 行级校验、展示映射 impRowsOf/allUnits、更新机制 #upCnt、模板弹窗全跳过均不受影响）
- fixture 新增 `_r13_fixture_misslen.xlsx`（字段明细表头仅 4 列、无「字段长度*」）
- 截图目检：`n4r35_r17_import_header_miss.png`（导入弹窗表头缺列红字提示、列出缺失列名）、`n4r36_r17_tpl_modal.png`（模板弹窗填写说明含表头完整条款）
- `node --check` 通过；`verify.py` TOTAL FAIL: 0


## PRD v1.7.5 关联（r18，位于上两级 `output/基础库专题库大屏/`）

- `03-prd.md` 升 v1.7.5：§0 版本绑定（PRD v1.7.5 ↔ build-2.4.14）；§5 ③ 模板 14 列与 5 新列口径、④ 写入规则（按填报值登记接入状态，req/agreed/src/gov 入库，填「—」显示待治理登记占位）；§5.4 功能描述 / 统计规则（CAT_COLS 14 列、行级 14 项）/ 异常空值；§6 文件级 14 列文案 + 行级 5 项缺失 + 接入状态枚举 + 治理表名「—」展示级；§7 P8；§8 新增 v1.7.5 变更摘要
- 权威 `PRD-基础库专题库数据地图.md` 升 v1.7.5：§19.3 模板 14 列 / 下发定位 / 写入规则 / 错误提示规则，**新增 §28 变更记录**；`03-prd-功能清单.md`（F-046/F-047 14 列）、`03-prd-preview.html`（v1.7.5 / 2.4.14 + F/R 行）、`project-spec.md`（v1.7.5 ↔ build-2.4.14、R-13 r18 修订）同步
- 对照页 `prototype-prd.html`：头部注释 / 页脚 v1.7.5 / build-2.4.14；P4 prd / scene / funcs / accept / exception / mod 补 14 列与新要素展示；RULES R-11 升 2.4.14、R-12/R-13 加 r18
- `verify-rules.js`：R-11 升 build-2.4.14 / PRD v1.7.5；R-13 追加 5 新列映射、5 项必填、`IMP_ST` 枚举、`agreed:c.agreed` 与六库模板 14 列全星标表头解压断言（保留 sheet2 英文类型断言与最多 3 次渲染重试）

## 验证记录（2026-11-25，build-2.4.14 / r18 模板 14 列对齐原型展示要素）

- `node verify-rules.js` **13/13 PASS**；六库模板 14 列全星标表头解压校验 6/6 + `导入模板.zip` 6/6 重打包
- **同源 http harness 36 项断言全绿**：H1 14 列 fixture（3 行 1 有效 2 有效 1 异常：缺接入状态、`gov=—` 合法）、T1 req/agreed/src/gov/st 入库与 items 合并、T2 抽屉真实源表/治理表/约定时间/需求字段且无「待治理登记」、T3 数据表派生 2 张（源表+治理表、编码「—」）、T4 `gov=—` 派生 1 张并显示占位、H2 缺「物理表/源表名*」文件级阻止（提示 14 列、impState=null、按钮禁用）、H3 缺「约定更新时间*」、H5 模板弹窗 14 列文案、T5 更新机制 agreed 与 upCnt、T6 新单位台账与接入状态列、D1 DATA_TABLES 快照 72 不变
- fixture：`_r18_fixture_ok.xlsx`（14 列 3 目录行 + 2 字段行）/ `_r18_fixture_miss_src.xlsx` / `_r18_fixture_miss_agreed.xlsx`
- 截图目检：`n4r37_r18_drawer_full.png`（导入目录抽屉全要素：源表 `ods_rk_cs_a1b2c3d4`、治理表 `dwd_rk_cs_xx`、约定更新时间「每日2点」、需求字段 6 项）、`n4r38_r18_tpl_modal.png`（模板弹窗 14 列文案 + build-2.4.14）
- `node --check` 通过；`verify.py` TOTAL FAIL: 0


## PRD v1.7.6 关联（r19，位于上两级 `output/基础库专题库大屏/`）

- **需求转向（用户指令 2026-11-25）**：「不要管之前的需求，现在只是做模板，是为了有些单位无法提供数据，只提供各项指标数值，用于省里做展示用」；Gate 确认：① 模板结构 = 保留目录表 + 加指标表（三工作表）；② 模板份数 = 一个通用模板（六库合一）；③ 原型 = 同步适配（导入指标数值后大屏按填报值展示，厅局填什么就展示什么）。
- `03-prd.md` 升 v1.7.6：§0 版本绑定（PRD v1.7.6 ↔ build-2.4.15）；§6 新增「指标数值」7 行错误提示规则（文件级表头缺列 31 列 / 仅有指标 sheet 跳过目录解析 / 行级库名称与数值 / 示例行与未填报预填行跳过 / 汇总级与结果级指标段）；§7 表后插入 v1.7.6 展示映射修订注（P2/P3/P6/P7 按填报值替换、列表型明细保持快照、R-05/R-07 边界待 Gate 确认）；§8 新增 v1.7.6 变更摘要
- 权威 `PRD-基础库专题库数据地图.md` 升 v1.7.6：§19.3 新增「v1.7.6 通用版模板与指标数值导入」bullet（31 列明细 + 展示替换范围），**新增 §29 变更记录**；`03-prd-功能清单.md`（F-046/F-047 通用版与指标口径）、`03-prd-preview.html`（v1.7.6 / 2.4.15 + F/R 行）、`project-spec.md`（v1.7.6 ↔ build-2.4.15、R-12 通用版模板 / R-13 r19 修订）同步
- 对照页 `prototype-prd.html`：头部注释 / 页脚 v1.7.6 / build-2.4.15；P4 prd / scene / funcs（F-046/F-047 重写）/ input / output / exception / accept / mod（src/stat/upd 补指标与五视图）；RULES R-11 升 2.4.15、R-12/R-13 加 r19
- `gen_r9_tpl.py` 整体重写（通用版）：输出单文件 `templates/导入模板-通用版.xlsx`（三工作表）+ zip 重打包；`gen_r19_fixtures.py`（指标 fixture 3 件：ok / 数值异常 / 表头缺列）与 `gen_r18_fixtures.py`（目录回归）保留可复现
- `verify-rules.js`：R-11 升 build-2.4.15 / PRD v1.7.6；R-12「六库模板」→「通用版模板」；R-13 name 删 F-051（功能点保持 43 条，r19 作为 F-046/F-047 修订）并追加指标解析与展示替换源码断言 + 通用版模板解压断言

## 验证记录（2026-11-25，build-2.4.15 / r19 通用版模板 + 指标数值驱动展示）

- **r19 微调（用户指令「覆盖范围，一类一行」；二次纠正后定稿）**：通用版模板「指标数值」表覆盖范围改为**物理行拆分**——每个覆盖类别单独占一个表格行、D 列每格只放一个类别（首版误做「单元格内换行堆叠」，WPS 中因行高未撑开挤成一坨，用户截图指正后改为拆行）；六库按类别展开为 21 行（人口 5 / 法人 3 / 信用 4 / 地理 4 / 婚姻 2 / 死亡 3），识别要素（库名称/库类型/牵头单位）每行重复，示例行同样一类一行且仅首行带权威数值；去掉 wrapText 样式（不再需要单元格内换行）。**数值填写规则**：库级指标数值只需在本库任意一行（建议首行）填写一次，其余类别行数值列留空——导入按库名称匹配、`filled===0` 行自动跳过，不会重复计数。HOWTO 同步写明「一类一行、D 列每格一个类别、数值只填一次」；`gen_r9_tpl.py` 重生成 + zip 重打包（1 member，testzip 通过）。**verify-rules.js R-13 新增断言**：D 列文本单元格 ≥22 个、每格不含顿号/逗号/换行、8 类代表类别均独立成格（防止回退）。**复验**：verify-rules **13/13 PASS**；新建 r20 端到端 harness（按「一类一行」模板填写的 fixture，经 8899 HTTP + 无头浏览器真实走导入）**19/19 全绿**——有效指标行仅 1 行（人口库首行，27 项数值，`ok=true`）、其余 25 行静默跳过、`IMP_LIB_SUM` 只写入 1 库、`pop.libRecords=999999999`、P3 KPI 显示 999,999,999、回执「指标导入 1 库」。原型 **零改动**

- `node verify-rules.js` **13/13 PASS**；通用版模板解压断言（1 member 含「通用版」、sheet1 31 列星标、sheet2 14 列星标、sheet3 5 必填星标与英文类型、「按库名称匹配」）
- **同源 http harness 44 项断言全绿**：T1 指标映射 4（`impMapIndHeader` 31 列 / 库名称 / 健康度 / 已发布服务数）；T2 解析入库 9（ok fixture：6 预填行 5 跳过 + pop 行 27 项指标全部入库 `IMP_LIB_SUM.pop`）；T3 展示替换 18（P2 库卡应建目录数 60、P3 六 KPI 999,999,999/15/2,000+1,800/200+150+2,100/200+150+50+20·单位填报/1,000/200,000,000/6、P3 四模块 15·77·2,000、30·3·12、150·50·20、500·9·900·50、1,000·200,000,000·9·2、P6 五 KPI 500/9/900/50/15、P7 四 KPI 1,000/200,000,000/9/2）；T4 数值异常 3（`库接入数据量=abc` 行级标红阻止）；T5 表头缺列 2（缺「已发布服务数*」文件级阻止 + 提示「全部 31 列要素」）；T6 目录回归 6（r18 目录 fixture 导入正常且「指标保持不被覆盖」、接入状态 badge 按填报值展示）；D 系列回归通过
- fixture：`gen_r19_fixtures.py` → `_r19_fixture_ind_ok.xlsx`（31 列 + 示例行 + 6 预填行，pop 全填）/ `_r19_fixture_ind_bad.xlsx` / `_r19_fixture_ind_hdr.xlsx`；`gen_r18_fixtures.py` → `_r18_fixture_ok.xlsx`（目录回归）
- 截图目检：`n4r39_r19_p3_before.png`（快照态：433,120,247 / 12 / 1,023 / 117 / 746 / 125,740,861 + 四模块快照值）、`n4r40_r19_p3_after.png`（导入后全部填报值替换正确）、`n4r41_r19_tpl_modal.png`（通用版单链接 + build-2.4.15 + 三工作表文案）
- `node --check` 通过；`verify.py` TOTAL FAIL: 0（8 个主页面 DOM 已按 build-2.4.15 重新 dump）
- **r19 微调二（用户指令「示例保留人口基础库就可以，其他的删掉」）**：模板示例仅留人口库一组（数据目录 3 条 + 字段明细 13 条，补「年龄 int」「登记体重 decimal」保住 varchar/int/decimal/date/datetime 五类型示范），其余五库示例删除；`verify-rules.js` R-13 增防回退断言（s2 不含其余五库名称、s2 恰含 3 条「（示例）」目录且均为人口库目录）；复验：解压校验（s1 一类一行 65 行结构不变、s2 仅 3 条人口示例、s3 13 条字段类型全枚举）+ verify-rules **13/13** + 端到端 harness（8899 同源 + headless Chrome，模板自身导入：目录/字段/指标有效行均 0、自动跳过 112 行、无异常行、`IMP_LIB_SUM` 不被污染）；原型零改动
- **已知边界**：规则列表 / 场景列表 / TOP5 接口明细等列表型明细保持快照；R-05/R-07 边界修订待 Gate 确认；导入仅内存态；`DATA_TABLES` 全量弹窗仍为快照 72 张

## PRD v1.8.0 关联（N4 r20 大迭代，2026-11-25）

**用户指令四项**：① 数据接入模块去掉字段结构预览/数据量构成模块、数据目录 20 条分页、目录详情去掉物理表/源表、治理表、数据表 Tab；② 数据治理规则列表细化到字段；③ PRD 完整更新（原则「所有数据来源都是数据表的导入」）；④ 模板细化为 4 指标 sheet + 三行结构 + 信用库示例（Gate 确认：4 指标 + 字段明细共 5 sheet、覆盖范围一类一行、成果/场景全局一行、填报值替换未填保持快照）。

- `gen_r9_tpl.py` 完全重写：五工作表（数据接入 8 列全 \* / 数据治理 6 列全 \* / 治理成果 4 列 / 场景服务 4 列 / 字段明细 6 列前 5 \*）+ 统一三行结构（说明行 / 表头 s=1 / 数据行）+ 信用库示例；模板重生成 + zip 重打包
- `index.html` 升 build-2.4.16：accExtra 移除、DIR_PAGESZ 分页、抽屉两 Tab、impRuleSec 字段级规则区块、impOnFile 五 sheet 解析全量重写、impCommit 新提交逻辑、P3/P6/P7 per-key fallback、全局声明前移修 TDZ
- 文档链同步：03-prd.md v1.8.0（§0/§5/§5.1/§5.3/§5.4/§6/§7/§8）、权威 PRD §19.3 + 新增 §30、功能清单 F-046/F-047/F-016/F-019/F-022/F-027/F-049/F-050、preview、对照页、project-spec、本文件、state G23

### r20 验证记录

- `node --check` 通过
- `node verify-rules.js` **13/13 PASS**（R-11 build-2.4.16 / PRD v1.8.0；R-13 全量重写断言见上表 verify-rules.js 行）
- **同源端到端 harness 18 项断言全绿**（8899 同源 + headless Chrome dump-dom）：
  - T1 模板自身导入：36 行全部静默跳过（示例行统一规则）、无异常行、`IMP_LIB_SUM`/`IMP_ACH`/`IMP_SCENE` 不被污染
  - T2 真实数值 fixture（`gen_r20_fixture_v2.py` 保留复现）：六库接入指标入库（credit 应建目录数=99）、5 条字段级规则 XY-R101–R105 入 `IMP_GOV_RULES` 并渲染于治理页区块、治理成果 888/777/66/55 → P6 四 KPI 替换、场景服务 999/8888888/7/9 → P7 四 KPI 替换、字段明细 2 条合并至「企业职工基本养老保险参保信息|省人力资源社会保障厅」items、P2 信用库应建目录 13→99、P3 KPI data-to=432656920,12,1023,117,746,125740861（供数单位 12 / 治理规则 117 / 订阅 746 / TOP5 125,740,861 保持快照）
  - T4 分页：注入 27 条目录 → 2 页（每页 20 条）、翻页正确、单位切换重置第 1 页
  - T5 抽屉：两 Tab（目录信息 / 已接入字段 N）、物理表/源表行、治理表行、数据表 Tab 均不存在
- 临时 harness/fixture/结果文件已清理；8899 服务已停止
- **已知边界**：规则台账 117 / 场景列表 / TOP5 接口明细保持快照；治理成果/场景服务涉及供数单位的口径恒快照；导入仅内存态；`DATA_TABLES` 全量弹窗仍为快照口径；R-05/R-07 边界修订待 Gate 确认

## PRD v1.8.1 关联（N4 r21，2026-11-26）

**用户指令五项**：① 各模块明细展示区增加轮播能力；② 大屏不直接展示导入模板/导入入口，改空白区 3 连击隐藏入口；③ 数据治理页统计总数置顶/明细在下、移除「更新机制」Tab；④ 单位成果填报删除恒空「文档 —」+ 左侧板块丰富；⑤ 场景服务不展示「规划场景」、场景服务并入治理成果页、模板「治理成果」「场景服务」两 sheet 合并。

- `index.html` 升 build-2.4.17：`startCarousel`/`refreshCarousels`（caroTimers Map、溢出判定、行高步进、悬停暂停、隐藏容器跳过）+ 6 容器 `data-caro`（分页区不轮播）；`hiddenEntry` 三连击隐藏入口（删顶栏 `#btnTpl`/`#btnImport` 与 P2 内联按钮，2s 窗口、交互元素清零）；治理页 govSummary 置顶 + 「更新机制」Tab 移除；成果填报去「· 文档 —」；P3 规划场景移除；P7 删除、P6 合并「治理成果 · 场景服务」；**修复 r20 残留 `scOk is not defined`**（`hasValid=aOk||gOk||ahOk||fOk`）
- 模板重构为**四工作表通用版 v1.8.1**：「数据接入」8 列 /「数据治理」6 列 /「治理成果与场景服务」8 列全局一行（前 4 成果 + 后 4 场景，示例 452/851/45/7/746/125,740,861/5/8（示例））/「字段明细」；zip 重打包
- 文档链同步：03-prd.md v1.8.1（功能点 45，F-051/F-052 新增）、权威 PRD v1.8.1 + §31、功能清单 45 条、preview、对照页（PAGES 8 条，P7 删除）、project-spec、本文件、state G24

### r21 验证记录

- `node --check` 通过；`node verify-rules.js` **13/13 PASS**（R-11 build-2.4.17 / PRD v1.8.1；R-12 隐藏入口断言；R-13 全量重写——govSummary 置顶 / 无 updateView / 四 sheet S() / `parseGlobal('治理成果与场景服务'` / hasAch||hasScn / `const gvA=` / 无「· 文档 —」/ 轮播函数与 data-caro / 模板四 sheet 解压断言；模板目录过滤器排除 `_` 前缀 fixture）
- **同源端到端 harness 18 项 ALL-PASS**（`_r21_harness.html` 保留复现，8899 同源 + headless Chrome dump-dom）：
  - T1a 三连击开启导入浮板 / T1b 再次三连击收起 / T1c 浮板按钮点击不触发清零（按钮点击后等 2s 窗口过期）
  - T2a 无 page-scenes / T2b 导航含合并页「治理成果 · 场景服务」/ T2c 无更新机制 Tab / T2d govSummary 置顶
  - T3 原模板导入全跳过（示例行规则），**顺带揪出 r20 残留 `scOk is not defined` 真 bug**（被 impCommit 完成文案掩盖，仅原模板路径暴露）
  - T4a-g fixture（`_r21_fixture.xlsx`，`_mk_fixture.py` 生成保留复现）：impGo 可用 / svcMon 210,000,000 / 成果 4 值 / 场景 830+6 / 无规划场景 KPI / 无「文档 —」/ 左侧板块丰富
  - T5a-b 轮播函数定义 + 6 个 data-caro 容器
- **已知边界**：导入仅内存态；规则台账 117 / TOP5 接口明细等列表型明细保持快照；分页区（P4 目录清单 / P8 全部已接入数据）不轮播

## PRD v2.0.0 关联（N6 r22，2026-11-26）

**用户指令两项**：① 资源清单去掉；② PRD 很乱看不懂、需交付研发开发——重新梳理为研发交付版 PRD，仅保留目前原型对应的需求，调整优化的内容不体现。

- `index.html` 升 build-2.4.18：**P8 资源清单（page-catalog）整页移除**——导航「资源清单」按钮、`#page-catalog` section、`#catTabs` 相关 CSS、catalog JS 区块（curLib/catPage/PAGE_SIZE/ledgerRows/impTagHtml/catRows/catFiltered/drawRing3D/renderCatTabs/renderCat/事件绑定/gotoCatalog）、`window.gotoCatalog`、PAGE_META `'page-catalog'` 路由项、TOUR 巡播条目、库抽屉「前往资源清单 →」按钮全部删除；**LEDGER_CATS 数据保留**（P2 库卡/P3/导入链路仍用）
- **03-prd.md 全量重写为研发交付版 v2.0.0 → v2.0.1**（Gate 修改意见「太复杂、模块太多；只保留功能点和业务规则」→ 重构为两部分：功能点按页面分组 34 条 + 业务规则 R-01–R-13 逐条写清规则与判定）：仅保留当前原型对应需求（§1 概述 / §2 全局口径 / §3 页面清单与导航（5 页） / §4 页面需求 / §5 Excel 导入 / §6 通用交互 / §7 技术与非功能 / §8 验收标准 D-01–D-11），不含任何历史调整与修订记录；功能点 34 条（当前生效）；功能清单同步重写（34 条，移除存档与 P8/P9/P10 条目）
- 文档链同步：verify-rules.js（R-01 改库卡双口径断言、R-02 改「待补充」断言、R-11 升 2.4.18、头注 r22）、prototype-prd.html（PAGES 8→7、P8 条目移除、页脚 PRD v2.0.0/2.4.18、data-i 5/6）、03-prd-preview.html（v2.0.0/2.4.18、34 条、F-027/F-030 节选行移除）、project-spec.md（版本绑定/页面编号表 P8 行/R-01/R-12/R-13）、本文件、state（G26）

### r22 验证记录

- `node --check` 通过（修复一次注释内 `cat*/` 提前闭合注释的语法错误）；残留引用检查通过（全部在注释内）
- `verify-rules.js` **13/13 PASS**：R-01 改断言库卡「应建目录/已录入明细/台账待补充」并列（原 P8 双口径统计随页删除）；R-02 改断言「待补充」口径（原「待导入」文案随 P8 移除）；R-11 升 build-2.4.18 / PRD v2.0.0
- **同源端到端 harness 22 项 ALL-PASS**（`_r21_harness.html` 增补 T6a-d）：T6a 无资源清单页 / T6b 主导航仅「库资源门户」/ T6c 界面无「资源清单」入口且 `window.gotoCatalog` 未定义 / T6d 打开非人口库库抽屉无「前往资源清单」按钮（调试要点：`openLib('pop')` 跳转人口库页而非抽屉，须用非 pop 库卡测试）
- **已知边界**：LEDGER_CATS 数据保留供 P2/P3/导入链路；隐藏导入入口（F-052）不依赖 P8，三连击入口在任何页面可用
