<script setup>
const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
</script>

<template>
  <div class="tableContainer">
    <mdui-list>
      <mdui-list-subheader></mdui-list-subheader>
      <mdui-list-subheader v-for="thisClass in $attrs.classSchedule.timeTable.classes">{{ thisClass.name || ($attrs.classSchedule.timeTable.classes.indexOf(thisClass) + 1) }}</mdui-list-subheader>
    </mdui-list>
    <mdui-list v-for="day in $attrs.classSchedule.classes">
      <div v-if="day">
        <mdui-list-subheader>{{ days[$attrs.classSchedule.classes.indexOf(day)] }}</mdui-list-subheader>
        <mdui-list-item v-for="i in $attrs.classSchedule.timeTable.classes">{{ $attrs.classSchedule.getSubject(day, i).name }}</mdui-list-item>
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
