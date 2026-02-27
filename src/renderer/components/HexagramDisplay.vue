<template>
  <div class="hexagram-display">
    <div class="hexagram-visual">
      <div 
        v-for="position in [6, 5, 4, 3, 2, 1]" 
        :key="position" 
        class="yao-line"
        :class="{ 'is-moving': isMoving(position) }"
      >
        <span class="yao-position">{{ position }}</span>
        <div class="yao-line-content">
          <template v-if="isYang(position)">
            <div class="yao-line-solid"></div>
          </template>
          <template v-else>
            <div class="yao-line-broken">
              <div class="yao-line-broken-part"></div>
              <div class="yao-line-broken-part"></div>
            </div>
          </template>
        </div>
        <span class="yao-moving-indicator" v-if="isMoving(position)">
          {{ getMovingIndicator(position) }}
        </span>
      </div>
    </div>
    
    <div class="hexagram-info">
      <div class="trigram-info">
        <span class="trigram-label">上卦</span>
        <span class="trigram-symbol">{{ getTrigramSymbol(hexagram.upperTrigram) }}</span>
        <span class="trigram-name">{{ hexagram.upperTrigram }}</span>
      </div>
      <div class="trigram-info">
        <span class="trigram-label">下卦</span>
        <span class="trigram-symbol">{{ getTrigramSymbol(hexagram.lowerTrigram) }}</span>
        <span class="trigram-name">{{ hexagram.lowerTrigram }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TRIGRAMS } from '@shared/data/hexagrams'
import type { Hexagram } from '@shared/types'

const props = defineProps<{
  hexagram: Hexagram
  movingPositions: number[]
}>()

function isYang(position: number): boolean {
  const index = position - 1
  return props.hexagram.binary[index] === '1'
}

function isMoving(position: number): boolean {
  return props.movingPositions.includes(position)
}

function getMovingIndicator(position: number): string {
  const isYangYao = isYang(position)
  return isYangYao ? '○' : '×'
}

function getTrigramSymbol(name: string): string {
  return TRIGRAMS[name]?.symbol || ''
}
</script>

<style scoped>
.hexagram-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.hexagram-visual {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;
}

.yao-line {
  display: flex;
  align-items: center;
  gap: 12px;
}

.yao-line.is-moving .yao-line-solid,
.yao-line.is-moving .yao-line-broken-part {
  background-color: var(--el-color-danger);
}

.yao-position {
  width: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.yao-line-content {
  display: flex;
  align-items: center;
}

.yao-line-solid {
  width: 100px;
  height: 12px;
  background-color: var(--el-text-color-primary);
  border-radius: 2px;
}

.yao-line-broken {
  display: flex;
  gap: 20px;
}

.yao-line-broken-part {
  width: 40px;
  height: 12px;
  background-color: var(--el-text-color-primary);
  border-radius: 2px;
}

.yao-moving-indicator {
  color: var(--el-color-danger);
  font-size: 16px;
  font-weight: bold;
}

.hexagram-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: center;
}

.trigram-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.trigram-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.trigram-symbol {
  font-size: 24px;
}

.trigram-name {
  font-size: 16px;
  font-weight: 500;
}
</style>
