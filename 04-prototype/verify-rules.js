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
    doc: '清单态（附件2 应建 134 条）与台账态（执行）独立并列、不强行调平（03-prd.md 7.7 / R-01）',
    test: () => dom.includes('应建 134') && dom.includes('台账 71') && dom.includes('双口径') },
  { id: 'R-02', name: '未知≠0，不得推算',
    doc: '未填报项显示“—”或“待补充”，不得用其他数量推算（03-prd.md 7.5 / R-02）',
    test: () => dom.includes('待导入') && dom.includes('待补充') && !dom.includes('按 0 计算') },
  { id: 'R-03', name: '主展示数量精确到个位，不用万/亿/整十数',
    doc: '主展示汇总数量精确到个位，不出现 434,000,000 等人为整十数（03-prd.md 8.1 / R-03）',
    test: () => dom.includes('433,120,247') && !/434,000,000|4\.34\s*亿/.test(dom) && !dom.includes('亿次') && !dom.includes('万次') },
  { id: 'R-04', name: '既有服务调用用 TOP5 精确合计，不反推总量',
    doc: '累计调用精确总数未提供，改用 TOP5 合计 125,740,861 并注明部分明细；不出现 1.98 亿（03-prd.md 7.6 / R-04）',
    test: () => dom.includes('125,740,861') && !dom.includes('1.98 亿') },
  { id: 'R-05', name: '治理成果按 12 家填报展示',
    doc: '452 流程节点 / 851 治理字段 / 45 结果表 / 7 文档，12 家单位填报（03-prd.md 7.5 / R-05）',
    test: () => dom.includes('452') && dom.includes('851') && dom.includes('12 家') },
  { id: 'R-06', name: '既有服务与规划场景分层不混计',
    doc: '8 个规划中场景（人口库 3 个）以「规划中」徽章分层，与既有服务独立统计、不合并（03-prd.md 7.6 / R-06）',
    test: () => dom.includes('规划中场景') && dom.includes('规划中应用场景') && /class="badge plan"/.test(rendered) },
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
    doc: '原型顶栏可见 build-X.Y.Z（build-2.4.16），与 PRD / state 版本一致（PRD v1.8.0）；支持 hash 导航供 prototype-prd.html 对照页 iframe 联动（N4 通过条件 / R-11）',
    test: () => dom.includes('build-2.4.16') && src.includes('id="buildTag"')
      && src.includes("addEventListener('hashchange'") && src.includes('window.setPage=setPage') },
  { id: 'R-12', name: '数据接入 Excel 导入弹窗 + 导入后预览 + 通用版五工作表模板（F-046/F-047 / PRD v1.5.0→v1.8.0）',
    doc: 'v1.5.0 §19.3 / 03-prd.md §5–§6：导入改居中弹窗（遮罩/Escape/焦点约束），确认后提供导入结果预览，错误提示规则分级落地；零依赖解析写入内存并保留双口径与未知≠0 口径（N4 r9 新增 / r10 修订 / r20 五工作表重构）',
    test: () => dom.includes('下载导入模板') && dom.includes('Excel 导入') && src.includes('openImportModal')
      && src.includes('openModal') && src.includes("id=\"modal\"") && src.includes('数据接入导入结果')
      && src.includes('DecompressionStream') && src.includes('impFmtRows') && fs.existsSync(path.join(path.dirname(file), 'templates')) },
  { id: 'R-13', name: '数据表下钻 / 全量已接入数据查询 / 库卡图标 / 五工作表导入模板 + 指标驱动展示 + 字段级规则 + 目录分页与抽屉精简（F-048/F-049/F-050 / PRD v1.8.0）',
    doc: 'v1.8.0 §5 / 03-prd.md：通用版模板五工作表（数据接入 8 列全必填 / 数据治理 6 列全必填·字段级 / 治理成果 4 列全局一行 / 场景服务 4 列全局一行 / 字段明细 5 必填列），每 sheet 第 1 行说明行、第 2 行表头、第 3 行起数据（信用库示例，任一单元格含「示例」整行跳过）；数据接入按库名称匹配写入 IMP_LIB_SUM 驱动 P2/P3；数据治理字段级规则驱动治理页「字段级规则（导入）」列表；治理成果 / 场景服务全局一行驱动 P6/P7 KPI；数据接入页移除字段结构预览与数据量构成模块、目录清单每页 20 条分页、目录详情抽屉两 Tab（物理表/源表、治理表、数据表 Tab 移除）；填报值替换展示、未填指标保持快照（所有数据来源均为数据表导入）',
    test: () => dom.includes('查询全部已接入数据') && src.includes('LIB_ICONS') && src.includes('openAllDataModal')
      && src.includes('openDirDrawer') && src.includes('DATA_TABLES')
      /* r20 数据接入页改造：字段结构预览 / 数据量构成模块移除；目录清单每页 20 条分页；抽屉两 Tab（去物理表/治理表/数据表 Tab） */
      && !src.includes('accExtra') && !src.includes('字段结构预览') && !src.includes('数据量构成')
      && src.includes('DIR_PAGESZ') && src.includes('每页 20 条') && src.includes('dirPage=1')
      && src.includes('onclick="dirTab(0)">目录信息') && src.includes('onclick="dirTab(1)">已接入字段')
      && !src.includes('dirTab(2)')
      /* r20 导入解析：五工作表定位 + 说明行/表头三行结构 + 全局状态 + 字段级规则 + 校验条款 */
      && src.includes("S('数据接入')") && src.includes("S('数据治理')") && src.includes("S('治理成果')")
      && src.includes("S('场景服务')") && src.includes("S('字段明细')")
      && src.includes('const IMP_GOV_RULES=[]') && src.includes('let IMP_ACH=null,IMP_SCENE=null')
      && src.includes('function renderGovRules') && src.includes('字段级规则（导入')
      && src.includes('库名称应为 ') && src.includes('规则编号在文件内重复')
      && src.includes('第 1 行为说明行、第 2 行为表头')
      && src.includes('function impCommit') && src.includes('IMP_LIB_SUM[key]=')
      && src.includes('renderPopKpis();renderPopMods();')
      && src.includes('const s=IMP_ACH') && src.includes('const s=IMP_SCENE')
      && (() => {
        const d = path.join(path.dirname(file), 'templates');
        /* 排除 WPS/Excel 打开原文件时自动生成的「 - 副本」副本与 ~$ 锁文件 */
        const ls = fs.readdirSync(d).filter(f => f.endsWith('.xlsx') && !f.startsWith('~$') && !f.includes(' - 副本'));
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
        /* r20 五工作表模板：数据接入 / 数据治理 / 治理成果 / 场景服务 / 字段明细（原「数据目录」「指标数值」sheet 移除）；
           每 sheet 第 1 行说明行、第 2 行表头（必填列带 *）、第 3 行起数据；示例为信用库（任一单元格含「示例」整行跳过） */
        return ls.length === 1 && ls[0].includes('通用版')
          && (() => {
            const p = path.join(d, ls[0]);
            const wb = readPart(p, 'xl/workbook.xml');
            const names = [...wb.matchAll(/<sheet name="([^"]+)"/g)].map(m => m[1]);
            const s1 = readSheet(p, 'sheet1'), s2 = readSheet(p, 'sheet2'), s3 = readSheet(p, 'sheet3'),
                  s4 = readSheet(p, 'sheet4'), s5 = readSheet(p, 'sheet5');
            /* sheet1 数据接入：覆盖范围 B 列「一类一行」——数据行（第 3 行起）每格只放一个覆盖类别（六库预填 21 行 + 信用库示例 4 行 ≥ 25 格；第 1 行说明行不计） */
            const bTexts = [...s1.matchAll(/<c r="B(\d+)"[^>]*><is><t[^>]*>([^<]*)<\/t><\/is><\/c>/g)].filter(m => +m[1] >= 3).map(m => m[2]);
            return JSON.stringify(names) === JSON.stringify(['数据接入', '数据治理', '治理成果', '场景服务', '字段明细'])
              && ['单位*','覆盖范围*','库名称*','库类型*','库接入数据量*','应建目录数*','库数据字段数*','库接入源表数*'].every(h => s1.includes(h))
              && s1.includes('一类一行') && s1.includes('必填') && bTexts.length >= 21
              && bTexts.every(t => !/[、，,\n]/.test(t))
              && s1.includes('社会信用基础库（示例）')
              && ['规则编号*','库名称*','库类型*','目标表*','字段*','规则描述*'].every(h => s2.includes(h))
              && s2.includes('细化到字段') && s2.includes('（示例）')
              && ['流程节点数','治理字段次数','结果表数量','沉淀文档数'].every(h => s3.includes(h)) && s3.includes('452（示例）')
              && ['累计订阅次数','接口调用次数','服务接口数','规划场景数'].every(h => s4.includes(h)) && s4.includes('746（示例）')
              && ['所属数据目录*','数据源单位*','字段名称*','字段类型*','字段长度*','字段说明'].every(h => s5.includes(h))
              && ['varchar','int','decimal','date','datetime'].every(t => s5.includes(t))
              && s5.includes('失信被执行人名单（示例）');
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
