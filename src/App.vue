<script setup>
import { reactive, watch } from 'vue';
import ExportDialog from './components/ExportDialog.vue';

import packageInfo from "../package.json";
import CSTable from './components/Table.vue';

import ClassSchedule from "./utils/classSchedule.js";
import { downloadIcs, generateIcs } from "./utils/exportIcs.js";
import ModifyClassInfoDialog from "./components/ModifyClassInfoDialog.vue";
import ScheduleDB from './utils/db';
import ModifyTimeDialog from './components/ModifyTimeDialog.vue';

const MY_CONFIG = `{
    "subjects": {
        "chn": { "name": "语文", "teacher": null, "location": null },
        "mth": { "name": "数学", "teacher": null, "location": null },
        "eng": { "name": "英语", "teacher": null, "location": null },
        "phy": { "name": "物理", "teacher": null, "location": null },
        "chs": { "name": "化学", "teacher": null, "location": null },
        "bio": { "name": "生物", "teacher": null, "location": null },
        "geo": { "name": "地理", "teacher": null, "location": null },
        "plt": { "name": "政治", "teacher": null, "location": null },
        "his": { "name": "历史", "teacher": null, "location": null },
        "ity": { "name": "信息", "teacher": null, "location": null },
        "psy": { "name": "心理", "teacher": null, "location": null },
        "phe": { "name": "体育", "teacher": null, "location": null },
        "mus": { "name": "音乐", "teacher": null, "location": null },
        "mthExam": { "name": "数学周测", "teacher": null, "location": null },
        "phyExam": { "name": "物理周测", "teacher": null, "location": null },
        "ss": { "name": "自习", "teacher": null, "location": null },
        "td": { "name": "团队活动", "teacher": null, "location": null }
    },
    "defaultLocation": null,
    "timeTable": {
        "name": "Weekdays",
        "days": [1, 2, 3, 4, 5],
        "classes": [
            { "name": null, "startsAt": [ 7, 10], "endsAt": [ 7, 40] },
            { "name": null, "startsAt": [ 7, 45], "endsAt": [ 8, 25] },
            { "name": null, "startsAt": [ 8, 35], "endsAt": [ 9, 15] },
            { "name": null, "startsAt": [ 9, 45], "endsAt": [10, 25] },
            { "name": null, "startsAt": [10, 35], "endsAt": [11, 15] },
            { "name": null, "startsAt": [11, 25], "endsAt": [12,  5] },
            { "name": null, "startsAt": [14, 10], "endsAt": [14, 50] },
            { "name": null, "startsAt": [15,  0], "endsAt": [15, 40] },
            { "name": null, "startsAt": [15, 55], "endsAt": [16, 35] },
            { "name": null, "startsAt": [16, 40], "endsAt": [17, 20] }
        ]
    },
    "classes": [
        null,
        [ { "type": 0, "subjects": ["eng"] }, { "type": 0, "subjects": ["chn"] }, { "type": 0, "subjects": ["phy"] }, { "type": 0, "subjects": ["mth"] }, { "type": 0, "subjects": ["eng"] }, { "type": 0, "subjects": ["mus"] }, { "type": 0, "subjects": ["ss"] }, { "type": 0, "subjects": ["bio"] }, { "type": 0, "subjects": ["ity"] }, { "type": 0, "subjects": ["td"] } ],
        [ { "type": 0, "subjects": ["chn"] }, { "type": 0, "subjects": ["eng"] }, { "type": 0, "subjects": ["chn"] }, { "type": 0, "subjects": ["mth"] }, { "type": 0, "subjects": ["mth"] }, { "type": 0, "subjects": ["phe"] }, { "type": 0, "subjects": ["his"] }, { "type": 0, "subjects": ["geo"] }, { "type": 0, "subjects": ["chs"] }, { "type": 0, "subjects": ["phyExam"] } ],
        [ { "type": 0, "subjects": ["eng"] }, { "type": 0, "subjects": ["chs"] }, { "type": 0, "subjects": ["chn"] }, { "type": 0, "subjects": ["mth"] }, { "type": 0, "subjects": ["mth"] }, { "type": 0, "subjects": ["phe"] }, { "type": 0, "subjects": ["his"] }, { "type": 0, "subjects": ["geo"] }, { "type": 0, "subjects": ["chs"] }, { "type": 0, "subjects": ["phyExam"] } ],
        [ { "type": 0, "subjects": ["chn"] }, { "type": 0, "subjects": ["eng"] }, { "type": 0, "subjects": ["chn"] }, { "type": 0, "subjects": ["mth"] }, { "type": 0, "subjects": ["mth"] }, { "type": 0, "subjects": ["phe"] }, { "type": 0, "subjects": ["his"] }, { "type": 0, "subjects": ["geo"] }, { "type": 0, "subjects": ["chs"] }, { "type": 0, "subjects": ["phyExam"] } ],
        [ { "type": 0, "subjects": ["eng"] }, { "type": 0, "subjects": ["eng"] }, { "type": 0, "subjects": ["chn"] }, { "type": 0, "subjects": ["mth"] }, { "type": 0, "subjects": ["mth"] }, { "type": 0, "subjects": ["phe"] }, { "type": 0, "subjects": ["his"] }, { "type": 0, "subjects": ["geo"] }, { "type": 0, "subjects": ["chs"] }, { "type": 0, "subjects": ["phyExam"] } ]
    ]
}`;

const classSchedule = reactive(new ClassSchedule(MY_CONFIG));

const dialogData = reactive({
  selectedClass: null,
  selectedTime: null
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
        <CSTable 
          :classSchedule="classSchedule" 
          :dialogData="dialogData"
        ></CSTable>
        <modify-class-info-dialog 
          :classSchedule="classSchedule" 
          :selectedClass="dialogData.selectedClass" 
          :dialogData="dialogData"
        ></modify-class-info-dialog>
        <modify-time-dialog
          :classSchedule="classSchedule"
          :selectedTime="dialogData.selectedTime"
          :dialogData="dialogData"
        ></modify-time-dialog>
        <export-dialog :exportData="exportData" :onExport="handleExport"></export-dialog>
      </mdui-layout-main>
  </mdui-layout>
</template>

<style scoped>
</style>
