<script setup>
const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

const props = defineProps({
  classSchedule: Object,
  dialogData: Object
});

function openDialog(thisClass) {
  props.dialogData.selectedClass = thisClass;
  document.getElementById("modifyDialog").open = true;
}

function handleTimeClick(time, index) {
  props.dialogData.selectedTime = time;
}

function formatTime([hours, minutes]) {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function openTimeManageDialog() {
  props.dialogData.selectedTime = {};
}

// 检查某天是否启用
function isDayEnabled(day) {
  return props.classSchedule.timeTable.days.includes(day);
}
</script>

<template>
  <div class="tableContainer">
    <mdui-list>
      <mdui-list-subheader class="time-header">
        <mdui-button-icon 
          icon="schedule" 
          @click="openTimeManageDialog"
          title="管理课程时间"
        ></mdui-button-icon>
      </mdui-list-subheader>
      <mdui-list-subheader 
        v-for="(time, index) in props.classSchedule.timeTable.classes"
        :key="index"
        class="time-cell"
      >
        {{ index + 1 }}
      </mdui-list-subheader>
    </mdui-list>
    <mdui-list v-for="(day, di) in props.classSchedule.classes" :key="di">
      <div v-if="day && isDayEnabled(di)">
        <mdui-list-subheader>{{ days[di] }}</mdui-list-subheader>
        <mdui-list-item 
          v-for="(i, ci) in props.classSchedule.timeTable.classes" 
          :key="ci"
          @click='openDialog([di, ci, JSON.parse(JSON.stringify(day[ci]))])'
        >
          {{ props.classSchedule.getSubject(day, i).name }}
        </mdui-list-item>
      </div>
    </mdui-list>
  </div>
</template>

<style scoped>
.tableContainer {
  display: flex;
  flex-direction: row;
  justify-content: center;
}

/* 让所有列表项居中对齐 */
mdui-list-subheader,
mdui-list-item {
  text-align: center;
  justify-content: center;
}

.time-header {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 48px;
}

.day-disabled {
  display: none;
}
</style>
