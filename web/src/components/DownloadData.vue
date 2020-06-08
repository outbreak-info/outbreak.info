<template>
  <div>


<div class="w-100">
  <button class="btn btn-main-outline router-link no-underline m-5" role="button" @click="downloadData">download data</button>
</div>
<div id="download-dialog" class="dialog position-fixed text-left text-light rounded w-75 h-75 p-5" v-if="showDialog">
  <h3>Download data</h3>
  <DataUsage />
  <CiteUs />

</div>
</div>
</template>

<script>
import DataUsage from "@/components/DataUsage.vue";
import CiteUs from "@/components/CiteUs.vue";

export default {
  name: "DownloadData",
  props: {
    data: Array
  },
  components: {
    DataUsage,
    CiteUs
  },
  data() {
    return({
showDialog: true
    })
  },
  methods: {
    downloadData() {
        console.log("Downloading data")
        console.log(this.data)
      }
    }
  }
  </script>

  <style lang="scss" scoped>
  .dialog {
    background: rgba(65, 65, 65, 0.95);
    top: 50%;
    left: 50%;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
    padding: 10px;
    z-index: 1001;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  </style>
