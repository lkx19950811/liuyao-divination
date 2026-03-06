<template>
  <div class="result-page">
    <div class="page-header">
      <el-button @click="router.back()" :icon="ArrowLeft" circle />
      <h1 class="page-title">解卦结果</h1>
    </div>

    <div v-if="isLoading" class="loading-container">
      <el-icon class="is-loading" :size="40"><Loading /></el-icon>
      <p>加载中...</p>
    </div>

    <div v-else-if="!divinationStore.hasResult" class="empty-result">
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

      <el-card class="ai-interpretation-card" v-if="settingsStore.aiSettings.enabled">
        <template #header>
          <div class="card-header">
            <span>AI智能解读</span>
            <div class="ai-actions">
              <el-button
                v-if="aiLoading"
                type="danger"
                size="small"
                @click="cancelAIInterpretation"
              >
                停止生成
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="generateAIInterpretation"
                :loading="aiLoading"
                :disabled="!settingsStore.ollamaConnected || !settingsStore.aiSettings.model"
              >
                {{ aiInterpretation ? '重新解读' : 'AI解读' }}
              </el-button>
            </div>
          </div>
        </template>

        <!-- 人格选择 - 始终显示，方便用户切换人格重新解读 -->
        <div class="persona-selector" v-if="settingsStore.ollamaConnected && settingsStore.aiSettings.model && !aiLoading">
          <div class="persona-label">选择解读风格：</div>
          <el-radio-group v-model="selectedPersona" size="small">
            <el-radio-button
              v-for="persona in personas"
              :key="persona.id"
              :value="persona.id"
            >
              <span class="persona-option">
                <span class="persona-avatar">{{ persona.avatar }}</span>
                <span class="persona-name">{{ persona.name }}</span>
              </span>
            </el-radio-button>
          </el-radio-group>
          <div class="persona-desc" v-if="currentPersona">
            {{ currentPersona.description }}
          </div>
        </div>

        <div v-if="!settingsStore.ollamaConnected" class="ai-not-connected">
          <el-alert type="warning" :closable="false">
            未连接到Ollama服务，请前往设置检查AI配置
          </el-alert>
          <el-button type="primary" size="small" @click="router.push('/settings')" style="margin-top: 12px;">
            前往设置
          </el-button>
        </div>

        <div v-else-if="!settingsStore.aiSettings.model" class="ai-no-model">
          <el-alert type="info" :closable="false">
            请先在设置中选择AI模型
          </el-alert>
        </div>

        <div v-else-if="aiInterpretation || aiLoading" class="ai-content">
          <AIInterpretation
            :full-text="aiInterpretation"
            :is-generating="aiLoading"
            :show-thinking="settingsStore.aiSettings.showThinking"
          />
        </div>

        <div v-else class="ai-placeholder">
          <p>点击"AI解读"按钮，获取针对您问题的智能解读</p>
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
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useDivinationStore } from '../stores/divination'
import { useSettingsStore } from '../stores/settings'
import HexagramDisplay from '../components/HexagramDisplay.vue'
import AIInterpretation from '../components/AIInterpretation.vue'
import { formatLunarDate as formatLunar } from '@shared/utils/calendar'

interface Persona {
  id: string
  name: string
  description: string
  avatar: string
}

const router = useRouter()
const route = useRoute()
const divinationStore = useDivinationStore()
const settingsStore = useSettingsStore()

const result = computed(() => divinationStore.currentResult)
const remark = ref('')
const aiInterpretation = ref('')
const aiLoading = ref(false)
const isLoading = ref(false)
let cancelStream: (() => void) | null = null

// 人格相关
const personas = ref<Persona[]>([])
const selectedPersona = ref<string>('mentor')

const currentPersona = computed(() => {
  return personas.value.find(p => p.id === selectedPersona.value)
})

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

async function generateAIInterpretation() {
  if (!result.value) return

  // 如果正在生成中，防止重复点击
  if (aiLoading.value) {
    ElMessage.warning('AI解读正在进行中，请稍候')
    return
  }

  // Cancel any existing stream
  if (cancelStream) {
    cancelStream()
    cancelStream = null
  }

  aiLoading.value = true
  aiInterpretation.value = ''

  try {
    // 确保设置是最新的
    await settingsStore.loadSettings()

    // 检查模型是否已选择
    if (!settingsStore.aiSettings.model) {
      ElMessage.warning('请先在设置中选择AI模型')
      aiLoading.value = false
      return
    }

    // 设置当前人格
    await window.electronAPI.aiRoleplay.setPersona(selectedPersona.value)

    // 构建卦象上下文
    const hexagramContext = buildHexagramContext()

    // 创建会话
    const session = await window.electronAPI.aiRoleplay.createSession(result.value.id)
    console.log('[Result.vue] Created session:', session.id)

    // 使用带人格的对话API
    cancelStream = window.electronAPI.aiRoleplay.chatStream(
      {
        sessionId: session.id,
        hexagramContext,
        message: '请解读这个卦象',
        settings: JSON.parse(JSON.stringify(settingsStore.aiSettings))
      },
      // onChunk
      (text: string) => {
        console.log('[Result.vue] Received chunk:', text.substring(0, 50))
        aiInterpretation.value += text
      },
      // onEnd
      async () => {
        console.log('[Result.vue] Stream ended')
        aiLoading.value = false
        cancelStream = null
        // 保存AI解读到历史记录
        if (result.value?.id && aiInterpretation.value) {
          try {
            await window.electronAPI.history.update({
              id: result.value.id,
              aiInterpretation: aiInterpretation.value
            })
          } catch (e) {
            console.error('Failed to save AI interpretation:', e)
          }
        }
      },
      // onError
      (error: string) => {
        console.error('[Result.vue] Stream error:', error)
        aiLoading.value = false
        cancelStream = null
        ElMessage.error(`AI解读失败: ${error}`)
      }
    )
  } catch (error) {
    console.error('AI interpretation failed:', error)
    const errorMsg = error instanceof Error ? error.message : '未知错误'
    ElMessage.error(`AI解读失败: ${errorMsg}`)
    aiLoading.value = false
  }
}

// 构建卦象上下文
function buildHexagramContext(): string {
  if (!result.value) return ''

  let context = `【本卦】${result.value.originalHexagram.name}\n`
  context += `卦辞：${result.value.originalHexagram.guaci}\n`
  context += `彖辞：${result.value.originalHexagram.tuanci}\n`
  context += `象辞：${result.value.originalHexagram.xiangci}\n`

  if (result.value.changedHexagram) {
    context += `\n【变卦】${result.value.changedHexagram.name}\n`
    context += `卦辞：${result.value.changedHexagram.guaci}\n`
  }

  if (result.value.movingYaoPositions.length > 0) {
    context += `\n【动爻】第 ${result.value.movingYaoPositions.join('、')} 爻\n`
  }

  if (result.value.question) {
    context += `\n【预测问题】${result.value.question}\n`
  }

  return context
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

function cancelAIInterpretation() {
  if (cancelStream) {
    cancelStream()
    cancelStream = null
    aiLoading.value = false
    ElMessage.info('已停止生成')
  }
}

async function loadHistoryRecord(id: string) {
  isLoading.value = true
  try {
    const record = await window.electronAPI.history.get(id)
    if (record) {
      // 获取完整的卦象数据
      const originalHexagram = await window.electronAPI.hexagram.get(record.originalHexagramId)
      let changedHexagram = null
      if (record.changedHexagramId) {
        changedHexagram = await window.electronAPI.hexagram.get(record.changedHexagramId)
      }

      // 解析 JSON 字符串
      let lunarDate = null
      let ganZhi = null
      let timeInfo = null
      let coinResults = null
      let inputNumbers = null

      if (record.lunarDate) {
        try {
          lunarDate = JSON.parse(record.lunarDate)
        } catch { /* ignore */ }
      }
      if (record.ganZhi) {
        try {
          ganZhi = JSON.parse(record.ganZhi)
        } catch { /* ignore */ }
      }
      if (record.timeInfo) {
        try {
          timeInfo = JSON.parse(record.timeInfo)
        } catch { /* ignore */ }
      }
      if (record.coinResults) {
        try {
          coinResults = JSON.parse(record.coinResults)
        } catch { /* ignore */ }
      }
      if (record.inputNumbers) {
        try {
          inputNumbers = JSON.parse(record.inputNumbers)
        } catch { /* ignore */ }
      }

      // 构建完整的 DivinationResult
      divinationStore.currentResult = {
        id: record.id,
        createdAt: new Date(record.createdAt),
        method: record.method,
        originalHexagram,
        changedHexagram,
        movingYaoPositions: record.movingYaoPositions,
        question: record.question,
        remark: record.remark,
        coinResults,
        inputNumbers,
        timeInfo,
        lunarDate,
        ganZhi
      }
      remark.value = record.remark || ''
      aiInterpretation.value = record.aiInterpretation || ''
    } else {
      ElMessage.error('未找到该记录')
      router.push('/history')
    }
  } catch (e) {
    console.error('Failed to load history record:', e)
    ElMessage.error('加载记录失败')
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await settingsStore.loadSettings()
  if (settingsStore.aiSettings.enabled) {
    await settingsStore.checkOllama()
    // 加载人格列表
    try {
      personas.value = await window.electronAPI.aiRoleplay.getPersonas()
      // 获取当前人格
      const currentP = await window.electronAPI.aiRoleplay.getCurrentPersona()
      selectedPersona.value = currentP || 'mentor'
    } catch (e) {
      console.error('Failed to load personas:', e)
    }
  }

  const id = route.params.id as string
  if (id) {
    await loadHistoryRecord(id)
  } else if (result.value) {
    remark.value = result.value.remark || ''
  }
})

onUnmounted(() => {
  // Cancel any ongoing stream when component is destroyed
  if (cancelStream) {
    cancelStream()
    cancelStream = null
  }
})

watch(() => route.params.id, async (newId) => {
  if (newId) {
    await loadHistoryRecord(newId as string)
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

.loading-container {
  text-align: center;
  padding: 60px 0;
  color: var(--el-text-color-secondary);
}

.loading-container p {
  margin-top: 16px;
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
.remark-card,
.ai-interpretation-card {
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

.ai-not-connected,
.ai-no-model,
.ai-placeholder {
  text-align: center;
  padding: 20px;
  color: var(--el-text-color-secondary);
}

.ai-actions {
  display: flex;
  gap: 8px;
}

.ai-content {
  line-height: 1.8;
  white-space: pre-wrap;
}

.ai-content p {
  margin: 0;
}

.persona-selector {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.persona-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}

.persona-option {
  display: flex;
  align-items: center;
  gap: 4px;
}

.persona-avatar {
  font-size: 16px;
}

.persona-name {
  font-size: 12px;
}

.persona-desc {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  padding: 8px 12px;
  background: var(--el-bg-color);
  border-radius: 4px;
}
</style>
