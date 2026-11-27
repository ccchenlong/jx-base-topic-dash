#!/usr/bin/env node
/**
 * verify-rules.js —— N4 原型口径规则校验（工作流产物）
 * 用法：node verify-rules.js [index.html 路径]
 * 流程：无头 Chrome 渲染 → 双口径断言（渲染 DOM 管界面展示 / 源码管数据常量）
 * 每条 R-xx 失败时回引 03-prd.md 的规则原文；全部通过退出码 0。
 * 规则来源：PRD-基础库专题库数据地图.md v1.7.0（主规格 project-spec.md R-xx 编号，R-01–R-13）
 * r16：导入改全要素必填 + 导入完整数据并入大屏展示（接入单位视图 / 目录抽屉 / 更新机制），R-11 升 build-2.4.12，R-13 追加全要素必填与展示映射断言
 * r17：表头级全要素校验（用户指令：填写的表头也要包含全部要素）——「数据目录」表头须含全部 9 列、「字段明细」表头须含 5 个必填列，缺列文件级阻止并提示缺失列；R-11 升 build-2.4.13，R-13 追加表头校验断言
 * r18：导入模板对齐原型展示要素（用户指令：调整导入模板，把原型中展示的要素全部在导入模板中体现，下发各厅局填写后导入系统展示）——「数据目录」sheet 9→14 列（新增 需求字段数、接入状态、约定更新时间、物理表源表名、治理表名 五列，均带星标必填），接入状态按填报值登记；R-11 升 build-2.4.14，R-13 追加 5 新列映射 / 5 项必填 / IMP_ST 枚举 / 模板 14 列解压断言
 * r19：需求转向（用户指令：不要管之前的需求，现在只是做模板，是为了有些单位无法提供数据，只提供各项指标数值，用于省里做展示用）——模板改一个通用版文件（六库合一，三工作表：「指标数值」31 列 +「数据目录」14 列 +「字段明细」），新增 impMapIndHeader/IND_NUMS 解析指标数值 sheet、IMP_LIB_SUM 写入并驱动 P2/P3/P6/P7 展示（厅局填什么就展示什么，未填报保持快照）；R-11 升 build-2.4.15，R-13 修订为通用版三表解压断言 + 指标映射/IMP_LIB_SUM/渲染函数化断言
 * r15：「数据目录」sheet 去掉主要字段 1–3（12→9 列），R-11 断言升 build-2.4.11，R-13 修订列清单并断言映射已移除主要字段
 * r14：字段类型改英文类型名，R-11 断言升 build-2.4.10，R-13 追加 sheet2 解压后英文类型断言；渲染环节加最多 3 次重试消除 headless 时序抖动
 * r13：导入模板增回「字段明细」独立 sheet（双工作表），R-13 再修字段 sheet 断言，R-11 断言升 build-2.4.9
 * r12：总览驾驶舱展示入口移除；R-13 修订单工作表模板口径，R-11 断言升 build-2.4.8
 * r11：新增 R-13，R-11 断言升 build-2.4.7
 * r21：用户指令五项调整（PRD v2.0.0 / build-2.4.18）——R-11 升 build-2.4.18；R-06 改写为「既有服务独立统计，规划场景不再展示」（场景服务并入治理成果页）；R-12 升四工作表口径；R-13 重写：合并 sheet「治理成果与场景服务」8 列、page-scenes 移除、更新机制移除、data-caro 轮播、隐藏导入入口三连击、单位填报列表无「文档 —」、模板解压断言改四工作表
 * r22：用户指令两项（PRD v2.0.0 / build-2.4.18）——①资源清单页移除：R-01 改断言库卡「应建数据目录/台账已接入/台账待补充」并列（原 P8 双口径统计随页删除）、R-02 改断言「待补充」口径、R-11 升 build-2.4.18、R-13 增无 page-catalog 断言②PRD 重写为研发交付版 v2.0.0→v2.0.1（Gate 修改意见：只保留功能点与业务规则两部分，业务规则逐条写清）；r23：顶栏主导航最后一个按钮「库资源门户」移除——R-11 升 build-2.4.19 + 加无 `data-page="libraries"` 结构性断言（无主导航入口）
 * r24：用户指令「导入模板还是不对，现在的数据接入 sheet 应该是数据总览，再增加一张数据接入 sheet」——模板改五工作表（数据总览 / 数据接入 / 数据治理 / 治理成果与场景服务 / 字段明细）：R-11 升 build-2.4.20、PRD v2.0.3；R-12/R-13 升五工作表口径；R-13 增「数据接入」目录级明细 sheet（7 列）解压断言 + 目录台账写入断言（LEDGER_CATS imported 标记 / impCatKeys / 更新频率枚举）
 * r25：用户指令「库资源门户这个面包屑都要删除」——R-11 升 build-2.4.21 / PRD v2.0.4 + 加结构性断言（#crumb 无「库资源门户」项、P2 空 crumb 隐藏、P3–P6 仅保留「人口基础库 / 当前页」层级）
 * r26：用户手动调整导入模板为最终版（内容零改动，样式调整 + 列结构适配）——R-11 升 build-2.4.22 / PRD v2.0.5；R-13 模板断言适配最终版（治理 sheet 首列「规则编号*」→「数据源单位*」、成果 sheet 首列「流程节点数」→「数据源单位*」+ 示例 851、字段明细新增 库名称* / 库类型* 两列（5→8 列口径）、数据总览仅留 1 行示例）+ 模板样式断言（第 1 行说明行加高 ht=80 + 自动换行 wrapText、表头蓝底白字 FF1677FF + 冻结前两行 pane）+ 源码断言（治理去重改同单位同字段、parseGlobal 支持 unit 文本列、IMP_GOV_RULES 首键 unit、ACH_KEYS 去 govNode）
 * r27：用户指令「数据总览需要根据各单位填录的这些字段，最后进行汇总展示」+「基于现在的导入模板去调整」（PRD v2.0.6 / build-2.4.23）——R-11 升 build-2.4.23 / v2.0.6；R-12/R-13 升四工作表口径；R-13 重写：模板四工作表（数据总览 9 列汇总口径：数据源单位 / 覆盖范围 / 库名称 / 库类型 / 接入数据量 / 数据字段 / 治理规则 / 累计订阅次数 / 接口调用次数；「字段明细」sheet 删除）+「数据接入」9 列（新增 更新状态 / 已接入字段）+「治理成果与场景服务」9 列（新增 场景名称）+ 源码断言（IMP_OVERVIEW 全局汇总 / optCol 可选列 / sceneNames 文本列 / itemsRaw 分号拆分）
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const file = path.resolve(process.argv[2] || path.join(__dirname, 'index.html'));
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

/* 1) 源码口径：数据常量与版本标识 */
const src = fs.readFileSync(file, 'utf8');

/* 2) 渲染口径：无头 Chrome dump-dom（界面展示文案以渲染结果为准）
   r14：headless 偶发时序抖动会让 KPI 计数动画未完成就 dump-dom（R-03 的 433,120,247 缺失）。
   最多渲染 3 次，若关键精确数值已出现即停止；仅对该渲染信号重试，不掩盖任何规则断言的失败。 */
let rendered = '';
try {
  const renderOnce = () => execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--virtual-time-budget=8000',
    '--window-size=1920,1080', '--hide-scrollbars', '--dump-dom',
    'file:///' + file.replace(/\\/g, '/'),
  ], { timeout: 120000, maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
  for (let i = 0; i < 3; i++) {
    rendered = renderOnce();
    if (rendered.replace(/<script[\s\S]*?<\/script>/gi, '').includes('433,120,247')) break;
  }
} catch (e) {
  console.error('渲染失败：' + e.message);
  process.exit(2);
}
const dom = rendered.replace(/<script[\s\S]*?<\/script>/gi, '');

const RULES = [
  { id: 'R-01', name: '双口径并列不调平',
    doc: '库卡应建数据目录（清单态）与接入台账（台账态）独立并列、不强行调平（PRD v2.0.2 / R-01）',
    test: () => dom.includes('应建目录') && dom.includes('已录入明细') && dom.includes('台账待补充') },
  { id: 'R-02', name: '未知≠0，不得推算',
    doc: '未填报项显示“—”或“待补充”，不得用其他数量推算（03-prd.md 7.5 / R-02）',
    test: () => dom.includes('待补充') && dom.includes('该单位目录明细待补充') && !dom.includes('按 0 计算') },
  { id: 'R-03', name: '主展示数量精确到个位，不用万/亿/整十数',
    doc: '主展示汇总数量精确到个位，不出现 434,000,000 等人为整十数（03-prd.md 8.1 / R-03）',
    test: () => dom.includes('433,120,247') && !/434,000,000|4\.34\s*亿/.test(dom) && !dom.includes('亿次') && !dom.includes('万次') },
  { id: 'R-04', name: '既有服务调用用 TOP5 精确合计，不反推总量',
    doc: '累计调用精确总数未提供，改用 TOP5 合计 125,740,861 并注明部分明细；不出现 1.98 亿（03-prd.md 7.6 / R-04）',
    test: () => dom.includes('125,740,861') && !dom.includes('1.98 亿') },
  { id: 'R-05', name: '治理成果按 12 家填报展示',
    doc: '452 流程节点 / 851 治理字段 / 45 结果表 / 7 文档，12 家单位填报（03-prd.md 7.5 / R-05）',
    test: () => dom.includes('452') && dom.includes('851') && dom.includes('12 家') },
  { id: 'R-06', name: '既有服务独立统计，规划场景不再展示（v1.8.1 r21）',
    doc: 'v1.8.1 用户指令⑤：场景服务并入治理成果页、规划场景不再展示；既有服务订阅/调用/接口数独立统计不混计（03-prd.md §7.6 / §31 / R-06）',
    test: () => dom.includes('场景服务 · 接口调用 TOP5') && !dom.includes('规划中场景') && !dom.includes('规划中应用场景')
      && !src.includes('id="page-scenes"') && !src.includes('data-goto="page-scenes"') },
  { id: 'R-07', name: '治理规则 117 = 基础 100 + 业务 17，已登记≠已执行',
    doc: '117 条（基础 100 / 业务 17，参考 0）；“已登记”只表示已登记，「已执行」指标不得给出虚构数量、只显示“—”（03-prd.md 7.4 / R-07）',
    test: () => src.includes('117') && src.includes('已登记') && !/<b>\s*\d+\s*<\/b>\s*已执行/.test(src) },
  { id: 'R-08', name: '供数单位 12 家（应供数 19 家）',
    doc: '供数单位 12 家，应供数 19 家，覆盖 63.2%（03-prd.md 7.2 / R-08）',
    test: () => dom.includes('12 家') && dom.includes('19 家') && dom.includes('63.2%') },
  { id: 'R-09', name: '源表 49 张：28 正常 / 2 未更新 / 19 对接中',
    doc: '更新健康度 57.1% = 28/49（03-prd.md 7.2 / R-09）',
    test: () => dom.includes('更新健康度') && dom.includes('57.1%') && dom.includes('49 张源表') },
  { id: 'R-10', name: '数据字段 1,023 项（明细 896 / 需求 982）',
    doc: '数据字段 1,023 项；已接入明细 896 / 需求 982（03-prd.md 7.2 / R-10）',
    test: () => dom.includes('1,023') && src.includes('896') },
  { id: 'R-11', name: '版本标识可见 + hash 导航（对照页联动）',
    doc: '原型顶栏可见 build-X.Y.Z（build-2.4.25），与 PRD / state 版本一致（PRD v2.0.8）；支持 hash 导航供 prototype-prd.html 对照页 iframe 联动（N4 通过条件 / R-11）；r25：面包屑（#crumb）无「库资源门户」项',
    test: () => dom.includes('build-2.4.25') && src.includes('id="buildTag"')
      && !src.includes('data-page="libraries"')
      /* r25：面包屑中的「库资源门户」项全部删除（P2 门户页空且隐藏；P3–P6 仅保留「人口基础库 / 当前页」） */
      && !src.includes('<b>库资源门户</b>') && src.includes('<div class="crumb" id="crumb"></div>')
      && src.includes("$('#crumb').style.display=m.crumb?'':'none'") && src.includes("crumb:'<b>人口基础库</b>")
      && src.includes("addEventListener('hashchange'") && src.includes('window.setPage=setPage') },
  { id: 'R-12', name: '隐藏导入入口（三连击）+ Excel 导入弹窗 + 导入后预览 + 通用版四工作表模板（F-046/F-047 / PRD v2.0.8）',
    doc: '03-prd.md §3 / §6：大屏不直接展示导入模板/导入入口，空白区域 2 秒内连击 3 次浮出隐藏入口面板；导入居中弹窗（遮罩/Escape/焦点约束），确认后提供导入结果预览，错误提示规则分级落地；零依赖解析写入内存并保留双口径与未知≠0 口径（N4 r9 新增 / r20 指标数值 / r21 四工作表+隐藏入口 / r24 五工作表 / r27 用户最终版四工作表）',
    test: () => dom.includes('下载导入模板') && dom.includes('Excel 导入') && src.includes('openImportModal')
      && src.includes('openModal') && src.includes("id=\"modal\"") && src.includes('数据总览导入结果') && src.includes('数据接入目录导入结果')
      && src.includes('DecompressionStream') && src.includes('impFmtRows') && fs.existsSync(path.join(path.dirname(file), 'templates'))
      /* r21 隐藏导入入口：页面无直接导入按钮，空白三连击开启 */
      && !src.includes('id="btnTpl"') && !src.includes('id="btnImport"')
      && src.includes('hiddenEntry') && src.includes('_hideClicks') && src.includes('btnTplH') && src.includes('btnImportH') },
  { id: 'R-13', name: '明细区轮播 / 四工作表导入模板·用户最终版（数据总览 9 列汇总口径 + 治理成果 sheet 14 列）/ P3 六卡按各单位填录汇总 / P6 底部三块按填报展示（含服务化路径整块）/ 拉伸铺满 / 治理页重构 / 场景并入成果页 / 字段级规则 / 目录分页与抽屉精简（F-016/F-018/F-019/F-019b/F-021/F-022/F-026/F-027/F-046–F-050 / PRD v2.0.8）',
    doc: '03-prd.md §3–§6：通用版模板四工作表（数据总览 9 列汇总口径：数据源单位 / 覆盖范围 / 库名称 / 库类型 / 接入数据量（条）/ 数据字段（项）/ 治理规则（条）/ 累计订阅次数（次）/ 接口调用次数（次），一单位一库一类别一行、五项数值列按列求和、供数单位按数据源单位去重计数 / 数据接入 9 列（前 5 列必填 + 更新状态 / 已接入字段可选，已接入字段分号拆分合并目录 items）/ 数据治理 6 列全必填·字段级 / 治理成果与场景服务 14 列数值列全平台汇总一行 + 场景名称 + TOP5 接口调用明细（r28：名称:次数分号分隔，选填）+ 服务发布项数 / 调用监测次数 / 发布状态 / 调用状态（r29 新增 4 个选填列，驱动服务化路径整块）），每 sheet 第 1 行说明行（灰字、自动换行、加高 ht=80）、第 2 行表头（蓝底白字加粗、冻结前两行）、第 3 行起数据（任一单元格含「示例」整行跳过）；r27 汇总口径：导入后写 IMP_OVERVIEW 驱动 P3 六张 KPI 卡（每卡独立 has 判断，未填列保持快照、未知≠0）；r28：IMP_TOP5 驱动 P6 底部三块（TOP5 明细 / 调用结构占比自动测算 / 调用监测），未填保持平台快照；r29：IMP_SVCPATH 驱动「服务化路径」整块（服务发布数值与进度条 / 调用监测数值与进度条 / 发布状态与调用状态徽章；数值新列优先 → 旧列「服务接口数 / 接口调用次数」 → 快照，进度条按填报值相对快照基准自动测算封顶 100%，状态列分号拆分，未填保持快照）；scaleStage 拉伸铺满（宽高分别缩放，任意容器比例不留白边）；IMP_LIB_SUM 保留按库名写入（P2 库卡应建目录数 / 源表数回退快照）；「数据接入」sheet 按「数据源单位+数据目录」写目录台账（LEDGER_CATS，imported 标记驱动 P4 / 目录抽屉），已登记目录按填报值更新、新目录登记为导入目录；合并 sheet 按键拆分写 IMP_ACH/IMP_SCENE 驱动合并页 KPI（数据源单位/场景名称为文本列、不进数值 KPI）；治理成果页左侧板块丰富、单位填报列表无「文档 —」；治理页统计总数置顶+明细在下、「更新机制」Tab 移除；场景服务并入治理成果页、规划场景不再展示；各明细滚动区 data-caro 轮播（分页区不轮播）；填报值替换、未填保持快照（所有数据来源均为数据表导入）',
    test: () => dom.includes('查询全部已接入数据') && src.includes('LIB_ICONS') && src.includes('openAllDataModal')
      && src.includes('openDirDrawer') && src.includes('DATA_TABLES')
      /* r20 数据接入页改造：字段结构预览 / 数据量构成模块移除；目录清单每页 20 条分页；抽屉两 Tab（去物理表/治理表/数据表 Tab） */
      && !src.includes('accExtra') && !src.includes('字段结构预览') && !src.includes('数据量构成')
      && src.includes('DIR_PAGESZ') && src.includes('每页 20 条') && src.includes('dirPage=1')
      && src.includes('onclick="dirTab(0)">目录信息') && src.includes('onclick="dirTab(1)">已接入字段')
      && !src.includes('dirTab(2)')
      /* r21 治理页重构：统计总数置顶、明细在下；「更新机制」Tab 移除 */
      && src.includes('id="govSummary"') && !src.includes('id="updateView"') && !src.includes('class="govtab"')
      /* r21 导入解析：五工作表定位（r24）+ 合并 sheet「治理成果与场景服务」按键拆分 + 说明行/表头三行结构 + 字段级规则 + 校验条款 */
      && src.includes("S('数据总览')") && src.includes("S('数据接入')") && src.includes("S('数据治理')") && src.includes("S('治理成果与场景服务')")
      && src.includes("S('字段明细')") && src.includes("parseGlobal('治理成果与场景服务'")
      /* r24 数据接入目录级明细：解析 + 写目录台账（已登记更新 / 新目录 imported 登记）+ 更新频率枚举 */
      && src.includes('const impCats=[]') && src.includes('const impCatKeys=new Set()')
      && src.includes('更新频率应为 ') && src.includes('目录在文件内重复')
      && src.includes('LEDGER_CATS.push({id:LEDGER_CATS.reduce') && src.includes('imported:true});')
      && src.includes('catItems+=fldItems.length;catNew++')
      && src.includes('数据接入目录 ') && src.includes('新增登记 ')
      && src.includes('ACH_KEYS') && src.includes('SCN_KEYS') && src.includes('hasAch||hasScn')
      && src.includes('const IMP_GOV_RULES=[]') && src.includes('let IMP_ACH=null,IMP_SCENE=null,IMP_TOP5=null,IMP_SVCPATH=null')
      && src.includes('function renderGovRules') && src.includes('字段级规则（导入')
      && src.includes('库名称应为 ') && src.includes('同单位同字段的相同规则在文件内重复')
      /* r26 用户最终版列结构：治理 sheet 首列数据源单位（IMP_GOV_RULES 首键 unit）、成果 sheet 数据源单位为文本列、ACH_KEYS 去 govNode */
      && src.includes('IMP_GOV_RULES.push({unit:r.dept') && src.includes("key==='unit'")
      /* r27 汇总口径：IMP_OVERVIEW 驱动 P3 六卡（五项按列求和 + 供数单位去重）；「数据接入」可选列 optCol（更新状态/已接入字段）；「治理成果与场景服务」可选文本列 sceneNames；已接入字段 itemsRaw 分号拆分合并 items */
      && src.includes('let IMP_OVERVIEW=null') && src.includes('if(accN)IMP_OVERVIEW=') && src.includes('ovUnits.size')
      && src.includes("key==='sceneNames'") && src.includes('const optCol=') && src.includes('itemsRaw')
      && src.includes('const gv=(k,fb)=>(o&&o.has[k])?o[k]:fb')
      /* r28 TOP5 明细列：parseGlobal 可选文本列 top5Raw → IMP_TOP5 拆分（名称:次数，降序取 5）驱动 P6 底部三块 renderSvc；r29：sheet4 任一有效行均调 renderSvc()（幂等重算三块） */
      && src.includes("key==='top5Raw'") && src.includes('if(gRow)renderSvc()') && src.includes('function renderSvc')
      /* r29 服务化路径整块：4 个可选列（svcPub / svcMonCnt / pubStatus / callStatus）→ IMP_SVCPATH，renderSvcPath 驱动数值·进度条·状态徽章；数值新列优先 → 旧列 → 快照 */
      && src.includes("key==='pubStatus'||key==='callStatus'") && src.includes('IMP_SVCPATH=Object.keys(sp).length?sp:null')
      && src.includes('function renderSvcPath') && src.includes('renderSvcPath();')
      && src.includes('id="svcPubBar"') && src.includes('id="svcMonBar"') && src.includes('id="svcBadges"')
      && src.includes("$('#svcPubBar').style.width") && src.includes("$('#svcMonBar').style.width")
      && src.includes("sp.pub") && src.includes('sp.pubStatus') && src.includes('sp.callStatus')
      && src.includes('IMP_TOP5=gRow.vals.top5Raw.split') && src.includes("$('#svcApis')")
      /* r28 拉伸铺满：scaleStage 宽高分别缩放（Math.min 等比缩放移除） */
      && src.includes('scale(${sx},${sy})') && !src.includes('Math.min(innerWidth/1920')
      && src.includes('第 1 行为说明行、第 2 行为表头')
      && src.includes('function impCommit') && src.includes('IMP_LIB_SUM[key]=')
      && src.includes('renderPopKpis();renderPopMods();')
      && src.includes('const gvA=') && src.includes('function renderAch')
      /* r21 单位成果填报：恒空「文档 —」展示项移除；左侧板块丰富（填报进度/完整度） */
      && !src.includes('· 文档 —') && src.includes('填报进度') && src.includes('填报完整度')
      /* r21 明细区轮播：data-caro 标记 + startCarousel/refreshCarousels（分页区不轮播原则写入实现注释） */
      && src.includes('function startCarousel') && src.includes('function refreshCarousels')
      && src.includes('data-caro') && src.includes('分页区不轮播')
      && (() => {
        const d = path.join(path.dirname(file), 'templates');
        /* 排除 WPS/Excel 打开原文件时自动生成的「 - 副本」副本、~$ 锁文件与 _ 前缀调试/fixture 产物 */
        const ls = fs.readdirSync(d).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$') && !f.startsWith('_') && !f.includes(' - 副本'));
        const zlib = require('zlib');
        const readPart = (p, part) => {
          const buf = fs.readFileSync(p);
          const eocd = buf.lastIndexOf('PK\x05\x06');
          let off = buf.readUInt32LE(eocd + 16);
          for (let i = 0; i < buf.readUInt16LE(eocd + 10); i++) {
            const nameLen = buf.readUInt16LE(off + 28), extraLen = buf.readUInt16LE(off + 30), cmtLen = buf.readUInt16LE(off + 32);
            const name = buf.toString('latin1', off + 46, off + 46 + nameLen);
            const csize = buf.readUInt32LE(off + 20), method = buf.readUInt16LE(off + 10), lho = buf.readUInt32LE(off + 42);
            if (name === part) {
              const lnLen = buf.readUInt16LE(lho + 26), leLen = buf.readUInt16LE(lho + 28);
              const data = buf.subarray(lho + 30 + lnLen + leLen, lho + 30 + lnLen + leLen + csize);
              return method === 8 ? zlib.inflateRawSync(data).toString('utf8') : data.toString('utf8');
            }
            off += 46 + nameLen + extraLen + cmtLen;
          }
          return '';
        };
        const readSheet = (p, sheetName) => readPart(p, 'xl/worksheets/' + sheetName + '.xml');
        /* r23：模板可能被 Excel/WPS 打开另存（t="s" + xl/sharedStrings.xml），校验须同时兼容 inlineStr 与 sharedStrings 两种单元格存储 */
        const sharedOf = p => {
          const x = readPart(p, 'xl/sharedStrings.xml');
          if (!x) return [];
          return [...x.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m =>
            [...m[1].matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map(t => t[1]).join('')
              .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
        };
        const cellVal = (xml, ss) => {
          const t = (xml.match(/\bt="([^"]+)"/) || [])[1];
          if (t === 's') { const v = xml.match(/<v>(\d+)<\/v>/); return v ? (ss[+v[1]] || '') : ''; }
          if (t === 'inlineStr') return [...xml.matchAll(/<t[^>]*>([^<]*)<\/t>/g)].map(m => m[1]).join('');
          const v = xml.match(/<v>([^<]*)<\/v>/); return v ? v[1] : '';
        };
        /* r21 四工作表模板 → r24 五工作表 → r27 用户最终版四工作表（数据总览 9 列汇总口径 / 数据接入 9 列 / 数据治理 6 列 / 治理成果与场景服务 14 列 r28 +TOP5 接口调用明细 r29 +服务化路径 4 列）；
           每 sheet 第 1 行说明行（加高 + 自动换行 + 浅蓝灰底灰字）、第 2 行表头（蓝底白字、冻结前两行）、第 3 行起数据；示例为信用库（任一单元格含「示例」整行跳过） */
        return ls.length === 1 && ls[0].includes('通用版')
          && (() => {
            /* r23：模板真源取 导入模板.zip（原始打包，与线上站点一致）；xlsx 可能被 Excel/WPS 打开另存改写，不作为校验依据 */
            const p = path.join(d, '导入模板.zip');
            const wb = readPart(p, 'xl/workbook.xml');
            const names = [...wb.matchAll(/<sheet name="([^"]+)"/g)].map(m => m[1]);
            const ss = sharedOf(p);
            const s1 = readSheet(p, 'sheet1'), s2 = readSheet(p, 'sheet2'), s3 = readSheet(p, 'sheet3'),
                  s4 = readSheet(p, 'sheet4');
            /* 断言目标 = sheet XML + 共享字符串全文（inlineStr 版 ss 为空，等价于原断言） */
            const T = x => x + '|' + ss.join('|');
            /* sheet1 数据总览（r27 9 列汇总口径）：覆盖范围 B 列「一类一行」——数据行（第 3 行起）每格只放一个覆盖类别（第 1 行说明行不计） */
            const bTexts = [...s1.matchAll(/<c r="B(\d+)"[^>]*>([\s\S]*?)<\/c>/g)].filter(m => +m[1] >= 3)
              .map(m => cellVal(m[0], ss)).filter(v => v !== '');
            /* r26 模板样式（内容零改动）：styles.xml 含自动换行 + 政务蓝表头底色 + 浅蓝灰说明底色；sheet 第 1 行加高 + 冻结前两行 */
            const stl = readPart(p, 'xl/styles.xml');
            return JSON.stringify(names) === JSON.stringify(['数据总览', '数据接入', '数据治理', '治理成果与场景服务'])
              && ['数据源单位*','覆盖范围*','库名称*','库类型*','接入数据量*','数据字段*','治理规则*','累计订阅次数*','接口调用次数*'].every(h => T(s1).includes(h))
              && T(s1).includes('一类一行') && T(s1).includes('必填') && bTexts.length >= 1
              && bTexts.every(t => !/[、，,\n]/.test(t))
              /* r27 汇总口径说明行：按列求和 / 去重计数 / 勿重复填写 */
              && T(s1).includes('按列求和') && T(s1).includes('去重计数') && T(s1).includes('请勿重复填写同一笔数据')
              && T(s1).includes('社会信用基础库（示例）')
              && stl.includes('wrapText="1"') && stl.includes('FF1677FF') && stl.includes('FFEFF4FB')
              && s1.includes('ht="80"') && s1.includes('customHeight="1"') && s1.includes('<pane ')
              /* sheet2 数据接入（r27 用户最终版 9 列：新增 更新状态 / 已接入字段，前 5 列必填 + 更新频率枚举说明 + 示例行） */
              && ['数据源单位*','数据目录*','字段数*','数据量*','更新频率*','数据时间范围','最后更新时间','更新状态','已接入字段'].every(h => T(s2).includes(h))
              && T(s2).includes('更新频率枚举') && T(s2).includes('失业保险参保信息（示例）')
              /* sheet3 数据治理（r26 用户最终版：首列「规则编号*」→「数据源单位*」，字段级规则 6 列） */
              && ['数据源单位*','库名称*','库类型*','目标表*','字段*','规则描述*'].every(h => T(s3).includes(h))
              && T(s3).includes('细化到字段') && T(s3).includes('（示例）')
              /* sheet4 合并 sheet（r27 9 列 → r28 10 列 +TOP5 接口调用明细 → r29 14 列 +服务化路径 4 列），数值列全平台汇总一行 */
              && ['数据源单位*','治理字段次数','结果表数量','沉淀文档数','累计订阅次数','接口调用次数','服务接口数','规划场景数','场景名称','TOP5 接口调用明细','服务发布项数','调用监测次数','发布状态','调用状态'].every(h => T(s4).includes(h))
              && T(s4).includes('851（示例）') && T(s4).includes('746（示例）')
              && T(s4).includes('婚姻信息核验接口:52000000（示例）') && T(s4).includes('名称:次数')
              && T(s4).includes('8（示例）') && T(s4).includes('125740861（示例）') && T(s4).includes('已发布（示例）') && T(s4).includes('调用正常（示例）')
              && s4.includes('A1:N3') && s4.includes('<c r="J1" s="1" t="s">') && s4.includes('<c r="J2" s="2" t="s">')
              && ['K','L','M','N'].every(c=>s4.includes(`<c r="${c}1" s="1" t="s">`) && s4.includes(`<c r="${c}2" s="2" t="s">`) && s4.includes(`<c r="${c}3" t="s">`))
              && (s4.match(/spans="1:14"/g)||[]).length===3
              && readPart(p, 'xl/sharedStrings.xml').includes('count="130" uniqueCount="116"');
          })();
      })()},
];

let fail = 0;
console.log('=== N4 原型口径规则校验（' + path.basename(file) + '，渲染 DOM 口径）===');
for (const r of RULES) {
  let ok = false, err = '';
  try { ok = !!r.test(); } catch (e) { err = e.message; }
  console.log(`  ${ok ? 'PASS' : 'FAIL'} ${r.id} ${r.name}`);
  if (!ok) { fail++; console.log(`        规则原文：${r.doc}`); if (err) console.log(`        异常：${err}`); }
}
console.log(`\nTOTAL: ${RULES.length}  PASS: ${RULES.length - fail}  FAIL: ${fail}`);
process.exit(fail ? 1 : 0);
