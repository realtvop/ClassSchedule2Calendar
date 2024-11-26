<script setup>
import packageInfo from "../package.json";
import CSTable from './components/Table.vue';

import { generateIcs } from "./utils/exportIcs.js";
const timeTable =
    {
      name: "Weekdays",
      days: [1, 2, 3, 4, 5],
      classes: [
        { name: null, startsAt: [ 7, 10], endsAt: [ 7, 40] },
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

function exportIcs() {
  downloadTextFile("fuck.ics", generateIcs(timeTable, classes))
}
function downloadTextFile(filename, content) {
  // 创建一个 Blob 对象，包含文本内容
  const blob = new Blob([content], { type: 'text/plain' });

  // 创建一个临时的 <a> 元素
  const link = document.createElement('a');

  // 使用 URL.createObjectURL 为 Blob 生成一个 URL
  link.href = URL.createObjectURL(blob);

  // 设置下载文件名
  link.download = filename;

  // 将 <a> 元素添加到页面中（隐形操作）
  document.body.appendChild(link);

  // 触发点击事件，下载文件
  link.click();

  // 移除临时 <a> 元素
  document.body.removeChild(link);

  // 释放 Blob URL
  URL.revokeObjectURL(link.href);
}

</script>

<template>
  <mdui-layout style="position: fixed; left: 0; right: 0; top: 0; bottom: 0;">
      <mdui-top-app-bar order="1" scroll-behavior="elevate" style="user-select: none; -webkit-user-select: none;">
            <div>
                <mdui-top-app-bar-title>
                  {{ packageInfo.displayName }}
                </mdui-top-app-bar-title>
            </div>
<!--          <mdui-top-app-bar-title style="font-weight: 350;">-->
<!--                  Edit-->
<!--          </mdui-top-app-bar-title>-->
          <div style="flex-grow: 1"></div>
          <mdui-button icon="download" @click="exportIcs">
            Download ics file
          </mdui-button>
      </mdui-top-app-bar>

      <mdui-layout-main>
        <CSTable></CSTable>
      </mdui-layout-main>
  </mdui-layout>
</template>

<style scoped>
</style>
