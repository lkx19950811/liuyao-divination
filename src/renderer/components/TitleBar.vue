<template>
  <div class="title-bar" :class="{ 'dark-mode': isDarkMode }">
    <div class="title-bar-drag">
      <div class="app-icon">☯</div>
      <span class="app-title">六爻预测</span>
    </div>
    <div class="window-controls">
      <button class="control-btn minimize" @click="minimize" title="最小化">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect y="5" width="12" height="2" fill="currentColor"/>
        </svg>
      </button>
      <button class="control-btn maximize" @click="toggleMaximize" :title="isMaximized ? '还原' : '最大化'">
        <svg v-if="isMaximized" width="12" height="12" viewBox="0 0 12 12">
          <rect x="2" y="4" width="8" height="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <path d="M4 4V2h6v6h-2" fill="none" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <svg v-else width="12" height="12" viewBox="0 0 12 12">
          <rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
      <button class="control-btn close" @click="closeWindow" title="关闭">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M1 1l10 10M11 1l-10 10" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '../stores/settings'

const settingsStore = useSettingsStore()
const isDarkMode = computed(() => settingsStore.theme === 'dark')
const isMaximized = ref(false)

const minimize = async () => {
  await window.electronAPI?.window.minimize()
}

const toggleMaximize = async () => {
  await window.electronAPI?.window.maximize()
}

const closeWindow = async () => {
  await window.electronAPI?.window.close()
}

const handleMaximized = (_: unknown, maximized: boolean) => {
  isMaximized.value = maximized
}

onMounted(async () => {
  window.electronAPI?.window.onWindowMaximized(handleMaximized)
  const maximized = await window.electronAPI?.window.isMaximized()
  isMaximized.value = maximized ?? false
})

onUnmounted(() => {
  window.electronAPI?.window.removeWindowMaximizedListener(handleMaximized)
})
</script>

<style scoped>
.title-bar {
  height: 32px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.title-bar.dark-mode {
  background: linear-gradient(180deg, #2d2d2d 0%, #252525 100%);
  border-bottom-color: #3a3a3a;
}

.title-bar-drag {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  flex: 1;
  -webkit-app-region: drag;
  height: 100%;
}

.app-icon {
  font-size: 18px;
  color: #409eff;
}

.app-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.dark-mode .app-title {
  color: #e5eaf3;
}

.window-controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.control-btn {
  width: 46px;
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #606266;
  transition: background-color 0.15s;
}

.dark-mode .control-btn {
  color: #a3a6ad;
}

.control-btn:hover {
  background-color: #e9ecf0;
}

.dark-mode .control-btn:hover {
  background-color: #3a3a3a;
}

.control-btn.close:hover {
  background-color: #e81123;
  color: #ffffff;
}

.dark-mode .control-btn.close:hover {
  background-color: #e81123;
  color: #ffffff;
}
</style>
