<template>
<div>
  <div v-if="loading && showLoading" class="loader dialog d-flex flex-column align-items-center">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']"/>
    <div class="text-light mt-3">Fetching data, please be patient</div>
    <div class="text-light">
      {{formatPercent(progress)}} complete
    </div>
    <svg :width="progressBarWidth" height="20">
      <rect x="0" y="0" :width="progressBarWidth" height="20" class="progress-background"></rect>
      <rect x="0" y="0" :width="progressBarWidth*progress" height="20" class="progress-bar"></rect>
      <rect x="0" y="0" :width="progressBarWidth" height="20" class="progress-stroke"></rect>
    </svg>
  </div>

  <div class="d-inline">
    <!-- button to download -->
    <button class="download-btn btn-main-outline router-link no-underline my-1" role="button" @click="showDialogBox"><small>download {{downloadLabel}}</small></button>
    <a class="hidden" ref="download_link"></a>


    <div id="download-dialog" class="dialog position-fixed text-left d-flex flex-column text-light rounded w-75 h-75 px-5 py-4" v-if="showDialog">
      <h2>Download</h2>

      <!-- <a href="#download" class="my-4">download files</a> -->
      <!-- Data Usage and citations -->
      <DataUsage />
      <CiteUs class="mt-5" />

      <!-- Actual data download -->
      <h2 class="my-3">Download</h2>
      <div v-if="type == 'epidemiology' || type == 'regions' || type == 'maps'  || type == 'report'" class="mb-4">
        <h4 class="m-0">Figure</h4>
        <a class="text-uppercase pointer" @click="downloadSvg">
          <p class="focustext m-0">
            svg
          </p>
        </a>
        <a class="text-uppercase pointer" @click="downloadPng">
          <p class="focustext m-0">
            png
          </p>
        </a>
      </div>

      <h4 class="m-0">Data</h4>
      <a class="text-uppercase pointer" @click="prepData('json')">
        <p class="focustext m-0">
          json
        </p>
      </a>
      <a class="text-uppercase pointer" @click="prepData('tsv')">
        <p class="focustext m-0">
          tsv
        </p>
      </a>

      <!-- close button -->
      <button class="btn btn-main router-link no-underline m-5 background-white" role="button" @click="closeDialogBox">close</button>
    </div>
  </div>
</div>
</template>


<script>
import DataUsage from "@/components/DataUsage.vue";
import CiteUs from "@/components/CiteUs.vue";
import {
  mapState
} from "vuex";

import {
  getAll,
  progressState$
} from "@/api/biothings.js";

import { getPng, getSvg } from "@/js/get_svg.js";

import {
  timeFormat,
  format
} from "d3";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

library.add(faSpinner);

import cloneDeep from "lodash/cloneDeep";
import uniq from "lodash/uniq";

export default {
  name: "DownloadData",
  props: {
    data: Array,
    type: String,
    figureRef: String,
    query: String,
    api: String,
    downloadLabel: {
      type: String,
      default: "vis & data"
    },
    isVertical: {
      type: Boolean,
      default: false
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    sourceString: {
      type: String,
      default: "Johns Hopkins University Center for Systems Science and Engineering (non-U.S. data); The New York Times (U.S. data); The COVID Tracking Project (testing data), updated daily."
    }
  },
  components: {
    DataUsage,
    CiteUs, FontAwesomeIcon
  },
  data() {
    return ({
      showDialog: false,
      showLoading: false,
      downloadable: null,
      dataSubscription: null,
      progress: 0,
      progressBarWidth: 225
    })
  },
  computed: {
    ...mapState("admin", ["loading", "outbreak", "sources", "resources"]),
    today() {
      return (new Date());
    },
    todayFormatted() {
      return (this.formatDate(this.today))
    },
    todayFormattedLong() {
      return (this.formatDate(this.today, "%d %b %Y"))
    },
    filename() {
      if (this.data && this.data.length === 1 && this.type == "epidemiology") {
        return (`${this.data[0].key}_outbreakinfo_epidemiology_data_${this.todayFormatted}`)
      } else if (this.type == "resources") {
        return (`outbreakinfo_resources_metadata_${this.todayFormatted}`)
      } else if (this.type == "report") {
        return (`outbreakinfo_mutation_report_data_${this.todayFormatted}`)
      } else {
        return (`outbreakinfo_epidemiology_data_${this.todayFormatted}`)
      }

    }
  },
  methods: {
    formatDate(dateString, formatString = "%Y-%m-%d") {
      const formatDate = timeFormat(formatString);
      return (formatDate(dateString))
    },
    formatPercent(value) {
      return (format(".0%")(value))
    },
    closeDialogBox() {
      this.showDialog = false;
    },
    showDialogBox() {
      this.showDialog = true;
    },
    downloadAll(dwnld_data, encodingFormat, filename) {
      this.downloadData(dwnld_data, encodingFormat, filename);
      this.downloadData([this.getMetadata(filename)], "text/plain", `${this.filename}_README.txt`, true);
    },
    downloadData(dwnld_data, encodingFormat, filename, isReadme = false) {
      // Send GA event
      // https://matteo-gabriele.gitbook.io/vue-gtag/methods/events
      if (isReadme) {
        this.$gtag.event("download", {
          'event_category': `${this.type}_${this.figureRef}_${this.downloadLabel}_README`,
          'event_label': `downloading |${this.figureRef}| {${this.downloadLabel} README} data from [${this.$route.fullPath}] as (${encodingFormat})`
        })
      } else {
        this.$gtag.event("download", {
          'event_category': `${this.type}_${this.figureRef}_${this.downloadLabel}`,
          'event_label': `downloading |${this.figureRef}| {${this.downloadLabel}} data from [${this.$route.fullPath}] as (${encodingFormat})`
        })
      }

      // code adapted from CViSB
      const blob = new Blob(dwnld_data, {
        type: encodingFormat
      });

      const hiddenElement = this.$refs.download_link;
      hiddenElement.href = window.URL.createObjectURL(blob);
      hiddenElement.target = '_blank';
      hiddenElement.download = filename;
      hiddenElement.click();
      this.showDialog = false;

      setTimeout(function() {
        window.URL.revokeObjectURL(hiddenElement.href);
      }, 10);
    },
    getMetadata(filename) {
      const sourceText = this.query ? `${window.location.origin}/${this.$route.fullPath}\nQuery: ${this.query}` : `${window.location.origin}/${this.$route.fullPath}`;

      const epiString = this.sources.map(d => `${d.scope}: ${d.citation}`).join("\n\n");
      const resourcesString = this.resources.flatMap(d => d.sources).map(d => `${d.name}: ${d.citation}`).join("\n\n")

      return (
        `${filename}

Downloaded: ${this.today}
Source: ${sourceText}

\n\n\nPlease cite the data sources, as appropriate, and follow the terms of their licenses:
\n\n${"-".repeat(75)}
outbreak.info
${"-".repeat(75)}
${this.outbreak.authors} outbreak.info. Available online: https://outbreak.info/ (2020)
\n\n${"-".repeat(75)}
epidemiology
${"-".repeat(75)}
${epiString}
\n\n${"-".repeat(75)}
resources
${"-".repeat(75)}
${resourcesString}
\n\n${"-".repeat(75)}
`)
    },
    downloadSvg() {
      const svgObject = getSvg(this.figureRef, this.sourceString, this.todayFormattedLong, this.darkMode);

      const filenames = svgObject.map(svg => this.filename + "_" + svg.name + ".svg").join(", ");

      this.downloadData([this.getMetadata(this.getMetadata(filenames))], "text/plain", `${this.filename}_README.txt`, true);
      svgObject.forEach(svg =>
        this.downloadData(svg.source, "text/xml", this.filename + "_" + svg.name + ".svg")
      )
    },
    downloadPng() {
      this.$gtag.event("download", {
        'event_category': `${this.type}_${this.figureRef}_${this.downloadLabel}`,
        'event_label': `downloading |${this.figureRef}| {${this.downloadLabel}} data from [${this.$route.fullPath}] as (.png)`
      });
      getPng(`svg.${this.figureRef}`, this.sourceString, this.todayFormattedLong, this.isVertical, this.darkMode, true, `${this.filename}.png`);
      this.downloadData([this.getMetadata(this.filename)], "text/plain", `${this.filename}_README.txt`, true);
    },
    prepData(fileType) {
      if (!this.downloadable && this.query && this.api) {
        this.showDialog = false;
        this.showLoading = true;
        this.dataSubscription = getAll(this.api, this.query).subscribe(results => {
          this.downloadable = this.cleanData(results, fileType);
          this.showLoading = false;
        })
      } else {
        this.cleanData(this.data, fileType);
      }
    },
    cleanData(data, fileType) {
      if (data) {
        // create a copy so the real stuff isn't mutated
        this.downloadable = cloneDeep(data);

        // clean up based on the type of data being exported
        if (this.type == "epidemiology") {
          this.downloadable = this.downloadable.flatMap(location => location.value).filter(d => !d.calculated);

          this.downloadable.forEach(d => {
            d["source"] = d.country_name == "United States of America" || d.iso3 === "USA" || d.location_id === "USA" ? "The New York Times, The COVID Tracking Project" : "JHU COVID-19 Data Repository";
            d["date"] = this.formatDate(d.date);
            delete d._score;
            delete d.color;
          })
        } else if (this.type == "maps") {
          this.downloadable.forEach(d => {
            d["source"] = d.country_name == "United States of America" || d.iso3 === "USA" || d.location_id === "USA" ? "The New York Times" : "JHU COVID-19 Data Repository";
            delete d._score;
            delete d.datetime;
            delete d.fill;
          })
        } else if (this.type == "regions") {

          this.downloadable.forEach(d => {
            d["source"] = "JHU COVID-19 Data Repository, The New York Times";
            d["date"] = this.formatDate(d.date);
            delete d._score;
          })
        } else if (this.type == "resources") {
          this.downloadable.forEach(d => {
            d["source"] = d.curatedBy ? d.curatedBy.name : null;
            delete d._score;
            delete d.color;
          })
        } else {
          this.downloadable.forEach(d => {
            d["source"] = d.curatedBy ? d.curatedBy.name : null;
            delete d._score;
            delete d.color;
          })
        }

        if (fileType == "tsv") {
          this.downloadTsv();
        } else {
          this.downloadJson();
        }

      }
    },
    data2Str(data, columnDelimiter = "\t") {
      const lineDelimiter = '\n';

      let colnames = uniq(data.flatMap(d => Object.keys(d)));

      var dwnld_data = "";
      dwnld_data += colnames.join(columnDelimiter);
      dwnld_data += lineDelimiter;

      data.forEach(function(item) {
        let counter = 0;
        colnames.forEach(function(key) {
          if (counter > 0) dwnld_data += columnDelimiter;

          // For null values, return empty string.
          // Make sure the values are encased in quotes, in case the item[key] includes html like `\n` which will break the parsing
          dwnld_data += (item[key] || item[key] === 0 || item[key] === false) ? `${JSON.stringify(item[key])}` : "";
          counter++;
        });
        dwnld_data += lineDelimiter;
      });

      return (dwnld_data)
    },
    downloadJson() {
      const dataString = JSON.stringify(this.downloadable);
      this.downloadAll([dataString], "text/json;charset=utf-8", this.filename + ".json");
    },
    downloadTsv() {
      const dataString = this.data2Str(this.downloadable);
      this.downloadAll([dataString], "text/tab-separated-values;charset=utf-8", this.filename + ".tsv")
    }
  },
  mounted() {
    this.progressSubscription = progressState$.subscribe(progress => {
      this.progress = progress;
    })

    this.$nextTick(function() {
      // window.addEventListener("click", this.closeDialogBox), { passive: true };
      // Close on escape
      document.addEventListener(
        "keyup",
        evt => {
          if (evt.keyCode === 27) {
            this.closeDialogBox();
          }
        }, {
          passive: true
        }
      );
    });
  },
  destroyed() {
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
    // window.removeEventListener("click", this.closeDialogBox);
    document.removeEventListener("keyup", this.closeDialogBox);
  }
}
</script>

  <style lang="scss">
  .dialog {
      background: rgba(40, 40, 40, 0.95);
      top: 50%;
      left: 50%;
      box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
      padding: 10px;
      z-index: 99;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      overflow-y: auto;
  }

  .btn-main.background-white {
      background: white !important;
      color: $primary-color !important;
      &:hover {
          color: white !important;
      }
  }

  #download-dialog.text-light a {
      color: rgba(255,255, 255, 0.5) !important; //#3d9bff
      &:hover {
          color: #85c0ff !important;
      }
  }

  #download-dialog.text-light .text-highlight {
      color: #ff7096 !important;
  }

  .progress-bar {
    fill: $warning-color;
  }

  .progress-background {
    fill: $grey-40;
  }

  .progress-stroke {
    stroke: white;
    stroke-width: 1.5;
    fill: none;
  }

.download-btn {
  min-width: 160px;
}
  </style>
