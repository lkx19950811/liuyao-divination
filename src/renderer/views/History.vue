<template>
  <div class="history-page">
    <div class="page-header">
      <h1 class="page-title">历史记录</h1>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索问题或备注..."
        :prefix-icon="Search"
        clearable
        style="width: 300px"
        @input="handleSearch"
      />
    </div>

    <div class="history-list" v-loading="historyStore.isLoading">
      <el-empty v-if="historyStore.records.length === 0" description="暂无历史记录" />
      
      <el-card v-for="record in historyStore.records" :key="record.id" class="history-item" @click="viewDetail(record)">
        <div class="history-item-header">
          <div class="hexagram-names">
            <span class="original-hexagram">{{ getHexagramName(record.originalHexagramId) }}</span>
            <span v-if="record.changedHexagramId" class="arrow">→</span>
            <span v-if="record.changedHexagramId" class="changed-hexagram">{{ getHexagramName(record.changedHexagramId) }}</span>
          </div>
          <el-tag :type="getMethodType(record.method)" size="small">
            {{ getMethodLabel(record.method) }}
          </el-tag>
        </div>
        <div class="history-item-content">
          <p class="question" v-if="record.question">{{ record.question }}</p>
          <p class="date">{{ formatDate(record.createdAt) }}</p>
        </div>
        <div class="history-item-actions">
          <el-button type="primary" link @click.stop="viewDetail(record)">查看详情</el-button>
          <el-button type="danger" link @click.stop="handleDelete(record.id)">删除</el-button>
        </div>
      </el-card>
    </div>

    <div class="pagination" v-if="historyStore.total > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="historyStore.total"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useHistoryStore } from '../stores/history'
import { HEXAGRAMS } from '../../shared/data/hexagrams'

const router = useRouter()
const historyStore = useHistoryStore()

const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = 20

function getHexagramName(id: number): string {
  return HEXAGRAMS.find(h => h.id === id)?.name || '未知'
}

function getMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    time: '时间起卦',
    number: '数字起卦',
    coin: '铜钱起卦',
    manual: '手动起卦'
  }
  return labels[method] || '未知'
}

function getMethodType(method: string): '' | 'success' | 'warning' | 'info' | 'danger' {
  const types: Record<string, '' | 'success' | 'warning' | 'info' | 'danger'> = {
    time: '',
    number: 'success',
    coin: 'warning',
    manual: 'info'
  }
  return types[method] || ''
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadRecords() {
  await historyStore.loadRecords({
    limit: pageSize,
    offset: (currentPage.value - 1) * pageSize
  })
}

async function handleSearch() {
  if (searchKeyword.value.trim()) {
    await historyStore.searchRecords(searchKeyword.value.trim())
  } else {
    await loadRecords()
  }
}

function handlePageChange(page: number) {
  currentPage.value = page
  loadRecords()
}

function viewDetail(record: { id: string }) {
  router.push(`/result/${record.id}`)
}

async function handleDelete(id: string) {
  try {
    await ElMessageBox.confirm('确定要删除这条记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await historyStore.deleteRecord(id)
    ElMessage.success('删除成功')
  } catch {
    // User cancelled
  }
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
.history-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  cursor: pointer;
  transition: all 0.3s;
}

.history-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.history-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.hexagram-names {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
}

.original-hexagram {
  color: var(--el-color-primary);
}

.arrow {
  color: var(--el-text-color-secondary);
}

.changed-hexagram {
  color: var(--el-color-warning);
}

.history-item-content {
  margin-bottom: 12px;
}

.question {
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.date {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.history-item-actions {
  display: flex;
  gap: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
