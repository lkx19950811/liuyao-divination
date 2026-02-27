<template>
  <div class="time-divination">
    <el-form label-width="80px">
      <el-form-item label="日期">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </el-form-item>
      <el-form-item label="时辰">
        <el-select v-model="selectedHour" placeholder="选择时辰">
          <el-option 
            v-for="shichen in SHICHEN_NAMES" 
            :key="shichen" 
            :label="shichen" 
            :value="SHICHEN_NAMES.indexOf(shichen)"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <div class="lunar-info" v-if="lunarDate">
          <p>农历：{{ formatLunarDate(lunarDate) }}</p>
          <p>干支：{{ ganZhi?.year }}年 {{ ganZhi?.month }}月 {{ ganZhi?.day }}日 {{ ganZhi?.hour }}时</p>
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
import { ref, watch, onMounted } from 'vue'
import { SHICHEN_NAMES, solarToLunar, getGanZhi, formatLunarDate } from '@shared/utils/calendar'
import type { LunarDate, GanZhi } from '@shared/types'

const emit = defineEmits<{
  divinate: []
}>()

const selectedDate = ref('')
const selectedHour = ref(new Date().getHours())
const lunarDate = ref<LunarDate | null>(null)
const ganZhi = ref<GanZhi | null>(null)
const isLoading = ref(false)

function getData() {
  const date = new Date(selectedDate.value)
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: selectedHour.value === 0 ? 23 : (selectedHour.value * 2 - 1)
  }
}

function updateLunarInfo() {
  if (!selectedDate.value) return
  
  const date = new Date(selectedDate.value)
  const hour = selectedHour.value === 0 ? 23 : (selectedHour.value * 2 - 1)
  
  lunarDate.value = solarToLunar(date.getFullYear(), date.getMonth() + 1, date.getDate())
  ganZhi.value = getGanZhi(date.getFullYear(), date.getMonth() + 1, date.getDate(), hour)
}

function handleDivinate() {
  emit('divinate')
}

watch([selectedDate, selectedHour], updateLunarInfo)

onMounted(() => {
  const now = new Date()
  selectedDate.value = now.toISOString().split('T')[0]
  selectedHour.value = Math.floor(now.getHours() / 2)
  updateLunarInfo()
})

defineExpose({ getData })
</script>

<style scoped>
.time-divination {
  padding: 20px 0;
}

.lunar-info {
  background-color: var(--el-fill-color-light);
  padding: 12px 16px;
  border-radius: 4px;
  font-size: 14px;
}

.lunar-info p {
  margin-bottom: 4px;
}

.lunar-info p:last-child {
  margin-bottom: 0;
}
</style>
