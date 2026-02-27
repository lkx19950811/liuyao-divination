<template>
  <div class="coin-divination">
    <div class="coin-area">
      <div class="coins-display">
        <div 
          v-for="(coin, index) in currentCoins" 
          :key="index" 
          class="coin"
          :class="{ 
            'coin-front': coin === 'front',
            'coin-back': coin === 'back',
            'flipping': isFlipping
          }"
        >
          {{ coin === 'front' ? '正' : '反' }}
        </div>
      </div>
      <div class="yao-result" v-if="currentYaoType">
        <span>第{{ currentYaoPosition }}爻：</span>
        <span :class="['yao-type', currentYaoType]">{{ yaoTypeLabel }}</span>
      </div>
    </div>

    <div class="progress-area">
      <el-progress 
        :percentage="progressPercentage" 
        :format="() => `${completedYaos}/6`"
        :stroke-width="20"
        striped
      />
    </div>

    <div class="actions">
      <el-button 
        type="primary" 
        @click="throwCoin" 
        :disabled="isFlipping || completedYaos >= 6"
        size="large"
      >
        {{ completedYaos >= 6 ? '已完成' : (completedYaos === 0 ? '开始抛币' : '继续抛币') }}
      </el-button>
      <el-button @click="reset" v-if="completedYaos > 0 && completedYaos < 6">
        重新开始
      </el-button>
    </div>

    <div class="result-summary" v-if="completedYaos >= 6">
      <el-alert type="success" title="起卦完成" :closable="false">
        <template #default>
          <p>请点击下方按钮查看解卦结果</p>
        </template>
      </el-alert>
      <el-button type="primary" size="large" @click="handleDivinate" style="margin-top: 16px;">
        查看解卦结果
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { YaoType, CoinResult } from '@shared/types'
import { coinsToYaoType } from '@shared/utils/hexagram'

const emit = defineEmits<{
  divinate: []
}>()

const currentCoins = ref<Array<'front' | 'back'>>(['front', 'front', 'front'])
const currentYaoType = ref<YaoType | null>(null)
const currentYaoPosition = ref(6)
const completedYaos = ref(0)
const isFlipping = ref(false)
const coinResults = ref<CoinResult[]>([])

const progressPercentage = computed(() => (completedYaos.value / 6) * 100)

const yaoTypeLabel = computed(() => {
  const labels: Record<YaoType, string> = {
    yang: '阳爻 —',
    yin: '阴爻 - -',
    oldYang: '老阳 ○',
    oldYin: '老阴 ×'
  }
  return currentYaoType.value ? labels[currentYaoType.value] : ''
})

function throwCoins(): Array<'front' | 'back'> {
  return [0, 1, 2].map(() => (Math.random() > 0.5 ? 'front' : 'back'))
}

async function throwCoin() {
  if (isFlipping.value || completedYaos.value >= 6) return
  
  isFlipping.value = true
  
  await new Promise(resolve => setTimeout(resolve, 500))
  
  const coins = throwCoins()
  currentCoins.value = coins
  currentYaoType.value = coinsToYaoType(coins)
  currentYaoPosition.value = 6 - completedYaos.value
  
  coinResults.value.push({
    position: currentYaoPosition.value,
    coins,
    yaoType: currentYaoType.value
  })
  
  completedYaos.value++
  isFlipping.value = false
}

function reset() {
  currentCoins.value = ['front', 'front', 'front']
  currentYaoType.value = null
  currentYaoPosition.value = 6
  completedYaos.value = 0
  coinResults.value = []
}

function getData() {
  return {
    coinResults: coinResults.value
  }
}

function handleDivinate() {
  emit('divinate')
}

defineExpose({ getData })
</script>

<style scoped>
.coin-divination {
  padding: 20px 0;
  text-align: center;
}

.coin-area {
  margin-bottom: 24px;
}

.coins-display {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
}

.coin {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  transition: all 0.3s;
}

.coin-front {
  background: linear-gradient(145deg, #ffd700, #ffaa00);
  color: #8b4513;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.coin-back {
  background: linear-gradient(145deg, #c0c0c0, #a0a0a0);
  color: #333;
  box-shadow: 0 4px 12px rgba(192, 192, 192, 0.4);
}

.coin.flipping {
  animation: flip 0.5s ease-in-out;
}

@keyframes flip {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(180deg); }
  100% { transform: rotateY(360deg); }
}

.yao-result {
  font-size: 18px;
  margin-top: 16px;
}

.yao-type {
  font-weight: bold;
}

.yao-type.yang, .yao-type.oldYang {
  color: var(--el-color-primary);
}

.yao-type.yin, .yao-type.oldYin {
  color: var(--el-color-danger);
}

.progress-area {
  margin-bottom: 24px;
  padding: 0 20px;
}

.actions {
  margin-bottom: 24px;
}

.result-summary {
  max-width: 400px;
  margin: 0 auto;
}
</style>
