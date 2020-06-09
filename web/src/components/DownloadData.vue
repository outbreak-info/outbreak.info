<template>
<div>
  <!-- button to download -->
  <div class="w-100">
    <button class="btn btn-main-outline router-link no-underline m-5" role="button" @click="showDialogBox">download {{downloadLabel}}</button>
    <a class="hidden" ref="download_link"></a>
  </div>


  <div id="download-dialog" class="dialog position-fixed text-left d-flex flex-column text-light rounded w-75 h-75 px-5 py-4" v-if="showDialog">
    <h2>Download</h2>
    <!-- <a href="#download" class="my-4">download files</a> -->
    <DataUsage />
    <CiteUs class="mt-5" />

    <!-- Actual data download -->
    <h2 class="my-3">Download</h2>
    <div v-if="type == 'epidemiology'" class="mb-4">
      <h4 class="m-0">Figure</h4>
      <a class="text-uppercase pointer" @click="downloadSvg">
        <p class="focustext m-0">
          svg
        </p>
      </a>
    </div>

    <h4 class="m-0">Data</h4>
    <a class="text-uppercase pointer" @click="downloadJson">
      <p class="focustext m-0">
        json
      </p>
    </a>
    <a class="text-uppercase pointer" @click="downloadTsv">
      <p class="focustext m-0">
        tsv
      </p>
    </a>

    <!-- close button -->
    <button class="btn btn-main router-link no-underline m-5 background-white" role="button" @click="closeDialogBox">close</button>
  </div>
</div>
</template>

<script>
import DataUsage from "@/components/DataUsage.vue";
import CiteUs from "@/components/CiteUs.vue";

import { timeFormat } from "d3";
import { cloneDeep } from "lodash";

export default {
  name: "DownloadData",
  props: {
    data: Array,
    type: String,
    downloadLabel: {
      type: String,
      default: "figure & data"
    }
  },
  components: {
    DataUsage,
    CiteUs
  },
  data() {
    return({
      showDialog: false,
      downloadable: []
    })
  },
  computed: {
    today() {
      const today = new Date();
      return(this.formatDate(today))
    },
    filename() {
      if(this.data.length === 1 && this.type == "epidemiology"){
      return(`${this.data[0].key}_outbreakinfo_epidemiology_data_${this.today}`)
    } else {
      return(`outbreakinfo_epidemiology_data_${this.today}`)
    }

    }
  },
  methods: {
    formatDate(dateString) {
      const formatDate = timeFormat("%Y-%m-%d");
      return(formatDate(dateString))
    },
    closeDialogBox() {
      this.showDialog = false;
    },
    showDialogBox() {
      this.showDialog = true;
    },
    downloadData(dwnld_data, encodingFormat, filename) {
        // code adapted from CViSB
        const blob = new Blob([dwnld_data], { type: encodingFormat });
        const hiddenElement = this.$refs.download_link;
        hiddenElement.href = window.URL.createObjectURL(blob);
        hiddenElement.target = '_blank';
        hiddenElement.download = filename;
        hiddenElement.click();
        this.showDialog = false;
    },
    downloadSvg() {
        console.log("Downloading data")
        console.log(this.data)
        console.log(this.filename)
      },
      prepData() {
        this.downloadable = cloneDeep(this.data);
        if(this.type == "epidemiology"){
        this.downloadable = this.downloadable.flatMap(location => location.value)

        this.downloadable.forEach(d => {
          d["source"] = d.country_iso3 === "USA" || d.location_id === "USA" ? "The New York Times, The COVID Tracking Project" : "JHU COVID-19 Data Repository";
          d["date"] = this.formatDate(d.date);
        delete d._score;
        delete d.color;
      })}
        else {
          this.downloadable.forEach(d => {
            d["source"] = d.curatedBy ? d.curatedBy.name : null;
          delete d._score;
          delete d.color;
          })
        }
      },
    downloadJson() {
      this.prepData();
      const dataString = JSON.stringify(this.downloadable);
      this.downloadData(dataString, "text/json;charset=utf-8", this.filename + ".json")
      },
    downloadTsv() {
      this.prepData();
      }
    },
    mounted() {
      this.$nextTick(function() {
        // window.addEventListener("click", this.closeDialogBox), { passive: true };
        // Close on escape
        document.addEventListener(
          "keyup",
          evt => {
            if (evt.keyCode === 27) {
              this.closeDialogBox();
            }
          },
          { passive: true }
        );
      });
    },
    destroyed() {
      // window.removeEventListener("click", this.closeDialogBox);
      document.removeEventListener("keyup", this.closeDialogBox);
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
