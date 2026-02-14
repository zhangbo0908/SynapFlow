# SynapFlow 自动更新发布指南

## 📋 前置条件

1. 拥有 GitHub 仓库的发布权限
2. GitHub Personal Access Token (PAT)，具有 `repo` 权限

---

## 🔑 第一步：配置 GitHub Token

### 1.1 生成 Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 设置 Note（如：SynapFlow Release）
4. 选择 Expiration（建议设置为 90 days）
5. **重要**：勾选 `repo` 权限（完全访问仓库）
6. 点击 "Generate token"
7. **立即复制生成的 Token**（只会显示一次）

### 1.2 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Token：

```env
GH_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 🚀 第二步：发布新版本

### 2.1 更新版本号

修改 `package.json` 中的 `version` 字段：

```json
{
  "version": "1.3.2"  // 更新为新版本号
}
```

### 2.2 提交和打标签

```bash
# 提交版本更新
git add package.json
git commit -m "chore: bump version to 1.3.2"

# 创建 git tag
git tag -a v1.3.2 -m "Release v1.3.2"

# 推送到 GitHub
git push origin main
git push origin v1.3.2
```

### 2.3 构建和发布

运行构建命令：

```bash
# macOS
npm run build:mac
```

或者直接发布到 GitHub Releases：

```bash
npm run build
npx electron-builder --mac --publish always
```

---

## 📝 注意事项

### macOS 签名
当前配置已禁用签名和公证，适合测试发布：
- `sign: false` - 禁用代码签名
- `notarize: false` - 禁用公证
- `hardenedRuntime: false` - 禁用硬运行时

生产环境建议启用签名以避免 Gatekeeper 警告。

### 版本号规范
遵循语义化版本规范（Semantic Versioning）：
- `MAJOR.MINOR.PATCH`
- MAJOR：重大变更，不兼容的 API 修改
- MINOR：新功能，向下兼容的功能性新增
- PATCH：Bug 修复，向下兼容的问题修正

---

## 🔍 验证更新

1. 发布新版本后，打开旧版本应用
2. 应用会自动检测更新（或手动检查）
3. 弹出更新提示窗口
4. 点击下载并安装

---

## ⚠️ 常见问题

### Q: 发布时提示权限不足？
A: 确保 GH_TOKEN 有 `repo` 权限，并且对仓库有写权限。

### Q: macOS 提示"无法打开"？
A: 因为未签名，可以在系统设置 > 安全性与隐私中允许打开。

### Q: 如何启用签名？
A: 需要 Apple Developer 证书，修改 package.json 中的 mac.sign 为 true 并配置证书。
