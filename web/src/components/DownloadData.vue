<template>
<div>
  <div v-if="loading && showLoading" class="loader dialog d-flex flex-column align-items-center">
    <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
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
    <button class="btn-main-outline router-link no-underline my-1" role="button" @click="showDialogBox"><small>download {{downloadLabel}}</small></button>
    <a class="hidden" ref="download_link"></a>


    <div id="download-dialog" class="dialog position-fixed text-left d-flex flex-column text-light rounded w-75 h-75 px-5 py-4" v-if="showDialog">
      <h2>Download</h2>
      <a class="text-uppercase pointer" @click="downloadSvg">
        <p class="focustext m-0">
          svg
        </p>
      </a>

      <!-- <a href="#download" class="my-4">download files</a> -->
      <!-- Data Usage and citations -->
      <DataUsage />
      <CiteUs class="mt-5" />

      <!-- Actual data download -->
      <h2 class="my-3">Download</h2>
      <div v-if="type == 'epidemiology' || type == 'regions'" class="mb-4">
        <h4 class="m-0">Figure</h4>
        <a class="text-uppercase pointer" @click="downloadSvg">
          <p class="focustext m-0">
            svg
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

import {
  timeFormat,
  format
} from "d3";
import {
  cloneDeep,
  uniq
} from "lodash";

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
    }
  },
  components: {
    DataUsage,
    CiteUs
  },
  data() {
    return ({
      showDialog: false,
      showLoading: false,
      downloadable: null,
      dataSubscription: null,
      progress: 0,
      progressBarWidth: 225,
      prefix: {
        xmlns: "http://www.w3.org/2000/xmlns/",
        xlink: "http://www.w3.org/1999/xlink",
        svg: "http://www.w3.org/2000/svg"
      }
    })
  },
  computed: {
    ...mapState("admin", ["loading", "outbreak", "sources", "resources"]),
    today() {
      const today = new Date();
      return (this.formatDate(today))
    },
    filename() {
      if (this.data && this.data.length === 1 && this.type == "epidemiology") {
        return (`${this.data[0].key}_outbreakinfo_epidemiology_data_${this.today}`)
      } else if (this.type == "resources") {
        return (`outbreakinfo_resources_metadata_${this.today}`)
      } else {
        return (`outbreakinfo_epidemiology_data_${this.today}`)
      }

    }
  },
  methods: {
    formatDate(dateString) {
      const formatDate = timeFormat("%Y-%m-%d");
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
      this.downloadData([this.getMetadata(filename)], "text/plain", `${this.filename}_README.txt`);
    },
    downloadData(dwnld_data, encodingFormat, filename) {
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
      // code adapted from https://github.com/nytimes/svg-crowbar (thanks, Mike Bostock)
      console.log("Downloading data")
      const refs = document.getElementsByClassName(this.figureRef);
      var emptySvg = window.document.createElementNS(this.prefix.svg, 'svg');
      window.document.body.appendChild(emptySvg);
      var emptySvgDeclarationComputed = getComputedStyle(emptySvg);

      const svgObject = this.getSvgSources(refs, emptySvgDeclarationComputed);
      this.downloadAll(svgObject[0].source, "text/xml", this.filename + ".svg")
      console.log(svgObject)
    },
    getSvgSources(svgs, emptySvgDeclarationComputed) {
      var svgInfo = [];
      var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

      // apparently nodes, while array-like, don't have a `forEach` property attached to them... hence this syntax
      [].forEach.call(svgs, svg => {

        svg.setAttribute("version", "1.1");

        // removing attributes so they aren't doubled up
        svg.removeAttribute("xmlns");
        svg.removeAttribute("xlink");


        // These are needed for the svg
        if (!svg.hasAttributeNS(this.prefix.xmlns, "xmlns")) {
          svg.setAttributeNS(this.prefix.xmlns, "xmlns", this.prefix.svg);
        }

        if (!svg.hasAttributeNS(this.prefix.xmlns, "xmlns:xlink")) {
          svg.setAttributeNS(this.prefix.xmlns, "xmlns:xlink", this.prefix.xlink);
        }

        // necessary to nest styles inline
        this.setInlineStyles(svg, emptySvgDeclarationComputed);

        var source = (new XMLSerializer()).serializeToString(svg);
        var rect = svg.getBoundingClientRect();
        svgInfo.push({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          class: svg.getAttribute("class"),
          id: svg.getAttribute("id"),
          name: svg.getAttribute("name"),
          childElementCount: svg.childElementCount,
          source: [doctype + source]
        });
      });
      return svgInfo;
    },
    setInlineStyles(svg, emptySvgDeclarationComputed) {

      function explicitlySetStyle(element) {
        var cSSStyleDeclarationComputed = getComputedStyle(element);
        var i, len, key, value;
        var computedStyleStr = "";
        for (i = 0, len = cSSStyleDeclarationComputed.length; i < len; i++) {
          key = cSSStyleDeclarationComputed[i];
          value = cSSStyleDeclarationComputed.getPropertyValue(key);
          if (value !== emptySvgDeclarationComputed.getPropertyValue(key)) {
            computedStyleStr += key + ":" + value + ";";
          }
        }
        element.setAttribute('style', computedStyleStr);
      }

      function traverse(obj) {
        var tree = [];
        tree.push(obj);
        visit(obj);

        function visit(node) {
          if (node && node.hasChildNodes()) {
            var child = node.firstChild;
            while (child) {
              if (child.nodeType === 1 && child.nodeName != 'SCRIPT') {
                tree.push(child);
                visit(child);
              }
              child = child.nextSibling;
            }
          }
        }
        return tree;
      }
      // hardcode computed css styles inside svg
      var allElements = traverse(svg);
      var i = allElements.length;
      while (i--) {
        explicitlySetStyle(allElements[i]);
      }
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
        this.downloadable = cloneDeep(data);
        if (this.type == "epidemiology") {
          this.downloadable = this.downloadable.flatMap(location => location.value).filter(d => !d.calculated)

          this.downloadable.forEach(d => {
            d["source"] = d.country_name == "United States of America" || d.country_iso3 === "USA" || d.location_id === "USA" ? "The New York Times, The COVID Tracking Project" : "JHU COVID-19 Data Repository";
            d["date"] = this.formatDate(d.date);
            delete d._score;
            delete d.color;
          })
        } else if (this.type == "regions") {

          this.downloadable.forEach(d => {
            d["source"] = "JHU COVID-19 Data Repository, The New York Times";
            d["date"] = this.formatDate(d.date);
            delete d._score;
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
          dwnld_data += (item[key] || item[key] === 0 || item[key] === false) ? item[key] : "";
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


  </style>
