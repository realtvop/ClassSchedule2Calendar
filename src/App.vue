<script setup>
import { reactive, watch } from 'vue';
import ExportDialog from './components/ExportDialog.vue';

import packageInfo from "../package.json";
import CSTable from './components/Table.vue';

import ClassSchedule from "./utils/classSchedule.js";
import { downloadIcs, generateIcs } from "./utils/exportIcs.js";
import ModifyClassInfoDialog from "./components/ModifyClassInfoDialog.vue";
import ScheduleDB from './utils/db';

const MY_CONFIG = `{
    "subjects": {},
    "defaultLocation": null,
    "timeTable": {
        "name": "Weekdays",
        "days": [1, 2, 3, 4, 5],
        "classes": [
            { "name": null, "startsAt": [8, 0], "endsAt": [8, 45] }
        ]
    },
    "classes": [
        null,
        [ { "type": 0, "subjects": [] } ],
        [ { "type": 0, "subjects": [] } ],
        [ { "type": 0, "subjects": [] } ],
        [ { "type": 0, "subjects": [] } ],
        [ { "type": 0, "subjects": [] } ]
    ]
}`;

const classSchedule = reactive(new ClassSchedule(MY_CONFIG));

const dialogData = reactive({
  selectedClass: null,
});

const exportData = reactive({
  startDate: null,
  endDate: null
});

function showExportDialog() {
  document.getElementById("exportDialog").open = true;
}

function handleExport(startDate, endDate) {
  downloadIcs(classSchedule, startDate, endDate);
}

async function saveSchedule() {
  try {
    await ScheduleDB.saveSchedule(classSchedule);
  } catch (error) {
    console.error('Failed to save schedule:', error);
    // 可以在这里添加错误提示
  }
}

async function updateSchedule(newData) {
  Object.assign(classSchedule, new ClassSchedule(newData));
  await saveSchedule();
}

async function initDefaultSchedule() {
  const defaultSchedule = new ClassSchedule({
    subjects: [],
    timeTable: { classes: [] },
    classes: [],
    defaultLocation: ''
  });
  Object.assign(classSchedule, defaultSchedule);
}

async function created() {
  try {
    const savedData = await ScheduleDB.loadSchedule();
    if (savedData) {
      const loadedSchedule = new ClassSchedule(savedData);
      Object.assign(classSchedule, loadedSchedule);
    } else {
      initDefaultSchedule();
    }
  } catch (error) {
    console.error('Failed to load schedule:', error);
    initDefaultSchedule();
  }
}

watch(
  () => classSchedule,
  () => {
    saveSchedule();
  },
  { deep: true }
);

created();
</script>

<template>
  <mdui-layout style="position: fixed; left: 0; right: 0; top: 0; bottom: 0;">
      <mdui-top-app-bar order="1" scroll-behavior="elevate" style="user-select: none; -webkit-user-select: none;">
            <div>
                <mdui-top-app-bar-title>
                  {{ packageInfo.displayName }}
                </mdui-top-app-bar-title>
            </div>
          <div style="flex-grow: 1"></div>
          <mdui-button icon="download" @click="showExportDialog">
            下载 ics 文件
          </mdui-button>
      </mdui-top-app-bar>

      <mdui-layout-main>
        <CSTable :classSchedule :dialogData></CSTable>
        <modify-class-info-dialog :classSchedule :selectedClass="dialogData.selectedClass" :dialogData></modify-class-info-dialog>
        <export-dialog :exportData="exportData" :onExport="handleExport"></export-dialog>
      </mdui-layout-main>
  </mdui-layout>
</template>

<style scoped>
</style>
