<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h1 class="page-title">运势仪表盘</h1>
      <p class="page-subtitle">可视化分析您的起卦记录</p>
    </div>

    <!-- 概览卡片 -->
    <div class="summary-cards" v-if="summary">
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6">
          <el-card class="summary-card">
            <div class="card-value">{{ summary.totalRecords }}</div>
            <div class="card-label">总起卦数</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card class="summary-card lucky">
            <div class="card-value">{{ summary.luckyCount }}</div>
            <div class="card-label">吉卦</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card class="summary-card neutral">
            <div class="card-value">{{ summary.neutralCount }}</div>
            <div class="card-label">平卦</div>
          </el-card>
        </el-col>
        <el-col :xs="12" :sm="6">
          <el-card class="summary-card unlucky">
            <div class="card-value">{{ summary.unluckyCount }}</div>
            <div class="card-label">凶卦</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 趋势图 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span>运势趋势</span>
          <el-radio-group v-model="trendRange" size="small">
            <el-radio-button label="7">近7天</el-radio-button>
            <el-radio-button label="30">近30天</el-radio-button>
            <el-radio-button label="all">全部</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      <div ref="trendChartRef" class="chart-container"></div>
    </el-card>

    <!-- 卦象分布和词云 -->
    <el-row :gutter="16">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <span>卦象分布 TOP 10</span>
          </template>
          <div ref="distributionChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card">
          <template #header>
            <span>关键词词云</span>
          </template>
          <div ref="wordCloudRef" class="chart-container word-cloud">
            <div class="word-cloud-content" v-if="keywords.length > 0">
              <span
                v-for="keyword in keywords"
                :key="keyword.word"
                class="word-item"
                :class="keyword.sentiment"
                :style="{ fontSize: getWordSize(keyword.count) + 'px' }"
              >
                {{ keyword.word }}
              </span>
            </div>
            <el-empty v-else description="暂无数据" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 周期报告 -->
    <el-card class="report-card" v-if="report">
      <template #header>
        <span>周期报告</span>
      </template>
      <div class="report-content">
        <el-row :gutter="16">
          <el-col :span="8">
            <div class="report-item">
              <span class="report-label">总起卦数</span>
              <span class="report-value">{{ report.totalDivinations }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="report-item">
              <span class="report-label">平均每周</span>
              <span class="report-value">{{ report.averagePerWeek }} 次</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="report-item">
              <span class="report-label">常见卦象</span>
              <span class="report-value">{{ summary?.mostFrequentHexagram || '-' }}</span>
            </div>
          </el-col>
        </el-row>
        <el-divider />
        <div class="insights" v-if="report.insights.length > 0">
          <div class="insights-title">洞察分析</div>
          <ul>
            <li v-for="(insight, index) in report.insights" :key="index">{{ insight }}</li>
          </ul>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

interface Summary {
  totalRecords: number
  luckyCount: number
  unluckyCount: number
  neutralCount: number
  mostFrequentHexagram: string
  recentTrend: 'up' | 'down' | 'stable'
}

interface TrendData {
  date: string
  fortune: '吉' | '凶' | '平'
  score: number
  count: number
}

interface KeywordItem {
  word: string
  count: number
  sentiment: 'positive' | 'negative' | 'neutral'
}

interface HexagramDistribution {
  hexagramName: string
  count: number
  percentage: number
}

interface CycleReport {
  totalDivinations: number
  averagePerWeek: number
  peakDays: string[]
  lunarCorrelation: string
  insights: string[]
}

const summary = ref<Summary | null>(null)
const trendData = ref<TrendData[]>([])
const keywords = ref<KeywordItem[]>([])
const distribution = ref<HexagramDistribution[]>([])
const report = ref<CycleReport | null>(null)
const trendRange = ref('30')

const trendChartRef = ref<HTMLElement>()
const distributionChartRef = ref<HTMLElement>()
const wordCloudRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let distributionChart: echarts.ECharts | null = null

onMounted(async () => {
  await loadData()
})

watch(trendRange, async () => {
  await loadTrendData()
  nextTick(() => {
    renderTrendChart()
  })
})

async function loadData() {
  await Promise.all([
    loadSummary(),
    loadTrendData(),
    loadKeywords(),
    loadDistribution(),
    loadReport()
  ])
  nextTick(() => {
    renderTrendChart()
    renderDistributionChart()
  })
}

async function loadSummary() {
  try {
    summary.value = await window.electronAPI.dashboard.getSummary()
  } catch (error) {
    console.error('Failed to load summary:', error)
  }
}

async function loadTrendData() {
  try {
    let startDate: string | undefined
    let endDate: string | undefined

    if (trendRange.value !== 'all') {
      const days = parseInt(trendRange.value)
      const end = new Date()
      const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
      startDate = start.toISOString().split('T')[0]
      endDate = end.toISOString().split('T')[0]
    }

    trendData.value = await window.electronAPI.dashboard.getTrend(startDate, endDate)
  } catch (error) {
    console.error('Failed to load trend data:', error)
  }
}

async function loadKeywords() {
  try {
    keywords.value = await window.electronAPI.dashboard.getKeywordCloud(50)
  } catch (error) {
    console.error('Failed to load keywords:', error)
  }
}

async function loadDistribution() {
  try {
    distribution.value = await window.electronAPI.dashboard.getHexagramDistribution()
  } catch (error) {
    console.error('Failed to load distribution:', error)
  }
}

async function loadReport() {
  try {
    report.value = await window.electronAPI.dashboard.getCycleReport()
  } catch (error) {
    console.error('Failed to load report:', error)
  }
}

function renderTrendChart() {
  if (!trendChartRef.value) return

  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: trendData.value.map(d => d.date.slice(5)),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: (value: number) => {
          if (value >= 65) return '吉'
          if (value <= 35) return '凶'
          return '平'
        }
      }
    },
    series: [
      {
        name: '运势得分',
        type: 'line',
        data: trendData.value.map(d => d.score),
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        lineStyle: {
          color: '#409EFF'
        },
        itemStyle: {
          color: '#409EFF'
        }
      }
    ]
  }

  trendChart.setOption(option)
}

function renderDistributionChart() {
  if (!distributionChartRef.value) return

  if (!distributionChart) {
    distributionChart = echarts.init(distributionChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}次 ({d}%)'
    },
    series: [
      {
        name: '卦象分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: distribution.value.map(d => ({
          name: d.hexagramName,
          value: d.count
        }))
      }
    ]
  }

  distributionChart.setOption(option)
}

function getWordSize(count: number): number {
  const minSize = 12
  const maxSize = 28
  const maxCount = Math.max(...keywords.value.map(k => k.count))
  return minSize + ((count / maxCount) * (maxSize - minSize))
}
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
}

.summary-cards {
  margin-bottom: 24px;
}

.summary-card {
  text-align: center;
  padding: 20px 0;
}

.card-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.card-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

.summary-card.lucky .card-value {
  color: #67C23A;
}

.summary-card.unlucky .card-value {
  color: #F56C6C;
}

.summary-card.neutral .card-value {
  color: #E6A23C;
}

.chart-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-container {
  height: 300px;
  width: 100%;
}

.word-cloud {
  display: flex;
  align-items: center;
  justify-content: center;
}

.word-cloud-content {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 20px;
}

.word-item {
  padding: 4px 8px;
  border-radius: 4px;
  transition: transform 0.2s;
  cursor: default;
}

.word-item:hover {
  transform: scale(1.1);
}

.word-item.positive {
  color: #67C23A;
  background: rgba(103, 194, 58, 0.1);
}

.word-item.negative {
  color: #F56C6C;
  background: rgba(245, 108, 108, 0.1);
}

.word-item.neutral {
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
}

.report-card {
  margin-bottom: 24px;
}

.report-content {
  padding: 8px 0;
}

.report-item {
  text-align: center;
}

.report-label {
  display: block;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.report-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.insights-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.insights ul {
  list-style: none;
  padding: 0;
}

.insights li {
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.insights li:last-child {
  border-bottom: none;
}
</style>