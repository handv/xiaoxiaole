# GitHub Pages 发布指南

## 步骤 1: 在 GitHub 上创建仓库

1. 登录 GitHub
2. 点击右上角的 "+" 号，选择 "New repository"
3. 仓库名称填写：`xiaoxiaole`（或你喜欢的名称）
4. 选择 Public（公开）
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

## 步骤 2: 将本地代码推送到 GitHub

在终端中执行以下命令（将 `your-username` 替换为你的 GitHub 用户名）：

```bash
# 添加远程仓库（替换 your-username 为你的 GitHub 用户名）
git remote add origin https://github.com/your-username/xiaoxiaole.git

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

## 步骤 3: 启用 GitHub Pages

1. 在 GitHub 仓库页面，点击右上角的 "Settings"（设置）
2. 在左侧菜单中找到 "Pages"（页面）
3. 在 "Source"（源）部分：
   - 选择 "Deploy from a branch"
   - Branch 选择 "main"
   - Folder 选择 "/ (root)"
4. 点击 "Save"（保存）

## 步骤 4: 访问你的网站

等待几分钟后，你的网站将在以下地址可用：
```
https://your-username.github.io/xiaoxiaole/
```

## 注意事项

- GitHub Pages 可能需要几分钟时间来部署你的网站
- 如果遇到 404 错误，请等待几分钟后重试
- 每次推送代码到 main 分支，GitHub Pages 会自动更新

