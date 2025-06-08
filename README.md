# LitePlay Hub - 轻游空间

轻游空间是一个纯前端Web小游戏平台，无需注册，即点即玩。

## CORS问题解决方案

如果您在直接打开HTML文件时遇到以下错误：

```
Access to fetch at 'file:///path/to/game_config.json' from origin 'null' has been blocked by CORS policy
```

这是由于浏览器的安全策略导致的，当您直接从文件系统（使用file://协议）打开HTML文件时，浏览器会阻止JavaScript从本地文件系统加载其他文件。

### 解决方法

您有两种方法可以解决这个问题：

#### 方法1：使用本地Web服务器（推荐）

我们提供了一个简单的Python HTTP服务器脚本，您可以按照以下步骤运行：

1. 确保您的计算机已安装Python（3.x版本）
2. 在Windows上，双击`start_server.bat`文件
3. 或者，在命令行中运行：`python start_server.py`
4. 服务器将在http://localhost:8000启动，并自动在浏览器中打开网站

#### 方法2：使用浏览器扩展或特殊设置

- **Chrome**：安装"Web Server for Chrome"扩展
- **Firefox**：在`about:config`中设置`security.fileuri.strict_origin_policy`为`false`
- **Edge**：基于Chromium，可以使用Chrome的解决方案

#### 方法3：使用代码备用方案

我们已经在代码中添加了备用方案，当fetch API失败时，会尝试使用XMLHttpRequest，如果仍然失败，则使用内联的默认游戏数据。这意味着即使在遇到CORS问题时，网站的基本功能仍然可用。

## 游戏配置

游戏配置存储在`game_config.json`文件中，您可以通过编辑该文件来添加、修改或删除游戏。

## 本地游戏开发

游戏文件存放在`games`目录下，每个游戏都有自己的子目录。如果您想添加新游戏，只需创建一个新的子目录，并确保包含必要的文件（如index.html）。

## 项目概述

这是"轻游空间 (LitePlay Hub)"的高保真HTML原型，一个纯前端的Web小游戏平台。原型使用HTML、Tailwind CSS和FontAwesome实现，模拟了完整的用户界面和基本交互。

## 技术栈

- HTML5
- [Tailwind CSS](https://tailwindcss.com/) - 用于快速构建自定义界面
- [FontAwesome](https://fontawesome.com/) - 提供图标支持
- [Unsplash](https://unsplash.com/) - 提供高质量图片资源

## 文件结构

- `index.html` - 首页/游戏大厅
- `game.html` - 游戏运行页面
- `categories.html` - 分类浏览页面
- `search.html` - 搜索结果页面
- `recent.html` - 最近玩过页面
- `favorites.html` - 我的收藏页面
- `settings.html` - 设置页面
- `assets/` - 存放图片、图标等资源

## 主题与颜色

- 主色: `#3B82F6` (蓝色)
- 辅助色: `#10B981` (绿色)
- 强调色: `#F59E0B` (橙色)
- 默认为深色主题，可通过界面切换为浅色主题

## 浏览说明

1. 从`index.html`开始浏览
2. 点击游戏卡片可进入游戏页面
3. 导航栏提供各功能区域的入口
4. 原型支持深色/浅色主题切换 