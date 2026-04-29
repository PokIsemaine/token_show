<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  companies: { type: Array, default: () => [] },
  tokenTypes: { type: Array, default: () => [] },
  methods: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue'])

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function resetFilters() {
  emit('update:modelValue', {
    company: '',
    tokenType: '',
    reimbursementMethod: '',
    keyword: '',
  })
}

const hasFilters = computed(() =>
  props.modelValue.company || props.modelValue.tokenType || props.modelValue.reimbursementMethod || props.modelValue.keyword
)
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 mb-6">
    <input
      type="text"
      placeholder="搜索公司/部门..."
      :value="modelValue.keyword"
      @input="update('keyword', $event.target.value)"
      class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none w-48"
    />

    <select
      :value="modelValue.company"
      @change="update('company', $event.target.value)"
      class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">全部公司</option>
      <option v-for="c in companies" :key="c" :value="c">{{ c }}</option>
    </select>

    <select
      :value="modelValue.tokenType"
      @change="update('tokenType', $event.target.value)"
      class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">全部类型</option>
      <option v-for="t in tokenTypes" :key="t" :value="t">{{ t }}</option>
    </select>

    <select
      :value="modelValue.reimbursementMethod"
      @change="update('reimbursementMethod', $event.target.value)"
      class="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <option value="">全部方式</option>
      <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
    </select>

    <button
      v-if="hasFilters"
      @click="resetFilters"
      class="px-3 py-2 text-sm text-red-500 hover:text-red-700 transition"
    >
      清除筛选
    </button>
  </div>
</template>
