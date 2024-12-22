<script setup>
import { reactive, watch, ref } from 'vue';
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

const importDialog = ref(null);

function showExportDialog() {
  document.getElementById("exportDialog").open = true;
}

function handleExport(startDate, endDate) {
  downloadIcs(classSchedule, startDate, endDate);
}

// 显示导入确认对话框
function showImportDialog() {
  importDialog.value.open = true;
}

// 处理导入确认
function handleImportConfirm() {
  importDialog.value.open = false;
  openImportFileDialog();
}

// 打开文件选择器
async function openImportFileDialog() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.csv';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const newSchedule = await ClassSchedule.import(file);
      Object.assign(classSchedule, newSchedule);
      await saveSchedule();
    } catch (error) {
      alert('导入失败：无效的课程表文件');
    }
  };
  
  input.click();
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

// 导出课程表
function exportSchedule(format) {
  classSchedule.export(format);
}

// 导入课程表
async function importSchedule() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.csv';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const newSchedule = await ClassSchedule.import(file);
      Object.assign(classSchedule, newSchedule);
      await saveSchedule();
    } catch (error) {
      alert('导入失败：无效的课程表文件');
    }
  };
  
  input.click();
}
</script>

<template>
  <mdui-layout style="position: fixed; left: 0; right: 0; top: 0; bottom: 0;">
      <mdui-top-app-bar order="1" scroll-behavior="elevate" style="user-select: none; -webkit-user-select: none;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <mdui-top-app-bar-title>
                  {{ packageInfo.displayName }}
                </mdui-top-app-bar-title>
                <mdui-dropdown>
                  <mdui-button slot="trigger" style="min-width: 0" variant="outlined">文件</mdui-button>
                  <mdui-menu>
                    <mdui-menu-item @click="showImportDialog">导入课程表</mdui-menu-item>
                    <mdui-divider></mdui-divider>
                    <mdui-menu-item @click="exportSchedule('json')">导出为 JSON (包含所有设置)</mdui-menu-item>
                    <mdui-menu-item @click="exportSchedule('csv')">导出为 CSV</mdui-menu-item>
                  </mdui-menu>
                </mdui-dropdown>
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

        <!-- 导入确认对话框 -->
        <mdui-dialog
          ref="importDialog"
          close-on-overlay-click
          headline="导入课程表"
        >
          <div style="padding: 20px;">
            <p>导入新的课程表将会覆盖当前的课程表。建议您先导出当前课程表以备份。</p>
            <p>是否继续导入？</p>
          </div>

          <mdui-button slot="action" variant="text" @click="importDialog.open = false">取消</mdui-button>
          <mdui-button slot="action" variant="text" @click="exportSchedule('json')">导出备份</mdui-button>
          <mdui-button slot="action" variant="filled" @click="handleImportConfirm">继续导入</mdui-button>
        </mdui-dialog>
      </mdui-layout-main>
  </mdui-layout>
</template>

<style scoped>
</style>
