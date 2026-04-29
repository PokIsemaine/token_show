<script setup>
import { ref } from 'vue'

const props = defineProps({
  entry: {
    type: Object,
    required: true,
  },
})

const expanded = ref(false)

const tokenTypes = Array.isArray(props.entry.tokenType) ? props.entry.tokenType : [props.entry.tokenType]
const methods = Array.isArray(props.entry.reimbursementMethod) ? props.entry.reimbursementMethod : [props.entry.reimbursementMethod]
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition cursor-pointer"
    @click="expanded = !expanded"
  >
    <div class="mb-3">
      <h3 class="text-lg font-semibold">{{ entry.company }}</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">{{ entry.department }}</p>
    </div>

    <!-- Supplier tags -->
    <div class="flex flex-wrap gap-1 mb-3">
      <span
        v-for="t in tokenTypes"
        :key="t"
        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
      >
        {{ t }}
      </span>
    </div>

    <div class="space-y-2 text-sm">
      <div class="flex items-center gap-2">
        <span class="text-gray-500 dark:text-gray-400 shrink-0">额度</span>
        <span class="font-medium text-green-600 dark:text-green-400">{{ entry.monthlyQuota }}</span>
      </div>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="m in methods"
          :key="m"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700"
        >
          {{ m }}
        </span>
      </div>
    </div>

    <!-- Comment hint -->
    <div v-if="entry.comments && entry.comments.length > 0" class="mt-3 text-xs text-gray-400">
      💬 {{ entry.comments.length }} 条评论
    </div>

    <!-- Expanded details -->
    <div v-if="expanded" class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3 text-sm">
      <div v-if="entry.restrictions">
        <span class="text-gray-500 dark:text-gray-400">限制条件：</span>
        <span>{{ entry.restrictions }}</span>
      </div>
      <div v-if="entry.note">
        <span class="text-gray-500 dark:text-gray-400">备注：</span>
        <span>{{ entry.note }}</span>
      </div>

      <!-- Comments -->
      <div v-if="entry.comments && entry.comments.length > 0" class="space-y-3">
        <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">评论</div>
        <div
          v-for="(comment, idx) in entry.comments"
          :key="idx"
          class="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm"
        >
          <div class="text-xs text-gray-400 mb-1">
            <a
              :href="`https://github.com/${comment.author}`"
              target="_blank"
              rel="noopener"
              class="text-blue-500 hover:underline font-medium"
              @click.stop
            >
              @{{ comment.author }}
            </a>
            · {{ comment.createdAt.split('T')[0] }}
          </div>
          <p class="whitespace-pre-wrap">{{ comment.body }}</p>
        </div>
      </div>

      <div class="text-xs text-gray-400 mt-2">
        发布于 {{ entry.publishedAt }}
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

    <!-- Collapse hint -->
    <div v-else class="mt-3 text-xs text-gray-400">
      点击展开详情
    </div>
  </div>
</template>
