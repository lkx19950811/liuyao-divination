<template>
  <div class="environment-panel" v-if="weather">
    <div class="weather-card">
      <div class="weather-main">
        <span class="weather-icon">{{ weather.icon }}</span>
        <div class="weather-info">
          <span class="weather-temp">{{ weather.temperature }}°C</span>
          <span class="weather-desc">{{ weather.description }}</span>
          <span class="weather-city" v-if="weather.cityName">{{ weather.cityName }}</span>
        </div>
      </div>
      <div class="weather-hint" v-if="hexagramHint">
        <el-icon><InfoFilled /></el-icon>
        <span>{{ hexagramHint.hint }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'

interface WeatherInfo {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'foggy'
  temperature: number
  humidity: number
  description: string
  icon: string
  cityName?: string
}

interface HexagramHint {
  trigram: string
  hint: string
}

const weather = ref<WeatherInfo | null>(null)
const hexagramHint = ref<HexagramHint | null>(null)

onMounted(async () => {
  await loadWeather()
})

async function loadWeather() {
  try {
    if (!window.electronAPI?.weather?.getCurrent) {
      console.warn('Weather API not available')
      return
    }

    const data = await window.electronAPI.weather.getCurrent()
    weather.value = data

    if (window.electronAPI?.weather?.getHexagramHint) {
      const hint = await window.electronAPI.weather.getHexagramHint(data.condition)
      hexagramHint.value = hint
    }
  } catch (error) {
    console.error('Failed to load weather:', error)
  }
}

defineExpose({ weather })
</script>

<style scoped>
.environment-panel {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  margin-bottom: 16px;
}

.weather-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.weather-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.weather-icon {
  font-size: 32px;
}

.weather-info {
  display: flex;
  flex-direction: column;
}

.weather-temp {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.weather-desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.weather-city {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.weather-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 4px 8px;
  border-radius: 4px;
}
</style>