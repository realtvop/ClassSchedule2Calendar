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
import SettingsDialog from './components/SettingsDialog.vue';

const MY_CONFIG = `{
    "subjects": {
        "example": { "name": "example", "teacher": null, "location": null }
    },
    "defaultLocation": null,
    "timeTable": {
        "name": "Weekdays",
        "days": [1, 2, 3, 4, 5],
        "classes": [
            { "name": null, "startsAt": [7, 0], "endsAt": [8, 0] }
        ]
    },
    "classes": [
        null,
        [{ "type": 0, "subjects": ["example"] }],
        [{ "type": 0, "subjects": ["example"] }], 
        [{ "type": 0, "subjects": ["example"] }],
        [{ "type": 0, "subjects": ["example"] }],
        [{ "type": 0, "subjects": ["example"] }]
    ],
    "settings": {
        "beforeClass": {
            "enabled": false,
            "minutes": 5
        },
        "afterClass": {
            "enabled": false,
            "minutes": 5
        }
    }
}`;

const classSchedule = reactive(new ClassSchedule(MY_CONFIG));

const dialogData = reactive({
  selectedClass: null,
  selectedTime: null,
  selectedSettings: null
});

const exportData = reactive({
  startDate: null,
  endDate: null
});

const importDialog = ref(null);
const settingsDialog = ref(null);

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

async function created() {
  try {
    const savedData = await ScheduleDB.loadSchedule();
    if (savedData) {
      const loadedSchedule = new ClassSchedule(savedData);
      Object.assign(classSchedule, loadedSchedule);
    } else {
      Object.assign(classSchedule, new ClassSchedule(MY_CONFIG));
    }
  } catch (error) {
    console.error('Failed to load schedule:', error);
    Object.assign(classSchedule, new ClassSchedule(MY_CONFIG));
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

function showSettingsDialog() {
  settingsDialog.value.showDialog();
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
                <mdui-button-icon icon="settings" @click="showSettingsDialog"></mdui-button-icon>
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

        <SettingsDialog ref="settingsDialog" :dialogData="dialogData" :classSchedule="classSchedule"></SettingsDialog>
      </mdui-layout-main>
  </mdui-layout>
</template>

<style scoped>
</style>
