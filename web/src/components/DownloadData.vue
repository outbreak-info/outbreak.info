<template>
<div>

  <div class="w-100">
    <button class="btn btn-main-outline router-link no-underline m-5" role="button" @click="downloadData">download data</button>
  </div>
  <div id="download-dialog" class="dialog position-fixed text-left d-flex flex-column text-light rounded w-75 h-75 px-5 py-4" v-if="showDialog">
    <h3>Download data</h3>
    <!-- <a href="#download" class="my-4">download files</a> -->
    <DataUsage />
    <CiteUs class="mt-5" />

    <!-- Actual data download -->
    <h2 class="my-3">Download data</h2>

    <!-- close button -->
    <button class="btn btn-main router-link no-underline m-5 background-white" role="button" @click="closeDialog">close</button>
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
    closeDialog() {
      this.showDialog = false;
    },
    downloadData() {
      this.showDialog = true;
        console.log("Downloading data")
        console.log(this.data)
      }
    },
    mounted() {
      this.$nextTick(function() {
        // window.addEventListener("click", this.closeDialog), { passive: true };
        // Close on escape
        document.addEventListener(
          "keyup",
          evt => {
            if (evt.keyCode === 27) {
              this.closeDialog();
            }
          },
          { passive: true }
        );
      });
    },
    destroyed() {
      // window.removeEventListener("click", this.closeDialog);
      document.removeEventListener("keyup", this.closeDialog);
    },
  }
  </script>

  <style lang="scss">
  .dialog {
    background: rgba(40, 40, 40, 0.95);
    top: 50%;
    left: 50%;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
    padding: 10px;
    z-index: 1001;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    overflow-y: auto;
  }

  .background-white {
    background: white !important;
    color: $primary-color !important;
    &:hover {
      color: white !important;
    }
  }

  .text-light a {
    color: #3d9bff !important;
    &:hover {
      color: #85c0ff !important;
    }
  }

  .text-light .text-highlight {
    color: #ff7096 !important;
  }

  </style>
