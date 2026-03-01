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
        <div class="card-header-row">
          <span>AI智能解卦</span>
          <el-switch v-model="aiEnabled" @change="handleAIEnabledChange" />
        </div>
      </template>
      
      <div v-if="!aiEnabled" class="ai-disabled-hint">
        <el-icon><InfoFilled /></el-icon>
        <span>开启后可使用AI智能解读卦象，帮助小白用户理解卦义</span>
      </div>
      
      <div v-else class="ai-settings-content">
        <div v-if="!ollamaInstalled" class="install-guide">
          <div class="install-header">
            <el-icon class="warning-icon"><WarningFilled /></el-icon>
            <span>未检测到Ollama，请按以下步骤安装</span>
          </div>

          <div class="install-steps">
            <div class="step">
              <div class="step-num" :class="{ 'step-done': ollamaInstalled }">
                <span v-if="ollamaInstalled">✓</span><span v-else>1</span>
              </div>
              <div class="step-content">
                <div class="step-title">
                  {{ ollamaInstalled ? `已安装 Ollama ${ollamaVersion || ''}` : '下载安装 Ollama' }}
                </div>
                <div v-if="!ollamaInstalled" class="step-action">
                  <el-button type="primary" @click="startDownload" :loading="downloading">
                    <el-icon><Download /></el-icon>
                    {{ downloading ? `下载中 ${downloadProgress}%` : '一键下载（国内加速）' }}
                  </el-button>
                  <el-button size="small" @click="openDownloadPage(true)">
                    官网下载
                  </el-button>
                </div>
                <el-progress v-if="downloading" :percentage="downloadProgress" :stroke-width="6" style="margin-top: 8px;" />

                <div v-if="downloadedFilePath && !ollamaInstalled" class="install-actions">
                  <el-button type="success" @click="installOllama" :loading="installing">
                    {{ installing ? '安装中...' : '开始安装' }}
                  </el-button>
                  <span class="step-hint">静默安装，安装完成后自动检测</span>
                </div>

                <div v-if="!ollamaInstalled" class="step-hint">国内用户自动使用镜像加速下载</div>
              </div>
            </div>

            <div v-if="ollamaInstalled && !ollamaRunning" class="step">
              <div class="step-num">2</div>
              <div class="step-content">
                <div class="step-title">启动 Ollama 服务</div>
                <div class="step-action">
                  <el-button type="primary" @click="startOllamaService">
                    启动服务
                  </el-button>
                </div>
                <div class="step-hint">或手动在终端运行 <code>ollama serve</code></div>
              </div>
            </div>
          </div>

          <div class="install-footer">
            <div class="requirements">
              <span>最低配置：8GB内存 · 10GB磁盘</span>
            </div>
            <el-button type="primary" @click="handleRecheckOllama" :loading="checkingOllama">
              重新检测
            </el-button>
          </div>
        </div>
        
        <el-form v-else label-width="100px" class="ai-form">
          <el-form-item label="服务状态">
            <div class="service-row">
              <el-input v-model="aiOllamaUrl" @blur="handleAIOllamaUrlChange" placeholder="http://localhost:11434" style="flex: 1;" disabled />
              <el-tag v-if="ollamaRunning" type="success" size="small" style="margin: 0 8px;">运行中</el-tag>
              <el-tag v-else type="info" size="small" style="margin: 0 8px;">未运行</el-tag>
              <el-button v-if="ollamaRunning" type="danger" size="small" @click="stopOllamaService">
                停止服务
              </el-button>
              <el-button v-else type="primary" size="small" @click="startOllamaService">
                启动服务
              </el-button>
            </div>
            <div class="form-hint">Ollama 默认地址，通常无需修改</div>
          </el-form-item>
          
          <el-form-item label="模型管理">
            <div class="model-section">
              <div v-if="availableModels.length > 0" class="installed-models-list">
                <div class="model-list-header">已安装模型：</div>
                <el-tag v-for="model in availableModels" :key="model.name" 
                  :type="aiModel === model.name ? 'success' : 'info'"
                  style="margin-right: 8px; margin-bottom: 8px; cursor: pointer;"
                  @click="aiModel = model.name; handleAIModelChange(model.name)">
                  {{ model.name }}
                </el-tag>
              </div>
              
              <div class="model-download-section">
                <div class="model-list-header">下载新模型：</div>
                <div class="model-download-actions">
                  <el-button type="primary" @click="pullModel" :loading="pullingModel">
                    一键下载推荐模型
                  </el-button>
                  <span class="model-hint">推荐：huihui_ai/gemma3-abliterated:latest</span>
                </div>
                <div v-if="pullingModel" class="pull-progress">
                  <el-progress 
                    :percentage="pullProgress" 
                    :status="pullProgress === 100 ? 'success' : ''"
                    :indeterminate="pullProgress === 0"
                  />
                  <div class="pull-output" v-if="pullOutput">{{ pullOutput }}</div>
                </div>
                
                <div class="manual-download">
                  <div class="manual-download-title">或手动下载（国内镜像加速）：</div>
                  <div class="manual-download-row">
                    <el-select v-model="selectedMirror" placeholder="选择镜像源" style="width: 180px;">
                      <el-option label="魔塔社区（推荐）" value="modelscope" />
                      <el-option label="HF国内镜像" value="hf-mirror" />
                      <el-option label="DaoCloud镜像" value="daocloud" />
                      <el-option label="默认（国外）" value="" />
                    </el-select>
                    <code class="command-code">{{ modelCommand }}</code>
                    <el-button type="success" size="small" @click="copyCommand(modelCommand)">
                      复制命令
                    </el-button>
                  </div>
                  <div class="form-hint">复制命令后在终端执行</div>
                </div>
              </div>
            </div>
          </el-form-item>
          
          <el-form-item label="当前模型">
            <el-select v-model="aiModel" @change="handleAIModelChange" placeholder="请选择模型" style="width: 100%;">
              <el-option v-for="model in availableModels" :key="model.name" :value="model.name" :label="model.name" />
            </el-select>
            <div class="form-hint" v-if="availableModels.length === 0">请先下载模型</div>
          </el-form-item>
          <el-form-item label="创造性">
            <div class="slider-row">
              <el-slider v-model="aiTemperature" :min="0.1" :max="1" :step="0.1" @change="handleAITemperatureChange" class="slider-input" />
              <span class="slider-value">{{ aiTemperature }}</span>
            </div>
            <div class="form-hint">值越高越有创造性，值越低越稳定</div>
          </el-form-item>
          <el-form-item label="最大字数">
            <div class="slider-row">
              <el-slider v-model="aiMaxTokens" :min="500" :max="2000" :step="100" @change="handleAIMaxTokensChange" class="slider-input" />
              <span class="slider-value">{{ aiMaxTokens }}</span>
            </div>
          </el-form-item>
        </el-form>
      </div>
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
        <el-descriptions-item label="版本">{{ appVersion }}</el-descriptions-item>
        <el-descriptions-item label="描述">基于传统六爻理论的桌面预测应用</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled, WarningFilled, Download } from '@element-plus/icons-vue'
import { useSettingsStore } from '../stores/settings'
import { useHistoryStore } from '../stores/history'

const settingsStore = useSettingsStore()
const historyStore = useHistoryStore()

const appVersion = ref('1.0.0')
const theme = ref<'light' | 'dark' | 'system'>('system')
const fontSize = ref<'small' | 'medium' | 'large'>('medium')
const hexagramStyle = ref<'traditional' | 'modern'>('traditional')
const autoSave = ref(true)
const defaultMethod = ref<'time' | 'number' | 'coin' | 'manual'>('time')

const aiEnabled = ref(false)
const aiOllamaUrl = ref('http://localhost:11434')
const aiModel = ref('')
const aiTemperature = ref(0.7)
const aiMaxTokens = ref(1500)
const checkingOllama = ref(false)

const ollamaConnected = ref(false)
const availableModels = ref<{name: string}[]>([])
const selectedMirror = ref('modelscope')
const installing = ref(false)
const ollamaInstalled = ref(false)
const ollamaVersion = ref('')
const ollamaRunning = ref(false)

const downloading = computed(() => settingsStore.ollamaDownloading)
const downloadProgress = computed(() => settingsStore.ollamaDownloadProgress)
const downloadedFilePath = computed(() => settingsStore.ollamaDownloadedFilePath)

const pullingModel = computed(() => settingsStore.modelPulling)
const pullProgress = computed(() => settingsStore.modelPullProgress)
const pullOutput = computed(() => settingsStore.modelPullOutput)

const modelCommand = computed(() => {
  switch (selectedMirror.value) {
    case 'modelscope':
      return 'ollama run modelscope.cn/unsloth/DeepSeek-R1-Distill-Qwen-7B-GGUF:DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf'
    case 'hf-mirror':
      return 'ollama run hf-mirror.com/unsloth/DeepSeek-R1-Distill-Qwen-7B-GGUF:Q4_K_M'
    case 'daocloud':
      return 'ollama run ollama.m.daocloud.io/library/qwen2.5:7b'
    default:
      return 'ollama pull huihui_ai/gemma3-abliterated:latest'
  }
})

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

async function handleAIEnabledChange(value: boolean) {
  await settingsStore.setAIEnabled(value)
  if (value) {
    await handleRecheckOllama()
  }
}

async function handleRecheckOllama() {
  checkingOllama.value = true
  try {
    // 先检查安装状态
    const installStatus = await window.electronAPI.ai.checkOllamaInstalled()
    ollamaInstalled.value = installStatus.installed
    ollamaVersion.value = installStatus.version || ''
    ollamaRunning.value = installStatus.running

    // 如果服务正在运行，检查连接
    if (installStatus.running) {
      await settingsStore.checkOllama()
      ollamaConnected.value = settingsStore.ollamaConnected
      availableModels.value = settingsStore.availableModels
    } else {
      ollamaConnected.value = false
      availableModels.value = []
    }

    if (ollamaConnected.value) {
      // 连接成功，不弹窗打扰用户
    } else if (!installStatus.installed) {
      // 未安装，界面已显示安装引导，不需要额外弹窗
    } else {
      // 已安装但未运行，界面已显示启动按钮
    }
  } finally {
    checkingOllama.value = false
  }
}

async function handleAIOllamaUrlChange() {
  await settingsStore.setAIOllamaUrl(aiOllamaUrl.value)
  ollamaConnected.value = settingsStore.ollamaConnected
  availableModels.value = settingsStore.availableModels
}

async function handleAIModelChange(value: string) {
  await settingsStore.setAIModel(value)
}

async function handleAITemperatureChange(value: number) {
  await settingsStore.setAITemperature(value)
}

async function handleAIMaxTokensChange(value: number) {
  await settingsStore.setAIMaxTokens(value)
}

async function openDownloadPage(useMirror: boolean) {
  await window.electronAPI.ai.openDownloadPage(useMirror)
}

async function startDownload() {
  const result = await settingsStore.downloadOllama()
  
  if (result.success && result.filePath) {
    ElMessage.success('下载完成，可以开始安装')
  } else if (result.message) {
    ElMessage.info(result.message)
  }
}

async function installOllama() {
  const filePath = downloadedFilePath.value
  if (!filePath) {
    ElMessage.warning('请先下载安装程序')
    return
  }

  installing.value = true
  try {
    const result = await window.electronAPI.ai.installOllama(filePath)

    if (result.success) {
      ElMessage.success('安装成功！请重启应用后使用')
      // 重新检测
      await handleRecheckOllama()
    } else {
      ElMessage.error(result.message)
    }
  } catch (error) {
    ElMessage.error('安装失败，请手动运行安装程序')
  } finally {
    installing.value = false
  }
}

async function startOllamaService() {
  const result = await window.electronAPI.ai.startOllama()
  if (result.success) {
    ElMessage.success(result.message)
    await handleRecheckOllama()
  } else {
    ElMessage.error(result.message)
  }
}

async function stopOllamaService() {
  const result = await window.electronAPI.ai.stopOllama()
  if (result.success) {
    ElMessage.success(result.message)
    await handleRecheckOllama()
  } else {
    ElMessage.error(result.message)
  }
}

function copyCommand(command: string) {
  navigator.clipboard.writeText(command).then(() => {
    ElMessage.success('命令已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

async function pullModel() {
  const modelName = 'huihui_ai/gemma3-abliterated:latest'
  
  const result = await settingsStore.pullModel(modelName)
  if (result.success) {
    if (result.message === '该模型已安装') {
      ElMessage.info(result.message)
    } else {
      ElMessage.success('模型下载完成')
    }
    availableModels.value = settingsStore.availableModels
  } else {
    ElMessage.error(result.message || '模型下载失败')
  }
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
  appVersion.value = await window.electronAPI.app.getVersion()
  await settingsStore.loadSettings()
  
  // 如果正在下载模型，恢复进度监听
  if (settingsStore.modelPulling) {
    settingsStore.setupProgressListener()
  }
  
  theme.value = settingsStore.theme
  fontSize.value = settingsStore.fontSize
  hexagramStyle.value = settingsStore.hexagramStyle
  autoSave.value = settingsStore.autoSave
  defaultMethod.value = settingsStore.defaultMethod

  aiEnabled.value = settingsStore.aiSettings.enabled
  aiOllamaUrl.value = settingsStore.aiSettings.ollamaUrl
  aiModel.value = settingsStore.aiSettings.model
  aiTemperature.value = settingsStore.aiSettings.temperature
  aiMaxTokens.value = settingsStore.aiSettings.maxTokens

  // 如果正在下载 Ollama，恢复进度监听
  if (settingsStore.ollamaDownloading) {
    settingsStore.setupDownloadListener()
  }

  // 如果正在下载模型，恢复进度监听
  if (settingsStore.modelPulling) {
    settingsStore.setupProgressListener()
  }

  // 如果 AI 功能开启，主动检查 Ollama 安装和连接状态
  if (aiEnabled.value) {
    await handleRecheckOllama()
  }
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

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-disabled-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.ai-settings-content {
  padding: 4px 0;
}

.install-guide {
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 20px;
}

.install-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 15px;
  font-weight: 500;
}

.warning-icon {
  color: var(--el-color-warning);
  font-size: 20px;
}

.install-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step {
  display: flex;
  gap: 12px;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-num.step-done {
  background: var(--el-color-success);
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}

.step-action {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.command-code {
  background: var(--el-fill-color);
  padding: 6px 12px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.pull-output {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
  max-height: 100px;
  overflow-y: auto;
  background: var(--el-fill-color-light);
  padding: 8px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

.install-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.requirements {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.ai-form {
  padding: 8px 0;
}

.service-row {
  display: flex;
  align-items: center;
}

.slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-input {
  flex: 1;
  min-width: 200px;
}

.install-actions {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.installed-models {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.slider-value {
  min-width: 36px;
  text-align: right;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.form-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.model-section {
  width: 100%;
}

.installed-models-list {
  margin-bottom: 16px;
}

.model-list-header {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.model-download-section {
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 16px;
}

.model-download-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.model-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.pull-progress {
  margin-bottom: 12px;
}

.pull-output {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
  max-height: 100px;
  overflow-y: auto;
  font-family: monospace;
  background: var(--el-fill-color);
  padding: 8px;
  border-radius: 4px;
}

.manual-download {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.manual-download-title {
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 8px;
}

.manual-download-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.guide-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.guide-action {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.guide-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}
</style>
