# 六爻预测App

一款基于传统六爻理论的桌面预测应用，使用 Electron + Vue 3 + TypeScript + SQLite 技术栈开发。

## ✅ 已完成功能

### 🔮 起卦模块
- **时间起卦**：根据指定时间（农历/公历）自动起卦
- **数字起卦**：输入两个数字进行起卦
- **铜钱起卦**：模拟传统铜钱起卦，带翻转动画效果
- **手动起卦**：手动选择每一爻的阴阳属性（阳爻、阴爻、老阳、老阴）

### 📖 解卦模块
- **卦象展示**：清晰的爻线显示，标注动爻位置
- **本卦/变卦**：同时显示本卦和变卦
- **卦辞解读**：
  - 卦辞（本卦的总体解释）
  - 彖辞（卦名的解释）
  - 象辞（卦象的说明）
  - 爻辞（每一爻的解释）
- **起卦信息**：农历日期、干支（年月日时）
- **纳甲信息**：天干、地支、五行、六亲
- **备注功能**：支持添加个人备注

### 📚 历史记录
- **记录保存**：自动或手动保存每次起卦结果
- **记录列表**：按时间倒序展示所有历史记录
- **记录搜索**：通过关键词搜索问题或备注
- **记录详情**：查看完整的历史记录信息
- **记录管理**：删除不需要的记录
- **筛选功能**：按起卦方式筛选历史记录

### 📖 知识库
- **六十四卦**：完整的六十四卦资料，包含卦象、卦辞、彖辞、象辞
- **八卦基础**：八卦的五行、自然、方位、季节等属性
- **起卦方法**：详细的起卦方法说明和计算公式
- **搜索功能**：快速搜索卦象信息

### ⚙️ 系统设置
- **主题设置**：
  - 浅色主题
  - 深色主题
  - 跟随系统主题
- **字体设置**：小、中、大三档字体大小
- **卦象样式**：传统样式 / 现代样式
- **默认起卦方式**：设置首选的起卦方法
- **自动保存**：起卦后自动保存到历史记录
- **数据管理**：清空历史记录、导出数据、备份恢复

### 💾 数据管理
- **TXT导出**：导出单条记录为文本格式
- **JSON导出**：导出所有历史记录和设置
- **数据库备份**：备份SQLite数据库文件
- **数据库恢复**：从备份文件恢复数据

## 🚀 启动方式

### 方式一：启动前端开发服务器（仅UI调试）

适用于前端界面开发和调试，**不包含Electron功能**：

```bash
npm run dev
```

然后在浏览器中访问：http://localhost:5173

---

### 方式二：启动Electron应用（完整功能）

适用于完整功能测试和使用，**包含所有功能**：

**Windows系统：**

```bash
# 第一步：在第一个终端中启动前端开发服务器
npm run dev

# 第二步：在第二个终端中启动Electron应用
npx electron .
```

或者在命令行中直接打开：

```bash
start npm run dev
npx electron .
```

**使用说明：**
- 第一个终端会启动Vite开发服务器，提供前端界面热更新
- 第二个终端会启动Electron应用窗口
- 修改前端代码后会自动热更新，无需重启
- 数据库等Electron功能完全可用

---

### 方式三：生产构建模式

构建生产版本并运行：

```bash
# 构建所有文件
npm run build

# 运行构建后的应用
npx electron .
```

---

### 方式四：Windows打包

构建Windows安装包：

```bash
npm run build:win
```

安装包将生成在 `release/` 目录中。

---

### 方式五：使用 concurrently（推荐）

安装依赖后，使用以下命令同时启动前端和后端：

```bash
npm run dev:full
```

这将同时启动：
1. Vite开发服务器（端口5173）
2. Electron应用窗口

## 🛠 技术栈

- **框架**：Electron 29.x+
- **前端框架**：Vue 3.4.x+
- **UI组件库**：Element Plus 2.5.x+
- **状态管理**：Pinia 2.1.x+
- **路由**：Vue Router 4.3.x+
- **构建工具**：Vite 5.x+
- **数据库**：SQLite (better-sqlite3)
- **语言**：TypeScript 5.x+
- **测试框架**：Vitest 1.x+
- **代码规范**：ESLint 8.x+ + Prettier

## 📁 项目结构

```
liuyao/
├── docs/                        # 项目文档
│   ├── PRD.md                # 产品需求文档
│   ├── TECHNICAL.md           # 技术设计文档
│   ├── API.md                 # API接口文档
│   └── DATABASE.md            # 数据库设计文档
├── src/
│   ├── main/                  # Electron主进程
│   │   ├── database/         # SQLite数据库操作
│   │   ├── ipc/              # IPC通信处理器
│   │   ├── preload.ts        # 预加载脚本
│   │   └── index.ts          # 主进程入口
│   ├── renderer/              # Vue 3渲染进程（前端）
│   │   ├── assets/           # 静态资源
│   │   ├── components/       # Vue组件
│   │   │   ├── Home.vue
│   │   │   ├── History.vue
│   │   │   ├── Settings.vue
│   │   │   ├── Knowledge.vue
│   │   │   ├── Result.vue
│   │   │   ├── HexagramDisplay.vue
│   │   │   ├── TimeDivination.vue
│   │   │   ├── NumberDivination.vue
│   │   │   ├── CoinDivination.vue
│   │   │   └── ManualDivination.vue
│   │   ├── views/            # 页面视图
│   │   ├── stores/           # Pinia状态管理
│   │   │   ├── divination.ts  # 起卦状态
│   │   │   ├── history.ts      # 历史记录状态
│   │   │   └── settings.ts    # 设置状态
│   │   ├── composables/      # 组合式函数
│   │   │   ├── useDivination.ts
│   │   │   ├── useCalendar.ts
│   │   │   └── useExport.ts
│   │   ├── router/           # 路由配置
│   │   ├── types/            # 类型声明（Electron API）
│   │   ├── main.ts           # 渲染进程入口
│   │   └── App.vue           # 根组件
│   └── shared/               # 主进程和渲染进程共享的代码
│       ├── data/              # 内置数据
│       │   ├── hexagrams.ts   # 六十四卦数据
│       │   └── calendar.ts    # 农历数据
│       ├── types/             # TypeScript类型定义
│       └── utils/             # 工具函数
│           ├── hexagram.ts     # 卦象计算工具
│           └── calendar.ts      # 日历转换工具
├── dist/                       # 前端构建产物
├── dist-electron/              # Electron主进程构建产物
├── package.json
├── tsconfig.json               # 渲染进程TypeScript配置
├── tsconfig.electron.json      # 主进程TypeScript配置
├── vite.config.ts              # Vite构建配置
├── vitest.config.ts            # 测试配置
└── electron-builder.yml         # Electron打包配置
```

## 📦 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动Vite开发服务器（仅前端） |
| `npm run dev:full` | 同时启动Vite和Electron（推荐） |
| `npm run dev:electron` | 仅启动Electron应用 |
| `npm run build` | 构建生产版本 |
| `npm run build:electron` | 仅构建Electron主进程 |
| `npm run build:win` | 构建Windows安装包 |
| `npm run preview` | 预览生产构建 |
| `npm run lint` | 代码检查和自动修复 |
| `npm run typecheck` | TypeScript类型检查 |
| `npm run test` | 运行测试 |
| `npm run test:watch` | 监听模式运行测试 |
| `npm run test:coverage` | 生成测试覆盖率报告 |

## 🗄 数据结构

### 历史记录表 (history)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT | 主键，UUID |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |
| method | TEXT | 起卦方式：time/number/coin/manual |
| original_hexagram_id | INTEGER | 本卦ID |
| changed_hexagram_id | INTEGER | 变卦ID |
| moving_yao_positions | TEXT | 动爻位置，JSON数组 |
| question | TEXT | 预测问题 |
| remark | TEXT | 备注 |
| coin_results | TEXT | 铜钱结果，JSON |
| input_numbers | TEXT | 数字输入，JSON |
| time_info | TEXT | 时间信息，JSON |
| lunar_date | TEXT | 农历日期，JSON |
| gan_zhi | TEXT | 干支信息，JSON |

### 设置表 (settings)
| 字段 | 类型 | 说明 |
|------|------|------|
| key | TEXT | 主键，设置项名称 |
| value | TEXT | 设置值 |
| updated_at | DATETIME | 更新时间 |

## 📋 内置数据

### 六十四卦
- 完整的64卦数据
- 每卦包含：卦象、上卦、下卦、卦辞、彖辞、象辞
- 五行属性、宫位信息

### 八卦基础
- 八卦名称、符号（卦象）
- 五行、自然、家庭、方位、季节属性

### 农历数据
- 1900-2100年完整农历数据
- 支持公历转农历
- 支持干支计算
- 支持节气计算

## ⚙️ 配置说明

### Vite 配置 (vite.config.ts)
- 开发服务器端口：5173
- 路径别名：`@/` → `src/renderer`，`@shared/` → `src/shared`
- 基础路径：`./` (支持相对路径)

### TypeScript 配置

**渲染进程 (tsconfig.json)**
- Vue 3 + Element Plus 类型支持
- 严格模式开启
- Volar 插件集成

**主进程 (tsconfig.electron.json)**
- CommonJS 模块系统
- Node.js 类型支持
- 共享代码支持

### Electron Builder 配置 (electron-builder.yml)
- 应用 ID：com.liuyao.app
- 产品名称：六爻预测
- 目标平台：Windows (x64, ARM64)
- 安装方式：NSIS
- 支持自定义图标

## 🎨 代码风格

- 使用 ESLint + Prettier
- 遵循 Vue 3 组合式 API 风格指南
- TypeScript 严格模式
- 函数式组件优先
- 单一职责原则

## 📝 开发规范

### Git 提交信息格式
```
<type>(<scope>): <subject>

# type: feat, fix, docs, style, refactor, test, chore
# scope: 模块名称
# subject: 简短描述
```

### 分支策略
- `main`: 稳定版本
- `develop`: 开发分支
- `feature/*`: 功能分支

## 🎯 使用指南

### 起卦流程

1. 在首页选择起卦方式（时间/数字/铜钱/手动）
2. 填写必要信息（日期、数字等）
3. 可选：输入预测问题
4. 点击"开始起卦"按钮
5. 查看解卦结果
6. 可选：添加备注并保存

### 历史记录管理

1. 进入"历史记录"页面
2. 浏览所有起卦记录
3. 可通过关键词搜索
4. 点击查看详情或删除记录
5. 导出需要的数据备份

### 知识库查询

1. 进入"知识库"页面
2. 浏览六十四卦详细信息
3. 查看八卦基础知识
4. 了解各种起卦方法

## ⚠️ 注意事项

1. **数据安全**：所有数据存储在本地，不上传云端
2. **离线使用**：应用完全离线可用
3. **备份建议**：定期通过设置页面导出数据备份
4. **版本兼容**：数据库升级需要考虑迁移策略
5. **系统要求**：仅支持Windows系统
6. **数据持久化**：SQLite数据库存储在用户数据目录

## 📚 参考资料

- 《周易正义》
- 《增删卜易》
- 《卜筮正宗》
- Element Plus 文档：https://element-plus.org/
- Electron 文档：https://www.electronjs.org/docs/
- Vue 3 文档：https://cn.vuejs.org/
- Vite 文档：https://cn.vitejs.dev/

## 🔄 版本历史

### v1.0.0 (当前版本)
- ✅ 实现四种起卦方式
- ✅ 实现完整解卦功能
- ✅ 实现历史记录管理
- ✅ 实现知识库查询
- ✅ 实现系统设置
- ✅ 支持数据导出和备份
- ✅ 完成六十四卦数据
- ✅ 实现农历日历转换
- ✅ 实现干支计算

## 📄 License

本项目仅供学习和研究使用。

---

**开发团队**：Claude Code
**最后更新**：2026-02-28
