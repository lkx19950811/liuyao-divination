<template>
  <div class="knowledge-page">
    <div class="page-header">
      <h1 class="page-title">知识库</h1>
      <el-input
        v-model="searchKeyword"
        placeholder="搜索卦象..."
        :prefix-icon="Search"
        clearable
        style="width: 300px"
        @input="handleSearch"
      />
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="六十四卦" name="hexagrams">
        <div class="hexagram-grid">
          <el-card 
            v-for="hexagram in filteredHexagrams" 
            :key="hexagram.id" 
            class="hexagram-card"
            shadow="hover"
          >
            <div class="hexagram-header">
              <span class="hexagram-name">{{ hexagram.name }}</span>
              <span class="hexagram-id">第{{ hexagram.id }}卦</span>
            </div>
            <div class="hexagram-trigrams">
              {{ hexagram.upperTrigram }}上 {{ hexagram.lowerTrigram }}下
            </div>
            <div class="hexagram-guaci">
              <strong>卦辞：</strong>{{ hexagram.guaci }}
            </div>
            <div class="hexagram-xiangci">
              <strong>象辞：</strong>{{ hexagram.xiangci }}
            </div>
            <div class="hexagram-desc" v-if="hexagram.description">
              {{ hexagram.description }}
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="八卦基础" name="bagua">
        <div class="bagua-section">
          <h3>八卦简介</h3>
          <p>八卦是中国古代哲学的基本概念，由阴爻（--）和阳爻（—）两种符号组成，每卦由三爻组成。</p>
          
          <el-row :gutter="20" class="trigram-list">
            <el-col :span="6" v-for="(trigram, name) in TRIGRAMS" :key="name">
              <el-card class="trigram-card">
                <div class="trigram-symbol">{{ trigram.symbol }}</div>
                <div class="trigram-name">{{ trigram.name }}</div>
                <div class="trigram-info">
                  <p><strong>五行：</strong>{{ trigram.wuxing }}</p>
                  <p><strong>自然：</strong>{{ trigram.nature }}</p>
                  <p><strong>方位：</strong>{{ trigram.direction }}</p>
                  <p><strong>季节：</strong>{{ trigram.season }}</p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <el-tab-pane label="起卦方法" name="methods">
        <div class="methods-section">
          <el-card class="method-info-card">
            <template #header>
              <span>时间起卦法</span>
            </template>
            <p>以农历年、月、日、时之数起卦。</p>
            <p>上卦 = (年 + 月 + 日) ÷ 8 的余数</p>
            <p>下卦 = (年 + 月 + 日 + 时) ÷ 8 的余数</p>
            <p>动爻 = (年 + 月 + 日 + 时) ÷ 6 的余数</p>
          </el-card>

          <el-card class="method-info-card">
            <template #header>
              <span>数字起卦法</span>
            </template>
            <p>以两个数字起卦。</p>
            <p>上卦 = 第一个数 ÷ 8 的余数</p>
            <p>下卦 = 第二个数 ÷ 8 的余数</p>
            <p>动爻 = (两数之和) ÷ 6 的余数</p>
          </el-card>

          <el-card class="method-info-card">
            <template #header>
              <span>铜钱起卦法</span>
            </template>
            <p>使用三枚铜钱，抛掷六次，每次记录结果：</p>
            <ul>
              <li>三个正面：老阳（动爻）</li>
              <li>两个正面：少阳（阳爻）</li>
              <li>一个正面：少阴（阴爻）</li>
              <li>零个正面：老阴（动爻）</li>
            </ul>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { HEXAGRAMS, TRIGRAMS } from '@shared/data/hexagrams'

const activeTab = ref('hexagrams')
const searchKeyword = ref('')

const filteredHexagrams = computed(() => {
  if (!searchKeyword.value.trim()) {
    return HEXAGRAMS
  }
  const keyword = searchKeyword.value.toLowerCase()
  return HEXAGRAMS.filter(h => 
    h.name.includes(searchKeyword.value) ||
    h.guaci.includes(searchKeyword.value) ||
    h.description?.toLowerCase().includes(keyword)
  )
})

function handleSearch() {
  // Search is reactive through computed
}
</script>

<style scoped>
.knowledge-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.hexagram-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.hexagram-card {
  transition: all 0.3s;
}

.hexagram-card:hover {
  transform: translateY(-4px);
}

.hexagram-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.hexagram-name {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.hexagram-id {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.hexagram-trigrams {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}

.hexagram-guaci,
.hexagram-xiangci {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.hexagram-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.bagua-section h3 {
  margin-bottom: 16px;
}

.trigram-list {
  margin-top: 24px;
}

.trigram-card {
  text-align: center;
  padding: 20px;
}

.trigram-symbol {
  font-size: 48px;
  margin-bottom: 12px;
}

.trigram-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
}

.trigram-info {
  text-align: left;
  font-size: 14px;
}

.trigram-info p {
  margin-bottom: 4px;
}

.methods-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.method-info-card {
  line-height: 1.8;
}

.method-info-card ul {
  margin-top: 8px;
  padding-left: 20px;
}
</style>
