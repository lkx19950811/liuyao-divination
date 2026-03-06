<template>
  <div class="coin-toss">
    <div class="canvas-container" ref="containerRef">
      <canvas ref="canvasRef" @click="tossCoin"></canvas>
      <div class="yao-result" v-if="showResult">
        <span class="yao-position">第 {{ currentPosition }} 爻</span>
        <span :class="['yao-type', currentYaoType]">{{ yaoTypeLabel }}</span>
      </div>
    </div>

    <div class="progress-info">
      <el-progress
        :percentage="progressPercentage"
        :format="() => `${completedYaos}/6`"
        :stroke-width="16"
        :status="completedYaos >= 6 ? 'success' : undefined"
      />
    </div>

    <div class="controls">
      <el-button
        type="primary"
        size="large"
        @click="tossCoin"
        :disabled="isAnimating || completedYaos >= 6"
        class="toss-button"
      >
        {{ buttonText }}
      </el-button>
      <el-button
        size="large"
        @click="reset"
        v-if="completedYaos > 0 && completedYaos < 6"
      >
        重新开始
      </el-button>
    </div>

    <div class="yao-history" v-if="yaoHistory.length > 0">
      <div
        v-for="yao in [...yaoHistory].reverse()"
        :key="yao.position"
        :class="['yao-item', yao.yaoType]"
      >
        <span class="yao-pos">{{ yao.position }}</span>
        <span class="yao-symbol">{{ yaoSymbol(yao.yaoType) }}</span>
      </div>
    </div>

    <div class="result-actions" v-if="completedYaos >= 6">
      <el-alert type="success" title="起卦完成" :closable="false" style="margin-bottom: 16px;">
        <p>请点击下方按钮查看解卦结果</p>
      </el-alert>
      <el-button type="primary" size="large" @click="handleDivinate">
        查看解卦结果
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CoinResult, YaoType } from '@shared/types'

const emit = defineEmits<{
  divinate: []
}>()

// Refs
const canvasRef = ref<HTMLCanvasElement>()
const containerRef = ref<HTMLElement>()

// State
const isAnimating = ref(false)
const showResult = ref(false)
const currentPosition = ref(1)
const currentYaoType = ref<YaoType | null>(null)
const completedYaos = ref(0)
const yaoHistory = ref<CoinResult[]>([])

// Canvas state
let ctx: CanvasRenderingContext2D | null = null
let animationId: number | null = null
let canvasWidth = 0
let canvasHeight = 0

// Coin state
interface Coin {
  x: number
  y: number
  z: number          // 高度
  vx: number
  vy: number
  vz: number
  rotation: number   // 翻转角度
  rotationSpeed: number
  isHeads: boolean
  finalHeads: boolean // 最终结果
}

let coins: Coin[] = []

const progressPercentage = computed(() => Math.min((completedYaos.value / 6) * 100, 100))

const buttonText = computed(() => {
  if (completedYaos.value >= 6) return '已完成'
  if (completedYaos.value === 0) return '点击投币'
  return '继续投币'
})

const yaoTypeLabel = computed(() => {
  const labels: Record<YaoType, string> = {
    yang: '阳爻 —',
    yin: '阴爻 - -',
    oldYang: '老阳 ○',
    oldYin: '老阴 ×'
  }
  return currentYaoType.value ? labels[currentYaoType.value] : ''
})

function yaoSymbol(type: YaoType): string {
  const symbols: Record<YaoType, string> = {
    yang: '———',
    yin: '— —',
    oldYang: '—○—',
    oldYin: '—×—'
  }
  return symbols[type]
}

onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

function initCanvas() {
  if (!canvasRef.value || !containerRef.value) {
    console.error('[CoinToss] Canvas or container not found')
    return
  }

  ctx = canvasRef.value.getContext('2d')
  if (!ctx) {
    console.error('[CoinToss] Cannot get 2d context')
    return
  }

  const rect = containerRef.value.getBoundingClientRect()
  canvasWidth = rect.width || 360
  canvasHeight = rect.height || 320

  // Set canvas size
  const dpr = window.devicePixelRatio || 1
  canvasRef.value.width = canvasWidth * dpr
  canvasRef.value.height = canvasHeight * dpr
  canvasRef.value.style.width = `${canvasWidth}px`
  canvasRef.value.style.height = `${canvasHeight}px`
  ctx.scale(dpr, dpr)

  // Initialize coins
  resetCoins()

  // Start render loop
  render()
}

function resetCoins() {
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2
  const spacing = 55

  coins = [0, 1, 2].map(i => ({
    x: centerX + (i - 1) * spacing,
    y: centerY,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: 0,
    isHeads: true,
    finalHeads: Math.random() > 0.5
  }))
}

function tossCoin() {
  if (isAnimating.value || completedYaos.value >= 6) return

  isAnimating.value = true
  showResult.value = false

  // 初始化硬币动画
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2

  coins.forEach((coin, i) => {
    // 随机决定最终正反
    coin.finalHeads = Math.random() > 0.5

    // 设置初始位置在碗中心附近
    coin.x = centerX + (Math.random() - 0.5) * 30
    coin.y = centerY + (Math.random() - 0.5) * 20
    coin.z = 0

    // 向上抛的速度（减小水平速度）
    coin.vz = 20 + Math.random() * 10
    coin.vx = (Math.random() - 0.5) * 3  // 减小水平速度
    coin.vy = (Math.random() - 0.5) * 2

    // 旋转速度
    coin.rotationSpeed = (Math.random() - 0.5) * 0.8
    coin.rotation = Math.random() * Math.PI * 2
  })

  // 等待动画完成后处理结果
  setTimeout(() => {
    finishToss()
  }, 2000)
}

function finishToss() {
  // 确定最终结果
  coins.forEach(coin => {
    coin.z = 0
    coin.vz = 0
    coin.isHeads = coin.finalHeads
    coin.rotation = coin.isHeads ? 0 : Math.PI
  })

  // 计算爻类型
  const headsCount = coins.filter(c => c.isHeads).length
  let yaoType: YaoType
  switch (headsCount) {
    case 3: yaoType = 'oldYang'; break
    case 2: yaoType = 'yang'; break
    case 1: yaoType = 'yin'; break
    case 0: yaoType = 'oldYin'; break
    default: yaoType = 'yang'
  }

  // 记录结果
  const position = completedYaos.value + 1
  currentPosition.value = position
  currentYaoType.value = yaoType

  yaoHistory.value.push({
    position,
    coins: coins.map(c => c.isHeads ? 'front' : 'back'),
    yaoType
  })

  completedYaos.value++

  // 显示结果
  showResult.value = true
  isAnimating.value = false

  // 准备下一轮
  if (completedYaos.value < 6) {
    setTimeout(() => {
      showResult.value = false
      resetCoins()
    }, 1000)
  }
}

function update() {
  if (!isAnimating.value) return

  const gravity = 0.8
  const bounce = 0.5
  const friction = 0.98
  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2
  const bowlRadius = Math.min(canvasWidth, canvasHeight) / 2 - 50 // 碗的半径，留出边距

  coins.forEach(coin => {
    // Z轴物理（上下跳动）
    coin.vz -= gravity
    coin.z += coin.vz

    // 触底反弹
    if (coin.z < 0) {
      coin.z = 0
      coin.vz = -coin.vz * bounce
      if (Math.abs(coin.vz) < 1) {
        coin.vz = 0
      }
    }

    // XY平面运动
    coin.x += coin.vx
    coin.y += coin.vy
    coin.vx *= friction
    coin.vy *= friction

    // 碗的圆形边界检测
    const dx = coin.x - centerX
    const dy = coin.y - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist > bowlRadius) {
      // 将硬币推回碗内
      const angle = Math.atan2(dy, dx)
      coin.x = centerX + Math.cos(angle) * bowlRadius
      coin.y = centerY + Math.sin(angle) * bowlRadius

      // 反弹速度（沿法线方向反射）
      const normalX = dx / dist
      const normalY = dy / dist
      const dotProduct = coin.vx * normalX + coin.vy * normalY
      coin.vx = (coin.vx - 2 * dotProduct * normalX) * bounce
      coin.vy = (coin.vy - 2 * dotProduct * normalY) * bounce
    }

    // 旋转
    coin.rotation += coin.rotationSpeed
    coin.rotationSpeed *= 0.98

    // 根据旋转判断正反（动画中）
    coin.isHeads = Math.cos(coin.rotation) > 0
  })
}

function render() {
  if (!ctx) return

  update()

  // 清空画布
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // 绘制背景
  drawBackground()

  // 绘制硬币
  coins.forEach(coin => drawCoin(coin))

  animationId = requestAnimationFrame(render)
}

function drawBackground() {
  if (!ctx) return

  const centerX = canvasWidth / 2
  const centerY = canvasHeight / 2
  const radius = Math.min(canvasWidth, canvasHeight) / 2 - 30

  // 碗底渐变
  const gradient = ctx.createRadialGradient(
    centerX - radius * 0.3, centerY - radius * 0.3, 0,
    centerX, centerY, radius
  )
  gradient.addColorStop(0, '#3d2e22')
  gradient.addColorStop(0.5, '#2a1f18')
  gradient.addColorStop(1, '#1a1410')

  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()

  // 碗边
  ctx.strokeStyle = '#5a4a3a'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
  ctx.stroke()
}

function drawCoin(coin: Coin) {
  if (!ctx) return

  const coinRadius = 24
  const x = coin.x
  const y = coin.y - coin.z * 0.5 // 高度影响视觉位置

  // 计算翻转效果
  const flipAngle = coin.rotation % (Math.PI * 2)
  const scaleX = Math.abs(Math.cos(flipAngle))
  const showHeads = Math.cos(flipAngle) > 0 ? coin.isHeads : !coin.isHeads

  ctx.save()
  ctx.translate(x, y)

  // 阴影
  const shadowScale = 1 - Math.min(coin.z / 100, 0.4)
  ctx.beginPath()
  ctx.ellipse(coin.z * 0.1, coin.z * 0.1 + 5, coinRadius * shadowScale, coinRadius * shadowScale * 0.5, 0, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(0, 0, 0, ${0.3 - coin.z * 0.002})`
  ctx.fill()

  // 硬币
  ctx.scale(scaleX, 1)

  // 硬币主体
  const coinGradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, coinRadius)
  if (showHeads) {
    coinGradient.addColorStop(0, '#FFF8DC')
    coinGradient.addColorStop(0.3, '#FFD700')
    coinGradient.addColorStop(0.7, '#DAA520')
    coinGradient.addColorStop(1, '#B8860B')
  } else {
    coinGradient.addColorStop(0, '#F5F5F5')
    coinGradient.addColorStop(0.3, '#D3D3D3')
    coinGradient.addColorStop(0.7, '#A9A9A9')
    coinGradient.addColorStop(1, '#808080')
  }

  ctx.beginPath()
  ctx.arc(0, 0, coinRadius, 0, Math.PI * 2)
  ctx.fillStyle = coinGradient
  ctx.fill()

  // 边框
  ctx.strokeStyle = showHeads ? '#8B6914' : '#505050'
  ctx.lineWidth = 2
  ctx.stroke()

  // 内圈
  ctx.beginPath()
  ctx.arc(0, 0, coinRadius * 0.75, 0, Math.PI * 2)
  ctx.strokeStyle = showHeads ? 'rgba(139, 105, 20, 0.4)' : 'rgba(100, 100, 100, 0.4)'
  ctx.lineWidth = 1
  ctx.stroke()

  // 方孔
  const holeSize = coinRadius * 0.2
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(-holeSize, -holeSize, holeSize * 2, holeSize * 2)
  ctx.strokeStyle = showHeads ? '#6B4E0A' : '#404040'
  ctx.lineWidth = 1
  ctx.strokeRect(-holeSize, -holeSize, holeSize * 2, holeSize * 2)

  // 文字
  if (scaleX > 0.3) {
    ctx.fillStyle = showHeads ? '#6B4E0A' : '#404040'
    ctx.font = `bold ${coinRadius * 0.45}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(showHeads ? '正' : '反', 0, 0)
  }

  ctx.restore()

  // 稳定后显示标签
  if (!isAnimating.value && coin.z === 0) {
    ctx.fillStyle = showHeads ? 'rgba(139, 105, 20, 0.9)' : 'rgba(60, 60, 60, 0.9)'
    ctx.beginPath()
    ctx.roundRect(x - 18, y - coinRadius - 28, 36, 22, 4)
    ctx.fill()

    ctx.fillStyle = '#fff'
    ctx.font = 'bold 13px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(showHeads ? '正' : '反', x, y - coinRadius - 17)
  }
}

function reset() {
  completedYaos.value = 0
  yaoHistory.value = []
  currentYaoType.value = null
  currentPosition.value = 1
  showResult.value = false
  isAnimating.value = false
  resetCoins()
}

function getData() {
  return {
    coinResults: JSON.parse(JSON.stringify(yaoHistory.value))
  }
}

function handleDivinate() {
  emit('divinate')
}

defineExpose({ getData })
</script>

<style scoped>
.coin-toss {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  width: 100%;
}

.canvas-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 320px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
}

.canvas-container canvas {
  width: 100%;
  height: 100%;
}

.yao-result {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  border-radius: 12px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}

.yao-position {
  font-size: 14px;
  color: #aaa;
}

.yao-type {
  font-size: 24px;
  font-weight: bold;
}

.yao-type.yang, .yao-type.oldYang {
  color: #ffd700;
}

.yao-type.yin, .yao-type.oldYin {
  color: #ff6b6b;
}

.progress-info {
  width: 100%;
  max-width: 400px;
  margin: 20px 0;
}

.controls {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.toss-button {
  min-width: 140px;
}

.yao-history {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}

.yao-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
}

.yao-pos {
  color: #888;
  font-size: 12px;
}

.yao-symbol {
  font-family: monospace;
  font-size: 16px;
}

.yao-item.yang, .yao-item.oldYang {
  border: 1px solid #ffd700;
}

.yao-item.yin, .yao-item.oldYin {
  border: 1px solid #ff6b6b;
}

.result-actions {
  width: 100%;
  max-width: 400px;
}
</style>