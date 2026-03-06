<template>
  <div class="home-page">
    <div class="page-header">
      <h1 class="page-title">六爻预测</h1>
      <p class="page-subtitle">选择起卦方式，开始您的预测之旅</p>
    </div>

    <!-- 环境感知面板 -->
    <EnvironmentPanel ref="environmentRef" />

    <div class="method-selection">
      <el-row :gutter="16">
        <el-col :xs="12" :sm="8" :md="6" :lg="4" v-for="method in methods" :key="method.key">
          <el-card
            class="method-card"
            :class="{ active: selectedMethod === method.key }"
            @click="selectedMethod = method.key"
            shadow="hover"
          >
            <div class="method-icon">{{ method.icon }}</div>
            <div class="method-title">{{ method.name }}</div>
            <div class="method-desc">{{ method.description }}</div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="divination-form card-container" v-if="selectedMethod">
      <el-divider content-position="left">{{ currentMethod?.name }}</el-divider>

      <div class="question-input">
        <el-input
          v-model="question"
          placeholder="请输入您想预测的问题（选填）"
          :rows="2"
          type="textarea"
          maxlength="200"
          show-word-limit
        />
      </div>

      <TimeDivination
        v-if="selectedMethod === 'time'"
        ref="timeRef"
        @divinate="handleDivinate"
      />
      <NumberDivination
        v-else-if="selectedMethod === 'number'"
        ref="numberRef"
        @divinate="handleDivinate"
      />
      <PhysicsCoinDivination
        v-else-if="selectedMethod === 'coin'"
        ref="physicsCoinRef"
        @divinate="handleDivinate"
      />
      <ManualDivination
        v-else-if="selectedMethod === 'manual'"
        ref="manualRef"
        @divinate="handleDivinate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useDivinationStore } from '../stores/divination'
import { useSettingsStore } from '../stores/settings'
import TimeDivination from '../components/TimeDivination.vue'
import NumberDivination from '../components/NumberDivination.vue'
import PhysicsCoinDivination from '../components/PhysicsCoinDivination.vue'
import ManualDivination from '../components/ManualDivination.vue'
import EnvironmentPanel from '../components/EnvironmentPanel.vue'

const router = useRouter()
const divinationStore = useDivinationStore()
const settingsStore = useSettingsStore()

type DivinationMethod = 'time' | 'number' | 'coin' | 'manual'

const selectedMethod = ref<DivinationMethod | null>(null)
const question = ref('')
const environmentRef = ref()

const timeRef = ref()
const numberRef = ref()
const physicsCoinRef = ref()
const manualRef = ref()

const methods = [
  { key: 'time' as const, name: '时间起卦', icon: '🕐', description: '根据时间自动起卦' },
  { key: 'number' as const, name: '数字起卦', icon: '🔢', description: '输入数字起卦' },
  { key: 'coin' as const, name: '铜钱起卦', icon: '🪙', description: '物理引擎沉浸式摇币' },
  { key: 'manual' as const, name: '手动起卦', icon: '✋', description: '手动选择阴阳爻' }
]

const currentMethod = computed(() => methods.find(m => m.key === selectedMethod.value))

// 用户可以设置默认起卦方式

async function handleDivinate() {
  if (divinationStore.isLoading) return

  try {
    let result
    const q = question.value || undefined

    switch (selectedMethod.value) {
      case 'time':
        const timeData = timeRef.value?.getData()
        if (!timeData) return
        result = await divinationStore.timeDivination(
          timeData.year,
          timeData.month,
          timeData.day,
          timeData.hour,
          q
        )
        break
      case 'number':
        const numData = numberRef.value?.getData()
        if (!numData) return
        result = await divinationStore.numberDivination(numData.num1, numData.num2, q)
        break
      case 'coin':
        const coinData = physicsCoinRef.value?.getData()
        result = await divinationStore.coinDivinationWithData(coinData?.coinResults || [], q)
        break
      case 'manual':
        const manualData = manualRef.value?.getData()
        if (!manualData) return
        result = await divinationStore.manualDivination(manualData.yaoTypes, q)
        break
    }

    if (result && settingsStore.autoSave) {
      await divinationStore.saveResult(result)
    }

    ElMessage.success('起卦成功！')
    router.push('/result')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '起卦失败，请重试')
  }
}

if (settingsStore.defaultMethod) {
  selectedMethod.value = settingsStore.defaultMethod
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.method-selection {
  margin-bottom: 24px;
}

.method-card {
  text-align: center;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  min-height: 140px;
}

.method-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.method-card.active {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.method-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.method-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--el-text-color-primary);
}

.method-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.divination-form {
  margin-top: 24px;
}

.question-input {
  margin-bottom: 24px;
}
</style>