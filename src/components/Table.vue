<script setup>
const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function openDialog(thisClass, that) {
  that.$attrs.dialogData.selectedClass = thisClass;
  document.getElementById("modifyDialog").open = true;
}
</script>

<template>
  <div class="tableContainer">
    <mdui-list>
      <mdui-list-subheader></mdui-list-subheader>
      <mdui-list-subheader v-for="thisClass in $attrs.classSchedule.timeTable.classes">{{ thisClass.name || ($attrs.classSchedule.timeTable.classes.indexOf(thisClass) + 1) }}</mdui-list-subheader>
    </mdui-list>
    <mdui-list v-for="(day, di) in $attrs.classSchedule.classes">
      <div v-if="day">
        <mdui-list-subheader>{{ days[di] }}</mdui-list-subheader>
        <mdui-list-item v-for="(i, ci) in $attrs.classSchedule.timeTable.classes" @click='openDialog([di, ci, JSON.parse(JSON.stringify(day[ci]))], this)'>{{ $attrs.classSchedule.getSubject(day, i).name }}</mdui-list-item>
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
