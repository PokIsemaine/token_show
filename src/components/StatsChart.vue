<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart, BarChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([PieChart, BarChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

const props = defineProps({
  entries: { type: Array, default: () => [] },
  stats: { type: Object, default: () => ({}) },
})

const tokenTypePie = computed(() => ({
  title: { text: 'Token 类型分布', left: 'center', textStyle: { fontSize: 14 } },
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, type: 'scroll' },
  series: [{
    type: 'pie',
    radius: ['35%', '60%'],
    label: { show: true, formatter: '{b}: {c}' },
    data: Object.entries(props.stats.tokenTypes || {}).map(([name, value]) => ({ name, value })),
  }],
}))

const companyBar = computed(() => {
  const companyMap = {}
  props.entries.forEach(e => {
    if (!companyMap[e.company]) companyMap[e.company] = []
    companyMap[e.company].push(e)
  })
  const companies = Object.keys(companyMap).sort((a, b) => companyMap[b].length - companyMap[a].length).slice(0, 15)
  return {
    title: { text: '各公司提交数量', left: 'center', textStyle: { fontSize: 14 } },
    tooltip: { trigger: 'axis' },
    grid: { left: 80, right: 20, bottom: 40, top: 40 },
    xAxis: { type: 'category', data: companies, axisLabel: { rotate: 30, fontSize: 11 } },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: companies.map(c => companyMap[c].length),
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    }],
  }
})
</script>

<template>
  <div class="grid md:grid-cols-2 gap-6 mb-8">
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <v-chart :option="tokenTypePie" style="height: 320px" autoresize />
    </div>
    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <v-chart :option="companyBar" style="height: 320px" autoresize />
    </div>
  </div>
</template>
