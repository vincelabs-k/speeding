# utm_source 命名规范

本仓库通过商店链接上的 `utm_source` 查询参数追踪各渠道带来的 Chrome Web Store / Edge Add-ons 安装流量。所有带商店链接的触点必须按本文档取值。

## 命名规则

统一格式：`{channel}_{placement}`，全小写、下划线分隔。

- `channel`：渠道大类（`github`、`x`、`bilibili`、`zhihu`、`wechat` 等）
- `placement`：该渠道内的具体位置（`readme`、`docs`、`bio`、`video`、`answer` 等）

取值需全局唯一、语义自明；新增触点时先查本表，未收录的再按规则登记。

## 参数拼接

- 链接已有其他查询参数时用 `&` 追加，无参数时用 `?` 起始
- 值仅使用 `[a-z0-9_]`，无需 URL 编码

## 仓库内触点取值表

| 触点           | 位置                                               | utm_source      | 商店                         |
| -------------- | -------------------------------------------------- | --------------- | ---------------------------- |
| README 安装区  | `README.md`                                        | `github_readme` | CWS + Edge                   |
| 文档首页       | `docs/index.md`                                    | `github_docs`   | CWS + Edge                   |
| popup 评分按钮 | `entrypoints/utils/constants.ts` → `getStoreUrl()` | `popup_rating`  | 按浏览器（Edge 用户跳 Edge） |

同一来源同时投递 CWS 与 Edge 时两商店使用相同 `utm_source`，按商店维度在后台区分。

## 外部渠道预留（示例）

未来新增外部推广渠道时按此表登记，勿直接发明新值：

| 渠道                      | 推荐取值                  | Chrome 链接                                                                                                             | Edge 链接                                                                                                                        |
| ------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| HN Show HN                | `hn_show`                 | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=hn_show>                 | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=hn_show>                 |
| HN Ask HN                 | `hn_ask`                  | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=hn_ask>                  | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=hn_ask>                  |
| Reddit r/chromeextensions | `reddit_chromeextensions` | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=reddit_chromeextensions> | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=reddit_chromeextensions> |
| Reddit r/udemy            | `reddit_udemy`            | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=reddit_udemy>            | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=reddit_udemy>            |
| Reddit r/languagelearning | `reddit_languagelearning` | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=reddit_languagelearning> | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=reddit_languagelearning> |
| Reddit r/productivity     | `reddit_productivity`     | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=reddit_productivity>     | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=reddit_productivity>     |
| X (Twitter) 简介          | `x_bio`                   | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=x_bio>                   | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=x_bio>                   |
| X 录屏                    | `x_video`                 | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=x_video>                 | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=x_video>                 |
| X 波形对比                | `x_pitch`                 | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=x_pitch>                 | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=x_pitch>                 |
| X 营收帖                  | `x_revenue`               | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=x_revenue>               | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=x_revenue>               |
| Bilibili 视频             | `bilibili_video`          | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=bilibili_video>          | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=bilibili_video>          |
| 知乎回答                  | `zhihu_answer`            | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=zhihu_answer>            | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=zhihu_answer>            |
| 微信公众号                | `wechat_article`          | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=wechat_article>          | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=wechat_article>          |
| Indie Hackers             | `ih_post`                 | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=ih_post>                 | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=ih_post>                 |
| Medium                    | `medium_post`             | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=medium_post>             | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=medium_post>             |
| Dev.to                    | `devto_post`              | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=devto_post>              | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=devto_post>              |
| 官网                      | `website_home`            | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=website_home>            | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=website_home>            |
| 博客                      | `blog_post`               | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=blog_post>               | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=blog_post>               |
| Newsletter                | `newsletter_issue`        | <https://chromewebstore.google.com/detail/speeding/odgdahfgpkmljkbecelajkobpleeioif?utm_source=newsletter_issue>        | <https://microsoftedge.microsoft.com/addons/detail/speeding/ccbafdcmpemnooafglgkijaccnnohnkc?utm_source=newsletter_issue>        |
| 合作方 / 第三方导航站     | `partner_<name>`          | 需登记时手动替换 `<name>` 生成                                                                                          | 需登记时手动替换 `<name>` 生成                                                                                                   |

新增渠道的链接在本文档登记后再对外发布，确保来源可统计。
