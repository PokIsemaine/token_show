<script setup>
import { ref } from 'vue'

defineProps({
  entry: {
    type: Object,
    required: true,
  },
})

const expanded = ref(false)
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition cursor-pointer"
    @click="expanded = !expanded"
  >
    <div class="flex items-start justify-between mb-3">
      <div>
        <h3 class="text-lg font-semibold">{{ entry.company }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ entry.department }}</p>
      </div>
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
        {{ entry.tokenType }}
      </span>
    </div>

    <div class="space-y-2 text-sm">
      <div class="flex items-center gap-2">
        <span class="text-gray-500 dark:text-gray-400 shrink-0">月度额度</span>
        <span class="font-medium text-green-600 dark:text-green-400">{{ entry.monthlyQuota }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-gray-500 dark:text-gray-400 shrink-0">报销方式</span>
        <span>{{ entry.reimbursementMethod }}</span>
      </div>
    </div>

    <!-- Expanded details -->
    <div v-if="expanded" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2 text-sm">
      <div v-if="entry.restrictions">
        <span class="text-gray-500 dark:text-gray-400">限制条件：</span>
        <span>{{ entry.restrictions }}</span>
      </div>
      <div v-if="entry.note">
        <span class="text-gray-500 dark:text-gray-400">备注：</span>
        <span>{{ entry.note }}</span>
      </div>
      <div class="text-xs text-gray-400 mt-2">
        提交于 {{ entry.submittedAt }}
        <a
          v-if="entry.issueNumber"
          :href="`https://github.com/PokIsemaine/token_show/issues/${entry.issueNumber}`"
          target="_blank"
          rel="noopener"
          class="ml-2 text-blue-500 hover:underline"
          @click.stop
        >
          #{{ entry.issueNumber }}
        </a>
      </div>
    </div>

    <!-- Expand hint -->
    <div v-else class="mt-3 text-xs text-gray-400">
      点击展开详情
    </div>
  </div>
</template>
