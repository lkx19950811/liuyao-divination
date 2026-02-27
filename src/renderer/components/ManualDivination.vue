<template>
  <div class="manual-divination">
    <div class="yao-selection">
      <div 
        v-for="position in [6, 5, 4, 3, 2, 1]" 
        :key="position" 
        class="yao-row"
      >
        <span class="yao-label">第{{ position }}爻</span>
        <el-radio-group v-model="yaoTypes[position - 1]" size="small">
          <el-radio-button value="yang">
            <span class="yao-option">阳 —</span>
          </el-radio-button>
          <el-radio-button value="yin">
            <span class="yao-option">阴 - -</span>
          </el-radio-button>
          <el-radio-button value="oldYang">
            <span class="yao-option">老阳 ○</span>
          </el-radio-button>
          <el-radio-button value="oldYin">
            <span class="yao-option">老阴 ×</span>
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="preview">
      <h4>卦象预览</h4>
      <div class="hexagram-preview">
        <div v-for="position in [6, 5, 4, 3, 2, 1]" :key="position" class="preview-yao">
          <div class="preview-yao-line" :class="{ 'is-yin': isYin(position - 1) }">
            <span class="line-part"></span>
            <span class="line-gap" v-if="isYin(position - 1)"></span>
            <span class="line-part" v-if="isYin(position - 1)"></span>
          </div>
          <span class="moving-mark" v-if="isMoving(position - 1)">
            {{ yaoTypes[position - 1] === 'oldYang' ? '○' : '×' }}
          </span>
        </div>
      </div>
    </div>

    <div class="actions">
      <el-button @click="reset">重置</el-button>
      <el-button type="primary" @click="handleDivinate">开始起卦</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { YaoType } from '@shared/types'

const emit = defineEmits<{
  divinate: []
}>()

const yaoTypes = ref<YaoType[]>(['yang', 'yang', 'yang', 'yang', 'yang', 'yang'])

function isYin(index: number): boolean {
  return yaoTypes.value[index] === 'yin' || yaoTypes.value[index] === 'oldYin'
}

function isMoving(index: number): boolean {
  return yaoTypes.value[index] === 'oldYang' || yaoTypes.value[index] === 'oldYin'
}

function reset() {
  yaoTypes.value = ['yang', 'yang', 'yang', 'yang', 'yang', 'yang']
}

function getData() {
  return {
    yaoTypes: yaoTypes.value
  }
}

function handleDivinate() {
  emit('divinate')
}

defineExpose({ getData })
</script>

<style scoped>
.manual-divination {
  padding: 20px 0;
}

.yao-selection {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.yao-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.yao-label {
  width: 60px;
  font-weight: 500;
}

.yao-option {
  font-family: monospace;
}

.preview {
  background-color: var(--el-fill-color-light);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.preview h4 {
  margin-bottom: 16px;
  text-align: center;
}

.hexagram-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-yao {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-yao-line {
  display: flex;
  align-items: center;
  gap: 4px;
}

.line-part {
  width: 40px;
  height: 8px;
  background-color: var(--el-text-color-primary);
  border-radius: 2px;
}

.line-gap {
  width: 12px;
}

.preview-yao-line.is-yin .line-part {
  width: 16px;
}

.moving-mark {
  color: var(--el-color-danger);
  font-weight: bold;
  font-size: 14px;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}
</style>
