<template>
  <div class="number-divination">
    <el-form label-width="80px">
      <el-form-item label="第一个数">
        <el-input-number v-model="num1" :min="1" :max="9999" />
      </el-form-item>
      <el-form-item label="第二个数">
        <el-input-number v-model="num2" :min="1" :max="9999" />
      </el-form-item>
      <el-form-item>
        <div class="number-hint">
          <p>提示：可以输入任意数字，如年龄、日期、编号等</p>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleDivinate" :loading="isLoading">
          开始起卦
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  divinate: []
}>()

const num1 = ref(1)
const num2 = ref(1)
const isLoading = ref(false)

function getData() {
  return {
    num1: num1.value,
    num2: num2.value
  }
}

function handleDivinate() {
  emit('divinate')
}

defineExpose({ getData })
</script>

<style scoped>
.number-divination {
  padding: 20px 0;
}

.number-hint {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
