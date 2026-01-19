
# 智楚date - APK 打包技术指南

本文件由系统自动生成，用于指导如何将当前代码转化为可以在安卓手机上分发的 `.apk` 安装包。

## 1. 核心参数 (用于打包工具)
- **应用名称**: 智楚date
- **包名 (Package ID)**: com.zhichu.date.app
- **启动 URL**: [您部署后的 HTTPS 地址]
- **配色**: #2E5B88 (尉蓝色)

## 2. 推荐打包方式 (一键式)
由于代码已经完全符合 **PWA (Progressive Web App)** 标准，您可以使用以下工具：

### 方案 A：PWABuilder (最简单)
1. 访问 [PWABuilder.com](https://www.pwabuilder.com/)。
2. 输入您部署该代码的网址。
3. 点击 **"Package for App Store"**。
4. 选择 **"Android"**，点击下载。
5. 系统会自动返回一个名为 `zhichu_date.apk` 的文件。

### 方案 B：Bubblewrap CLI (专业开发者)
如果您熟悉命令行，可以使用谷歌官方工具：
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://your-url.com/manifest.json
bubblewrap build
```

## 3. 安装说明
- 获得的 APK 文件可以直接发到微信或通过 USB 拷贝到手机安装。
- 首次安装可能会提示“未知来源”，请选择“允许”。
- 安装后，应用将拥有独立的任务管理权限，不再依赖浏览器。

---
*由智楚date 自动化构建系统提供支持*
