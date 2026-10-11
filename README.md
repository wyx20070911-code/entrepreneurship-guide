# 《高性价比创业指南》

循证、具体、有适用边界的创业阅读文档。当前48篇可读文章、12卷48章首轮覆盖，以及道法术器24主题。覆盖不等于完整论证或专业认可；证据初评与发布状态分开，当前复核为作者自查，未执行独立/专业审核。

- [12卷48章阅读目录](BOOK.md)
- [24主题阅读索引](TOPICS.md)
- [贡献与纠错](CONTRIBUTING.md) · [内容规范](CONTENT-GUIDE.md) · [变更记录](CHANGELOG.md)

正文维护在 `content/articles/*.md`，元数据在同编号JSON。网站从同一正文构建，保持 `/articles/E-XXXX/` 路径。第三方来源见文章配套JSON的references与claims，不包含来源全文。

## 本地阅读与检查

Node >=22.18，使用 package.json 锁定的 pnpm：

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm run validate
pnpm run test
pnpm run audit:public
pnpm run build
pnpm run preview
```

使用终端显示的 HTTP 地址，不双击HTML。修改文档 → 提交PR → 自动校验 → 合并main → Actions自动更新Pages。仓库设置 Pages 的 Source 为 GitHub Actions；部署URL由成功的Pages任务给出，首次实际上线前不得把计划地址当成已上线。

GitHub项目网站需要 `SITE_ORIGIN=https://账号.github.io`、`SITE_BASE_PATH=/仓库名/` 与 `PUBLIC_REPOSITORY_URL=https://github.com/账号/仓库名`。根域名部署使用 `/`；CI自动依据仓库设置路径。PR只有contents:read，不能访问部署权限。

原创正文/文档采用CC BY 4.0，代码采用MIT，第三方材料不被重新授权。详情见 LICENSE-DOCS.md 与 LICENSE-CODE。
