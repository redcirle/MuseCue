# MuseCue 网站部署与 Google 收录

本目录可作为 GitHub Pages 的发布根目录。正式域名为 `https://musecue.vip/`，`CNAME`、`robots.txt`、`sitemap.xml`、各语言页面的 canonical 与 hreflang 均已使用此域名。

## GitHub Pages

1. 将本目录文件上传到目标 GitHub 仓库的发布根目录，包含 `CNAME`、`robots.txt`、`sitemap.xml`、`ja/`、`ko/`、`zh-hans/`、`zh-hant/` 和字体文件。
2. 在仓库 **Settings → Pages** 启用发布，并将自定义域名设为 `musecue.vip`。按 GitHub Pages 显示的指引配置域名 DNS，启用 HTTPS。
3. 发布后检查 `https://musecue.vip/`、`/ja/`、`/ko/`、`/zh-hans/`、`/zh-hant/`、`/robots.txt` 和 `/sitemap.xml` 均可访问。

## Google Search Console

1. 在 Search Console 添加 **Domain property**：`musecue.vip`，按界面生成的 TXT 记录到域名 DNS 完成所有权验证。验证值因账户而异，不能预先写入本仓库。
2. 在 **Sitemaps** 提交 `https://musecue.vip/sitemap.xml`。
3. 使用 **URL Inspection** 检查首页和四个语言页，确认 Google 能读取页面并识别各自 canonical；需要时请求编入索引。
4. 发布后如更换域名，须同步修改 `CNAME`、`robots.txt`、`sitemap.xml` 和全部 HTML 页面的 canonical、hreflang、Open Graph URL。

搜索结果的实际收录和排序由 Google 决定；提交站点地图只是提供发现与监测入口。
