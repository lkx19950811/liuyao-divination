<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container" :class="{ 'dark-mode': isDarkMode }">
      <TitleBar />
      <el-container class="main-container">
        <el-aside width="200px" class="app-aside">
          <div class="logo">
            <span class="logo-icon">☯</span>
            <span class="logo-text">六爻预测</span>
          </div>
          <el-menu
            :default-active="currentRoute"
            router
            class="app-menu"
            :background-color="isDarkMode ? '#1f1f1f' : '#ffffff'"
            :text-color="isDarkMode ? '#ffffff' : '#303133'"
            :active-text-color="isDarkMode ? '#409eff' : '#409eff'"
          >
            <el-menu-item index="/">
              <el-icon><HomeFilled /></el-icon>
              <span>起卦</span>
            </el-menu-item>
            <el-menu-item index="/history">
              <el-icon><Clock /></el-icon>
              <span>历史记录</span>
            </el-menu-item>
            <el-menu-item index="/knowledge">
              <el-icon><Reading /></el-icon>
              <span>知识库</span>
            </el-menu-item>
            <el-menu-item index="/settings">
              <el-icon><Setting /></el-icon>
              <span>设置</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="app-main">
          <router-view />
        </el-main>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from './stores/settings'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import TitleBar from './components/TitleBar.vue'

const route = useRoute()
const settingsStore = useSettingsStore()

const currentRoute = computed(() => route.path)
const isDarkMode = computed(() => settingsStore.theme === 'dark')

onMounted(async () => {
  await settingsStore.loadSettings()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>

<style scoped>
.app-container {
  height: 100vh;
  background-color: var(--bg-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-container.dark-mode {
  --bg-color: #141414;
  --text-color: #ffffff;
}

.main-container {
  flex: 1;
  overflow: hidden;
  margin-top: 32px;
}

.app-aside {
  background-color: var(--bg-color);
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.logo-icon {
  font-size: 28px;
  color: var(--el-color-primary);
}

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.app-menu {
  border-right: none;
  flex: 1;
}

.app-main {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  overflow-y: auto;
  height: 100%;
}
</style>
