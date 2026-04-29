<script setup>
import { ref, computed, onMounted } from 'vue'
import EntryCard from './components/EntryCard.vue'
import FilterBar from './components/FilterBar.vue'
import entriesData from '../data/entries.json'
import statsData from '../data/stats.json'

const entries = ref(entriesData)
const stats = ref(statsData)
const loading = ref(true)

const filters = ref({
  company: '',
  tokenType: '',
  reimbursementMethod: '',
  keyword: '',
})

const companies = computed(() => [...new Set(entries.value.map(e => e.company))].sort())
const tokenTypes = computed(() => [...new Set(entries.value.map(e => e.tokenType))].sort())
const methods = computed(() => [...new Set(entries.value.map(e => e.reimbursementMethod))].sort())

const filteredEntries = computed(() => {
  return entries.value.filter(e => {
    if (filters.value.company && e.company !== filters.value.company) return false
    if (filters.value.tokenType && e.tokenType !== filters.value.tokenType) return false
    if (filters.value.reimbursementMethod && e.reimbursementMethod !== filters.value.reimbursementMethod) return false
    if (filters.value.keyword) {
      const kw = filters.value.keyword.toLowerCase()
      return (
        e.company.toLowerCase().includes(kw) ||
        e.department.toLowerCase().includes(kw) ||
        e.tokenType.toLowerCase().includes(kw) ||
        e.note.toLowerCase().includes(kw)
      )
    }
    return true
  })
})

onMounted(() => {
  loading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Token Show</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">各公司 AI Token 报销待遇一览</p>
        </div>
        <a
          href="https://github.com/PokIsemaine/token_show/issues/new?template=token-info.yml&labels=token-info"
          target="_blank"
          rel="noopener"
          class="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          + 提交信息
        </a>
      </div>
    </header>

    <!-- Main -->
    <main class="max-w-6xl mx-auto px-4 py-6">
      <!-- Filter bar -->
      <FilterBar
        v-model="filters"
        :companies="companies"
        :token-types="tokenTypes"
        :methods="methods"
      />

      <!-- Results count -->
      <div class="mb-4 text-sm text-gray-500 dark:text-gray-400">
        共 {{ filteredEntries.length }} 条记录
        <span v-if="stats.lastUpdated">（数据更新于 {{ stats.lastUpdated }}）</span>
      </div>

      <!-- Entry list -->
      <div v-if="loading" class="text-center py-20 text-gray-400">加载中...</div>
      <div v-else-if="filteredEntries.length === 0" class="text-center py-20 text-gray-400">
        暂无数据，点击右上角「+ 提交信息」贡献第一条
      </div>
      <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <EntryCard
          v-for="entry in filteredEntries"
          :key="entry.id"
          :entry="entry"
        />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 dark:border-gray-700 mt-12">
      <div class="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
        Token Show — 社区驱动的 Token 报销待遇信息 · 数据通过 GitHub Issue 提交
      </div>
    </footer>
  </div>
</template>
