<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  dialogData: Object,
  classSchedule: Object
});

const dialog = ref(null);
const form = ref({
  beforeClass: {
    enabled: props.classSchedule.settings?.beforeClass?.enabled ?? false,
    minutes: props.classSchedule.settings?.beforeClass?.minutes ?? 5
  },
  afterClass: {
    enabled: props.classSchedule.settings?.afterClass?.enabled ?? false,
    minutes: props.classSchedule.settings?.afterClass?.minutes ?? 5
  }
});

function showDialog() {
  // 打开对话框时，从 classSchedule 加载设置
  form.value = {
    beforeClass: {
      enabled: props.classSchedule.settings?.beforeClass?.enabled ?? false,
      minutes: props.classSchedule.settings?.beforeClass?.minutes ?? 5
    },
    afterClass: {
      enabled: props.classSchedule.settings?.afterClass?.enabled ?? false,
      minutes: props.classSchedule.settings?.afterClass?.minutes ?? 5
    }
  };
  dialog.value.open = true;
}

function closeDialog() {
  dialog.value.open = false;
}

function handleSave() {
  // 保存设置到 classSchedule
  if (!props.classSchedule.settings) props.classSchedule.settings = {};
  
  props.classSchedule.settings.beforeClass = {
    enabled: form.value.beforeClass.enabled,
    minutes: parseFloat(form.value.beforeClass.minutes) || 5
  };
  
  props.classSchedule.settings.afterClass = {
    enabled: form.value.afterClass.enabled,
    minutes: parseFloat(form.value.afterClass.minutes) || 5
  };
  
  closeDialog();
}

defineExpose({
  showDialog
});
</script>

<template>
  <mdui-dialog ref="dialog" close-on-overlay-click @close="closeDialog">
    <mdui-top-app-bar slot="header">
      <mdui-button-icon icon="close" @click="closeDialog"></mdui-button-icon>
      <mdui-top-app-bar-title>设置</mdui-top-app-bar-title>
      <mdui-button variant="text" @click="handleSave">保存</mdui-button>
    </mdui-top-app-bar>

    <div class="dialog-content">
      <div class="setting-item">
        <mdui-text-field
          :value="form.beforeClass.minutes"
          @input="form.beforeClass.minutes = $event.target.value"
          type="number"
          label="上课前提醒（分钟）"
          :disabled="!form.beforeClass.enabled"
          style="flex: 1;"
          step="0.1"
        ></mdui-text-field>
        <mdui-switch
          :checked="form.beforeClass.enabled"
          @change="form.beforeClass.enabled = $event.target.checked"
        >启用</mdui-switch>
      </div>

      <div class="setting-item">
        <mdui-text-field
          :value="form.afterClass.minutes"
          @input="form.afterClass.minutes = $event.target.value"
          type="number"
          label="下课提醒（分钟）"
          :disabled="!form.afterClass.enabled"
          style="flex: 1;"
          step="0.1"
        ></mdui-text-field>
        <mdui-switch
          :checked="form.afterClass.enabled"
          @change="form.afterClass.enabled = $event.target.checked"
        >启用</mdui-switch>
      </div>
    </div>
  </mdui-dialog>
</template>

<style scoped>
.dialog-content {
  padding: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item mdui-switch {
  --mdui-switch-track-width: 52px;
  --mdui-switch-track-height: 32px;
  flex-shrink: 0;
}

.setting-item mdui-text-field {
  min-width: 0;
}
</style>
