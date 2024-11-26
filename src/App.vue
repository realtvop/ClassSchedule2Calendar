<script setup>
import packageInfo from "../package.json";
import CSTable from './components/Table.vue';
</script>

<template>
  <mdui-layout style="position: fixed; left: 0; right: 0; top: 0; bottom: 0;">
      <mdui-top-app-bar order="1" scroll-behavior="elevate" style="user-select: none; -webkit-user-select: none;">
            <div>
                <mdui-top-app-bar-title>
                  {{ packageInfo.displayName }}
                </mdui-top-app-bar-title>
            </div>
          <!-- <mdui-top-app-bar-title style="font-weight: 350;">
                  aaa
          </mdui-top-app-bar-title> -->
          <div style="flex-grow: 1"></div>
      </mdui-top-app-bar>

      <mdui-layout-main>
        <CSTable></CSTable>
      </mdui-layout-main>
  </mdui-layout>
</template>

<style scoped>
</style>
