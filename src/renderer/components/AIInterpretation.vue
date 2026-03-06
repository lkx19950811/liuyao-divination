<template>
  <div class="ai-interpretation">
    <!-- 思考过程区域 - 仅当有思考内容时显示 -->
    <div v-if="hasThinkingContent" class="thinking-section">
      <div
        class="thinking-header"
        :class="{ expanded: isThinkingExpanded }"
        @click="isThinkingExpanded = !isThinkingExpanded"
      >
        <div class="thinking-title">
          <el-icon class="thinking-icon"><Cpu /></el-icon>
          <span>思考过程</span>
          <el-tag v-if="isGenerating && isThinkingInProgress" size="small" type="warning" effect="light" class="thinking-tag">
            思考中
          </el-tag>
          <el-tag v-else-if="!isThinkingInProgress" size="small" type="success" effect="light" class="thinking-tag">
            已完成
          </el-tag>
        </div>
        <el-icon class="expand-icon"><ArrowDown /></el-icon>
      </div>

      <el-collapse-transition>
        <div v-show="isThinkingExpanded" class="thinking-content-wrapper">
          <div class="thinking-content" v-html="renderMarkdown(thinking)"></div>
        </div>
      </el-collapse-transition>
    </div>

    <!-- 正文内容 -->
    <div class="main-content">
      <div v-if="content" v-html="renderMarkdown(content)" class="markdown-body"></div>
      <div v-else-if="isGenerating && !hasContent" class="generating-hint">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>{{ hasThinkingContent ? '正在生成正文...' : 'AI正在解读中...' }}</span>
      </div>
    </div>

    <!-- 生成中光标 -->
    <span v-if="isGenerating" class="cursor-blink">▌</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { marked } from 'marked'
import { Cpu, Loading, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps<{
  fullText: string
  isGenerating: boolean
  showThinking?: boolean
}>()

const thinking = ref('')
const content = ref('')
const isThinkingExpanded = ref(false) // 默认折叠
const isThinkingInProgress = ref(false)

// 计算属性：是否有思考内容
const hasThinkingContent = computed(() => {
  return thinking.value.length > 0
})

// 计算属性：是否有正文内容
const hasMainContent = computed(() => {
  return content.value.length > 0
})

// 计算属性：是否有任何内容
const hasContent = computed(() => {
  return hasThinkingContent.value || hasMainContent.value
})

// 解析文本，分离思考过程和正文
function parseText(text: string) {
  if (!text) {
    return { thinkingText: '', mainText: '', isThinking: false }
  }

  // 如果不显示思考过程
  if (props.showThinking === false) {
    // 移除思考标签，只保留正文
    const thinkRegex = /  \[思考\][\s\S]*?\[\/思考\]/g
    const mainText = text.replace(thinkRegex, '').trim()
    return { thinkingText: '', mainText, isThinking: false }
  }

  // 匹配  [思考]...[/思考] 标签
  const thinkRegex = /  \[思考\]([\s\S]*?)\[\/思考\]/g
  let thinkingText = ''
  let mainText = text

  // 提取思考过程
  let match
  while ((match = thinkRegex.exec(text)) !== null) {
    thinkingText += match[1]
  }

  // 移除思考标签，保留正文
  mainText = text.replace(thinkRegex, '').trim()

  // 处理未闭合的思考标签（正在生成中）
  const unclosedThinkMatch = text.match(/  \[思考\]([\s\S]*)$/)
  if (unclosedThinkMatch && !text.includes('[/思考]')) {
    thinkingText = unclosedThinkMatch[1]
    mainText = ''
    return { thinkingText, mainText, isThinking: true }
  }

  return { thinkingText: thinkingText.trim(), mainText, isThinking: false }
}

// 监听文本变化，实时解析
watch(() => props.fullText, (newText) => {
  const { thinkingText, mainText, isThinking } = parseText(newText)
  thinking.value = thinkingText
  content.value = mainText
  isThinkingInProgress.value = isThinking

  // 如果正在生成思考过程，自动展开
  if (isThinking && !isThinkingExpanded.value) {
    isThinkingExpanded.value = true
  }
}, { immediate: true })

// 渲染 Markdown
function renderMarkdown(text: string): string {
  if (!text) return ''
  return marked(text) as string
}
</script>

<style scoped>
.ai-interpretation {
  line-height: 1.8;
}

/* 思考区域样式 */
.thinking-section {
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--el-fill-color-lighter);
}

.thinking-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  background-color: var(--el-fill-color-light);
  transition: background-color 0.2s;
}

.thinking-header:hover {
  background-color: var(--el-fill-color);
}

.thinking-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.thinking-icon {
  color: var(--el-color-primary);
  font-size: 14px;
}

.thinking-tag {
  margin-left: 4px;
}

.expand-icon {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  transition: transform 0.3s;
}

.thinking-header.expanded .expand-icon {
  transform: rotate(180deg);
}

.thinking-content-wrapper {
  padding: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.thinking-content {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  max-height: 400px;
  overflow-y: auto;
}

.thinking-content :deep(p) {
  margin: 4px 0;
}

.thinking-content :deep(ul),
.thinking-content :deep(ol) {
  padding-left: 16px;
  margin: 4px 0;
}

/* 正文样式 */
.main-content {
  min-height: 20px;
}

.generating-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  padding: 16px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 8px;
}

/* Markdown 样式 */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  margin: 16px 0 8px;
  font-weight: 600;
}

.markdown-body :deep(h1) { font-size: 20px; }
.markdown-body :deep(h2) { font-size: 18px; }
.markdown-body :deep(h3) { font-size: 16px; }

.markdown-body :deep(p) {
  margin: 8px 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.markdown-body :deep(li) {
  margin: 4px 0;
}

.markdown-body :deep(strong) {
  font-weight: 600;
}

.markdown-body :deep(code) {
  background-color: var(--el-fill-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
}

.markdown-body :deep(pre) {
  background-color: var(--el-fill-color-dark);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 12px 0;
}

.markdown-body :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid var(--el-border-color);
  padding-left: 12px;
  margin: 8px 0;
  color: var(--el-text-color-secondary);
}

/* 生成中光标 */
.cursor-blink {
  color: var(--el-color-primary);
  font-weight: bold;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>
