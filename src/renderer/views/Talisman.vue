<template>
  <div class="talisman-page">
    <div class="page-header">
      <h1 class="page-title">电子护身符</h1>
      <p class="page-subtitle">生成专属卦象壁纸，护佑平安</p>
    </div>

    <!-- 最近吉卦 -->
    <el-card class="recent-lucky-card" v-if="recentLuckyHexagram">
      <template #header>
        <span>最近吉卦</span>
      </template>
      <div class="lucky-info">
        <div class="lucky-name">{{ recentLuckyHexagram.name }}</div>
        <div class="lucky-desc">{{ recentLuckyHexagram.description }}</div>
        <el-button type="primary" @click="generateWallpaper(recentLuckyHexagram)">
          生成壁纸
        </el-button>
      </div>
    </el-card>

    <!-- 风格选择 -->
    <el-card class="style-card">
      <template #header>
        <span>选择风格</span>
      </template>
      <div class="style-grid">
        <div
          v-for="style in styles"
          :key="style.id"
          class="style-item"
          :class="{ active: selectedStyle?.id === style.id }"
          @click="selectedStyle = style"
        >
          <div class="style-preview" :style="{ background: style.background, color: style.textColor }">
            {{ style.name.slice(0, 2) }}
          </div>
          <div class="style-name">{{ style.name }}</div>
        </div>
      </div>
    </el-card>

    <!-- 壁纸预览 -->
    <el-card class="preview-card" v-if="previewUrl">
      <template #header>
        <div class="preview-header">
          <span>壁纸预览</span>
          <el-button type="primary" @click="saveWallpaper" :loading="saving">
            保存壁纸
          </el-button>
        </div>
      </template>
      <div class="preview-container">
        <img :src="previewUrl" alt="壁纸预览" class="preview-image" />
      </div>
    </el-card>

    <!-- 今日宜忌 -->
    <el-card class="daily-card">
      <template #header>
        <span>今日宜忌</span>
      </template>
      <div class="daily-content">
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="daily-section yi">
              <div class="section-title">宜</div>
              <div class="section-items">
                <el-tag v-for="item in dailyYi" :key="item" type="success" class="daily-tag">{{ item }}</el-tag>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="daily-section ji">
              <div class="section-title">忌</div>
              <div class="section-items">
                <el-tag v-for="item in dailyJi" :key="item" type="danger" class="daily-tag">{{ item }}</el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 每日一签 -->
    <el-card class="daily-sign-card">
      <template #header>
        <span>每日一签</span>
      </template>
      <div class="sign-content">
        <div class="sign-text">{{ dailySign }}</div>
        <el-button type="primary" plain @click="refreshSign">换一签</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { WALLPAPER_STYLES, wallpaperService, type WallpaperStyle } from '../services/WallpaperService'
import type { Hexagram } from '../../shared/types'

const styles = ref<WallpaperStyle[]>(WALLPAPER_STYLES)
const selectedStyle = ref<WallpaperStyle | null>(WALLPAPER_STYLES[0])
const recentLuckyHexagram = ref<Hexagram | null>(null)
const previewUrl = ref<string | null>(null)
const previewBlob = ref<Blob | null>(null)
const saving = ref(false)

const dailyYi = ref<string[]>(['祈福', '求财', '出行', '会友'])
const dailyJi = ref<string[]>(['动土', '安葬', '开仓', '纳畜'])

const dailySigns = [
  '天行健，君子以自强不息。',
  '地势坤，君子以厚德载物。',
  '积善之家，必有余庆。',
  '善不积不足以成名，恶不积不足以灭身。',
  '君子终日乾乾，夕惕若厉，无咎。',
  '飞龙在天，利见大人。',
  '潜龙勿用，阳在下也。',
  '履霜坚冰至，阴始凝也。',
  '直方大，不习无不利。',
  '君子以独立不惧，遁世无闷。'
]

const dailySign = ref(dailySigns[0])

onMounted(async () => {
  await loadRecentLuckyHexagram()
  refreshSign()
})

async function loadRecentLuckyHexagram() {
  try {
    // 从历史记录获取最近的吉卦
    const history = await window.electronAPI.history.list({ limit: 10 })

    // 遍历历史记录查找吉卦
    for (const r of history) {
      const hexagram = await window.electronAPI.hexagram.get(r.originalHexagramId)
      if (hexagram && wallpaperService.isLuckyHexagram(hexagram.name)) {
        recentLuckyHexagram.value = hexagram
        return
      }
    }

    // 如果没有吉卦，使用乾卦
    if (!recentLuckyHexagram.value) {
      const allHexagrams = await window.electronAPI.hexagram.getAll()
      recentLuckyHexagram.value = allHexagrams.find((h) => h.name === '乾') || allHexagrams[0]
    }
  } catch (error) {
    console.error('Failed to load recent lucky hexagram:', error)
  }
}

async function generateWallpaper(hexagram: Hexagram) {
  if (!selectedStyle.value) {
    ElMessage.warning('请先选择风格')
    return
  }

  // 确保卦象数据完整
  if (!hexagram.guaci) {
    ElMessage.error('卦象数据不完整，缺少卦辞')
    return
  }

  try {
    const blob = await wallpaperService.generate(hexagram, selectedStyle.value)
    previewBlob.value = blob
    previewUrl.value = URL.createObjectURL(blob)
    ElMessage.success('壁纸生成成功')
  } catch (error) {
    ElMessage.error('生成壁纸失败: ' + (error instanceof Error ? error.message : '未知错误'))
    console.error(error)
  }
}

async function saveWallpaper() {
  if (!previewBlob.value) {
    ElMessage.warning('请先生成壁纸')
    return
  }

  saving.value = true

  try {
    const filename = `六爻护身符_${Date.now()}.png`
    await wallpaperService.save(previewBlob.value, filename)
    ElMessage.success('壁纸已保存')
  } catch (error) {
    ElMessage.error('保存壁纸失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

function refreshSign() {
  const randomIndex = Math.floor(Math.random() * dailySigns.length)
  dailySign.value = dailySigns[randomIndex]
}
</script>

<style scoped>
.talisman-page {
  max-width: 800px;
  margin: 0 auto;
}

.recent-lucky-card {
  margin-bottom: 24px;
}

.lucky-info {
  text-align: center;
  padding: 20px 0;
}

.lucky-name {
  font-size: 32px;
  font-weight: bold;
  color: var(--el-color-primary);
  margin-bottom: 8px;
}

.lucky-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 16px;
}

.style-card {
  margin-bottom: 24px;
}

.style-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.style-item {
  cursor: pointer;
  text-align: center;
  transition: transform 0.2s;
}

.style-item:hover {
  transform: scale(1.05);
}

.style-item.active .style-preview {
  box-shadow: 0 0 0 3px var(--el-color-primary);
}

.style-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 8px;
}

.style-name {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.preview-card {
  margin-bottom: 24px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.preview-image {
  max-width: 100%;
  max-height: 600px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.daily-card {
  margin-bottom: 24px;
}

.daily-section {
  padding: 16px;
  border-radius: 8px;
}

.daily-section.yi {
  background: rgba(103, 194, 58, 0.1);
}

.daily-section.ji {
  background: rgba(245, 108, 108, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}

.daily-section.yi .section-title {
  color: #67C23A;
}

.daily-section.ji .section-title {
  color: #F56C6C;
}

.section-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.daily-tag {
  margin: 0;
}

.daily-sign-card {
  margin-bottom: 24px;
}

.sign-content {
  text-align: center;
  padding: 20px 0;
}

.sign-text {
  font-size: 20px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  font-style: italic;
}
</style>