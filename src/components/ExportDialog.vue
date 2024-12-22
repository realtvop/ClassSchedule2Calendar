<script setup>
import { onMounted, ref } from 'vue';

const weekOffset = ref(0);

function getCurrentWeekDates() {
  const now = new Date();
  const currentDay = now.getDay();
  
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - currentDay + 1);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(now);
  endDate.setDate(now.getDate() - currentDay + 6);
  endDate.setHours(23, 59, 59, 999);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

function closeDialog() {
  document.getElementById("exportDialog").open = false;
  weekOffset.value = 0;
}

function exportAndClose() {
  props.onExport(new Date(props.exportData.startDate), new Date(props.exportData.endDate));
  closeDialog();
}

function adjustWeek(weeks) {
  weekOffset.value += weeks;
  const start = new Date(props.exportData.startDate);
  const end = new Date(props.exportData.endDate);
  
  start.setDate(start.getDate() + weeks * 7);
  end.setDate(end.getDate() + weeks * 7);
  
  props.exportData.startDate = start.toISOString().split('T')[0];
  props.exportData.endDate = end.toISOString().split('T')[0];
}

onMounted(() => {
  const { startDate, endDate } = getCurrentWeekDates();
  props.exportData.startDate = startDate;
  props.exportData.endDate = endDate;
});

const props = defineProps({
  exportData: Object,
  onExport: Function
});
</script>

<template>
  <mdui-dialog close-on-overlay-click id="exportDialog" @keyup.enter="exportAndClose">
    <mdui-top-app-bar slot="header">
      <mdui-button-icon icon="close" @click="closeDialog"></mdui-button-icon>
      <mdui-top-app-bar-title>导出 ics 文件</mdui-top-app-bar-title>
      <mdui-button variant="text" @click="exportAndClose">导出</mdui-button>
    </mdui-top-app-bar>
    
    <div style="padding: 16px;">
      <mdui-text-field
        type="date"
        v-model="exportData.startDate"
        style="margin-bottom: 16px; width: 100%;"
        label="开始日期"
      ></mdui-text-field>
      
      <mdui-text-field
        type="date"
        v-model="exportData.endDate"
        style="margin-bottom: 16px; width: 100%;"
        label="结束日期"
      ></mdui-text-field>

      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <mdui-button style="min-width: 0" @click="adjustWeek(-1)">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--mdui-color-on-surface-variant)">上一周</span>
            <mdui-icon name="chevron_left"></mdui-icon>
          </div>
        </mdui-button>

        <span style="color: var(--mdui-color-on-surface-variant); min-width: 80px; text-align: center">
          {{ weekOffset === 0 ? '本周' : 
             weekOffset < 0 ? `${-weekOffset} 周前` : 
             `${weekOffset} 周后` }}
        </span>

        <mdui-button style="min-width: 0" @click="adjustWeek(1)">
          <div style="display: flex; align-items: center; gap: 8px;">
            <mdui-icon name="chevron_right"></mdui-icon>
            <span style="color: var(--mdui-color-on-surface-variant)">下一周</span>
          </div>
        </mdui-button>
      </div>
    </div>
  </mdui-dialog>
</template>

<style scoped>
</style> 