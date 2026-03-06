# 六爻预测 v1.3 技术文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 版本 | 1.3.0 |
| 更新日期 | 2026-03-04 |

---

## 1. 概述

v1.3 版本在现有架构基础上，新增物理引擎、AI 角色扮演、数据可视化等模块。本文档描述新增模块的技术实现方案。

---

## 2. 技术架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Electron 主进程                         │
├─────────────────────────────────────────────────────────────┤
│  WidgetService  │  AudioService  │  WeatherService          │
└─────────────────────────────────────────────────────────────┘
                              │
                         IPC 通信
                              │
┌─────────────────────────────────────────────────────────────┐
│                      渲染进程 (Vue 3)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 物理引擎模块 │  │ AI角色模块  │  │ 可视化模块  │         │
│  │ (Matter.js) │  │ (Ollama)    │  │ (ECharts)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 游戏模块    │  │ 挂件模块    │  │ 壁纸模块    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                        SQLite (better-sqlite3)
```

### 2.2 新增技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Matter.js | ^0.19.0 | 2D 物理引擎 |
| ECharts | ^5.5.0 | 数据可视化图表 |
| WordCloud2.js | ^1.1.2 | 词云生成 |
| Howler.js | ^2.2.4 | 音频播放（可选） |

---

## 3. 物理引擎模块

### 3.1 目录结构

```
src/
├── physics/
│   ├── CoinPhysicsEngine.ts    # 物理引擎核心类
│   ├── Coin.ts                  # 铜钱实体
│   ├── Container.ts             # 容器边界
│   ├── types.ts                 # 类型定义
│   └── utils/
│       ├── collision.ts         # 碰撞检测
│       └── render.ts            # 渲染工具
└── components/
    └── CoinToss/
        ├── CoinTossCanvas.vue   # 物理画布组件
        ├── CoinTossControls.vue # 控制面板
        └── CoinTossResult.vue   # 结果展示
```

### 3.2 Matter.js 集成

```typescript
// src/physics/CoinPhysicsEngine.ts
import Matter from 'matter-js';

export class CoinPhysicsEngine {
  private engine: Matter.Engine;
  private render: Matter.Render;
  private world: Matter.World;
  private coins: Matter.Body[] = [];
  private container: Matter.Body;

  constructor(private options: CoinPhysicsOptions) {
    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: options.gravity.y }
    });
    this.world = this.engine.world;
  }

  init(canvas: HTMLCanvasElement): void {
    // 创建渲染器
    this.render = Matter.Render.create({
      canvas,
      engine: this.engine,
      options: {
        width: this.options.containerWidth,
        height: this.options.containerHeight,
        wireframes: false,
        background: 'transparent'
      }
    });

    // 创建容器边界
    this.createContainer();

    // 创建三枚铜钱
    this.createCoins();

    // 启动引擎
    Matter.Engine.run(this.engine);
    Matter.Render.run(this.render);
  }

  private createContainer(): void {
    const { containerWidth, containerHeight } = this.options;
    const wallThickness = 10;

    const walls = [
      // 底部
      Matter.Bodies.rectangle(
        containerWidth / 2,
        containerHeight + wallThickness / 2,
        containerWidth,
        wallThickness,
        { isStatic: true, render: { visible: false } }
      ),
      // 左侧
      Matter.Bodies.rectangle(
        -wallThickness / 2,
        containerHeight / 2,
        wallThickness,
        containerHeight,
        { isStatic: true, render: { visible: false } }
      ),
      // 右侧
      Matter.Bodies.rectangle(
        containerWidth + wallThickness / 2,
        containerHeight / 2,
        wallThickness,
        containerHeight,
        { isStatic: true, render: { visible: false } }
      )
    ];

    Matter.World.add(this.world, walls);
  }

  private createCoins(): void {
    const { containerWidth, coinRadius } = this.options;

    for (let i = 0; i < 3; i++) {
      const coin = Matter.Bodies.circle(
        containerWidth / 2 + (i - 1) * coinRadius * 2.5,
        50,
        coinRadius,
        {
          restitution: this.options.restitution,
          friction: this.options.friction,
          frictionAir: 0.01,
          render: {
            sprite: {
              texture: this.getCoinTexture(),
              xScale: 1,
              yScale: 1
            }
          }
        }
      );

      this.coins.push(coin);
      Matter.World.add(this.world, coin);
    }
  }

  applyShake(force: { x: number; y: number }): void {
    this.coins.forEach(coin => {
      Matter.Body.applyForce(coin, coin.position, {
        x: force.x * 0.001,
        y: force.y * 0.001
      });
    });
  }

  getCoinStates(): CoinState[] {
    return this.coins.map((coin, index) => ({
      id: index,
      position: { x: coin.position.x, y: coin.position.y },
      rotation: coin.angle,
      isHeads: this.determineHeads(coin.angle),
      velocity: { x: coin.velocity.x, y: coin.velocity.y },
      angularVelocity: coin.angularVelocity
    }));
  }

  private determineHeads(angle: number): boolean {
    // 根据角度判断正反面
    const normalizedAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return normalizedAngle < Math.PI / 2 || normalizedAngle > Math.PI * 3 / 2;
  }

  destroy(): void {
    Matter.Render.stop(this.render);
    Matter.Engine.clear(this.engine);
  }
}
```

### 3.3 Vue 组件集成

```vue
<!-- src/components/CoinToss/CoinTossCanvas.vue -->
<template>
  <div class="coin-toss-container">
    <canvas ref="canvasRef" class="coin-canvas"></canvas>
    <div class="controls">
      <el-button @mousedown="startShake" @mouseup="stopShake" @mouseleave="stopShake">
        按住摇动
      </el-button>
      <el-button @click="quickResult">快速出结果</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { CoinPhysicsEngine } from '@/physics/CoinPhysicsEngine';

const canvasRef = ref<HTMLCanvasElement>();
let engine: CoinPhysicsEngine | null = null;
let shakeInterval: number | null = null;

onMounted(() => {
  if (canvasRef.value) {
    engine = new CoinPhysicsEngine({
      containerWidth: 300,
      containerHeight: 400,
      coinRadius: 25,
      gravity: { x: 0, y: 1 },
      friction: 0.3,
      restitution: 0.6
    });
    engine.init(canvasRef.value);

    engine.on('allStable', (coins) => {
      emit('result', coins);
    });
  }
});

function startShake() {
  shakeInterval = window.setInterval(() => {
    engine?.applyShake({
      x: (Math.random() - 0.5) * 30,
      y: -Math.random() * 20
    });
  }, 50);
}

function stopShake() {
  if (shakeInterval) {
    clearInterval(shakeInterval);
    shakeInterval = null;
  }
}

function quickResult() {
  // 直接生成随机结果
  const results = Array.from({ length: 6 }, () => ({
    isHeads: Math.random() > 0.5
  }));
  emit('quickResult', results);
}

onUnmounted(() => {
  engine?.destroy();
});
</script>
```

---

## 4. AI 角色扮演模块

### 4.1 目录结构

```
src/
├── ai/
│   ├── PersonaManager.ts      # 人格管理
│   ├── SessionManager.ts      # 会话管理
│   ├── prompts/
│   │   ├── scholar.ts         # 严谨易学大师
│   │   ├── mentor.ts          # 现代生活导师
│   │   └── mystic.ts          # 神秘隐士
│   └── types.ts
└── stores/
    └── aiSession.ts           # Pinia store
```

### 4.2 人格 Prompt 设计

```typescript
// src/ai/prompts/scholar.ts
export const SCHOLAR_PROMPT = `你是一位精通六爻预测的易学大师，拥有深厚的学术功底。

【身份设定】
- 精通《周易》、《增删卜易》、《卜筮正宗》等经典著作
- 治学严谨，注重经典原文引用
- 分析卦象时条理清晰，逻辑严密

【回答风格】
- 引用古籍原文时标注出处
- 专业术语给出解释
- 分析全面，涵盖用神、原神、忌神、仇神
- 判断吉凶时有理有据

【输出格式】
1. 引用经典
2. 卦象分析
3. 爻辞解读
4. 综合判断
5. 建议事项`;

// src/ai/prompts/mentor.ts
export const MENTOR_PROMPT = `你是一位现代生活导师，善于将古老智慧与现代生活结合。

【身份设定】
- 了解现代人的生活压力和困惑
- 擅长用通俗语言解释复杂概念
- 给出切实可行的建议

【回答风格】
- 用职场、情感、人际关系等现代场景举例
- 避免晦涩的专业术语
- 语言亲切，像朋友聊天
- 给出具体行动建议

【输出格式】
1. 一句话总结
2. 现实场景解读
3. 具体建议
4. 注意事项`;

// src/ai/prompts/mystic.ts
export const MYSTIC_PROMPT = `你是一位隐居深山的神秘隐士，洞察天机却不轻易泄露。

【身份设定】
- 话语玄妙，留有余地
- 善用比喻和隐喻
- 透露一部分，保留一部分

【回答风格】
- 使用诗意化的语言
- 多用自然意象（风、水、山、云）
- 点到为止，引人深思
- 偶尔用典故或诗词

【输出格式】
诗偈开篇
隐喻解读
玄机提示`;
```

### 4.3 会话管理实现

```typescript
// src/ai/SessionManager.ts
import { v4 as uuid } from 'uuid';
import db from '@/database';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class SessionManager {
  private currentSessionId: string | null = null;

  createSession(divinationId: string, persona: PersonaType): string {
    const sessionId = uuid();
    const now = Date.now();

    db.prepare(`
      INSERT INTO sessions (id, divination_id, persona, messages, created_at, updated_at)
      VALUES (?, ?, ?, '[]', ?, ?)
    `).run(sessionId, divinationId, persona, now, now);

    this.currentSessionId = sessionId;
    return sessionId;
  }

  async sendMessage(message: string): Promise<string> {
    if (!this.currentSessionId) {
      throw new Error('No active session');
    }

    const session = this.getSession(this.currentSessionId);
    const messages = JSON.parse(session.messages);

    // 添加用户消息
    messages.push({
      role: 'user',
      content: message,
      timestamp: Date.now()
    });

    // 构建 Prompt
    const systemPrompt = this.getSystemPrompt(session.persona);
    const context = this.buildContext(messages);

    // 调用 Ollama
    const response = await this.callOllama(systemPrompt, context);

    // 添加 AI 回复
    messages.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    });

    // 更新数据库
    db.prepare(`
      UPDATE sessions SET messages = ?, updated_at = ?
      WHERE id = ?
    `).run(JSON.stringify(messages), Date.now(), this.currentSessionId);

    return response;
  }

  private async callOllama(systemPrompt: string, messages: Message[]): Promise<string> {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.getSelectedModel(),
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ],
        stream: false
      })
    });

    const data = await response.json();
    return data.message.content;
  }
}
```

---

## 5. 数据可视化模块

### 5.1 目录结构

```
src/
├── visualization/
│   ├── DashboardService.ts    # 仪表盘数据服务
│   ├── charts/
│   │   ├── TrendChart.vue     # 趋势图
│   │   ├── DistributionChart.vue # 分布图
│   │   └── WordCloud.vue      # 词云
│   └── utils/
│       ├── dataProcessor.ts   # 数据处理
│       └── nlpHelper.ts       # NLP 辅助
└── views/
    └── Dashboard.vue          # 仪表盘页面
```

### 5.2 趋势图组件

```vue
<!-- src/visualization/charts/TrendChart.vue -->
<template>
  <div ref="chartRef" class="trend-chart"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import db from '@/database';

const props = defineProps<{
  startDate: Date;
  endDate: Date;
}>();

const chartRef = ref<HTMLElement>();
let chart: echarts.ECharts | null = null;

onMounted(() => {
  if (chartRef.value) {
    chart = echarts.init(chartRef.value);
    updateChart();
  }
});

watch(() => [props.startDate, props.endDate], updateChart);

async function updateChart() {
  const data = getTrendData(props.startDate, props.endDate);

  chart?.setOption({
    title: { text: '运势趋势', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: data.dates
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 70) return '吉';
          if (value >= 40) return '平';
          return '凶';
        }
      }
    },
    series: [{
      type: 'line',
      data: data.scores,
      smooth: true,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(58, 147, 229, 0.5)' },
          { offset: 1, color: 'rgba(58, 147, 229, 0.1)' }
        ])
      },
      lineStyle: { color: '#3a93e5' }
    }]
  });
}

function getTrendData(startDate: Date, endDate: Date) {
  const records = db.prepare(`
    SELECT date(created_at / 1000, 'unixepoch', 'localtime') as date,
           hexagram_name,
           fortune_level
    FROM divinations
    WHERE created_at >= ? AND created_at <= ?
    ORDER BY created_at
  `).all(startDate.getTime(), endDate.getTime());

  // 聚合每日数据
  const dailyScores: Record<string, number[]> = {};
  records.forEach((r: any) => {
    if (!dailyScores[r.date]) dailyScores[r.date] = [];
    dailyScores[r.date].push(this.calculateScore(r.fortune_level));
  });

  return {
    dates: Object.keys(dailyScores),
    scores: Object.values(dailyScores).map(s => s.reduce((a, b) => a + b) / s.length)
  };
}
</script>
```

### 5.3 词云实现

```typescript
// src/visualization/utils/nlpHelper.ts
import db from '@/database';

export async function extractKeywords(
  startDate: Date,
  endDate: Date
): Promise<{ word: string; count: number }[]> {
  // 获取时间范围内的 AI 解读内容
  const records = db.prepare(`
    SELECT ai_interpretation
    FROM divinations
    WHERE created_at >= ? AND created_at <= ?
      AND ai_interpretation IS NOT NULL
  `).all(startDate.getTime(), endDate.getTime()) as { ai_interpretation: string }[];

  // 合并所有文本
  const allText = records.map(r => r.ai_interpretation).join(' ');

  // 使用简单的高频词提取（也可以调用 Ollama）
  const stopWords = new Set(['的', '了', '是', '在', '和', '有', '不', '这', '我', '你']);
  const words = allText.split(/[\s，。！？、；：""''（）]+/)
    .filter(w => w.length >= 2 && !stopWords.has(w));

  // 统计词频
  const wordCount: Record<string, number> = {};
  words.forEach(w => {
    wordCount[w] = (wordCount[w] || 0) + 1;
  });

  // 排序取前 50
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word, count]) => ({ word, count }));
}
```

---

## 6. 环境感知模块

### 6.1 天气服务

```typescript
// src/services/WeatherService.ts
export class WeatherService {
  private cache: WeatherInfo | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 分钟

  async getCurrentWeather(): Promise<WeatherInfo> {
    // 检查缓存
    if (this.cache && Date.now() - this.cacheTime < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      // 使用 Open-Meteo API（免费无需 Key）
      const position = await this.getPosition();
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${position.lat}&longitude=${position.lon}&current=temperature_2m,weather_code`
      );

      const data = await response.json();
      this.cache = this.parseWeather(data);
      this.cacheTime = Date.now();

      return this.cache;
    } catch (error) {
      // 返回缓存或默认值
      return this.cache || this.getDefaultWeather();
    }
  }

  private async getPosition(): Promise<{ lat: number; lon: number }> {
    // 尝试获取 IP 定位
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return { lat: data.latitude, lon: data.longitude };
    } catch {
      // 默认北京
      return { lat: 39.9, lon: 116.4 };
    }
  }

  private parseWeather(data: any): WeatherInfo {
    const code = data.current.weather_code;
    return {
      condition: this.weatherCodeToCondition(code),
      temperature: data.current.temperature_2m,
      description: this.getWeatherDescription(code),
      icon: this.getWeatherIcon(code)
    };
  }

  private weatherCodeToCondition(code: number): WeatherCondition {
    if (code === 0) return 'sunny';
    if (code <= 3) return 'cloudy';
    if (code <= 49) return 'foggy';
    if (code <= 69) return 'rainy';
    if (code <= 79) return 'snowy';
    if (code <= 99) return 'stormy';
    return 'sunny';
  }
}
```

### 6.2 音频服务

```typescript
// src/services/AudioService.ts
import { ipcRenderer } from 'electron';

export type AudioTrack =
  | 'guqin_calm'
  | 'guqin_joyful'
  | 'bianzhong_mystic'
  | 'flute_nature'
  | 'rain_ambient'
  | 'thunder_ambient';

export class AudioService {
  private currentTrack: AudioTrack | null = null;
  private audioElement: HTMLAudioElement | null = null;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.loop = true;
  }

  play(track: AudioTrack): void {
    const audioPath = this.getAudioPath(track);
    if (this.audioElement) {
      this.audioElement.src = audioPath;
      this.audioElement.play();
    }
    this.currentTrack = track;
  }

  stop(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    this.currentTrack = null;
  }

  setVolume(volume: number): void {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  recommendByHexagram(hexagram: { name: string; element: string }): AudioTrack {
    const elementMap: Record<string, AudioTrack> = {
      '水': 'flute_nature',
      '火': 'guqin_joyful',
      '木': 'guqin_calm',
      '金': 'bianzhong_mystic',
      '土': 'guqin_calm'
    };
    return elementMap[hexagram.element] || 'guqin_calm';
  }

  private getAudioPath(track: AudioTrack): string {
    return `file://${__dirname}/assets/audio/${track}.mp3`;
  }
}
```

---

## 7. 游戏模块

### 7.1 目录结构

```
src/
├── games/
│   ├── GameEngine.ts          # 游戏引擎基类
│   ├── HexagramMatch.ts       # 卦象连连看
│   ├── DivinationChallenge.ts # 断卦挑战
│   ├── AchievementManager.ts  # 成就管理
│   └── types.ts
└── views/
    └── Games.vue              # 游戏入口页面
```

### 7.2 成就系统

```typescript
// src/games/AchievementManager.ts
import db from '@/database';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_divination',
    name: '初窥门径',
    description: '完成首次起卦',
    icon: '🎯',
    unlockedAt: null
  },
  {
    id: 'hexagram_master',
    name: '登堂入室',
    description: '断卦挑战正确率达到 80%',
    icon: '🏆',
    unlockedAt: null
  },
  {
    id: 'coin_shaker',
    name: '铜钱达人',
    description: '使用物理引擎完成 100 次起卦',
    icon: '🪙',
    unlockedAt: null
  }
];

export class AchievementManager {
  check(action: string, data: any): Achievement[] {
    const unlocked: Achievement[] = [];

    switch (action) {
      case 'divination_complete':
        if (this.checkFirstDivination()) {
          unlocked.push(this.unlock('first_divination'));
        }
        break;
      case 'game_complete':
        if (data.accuracy >= 0.8) {
          unlocked.push(this.unlock('hexagram_master'));
        }
        break;
    }

    return unlocked;
  }

  private unlock(id: string): Achievement {
    const now = Date.now();
    db.prepare(`
      INSERT OR REPLACE INTO achievements (id, unlocked_at)
      VALUES (?, ?)
    `).run(id, now);

    const achievement = ACHIEVEMENTS.find(a => a.id === id)!;
    return { ...achievement, unlockedAt: now };
  }
}
```

---

## 8. 数据库迁移

### 8.1 迁移脚本

```typescript
// src/database/migrations/v1.3.ts
import db from '../index';

export function migrateToV13(): void {
  // 创建 sessions 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      divination_id TEXT NOT NULL,
      persona TEXT NOT NULL,
      messages TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (divination_id) REFERENCES divinations(id)
    )
  `);

  // 创建 achievements 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      unlocked_at INTEGER
    )
  `);

  // 创建 coin_toss_metadata 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS coin_toss_metadata (
      id TEXT PRIMARY KEY,
      divination_id TEXT NOT NULL,
      toss_index INTEGER NOT NULL,
      shake_force REAL,
      shake_duration REAL,
      trajectory TEXT,
      result TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (divination_id) REFERENCES divinations(id)
    )
  `);

  // 创建 game_records 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS game_records (
      id TEXT PRIMARY KEY,
      game_type TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      score INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      total INTEGER NOT NULL,
      time_used INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  // 更新版本号
  db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`).run('db_version', '1.3');
}
```

---

## 9. 性能优化

### 9.1 物理引擎优化

- 使用 `requestAnimationFrame` 控制渲染循环
- 在铜钱静止后暂停物理计算
- 提供低配模式降低精度

### 9.2 音频资源优化

- 使用 MP3 格式压缩音频
- 按需加载音频文件
- 音频预加载策略

### 9.3 图表渲染优化

- 使用 ECharts 按需引入
- 数据量大时使用数据采样
- 图表懒加载

---

## 10. 测试策略

### 10.1 单元测试

- 物理引擎：测试碰撞检测、正反面判定
- AI 模块：测试 Prompt 生成、会话管理
- 游戏模块：测试得分计算、成就解锁

### 10.2 集成测试

- 端到端起卦流程
- AI 多轮对话流程
- 数据可视化数据流

---

## 11. 部署说明

### 11.1 资源文件

新增资源目录：
```
resources/
├── audio/
│   ├── guqin_calm.mp3
│   ├── guqin_joyful.mp3
│   ├── bianzhong_mystic.mp3
│   ├── flute_nature.mp3
│   ├── rain_ambient.mp3
│   └── thunder_ambient.mp3
└── images/
    └── coin/
        ├── heads.png
        └── tails.png
```

### 11.2 打包配置更新

```json
// package.json
{
  "build": {
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "resources/**/*",
      "package.json"
    ]
  }
}
```