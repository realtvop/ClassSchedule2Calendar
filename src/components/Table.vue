<script setup>
const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const timeTable = 
  {
    name: "Weekdays",
    days: [1, 2, 3, 4, 5],
    classes: [
      { name: null, startsAt: [ 7, 15], endsAt: [ 7, 40] },
      { name: null, startsAt: [ 7, 45], endsAt: [ 8, 25] },
      { name: null, startsAt: [ 8, 35], endsAt: [ 9, 15] },
      { name: null, startsAt: [ 9, 45], endsAt: [10, 25] },
      { name: null, startsAt: [10, 35], endsAt: [11, 15] },
      { name: null, startsAt: [11, 25], endsAt: [12,  5] },

      { name: null, startsAt: [14, 10], endsAt: [14, 50] },
      { name: null, startsAt: [15,  0], endsAt: [15, 40] },
      { name: null, startsAt: [15, 55], endsAt: [16, 35] },
      { name: null, startsAt: [16, 40], endsAt: [17, 20] },

      { name: null, startsAt: [18, 50], endsAt: [20, 20], default: "第一节晚自习" },
      { name: null, startsAt: [20, 35], endsAt: [22, 10], default: "第二节晚自习" },
    ]
  };
const classes = [
  null,
  [ { type: 0, subjects: ["英语早读"] }, { type: 0, subjects: ["语文"] }, { type: 0, subjects: ["物理"] }, { type: 0, subjects: ["数学"] }, { type: 0, subjects: ["英语"] }, { type: 0, subjects: ["音乐"] }, { type: 0, subjects: ["自习"] }, { type: 0, subjects: ["生物"] }, { type: 0, subjects: ["信息"] }, { type: 0, subjects: ["团队活动"] }, ],
  [ { type: 0, subjects: ["语文早读"] }, { type: 0, subjects: ["英语"] }, { type: 0, subjects: ["语文"] }, { type: 0, subjects: ["数学"] }, { type: 0, subjects: ["数学"] }, { type: 0, subjects: ["体育"] }, { type: 0, subjects: ["历史"] }, { type: 0, subjects: ["地理"] }, { type: 0, subjects: ["化学"] }, { type: 0, subjects: ["物理测试"] }, ],
]
function getSubject(day, i) {
  if (day[timeTable.classes.indexOf(i)]) return day[timeTable.classes.indexOf(i)].subjects[0];
  return i.default;
}
</script>

<template>
  <div class="tableContainer">
    <mdui-list>
      <mdui-list-subheader></mdui-list-subheader>
      <mdui-list-subheader v-for="thisClass in timeTable.classes">{{ thisClass.name || (timeTable.classes.indexOf(thisClass) + 1) }}</mdui-list-subheader>
    </mdui-list>
    <mdui-list v-for="day in classes">
      <div v-if="day">
        <mdui-list-subheader>{{ days[classes.indexOf(day)] }}</mdui-list-subheader>
        <mdui-list-item v-for="i in timeTable.classes">{{ getSubject(day, i) }}</mdui-list-item>
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
.tableContainer > mdui-list {
  width: max-content;
}
</style>
