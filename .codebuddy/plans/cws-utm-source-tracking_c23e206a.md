---
name: cws-utm-source-tracking
overview: 为仓库内所有 Chrome Web Store / Edge 商店链接统一埋设 utm_source 自定义来源标记，并输出一份渠道规范文档（含外部渠道预留命名空间），支撑后续 CWS 流量来源分析。
todos:
  - id: add-utm-spec-doc
    content: 新增 docs/utm-sources.md，定义 utm_source 命名规范（{channel}_{placement}）及仓库内触点与外部渠道预留取值表
    status: completed
  - id: update-static-links
    content: 修改 README.md 与 docs/index.md 商店链接：替换 ext_ntp_promo_1p 并追加自定义 utm_source（github_readme / github_docs）
    status: completed
    dependencies:
      - add-utm-spec-doc
  - id: update-popup-store-url
    content: 修改 entrypoints/utils/constants.ts，为 getStoreUrl() 追加 utm_source=popup_rating，保持签名兼容
    status: completed
    dependencies:
      - add-utm-spec-doc
---

## 产品概述
为 Speeding 扩展建立基于 utm_source 的商店流量来源埋点体系，使后续可以在 Chrome Web Store / Edge Add-ons 后台按来源分析各渠道带来的安装流量。

## 核心功能
- 盘点仓库内所有商店链接触点，为每个触点配置可识别的自定义 utm_source（替换 README 中无意义的官方参数 ext_ntp_promo_1p）
- 覆盖触点：README.md 安装区、docs/index.md 文档首页、popup 评分按钮（运行时拼接）
- 同时覆盖 CWS 与 Edge 两个商店（Edge 无官方聚合证据，仅按"无副作用、后台是否聚合以实际报告为准"处理）
- 预留外部推广渠道（官网、社交媒体、博客、论坛等）的 utm_source 命名规范，输出到 docs 规范文档，便于后续扩展


## 技术方案
### 技术选型
- 纯静态改动：Markdown 链接 + TypeScript 常量，无新增依赖、无构建产物变化
- 运行时改动仅限 `entrypoints/utils/constants.ts`（WXT 项目中唯一的商店 URL 汇聚点）

### 实施思路
1. **建立 utm_source 命名规范**：统一格式 `{channel}_{placement}`（全小写、下划线分隔）。仓库内三触点取值：
   - `github_readme`（README.md 安装区）
   - `github_docs`（docs/index.md）
   - `popup_rating`（popup 评分按钮）
2. **文档层**：README.md、docs/index.md 的商店链接直接拼上 `?utm_source=<值>`；同一来源同时发给 CWS 与 Edge 时两商店同值（按商店维度在后台区分）
3. **运行时层**：`getStoreUrl()` 内部统一追加 UTM 参数，抽一个 `appendUtm(url, source)` 工具函数（处理已含查询串的情况，用 `encodeURIComponent` 防特殊字符注入），保持 `getStoreUrl()` 无参签名不变，仅一处调用点（RatingButton）无需改动即可生效
4. **外部渠道预留**：在 docs 规范文档中给出命名规则与示例（如 `x_twitter_bio`、`bilibili_video`、`zhihu_answer`），未来外部渠道直接按表取值即可

### 性能与风险
- 静态字符串拼接无运行时开销；不涉及网络请求、不违反扩展 CSP；不影响 manifest 与 host_permissions
- CWS 后台对未知查询参数静默忽略，替换 `ext_ntp_promo_1p` 不影响链接可用性；Edge URL 追加 UTM 无副作用
- 变更仅涉及 3 个已确认文件 + 1 个新文档，无扩散风险

### 架构设计
链路简单，无需架构图：规范文档（docs）→ 静态链接（README/docs）与运行时 URL（constants.ts）→ popup 评分按钮打开带 UTM 的商店页 → 商店后台按 utm_source 聚合来源

## 目录结构
```
speeding/
├── README.md                          # [MODIFY] 安装区 CWS 链接 utm_source 替换为 github_readme；Edge 链接追加 github_readme
├── docs/
│   ├── index.md                       # [MODIFY] CWS/Edge 链接追加 utm_source=github_docs
│   └── utm-sources.md                 # [NEW] utm_source 规范文档：命名规则、仓库内触点取值表、外部渠道预留规范与示例
└── entrypoints/
    └── utils/
        └── constants.ts               # [MODIFY] 新增 UTM 常量与 appendUtm 工具函数；getStoreUrl() 内部追加 utm_source=popup_rating
```

