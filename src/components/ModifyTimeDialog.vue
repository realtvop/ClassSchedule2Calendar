<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  classSchedule: Object,
  dialogData: Object,
  selectedTime: Object
});

const dialog = ref(null);
const timeForm = ref({
  startsAt: [0, 0],
  endsAt: [0, 0]
});

const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

// 格式化时间为 HH:MM 格式
function formatTime(hours, minutes) {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// 解析时间字符串为 [hours, minutes]
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(num => parseInt(num) || 0);
  return [
    Math.min(Math.max(hours, 0), 23),
    Math.min(Math.max(minutes, 0), 59)
  ];
}

// 添加一个状态来控制对话框的显示
const isDialogOpen = ref(false);

// 监听选中的时间变化
watch(() => props.selectedTime, (newVal) => {
  if (newVal) {
    // 如果是空对象，说明是从时间管理按钮打开的
    if (Object.keys(newVal).length === 0) {
      timeForm.value = {
        startsAt: [0, 0],
        endsAt: [0, 0]
      };
    } else {
      timeForm.value = {
        startsAt: [...newVal.startsAt],
        endsAt: [...newVal.endsAt]
      };
    }
    dialog.value.open = true;
  }
}, { deep: true });

// 处理开始时间变化
function handleStartTimeChange(event) {
  timeForm.value.startsAt = parseTime(event.target.value);
}

// 处理结束时间变化
function handleEndTimeChange(event) {
  timeForm.value.endsAt = parseTime(event.target.value);
}

// 保存修改
function handleSave() {
  if (props.selectedTime) {
    props.selectedTime.startsAt = [...timeForm.value.startsAt];
    props.selectedTime.endsAt = [...timeForm.value.endsAt];
  }
  closeDialog();
}

// 关闭对话框
function closeDialog() {
  dialog.value.open = false;
}

// 验证时间格式
function validateTime(time) {
  const [hours, minutes] = time;
  return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
}

// 添加新的课程时间段
function addClassTime() {
  props.classSchedule.timeTable.classes.push({
    name: null,
    startsAt: [8, 0],
    endsAt: [8, 40]
  });
}

// 删除课程时间段
function removeClassTime(index) {
  // 删除时间表中的时间段
  props.classSchedule.timeTable.classes.splice(index, 1);
  
  // 更新所有星期的课程数组，包括被禁用的星期
  Object.keys(props.classSchedule.classes).forEach(day => {
    if (props.classSchedule.classes[day] && props.classSchedule.classes[day].length > index) {
      props.classSchedule.classes[day].splice(index, 1);
    }
  });

  // 如果正在编辑的时间段被删除，关闭编辑窗口
  if (props.selectedTime && props.classSchedule.timeTable.classes.indexOf(props.selectedTime) === -1) {
    props.selectedTime = null;
  }

  // 更新所有时间段的序号显示
  props.classSchedule.timeTable.classes.forEach((classTime, i) => {
    if (classTime.name === null) {
      classTime.name = `第 ${i + 1} 节`;
    }
  });
}

// 检查某天是否启用
function isDayEnabled(day) {
  return props.classSchedule.timeTable.days.includes(day);
}

// 切换某天的启用状态
function toggleDay(day) {
  if (isDayEnabled(day)) {
    // 如果已启用，则禁用
    const index = props.classSchedule.timeTable.days.indexOf(day);
    if (index !== -1) {
      props.classSchedule.timeTable.days.splice(index, 1);
      // 不删除数据，只是不显示
    }
  } else {
    // 如果已禁用，则启用
    props.classSchedule.timeTable.days.push(day);
    // 如果没有课程数据，则初始化
    if (!props.classSchedule.classes[day]) {
      props.classSchedule.classes[day] = Array(props.classSchedule.timeTable.classes.length)
        .fill(null)
        .map(() => ({
          type: 0,
          subjects: ["ss"]
        }));
    }
    props.classSchedule.timeTable.days.sort((a, b) => a - b);
  }
}

// 删除确认对话框的状态
const deleteConfirm = ref({
  show: false,
  type: '', // 'day' 或 'class'
  index: null,
  day: null
});

const deleteDialog = ref(null);
const conflictDialog = ref(null); // 添加冲突对话框的引用

// 显示删除确认对话框
function showDeleteConfirm(type, data) {
  deleteConfirm.value = {
    show: true,
    type,
    index: type === 'class' ? data : null,
    day: type === 'day' ? data : null
  };
  deleteDialog.value.open = true;
}

// 处理删除确认
function handleDeleteConfirm() {
  if (deleteConfirm.value.type === 'class') {
    removeClassTime(deleteConfirm.value.index);
  } else if (deleteConfirm.value.type === 'day') {
    toggleDay(deleteConfirm.value.day);
    // 只在删除星期时关闭主窗口
    closeDialog();
  }
  closeDeleteConfirm();
}

// 关闭删除确认对话框
function closeDeleteConfirm() {
  deleteDialog.value.open = false;
}

// 处理对话框关闭事件
function handleClose() {
  // 重置表单数据
  if (props.selectedTime) {
    props.selectedTime = null;
  }
  closeDialog();
}

// 添加新课程的表单数据
const newClassForm = ref({
  startsAt: [0, 0],
  duration: 40
});

// 新课程对话框的状态
const newClassDialog = ref(null);

// 显示添加新课程对话框
function showAddClassDialog() {
  // 设置默认开始时间为最后一节课后10分钟
  const lastClass = props.classSchedule.timeTable.classes[props.classSchedule.timeTable.classes.length - 1];
  if (lastClass) {
    const [hours, minutes] = lastClass.endsAt;
    let newMinutes = minutes + 10;
    let newHours = hours;
    if (newMinutes >= 60) {
      newHours += Math.floor(newMinutes / 60);
      newMinutes = newMinutes % 60;
    }
    newClassForm.value.startsAt = [newHours, newMinutes];
  } else {
    newClassForm.value.startsAt = [8, 0];
  }
  newClassForm.value.duration = 40;
  newClassDialog.value.open = true;
}

// 添加一个状态来跟踪时间冲突
const hasConflict = ref(false);

// 检查时间冲突（修改版本，不显示对话框）
function checkTimeConflictQuiet(startTime, duration, excludeIndex = -1) {
  const endTime = [...startTime];
  endTime[1] += duration;
  if (endTime[1] >= 60) {
    endTime[0] += Math.floor(endTime[1] / 60);
    endTime[1] = endTime[1] % 60;
  }

  for (let i = 0; i < props.classSchedule.timeTable.classes.length; i++) {
    if (i === excludeIndex) continue; // 跳过当前正在编辑的时间段
    const classTime = props.classSchedule.timeTable.classes[i];
    if (isTimeOverlap(startTime, endTime, classTime.startsAt, classTime.endsAt)) {
      return true;
    }
  }
  return false;
}

// 检查两个时间段是否重叠
function isTimeOverlap(start1, end1, start2, end2) {
  const time1Start = start1[0] * 60 + start1[1];
  const time1End = end1[0] * 60 + end1[1];
  const time2Start = start2[0] * 60 + start2[1];
  const time2End = end2[0] * 60 + end2[1];

  return time1Start < time2End && time2Start < time1End;
}

// 添加新课程时间段
function handleAddClass() {
  const endTime = [...newClassForm.value.startsAt];
  endTime[1] += newClassForm.value.duration;
  if (endTime[1] >= 60) {
    endTime[0] += Math.floor(endTime[1] / 60);
    endTime[1] = endTime[1] % 60;
  }

  if (checkTimeConflictQuiet(newClassForm.value.startsAt, newClassForm.value.duration)) {
    return;
  }

  // 添加新的时间段
  const newIndex = props.classSchedule.timeTable.classes.length;
  props.classSchedule.timeTable.classes.push({
    name: `第 ${newIndex + 1} 节`,
    startsAt: [...newClassForm.value.startsAt],
    endsAt: endTime
  });

  // 更新所有星期的课程数组，包括被禁用的星期
  Object.keys(props.classSchedule.classes).forEach(day => {
    if (!props.classSchedule.classes[day]) {
      props.classSchedule.classes[day] = [];
    }
    props.classSchedule.classes[day].push({
      type: 0,
      subjects: ["ss"] // 默认为自习
    });
  });

  // 关闭对话框
  newClassDialog.value.open = false;
}

// 计算课程时长（分钟）
function calculateDuration(startTime, endTime) {
  const startMinutes = startTime[0] * 60 + startTime[1];
  const endMinutes = endTime[0] * 60 + endTime[1];
  return endMinutes - startMinutes;
}

// 更新结束时间
function updateEndTime(classTime, duration) {
  const endTime = [...classTime.startsAt];
  endTime[1] += duration;
  if (endTime[1] >= 60) {
    endTime[0] += Math.floor(endTime[1] / 60);
    endTime[1] = endTime[1] % 60;
  }
  classTime.endsAt = endTime;
}

// 关闭冲突提示对话框
function closeConflictDialog() {
  conflictDialog.value.open = false;
}

// 关闭新课程对话框
function closeNewClassDialog() {
  newClassDialog.value.open = false;
}

// 导出课程表
function exportSchedule() {
  props.classSchedule.export();
}

// 导入课程表
async function importSchedule() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const newSchedule = await props.classSchedule.constructor.import(file);
      props.classSchedule.timeTable = newSchedule.timeTable;
      props.classSchedule.classes = newSchedule.classes;
      props.classSchedule.subjects = newSchedule.subjects;
      props.classSchedule.defaultLocation = newSchedule.defaultLocation;
    } catch (error) {
      alert('导入失败：无效的课程表文件');
    }
  };
  
  input.click();
}
</script>

<template>
  <mdui-dialog 
    ref="dialog"
    close-on-overlay-click 
    @keyup.enter="handleSave"
    @close="handleClose"
  >
    <mdui-top-app-bar slot="header">
      <mdui-button-icon icon="close" @click="closeDialog"></mdui-button-icon>
      <mdui-top-app-bar-title>修改课程时间</mdui-top-app-bar-title>
      <mdui-button 
        variant="text" 
        @click="handleSave"
        :disabled="!validateTime(timeForm.startsAt) || !validateTime(timeForm.endsAt)"
      >
        保存
      </mdui-button>
    </mdui-top-app-bar>

    <div class="dialog-content">
      <!-- 工作日管理 -->
      <div class="section">
        <div class="section-header">
          <h3>工作日管理</h3>
        </div>
        <div class="days-list">
          <mdui-chip 
            v-for="day in [0, 1, 2, 3, 4, 5, 6]" 
            :key="day"
            :variant="isDayEnabled(day) ? 'filled' : 'outlined'"
            :class="{ 'day-disabled': !isDayEnabled(day) }"
            @click="toggleDay(day)"
          >
            {{ days[day] }}
          </mdui-chip>
        </div>
      </div>

      <!-- 课程时间管理 -->
      <div class="section">
        <div class="section-header">
          <h3>课程时间管理</h3>
          <mdui-button-icon icon="add" @click="showAddClassDialog"></mdui-button-icon>
        </div>
        <div class="time-list">
          <div v-for="(classTime, index) in props.classSchedule.timeTable.classes" :key="index" class="time-item">
            <span class="class-index">第 {{ index + 1 }} 节</span>
            <mdui-text-field
              type="time"
              label="开始时间"
              :value="formatTime(classTime.startsAt[0], classTime.startsAt[1])"
              :state="checkTimeConflictQuiet(classTime.startsAt, calculateDuration(classTime.startsAt, classTime.endsAt), index) ? 'error' : ''"
              @input="(e) => { 
                classTime.startsAt = parseTime(e.target.value);
                updateEndTime(classTime, calculateDuration(classTime.startsAt, classTime.endsAt));
              }"
            >
              <span slot="helper">
                <span v-if="checkTimeConflictQuiet(classTime.startsAt, calculateDuration(classTime.startsAt, classTime.endsAt), index)" style="color: rgb(var(--mdui-color-error))">与其他课程时间冲突</span>
                <span v-else>&nbsp;</span>
              </span>
            </mdui-text-field>
            <mdui-text-field
              type="number"
              label="时长（分钟）"
              :value="calculateDuration(classTime.startsAt, classTime.endsAt)"
              min="1"
              max="180"
              :state="checkTimeConflictQuiet(classTime.startsAt, calculateDuration(classTime.startsAt, classTime.endsAt), index) ? 'error' : ''"
              @input="(e) => { 
                const duration = parseInt(e.target.value) || 40;
                updateEndTime(classTime, duration);
              }"
            ></mdui-text-field>
            <mdui-button-icon icon="delete" @click="showDeleteConfirm('class', index)"></mdui-button-icon>
          </div>
        </div>
      </div>
    </div>
  </mdui-dialog>

  <!-- 删除确认对话框 -->
  <mdui-dialog
    ref="deleteDialog"
    close-on-overlay-click
    :headline="deleteConfirm.type === 'day' ? 
      `确定要删除${days[deleteConfirm.day]}吗？` : 
      `确定要删除第 ${deleteConfirm.index + 1} 节课时间段吗？`"
    @close="closeDeleteConfirm"
  >
    <div class="dialog-content">
      <p v-if="deleteConfirm.type === 'day'">
        删除后该工作日的课程安排将被隐藏，但数据会被保留。
      </p>
      <p v-else-if="deleteConfirm.type === 'class'">
        删除后所有该时段的课程都将被清除。
      </p>
    </div>

    <mdui-button slot="action" variant="text" @click="closeDeleteConfirm">取消</mdui-button>
    <mdui-button slot="action" variant="tonal" @click="handleDeleteConfirm">删除</mdui-button>
  </mdui-dialog>

  <!-- 添加新课程时间对话框 -->
  <mdui-dialog
    ref="newClassDialog"
    close-on-overlay-click
    @close="closeNewClassDialog"
  >
    <mdui-top-app-bar slot="header">
      <mdui-button-icon icon="close" @click="closeNewClassDialog"></mdui-button-icon>
      <mdui-top-app-bar-title>添加课程时间</mdui-top-app-bar-title>
      <mdui-button 
        variant="text" 
        @click="handleAddClass"
        :disabled="!validateTime(newClassForm.startsAt) || 
                  newClassForm.duration < 1 || 
                  newClassForm.duration > 180 || 
                  checkTimeConflictQuiet(newClassForm.startsAt, newClassForm.duration)"
      >
        添加
      </mdui-button>
    </mdui-top-app-bar>

    <div class="dialog-content">
      <div class="new-class-form">
        <mdui-text-field
          type="time"
          label="开始时间"
          :value="formatTime(newClassForm.startsAt[0], newClassForm.startsAt[1])"
          :state="checkTimeConflictQuiet(newClassForm.startsAt, newClassForm.duration) ? 'error' : ''"
          @input="(e) => { newClassForm.startsAt = parseTime(e.target.value) }"
        >
          <span slot="helper">
            <span v-if="checkTimeConflictQuiet(newClassForm.startsAt, newClassForm.duration)" style="color: rgb(var(--mdui-color-error))">与其他课程时间冲突</span>
            <span v-else>&nbsp;</span>
          </span>
        </mdui-text-field>
        <mdui-text-field
          type="number"
          label="持续时间（分钟）"
          v-model.number="newClassForm.duration"
          min="1"
          max="180"
          :state="checkTimeConflictQuiet(newClassForm.startsAt, newClassForm.duration) ? 'error' : ''"
        ></mdui-text-field>
      </div>
    </div>
  </mdui-dialog>

  <!-- 冲突提示对话框 -->
  <mdui-dialog
    ref="conflictDialog"
    close-on-overlay-click
    @close="closeConflictDialog"
  >
    <mdui-top-app-bar slot="header">
      <mdui-button-icon icon="close" @click="closeConflictDialog"></mdui-button-icon>
      <mdui-top-app-bar-title>时间冲突</mdui-top-app-bar-title>
    </mdui-top-app-bar>

    <div class="dialog-content">
      <p>与现有课程时间冲突，请修改时间！</p>
    </div>

    <div slot="actions">
      <mdui-button variant="text" @click="closeConflictDialog">确定</mdui-button>
    </div>
  </mdui-dialog>
</template>

<style scoped>
.dialog-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.days-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
}

.time-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.class-index {
  min-width: 60px;
  cursor: default;
  user-select: none;
}

.separator {
  margin: 0 4px;
}

.days-list mdui-chip {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.day-disabled {
  opacity: 0.5;
  text-decoration: line-through;
  --mdui-color-outline: rgba(0, 0, 0, 0.2);
}

.day-disabled:hover {
  opacity: 0.8;
  text-decoration: none;
}

.new-class-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

.time-item mdui-text-field {
  flex: 1;
  min-width: 0;
  height: 56px;
  --mdui-text-field-padding-vertical: 16px;
}

.time-item mdui-text-field[type="number"] {
  max-width: 120px;
}

.time-item mdui-text-field input {
  height: 24px;
  line-height: 24px;
}

.time-item mdui-text-field[state="error"] {
  --mdui-color-primary: var(--mdui-color-error);
  --mdui-text-field-label-color: var(--mdui-color-error);
  --mdui-text-field-input-color: var(--mdui-color-error);
}

:deep(mdui-text-field[state="error"] .mdui-text-field-helper) {
  color: rgb(var(--mdui-color-error)) !important;
}
</style> 