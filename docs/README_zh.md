# 六爻预测

中文 | [English](README.md)

基于传统六爻理论的桌面预测应用。

**技术栈：** Electron + Vue 3 + TypeScript + SQLite

## 功能概览

| 模块 | 功能 |
|------|------|
| 起卦 | 时间起卦、数字起卦、铜钱起卦、手动起卦 |
| 解卦 | 卦象展示、卦辞解读、AI智能解读（可选） |
| 历史 | 记录保存、搜索筛选、导出备份 |
| 知识库 | 六十四卦详解、八卦基础、起卦方法 |
| 设置 | 主题、字体、AI配置、数据管理 |

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式（推荐）
npm run dev:full
```

## 构建发布

```bash
# 1. 终止占用进程
taskkill /F /IM "LiuYao-Divination.exe" 2>$null
taskkill /F /IM "electron.exe" 2>$null

# 2. 清理旧构建
Remove-Item -Path "release" -Recurse -Force -ErrorAction SilentlyContinue

# 3. 以管理员权限打包
npm run build:win
```

**输出文件：**
- `release/{version}/LiuYao-Divination-{version}-x64.exe` - 便携版，双击运行

## AI智能解卦（可选）

本应用支持基于Ollama的本地AI解读功能：

1. 安装 [Ollama](https://ollama.ai)（需要0.6及以上版本）
2. 运行 `ollama pull huihui_ai/gemma3-abliterated:latest`
3. 在设置中开启AI功能并选择模型

## 技术栈

Electron 29 | Vue 3 | Element Plus | Pinia | SQLite | TypeScript | Vite

## 项目结构

```
src/
├── main/           # Electron主进程
├── renderer/       # Vue 3前端
└── shared/         # 共享代码（类型、工具、数据）
```

详细文档见 [docs/](docs/) 目录。

## 更新日志

### v1.2.4 (2026-03-01)
- ✨ 添加重启应用功能（安装 Ollama 后可重启检测）
- ✨ 模型下载添加镜像加速
- 🐛 修复切换页面时下载进度丢失的问题
- 🐛 移除不必要的弹窗提示
- 🐛 修复 TypeScript 类型错误
- ♻️ 将下载状态保存到全局 store

### v1.2.3 (2026-03-01)
- ♻️ 重构AI设置界面，新增模型管理模块
- ✨ 添加模型下载进度条，过滤ANSI乱码
- ✨ 新增国内镜像源（魔塔社区、HF镜像、DaoCloud）
- 🐛 修复历史记录详情无法展示的问题
- 🐛 修复Ollama连接状态检测问题
- 🐛 修复模型下载时重复弹出提示的问题

### v1.2.2 (2026-02-28)
- ✨ AI解读内容自动保存到历史记录
- 🎨 历史记录列表显示"AI解读"标签
- 🎨 优化AI解读提示词，提供更详细的卦象分析
- 🐛 修复打包后白屏问题（资源路径修正）
- 🎨 更新构建流程，添加进程清理步骤

### v1.2.1 (2026-02-28)
- 🎨 优化Ollama下载镜像源，移除失效镜像
- 🎨 默认使用Cloudflare镜像加速模型下载

### v1.2.0 (2026-02-28)
- ✨ AI解读支持流式输出，实时显示生成内容
- ✨ 支持DeepSeek-R1等模型的思考过程展示
- ✨ 思考过程以可折叠区域显示，使用小字体区分
- ✨ AI解读内容支持Markdown渲染
- ✨ 新增"停止生成"按钮，可随时取消AI解读
- 🎨 生成中显示光标动画效果

### v1.1.0 (2026-02-28)
- ✨ 新增AI智能解卦功能（基于Ollama本地模型）
- ✨ 新增AI设置页面（模型选择、温度、字数控制）
- 🎨 实现原生窗口外观（无边框+自定义标题栏）
- 🐛 修复农历日期显示undefined的问题
- 🐛 修复菜单导航和日期选择器无响应问题

### v1.0.0 (2026-02-27)
- ✅ 四种起卦方式
- ✅ 完整解卦功能
- ✅ 历史记录管理
- ✅ 知识库查询
- ✅ 系统设置
- ✅ 数据导出备份

## License

仅供学习研究使用。

## 作者

**KasonLee-marker** - [GitHub](https://github.com/KasonLee-marker)
