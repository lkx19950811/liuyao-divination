# 六爻预测 v1.3 API 文档

## 文档信息

| 项目 | 内容 |
|------|------|
| 版本 | 1.3.0 |
| 更新日期 | 2026-03-04 |

---

## 1. 概述

v1.3 版本新增了物理引擎、AI 角色扮演、数据可视化等功能的 API 接口。本文档仅包含新增/变更的 API，完整 API 请参考 [v1.0 API 文档](../v1.0/API.md)。

---

## 2. 物理引擎 API

### 2.1 CoinPhysicsEngine 类

铜钱物理引擎，基于 Matter.js 封装。

```typescript
interface CoinPhysicsOptions {
  containerWidth: number;
  containerHeight: number;
  coinRadius: number;
  gravity: { x: number; y: number };
  friction: number;
  restitution: number;
}

class CoinPhysicsEngine {
  constructor(options: CoinPhysicsOptions);

  // 初始化引擎
  init(canvas: HTMLCanvasElement): void;

  // 添加摇动力
  applyShake(force: { x: number; y: number }): void;

  // 获取当前铜钱状态
  getCoinStates(): CoinState[];

  // 开始模拟
  start(): void;

  // 停止模拟
  stop(): void;

  // 销毁引擎
  destroy(): void;

  // 事件监听
  on(event: 'coinLanded' | 'allStable', callback: Function): void;
}

interface CoinState {
  id: number;
  position: { x: number; y: number };
  rotation: number;
  isHeads: boolean;
  velocity: { x: number; y: number };
  angularVelocity: number;
}
```

### 2.2 使用示例

```typescript
const engine = new CoinPhysicsEngine({
  containerWidth: 300,
  containerHeight: 400,
  coinRadius: 25,
  gravity: { x: 0, y: 1 },
  friction: 0.3,
  restitution: 0.6
});

engine.init(canvasElement);

// 监听铜钱落地事件
engine.on('coinLanded', (coin: CoinState) => {
  console.log(`Coin ${coin.id} landed: ${coin.isHeads ? '正' : '反'}`);
});

// 监听所有铜钱静止
engine.on('allStable', (coins: CoinState[]) => {
  const result = coins.map(c => c.isHeads);
  // 根据正反面计算爻
});

// 应用摇动力
function onShake() {
  engine.applyShake({
    x: (Math.random() - 0.5) * 20,
    y: -Math.random() * 15
  });
}
```

---

## 3. AI 角色扮演 API

### 3.1 AIRoleplayManager 类

管理 AI 人格和多轮对话。

```typescript
type PersonaType = 'scholar' | 'mentor' | 'mystic';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Session {
  id: string;
  divinationId: string;
  persona: PersonaType;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

class AIRoleplayManager {
  // 获取可用人格列表
  getPersonas(): PersonaInfo[];

  // 设置当前人格
  setPersona(persona: PersonaType): void;

  // 获取当前人格
  getCurrentPersona(): PersonaType;

  // 创建新会话
  createSession(divinationId: string): Session;

  // 发送消息
  async sendMessage(sessionId: string, message: string): Promise<string>;

  // 获取会话历史
  getSessionHistory(sessionId: string): ChatMessage[];

  // 删除会话
  deleteSession(sessionId: string): void;
}

interface PersonaInfo {
  id: PersonaType;
  name: string;
  description: string;
  avatar: string;
}
```

### 3.2 人格 Prompt 模板

```typescript
const PERSONA_PROMPTS: Record<PersonaType, string> = {
  scholar: `你是一位严谨的易学大师，精通《周易》、《增删卜易》等经典著作。
请用专业的角度解读卦象，引用古籍原文，解释术语含义。
回答风格：严肃、专业、详尽。`,

  mentor: `你是一位现代生活导师，擅长将古老智慧与现代生活结合。
请用通俗易懂的语言解读卦象，结合职场、情感、人际关系等场景。
回答风格：亲切、实用、接地气。`,

  mystic: `你是一位神秘的隐士，洞察天机却不轻易泄露。
请用诗意、隐喻的方式解读卦象，留有思考和想象的空间。
回答风格：玄妙、诗意、引人深思。`
};
```

### 3.3 使用示例

```typescript
const manager = new AIRoleplayManager();

// 设置人格
manager.setPersona('mystic');

// 创建会话
const session = manager.createSession(divinationResult.id);

// 发送消息
const response = await manager.sendMessage(
  session.id,
  '大师，这个卦象对事业发展有何启示？'
);

console.log(response);

// 继续追问
const followUp = await manager.sendMessage(
  session.id,
  '那在这个月内有什么需要注意的时间点吗？'
);
```

---

## 4. 数据可视化 API

### 4.1 FortuneDashboard 类

运势可视化仪表盘。

```typescript
interface TrendData {
  date: string;
  fortune: '吉' | '凶' | '平';
  score: number;
}

interface KeywordCloud {
  keyword: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface HexagramDistribution {
  hexagramName: string;
  count: number;
  percentage: number;
}

class FortuneDashboard {
  // 获取吉凶趋势数据
  getTrendData(startDate: Date, endDate: Date): Promise<TrendData[]>;

  // 获取关键词词云数据
  getKeywordCloud(startDate: Date): Promise<KeywordCloud[]>;

  // 获取卦象分布
  getHexagramDistribution(): Promise<HexagramDistribution[]>;

  // 获取周期律报告
  getCycleReport(): Promise<CycleReport>;

  // 生成报告（PDF/图片）
  generateReport(format: 'pdf' | 'image'): Promise<Blob>;
}

interface CycleReport {
  totalDivinations: number;
  averagePerWeek: number;
  peakDays: string[];
  lunarCorrelation: number;
  insights: string[];
}
```

### 4.2 ECharts 配置示例

```typescript
// 吉凶趋势图配置
const trendChartOption = {
  title: { text: '运势趋势' },
  xAxis: { type: 'category', data: dates },
  yAxis: { type: 'value', min: 0, max: 100 },
  series: [{
    type: 'line',
    data: scores,
    smooth: true,
    areaStyle: { opacity: 0.3 }
  }]
};

// 卦象分布饼图
const pieChartOption = {
  title: { text: '卦象分布' },
  series: [{
    type: 'pie',
    radius: '50%',
    data: distributionData
  }]
};
```

---

## 5. 环境感知 API

### 5.1 WeatherService 类

天气服务。

```typescript
interface WeatherInfo {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy';
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
}

class WeatherService {
  // 获取当前天气（根据 IP 定位）
  async getCurrentWeather(): Promise<WeatherInfo>;

  // 根据城市名获取天气
  async getWeatherByCity(city: string): Promise<WeatherInfo>;

  // 获取缓存的天气（离线可用）
  getCachedWeather(): WeatherInfo | null;
}
```

### 5.2 AudioService 类

音频服务。

```typescript
type AudioTrack =
  | 'guqin_calm'      // 古琴 - 平静
  | 'guqin_joyful'    // 古琴 - 欢快
  | 'bianzhong_mystic' // 编钟 - 神秘
  | 'flute_nature'    // 笛子 - 自然
  | 'rain_ambient'    // 雨声白噪音
  | 'thunder_ambient'; // 雷声白噪音

class AudioService {
  // 播放音轨
  play(track: AudioTrack, options?: PlayOptions): void;

  // 停止播放
  stop(): void;

  // 设置音量
  setVolume(volume: number): void;

  // 根据卦象推荐音轨
  recommendTrack(hexagram: Hexagram): AudioTrack;

  // 根据天气推荐音轨
  recommendByWeather(weather: WeatherInfo): AudioTrack;
}

interface PlayOptions {
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
}
```

---

## 6. 游戏系统 API

### 6.1 GameService 类

游戏服务。

```typescript
type GameType = 'hexagram_match' | 'divination_challenge' | 'yaoci_quiz';

interface GameResult {
  score: number;
  correct: number;
  total: number;
  timeUsed: number;
  achievements: string[];
}

class GameService {
  // 开始游戏
  startGame(type: GameType, difficulty: 'easy' | 'medium' | 'hard'): GameSession;

  // 提交答案
  submitAnswer(sessionId: string, answer: any): boolean;

  // 结束游戏
  endGame(sessionId: string): GameResult;

  // 获取排行榜
  getLeaderboard(type: GameType): LeaderboardEntry[];
}

interface GameSession {
  id: string;
  type: GameType;
  difficulty: string;
  questions: Question[];
  currentQuestion: number;
  score: number;
  startTime: number;
}
```

### 6.2 AchievementService 类

成就服务。

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
  progress: number;
  total: number;
}

class AchievementService {
  // 获取所有成就
  getAllAchievements(): Achievement[];

  // 检查并解锁成就
  checkAchievement(action: string, data: any): Achievement[];

  // 获取解锁进度
  getProgress(): { unlocked: number; total: number };
}
```

---

## 7. 桌面挂件 API

### 7.1 WidgetService 类

```typescript
interface WidgetConfig {
  enabled: boolean;
  position: { x: number; y: number };
  opacity: number;
  autoStart: boolean;
  showType: 'daily_fortune' | 'recent_hexagram' | 'custom';
}

class WidgetService {
  // 启用挂件
  enable(): void;

  // 禁用挂件
  disable(): void;

  // 更新配置
  updateConfig(config: Partial<WidgetConfig>): void;

  // 获取配置
  getConfig(): WidgetConfig;

  // 设置开机自启
  setAutoStart(enabled: boolean): void;
}
```

### 7.2 WallpaperService 类

```typescript
interface WallpaperStyle {
  background: string;
  textColor: string;
  fontFamily: string;
  decorationStyle: 'classic' | 'modern' | 'minimal';
}

class WallpaperService {
  // 生成壁纸
  generate(hexagram: Hexagram, style: WallpaperStyle): Promise<Blob>;

  // 保存壁纸
  save(blob: Blob, filename: string): Promise<string>;

  // 获取预设样式
  getPresetStyles(): WallpaperStyle[];
}
```

---

## 8. 数据库变更

### 8.1 新增表结构

```sql
-- AI 会话表
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  divination_id TEXT NOT NULL,
  persona TEXT NOT NULL,
  messages TEXT NOT NULL, -- JSON array
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (divination_id) REFERENCES divinations(id)
);

-- 成就表
CREATE TABLE achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at INTEGER,
  progress INTEGER DEFAULT 0,
  total INTEGER DEFAULT 1
);

-- 摇铜钱元数据表
CREATE TABLE coin_toss_metadata (
  id TEXT PRIMARY KEY,
  divination_id TEXT NOT NULL,
  toss_index INTEGER NOT NULL,
  shake_force REAL,
  shake_duration REAL,
  trajectory TEXT, -- JSON array
  result TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (divination_id) REFERENCES divinations(id)
);

-- 游戏记录表
CREATE TABLE game_records (
  id TEXT PRIMARY KEY,
  game_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  score INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  time_used INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
```

---

## 9. IPC 通信新增

### 9.1 主进程暴露的 API

```typescript
// weather:get
ipcMain.handle('weather:get', async () => {
  return await weatherService.getCurrentWeather();
});

// audio:play
ipcMain.handle('audio:play', async (_, track: AudioTrack) => {
  audioService.play(track);
});

// widget:toggle
ipcMain.handle('widget:toggle', async (_, enabled: boolean) => {
  widgetService.setEnabled(enabled);
});

// wallpaper:generate
ipcMain.handle('wallpaper:generate', async (_, hexagram, style) => {
  return await wallpaperService.generate(hexagram, style);
});
```