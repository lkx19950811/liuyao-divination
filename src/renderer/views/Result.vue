<template>
  <div class="result-page">
    <div class="page-header">
      <el-button @click="router.back()" :icon="ArrowLeft" circle />
      <h1 class="page-title">解卦结果</h1>
    </div>

    <div v-if="!divinationStore.hasResult" class="empty-result">
      <el-empty description="暂无卦象结果，请先起卦" />
      <el-button type="primary" @click="router.push('/')">去起卦</el-button>
    </div>

    <div v-else class="result-content">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-card class="hexagram-card">
            <template #header>
              <div class="card-header">
                <span>本卦：{{ result?.originalHexagram.name }}</span>
                <el-tag v-if="result?.changedHexagram" type="warning">有变爻</el-tag>
              </div>
            </template>
            <HexagramDisplay 
              :hexagram="result!.originalHexagram" 
              :moving-positions="result!.movingYaoPositions"
            />
          </el-card>
        </el-col>

        <el-col :span="12" v-if="result?.changedHexagram">
          <el-card class="hexagram-card">
            <template #header>
              <div class="card-header">
                <span>变卦：{{ result.changedHexagram.name }}</span>
              </div>
            </template>
            <HexagramDisplay 
              :hexagram="result.changedHexagram" 
              :moving-positions="[]"
            />
          </el-card>
        </el-col>
      </el-row>

      <el-card class="interpretation-card">
        <template #header>
          <span>卦辞解读</span>
        </template>
        <div class="interpretation-content">
          <div class="interpretation-item">
            <h4>卦辞</h4>
            <p>{{ result?.originalHexagram.guaci }}</p>
          </div>
          <div class="interpretation-item">
            <h4>彖辞</h4>
            <p>{{ result?.originalHexagram.tuanci }}</p>
          </div>
          <div class="interpretation-item">
            <h4>象辞</h4>
            <p>{{ result?.originalHexagram.xiangci }}</p>
          </div>
          <div class="interpretation-item" v-if="result?.originalHexagram.description">
            <h4>卦义</h4>
            <p>{{ result.originalHexagram.description }}</p>
          </div>
        </div>
      </el-card>

      <el-card class="info-card" v-if="result?.ganZhi || result?.lunarDate">
        <template #header>
          <span>起卦信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="起卦方式">
            {{ methodLabel }}
          </el-descriptions-item>
          <el-descriptions-item label="起卦时间" v-if="result?.createdAt">
            {{ formatDate(result.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="农历日期" v-if="result?.lunarDate">
            {{ formatLunarDate(result.lunarDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="干支" v-if="result?.ganZhi">
            {{ result.ganZhi.year }}年 {{ result.ganZhi.month }}月 {{ result.ganZhi.day }}日 {{ result.ganZhi.hour }}时
          </el-descriptions-item>
          <el-descriptions-item label="预测问题" :span="2" v-if="result?.question">
            {{ result.question }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-card class="remark-card">
        <template #header>
          <span>备注</span>
        </template>
        <el-input
          v-model="remark"
          type="textarea"
          :rows="3"
          placeholder="添加您的备注..."
          @blur="saveRemark"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useDivinationStore } from '../stores/divination'
import HexagramDisplay from '../components/HexagramDisplay.vue'
import { formatLunarDate as formatLunar } from '@shared/utils/calendar'

const router = useRouter()
const divinationStore = useDivinationStore()

const result = computed(() => divinationStore.currentResult)
const remark = ref('')

const methodLabel = computed(() => {
  const labels: Record<string, string> = {
    time: '时间起卦',
    number: '数字起卦',
    coin: '铜钱起卦',
    manual: '手动起卦'
  }
  return labels[result.value?.method || ''] || '未知'
})

function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatLunarDate(lunar: { year: number; month: number; day: number; isLeapMonth: boolean; yearGanZhi?: string; monthGanZhi?: string; dayGanZhi?: string }) {
  return formatLunar(lunar as Parameters<typeof formatLunar>[0])
}

async function saveRemark() {
  if (result.value && remark.value !== result.value.remark) {
    try {
      await window.electronAPI.history.update({
        id: result.value.id,
        remark: remark.value
      })
    } catch (e) {
      console.error('Failed to save remark:', e)
    }
  }
}

onMounted(() => {
  if (result.value) {
    remark.value = result.value.remark || ''
  }
})
</script>

<style scoped>
.result-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.empty-result {
  text-align: center;
  padding: 60px 0;
}

.hexagram-card {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.interpretation-card,
.info-card,
.remark-card {
  margin-bottom: 24px;
}

.interpretation-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.interpretation-item h4 {
  color: var(--el-color-primary);
  margin-bottom: 8px;
  font-size: 16px;
}

.interpretation-item p {
  color: var(--el-text-color-primary);
  line-height: 1.8;
  text-indent: 2em;
}
</style>
