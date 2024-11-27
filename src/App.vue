<script setup>
import packageInfo from "../package.json";
import CSTable from './components/Table.vue';

import ClassSchedule from "./utils/classSchedule.js";
import {downloadIcs, generateIcs} from "./utils/exportIcs.js";

const classSchedule = new ClassSchedule({
  subjects: {
    chn: { name: "语文", teacher: null, location: null },
    mth: { name: "数学", teacher: null, location: null },
    eng: { name: "英语", teacher: null, location: null },
    phy: { name: "物理", teacher: null, location: null },
    chs: { name: "化学", teacher: null, location: null },
    bio: { name: "生物", teacher: null, location: null },
    geo: { name: "地理", teacher: null, location: null },
    plt: { name: "政治", teacher: null, location: null },
    his: { name: "历史", teacher: null, location: null },
    ity: { name: "信息", teacher: null, location: null },
    psy: { name: "心理", teacher: null, location: null },
    phe: { name: "体育", teacher: null, location: null },
    mus: { name: "音乐", teacher: null, location: null },

    mthExam: { name: "数学周测", teacher: null, location: null },
    phyExam: { name: "物理周测", teacher: null, location: null },

    ss: { name: "自习", teacher: null, location: null },
    td: { name: "团队活动", teacher: null, location: null },
  },
  defaultLocation: null,
});

function exportIcs() {
  downloadIcs(classSchedule);
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
        <CSTable :classSchedule="classSchedule"></CSTable>
      </mdui-layout-main>
  </mdui-layout>
</template>

<style scoped>
</style>
