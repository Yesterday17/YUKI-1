<template>
  <div class="container">
    <v-progress-linear :value="percent100" color="green" />
    <div>
      <div class="left">{{ speedKB }} KB/s</div>
      <div class="right">{{ transferedSizeMB }} MB / {{ totalSizeMB }} MB</div>
    </div>
  </div>
</template>

<script lang="ts">
import { remote } from "electron";
import Vue from "vue";
import { Component, Prop } from "vue-property-decorator";

import YkPageContent from "@/components/PageContent.vue";
import YkPageHeader from "@/components/PageHeader.vue";
import { FetchProgress } from "../../main/Downloader";

@Component
export default class DownloadProgress extends Vue {
  @Prop() public state!: FetchProgress;

  get percent100() {
    return parseFloat((this.state.progress * 100).toFixed(2));
  }
  get speedKB() {
    return parseFloat((this.state.rate / 1000).toFixed(2));
  }
  get totalSizeMB() {
    return parseFloat((this.state.total / 1000000).toFixed(2));
  }
  get transferedSizeMB() {
    return parseFloat((this.state.done / 1000000).toFixed(2));
  }
}
</script>

<style scoped>
.left {
  float: left;
}

.right {
  float: right;
}

.container {
  margin-left: 12px;
  width: 90%;
  height: 32px;
}
</style>
