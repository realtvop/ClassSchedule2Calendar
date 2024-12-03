<script setup>
const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function closeDialog() {
  document.getElementById("modifyDialog").open = false;
}
function save(attrs) {
  attrs.classSchedule.classes[attrs.selectedClass[0]][attrs.selectedClass[1]].subjects = attrs.selectedClass[2].subjects;
  closeDialog();
  console.log(JSON.parse(JSON.stringify(attrs.classSchedule.classes)))
}
</script>

<template>
  <mdui-dialog close-on-overlay-click id="modifyDialog" @keyup.enter="save">
    <mdui-top-app-bar slot="header">
      <mdui-button-icon icon="close" @click="closeDialog"></mdui-button-icon>
      <mdui-top-app-bar-title v-if="$attrs.selectedClass">{{ days[$attrs.selectedClass[0]] }} 第 {{ $attrs.selectedClass[1] + 1 }} 节</mdui-top-app-bar-title>
      <mdui-button variant="text" @click="save($attrs)">保存</mdui-button>
    </mdui-top-app-bar>
    <div style="height: 100px; width: 100%;" v-if="$attrs.selectedClass">
<!--      {{$attrs.selectedClass}}-->
      <mdui-select v-for="(s, si) in $attrs.selectedClass[2].subjects" label="科目" :value="s"
                   @click="$attrs.selectedClass[2].subjects[si] = $event.target.value">
        <mdui-menu-item v-for="(subject, i) in $attrs.classSchedule.subjects" :value="i">{{ subject.name }}</mdui-menu-item>
      </mdui-select>
    </div>
  </mdui-dialog>
</template>

<style scoped>
</style>
