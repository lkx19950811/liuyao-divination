<template>
  <div class="settings-page">
    <div class="page-header">
      <h1 class="page-title">设置</h1>
    </div>

    <el-card class="settings-card">
      <template #header>
        <span>外观设置</span>
      </template>
      <el-form label-width="120px">
        <el-form-item label="主题模式">
          <el-radio-group v-model="theme" @change="handleThemeChange">
            <el-radio value="light">浅色</el-radio>
            <el-radio value="dark">深色</el-radio>
            <el-radio value="system">跟随系统</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="字体大小">
          <el-radio-group v-model="fontSize" @change="handleFontSizeChange">
            <el-radio value="small">小</el-radio>
            <el-radio value="medium">中</el-radio>
            <el-radio value="large">大</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="卦象样式">
          <el-radio-group v-model="hexagramStyle" @change="handleHexagramStyleChange">
            <el-radio value="traditional">传统样式</el-radio>
            <el-radio value="modern">现代样式</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <span>起卦设置</span>
      </template>
      <el-form label-width="120px">
        <el-form-item label="默认起卦方式">
          <el-select v-model="defaultMethod" @change="handleDefaultMethodChange">
            <el-option value="time" label="时间起卦" />
            <el-option value="number" label="数字起卦" />
            <el-option value="coin" label="铜钱起卦" />
            <el-option value="manual" label="手动起卦" />
          </el-select>
        </el-form-item>
        <el-form-item label="自动保存">
          <el-switch v-model="autoSave" @change="handleAutoSaveChange" />
          <span class="setting-hint">开启后，起卦结果将自动保存到历史记录</span>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <span>数据管理</span>
      </template>
      <el-form label-width="120px">
        <el-form-item label="历史记录">
          <el-button type="danger" @click="clearHistory">清空历史记录</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="settings-card">
      <template #header>
        <span>关于</span>
      </template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="应用名称">六爻预测</el-descriptions-item>
        <el-descriptions-item label="版本">1.0.0</el-descriptions-item>
        <el-descriptions-item label="描述">基于传统六爻理论的桌面预测应用</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useSettingsStore } from '../stores/settings'
import { useHistoryStore } from '../stores/history'

const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()

const theme = ref<'light' | 'dark' | 'system'>('system')
const fontSize = ref<'small' | 'medium' | 'large'>('medium')
const hexagramStyle = ref<'traditional' | 'modern'>('traditional')
const autoSave = ref(true)
const defaultMethod = ref<'time' | 'number' | 'coin' | 'manual'>('time')

async function handleThemeChange(value: 'light' | 'dark' | 'system') {
  await settingsStore.setTheme(value)
  settingsStore.applyTheme()
}

async function handleFontSizeChange(value: 'small' | 'medium' | 'large') {
  await settingsStore.setFontSize(value)
}

async function handleHexagramStyleChange(value: 'traditional' | 'modern') {
  await settingsStore.setHexagramStyle(value)
}

async function handleAutoSaveChange(value: boolean) {
  await settingsStore.setAutoSave(value)
}

async function handleDefaultMethodChange(value: 'time' | 'number' | 'coin' | 'manual') {
  await settingsStore.setDefaultMethod(value)
}

async function clearHistory() {
  try {
    await ElMessageBox.confirm('确定要清空所有历史记录吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const records = await window.electronAPI.history.list()
    for (const record of records) {
      await window.electronAPI.history.delete(record.id)
    }
    
    await historyStore.loadRecords()
    ElMessage.success('历史记录已清空')
  } catch {
    // User cancelled
  }
}

onMounted(async () => {
  await settingsStore.loadSettings()
  theme.value = settingsStore.theme
  fontSize.value = settingsStore.fontSize
  hexagramStyle.value = settingsStore.hexagramStyle
  autoSave.value = settingsStore.autoSave
  defaultMethod.value = settingsStore.defaultMethod
})
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  margin-bottom: 20px;
}

.setting-hint {
  margin-left: 12px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
