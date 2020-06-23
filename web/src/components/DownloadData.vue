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
    },
    sourceString: {
      type: String,
      default: "Johns Hopkins University Center for Systems Science and Engineering (non-U.S. data); The New York Times (U.S. data); The COVID Tracking Project (testing data), updated daily."
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
      return(new Date());
    },
    todayFormatted() {
      return (this.formatDate(this.today))
    },
    filename() {
      if (this.data && this.data.length === 1 && this.type == "epidemiology") {
        return (`${this.data[0].key}_outbreakinfo_epidemiology_data_${this.todayFormatted}`)
      } else if (this.type == "resources") {
        return (`outbreakinfo_resources_metadata_${this.todayFormatted}`)
      } else {
        return (`outbreakinfo_epidemiology_data_${this.todayFormatted}`)
      }

    }
  },
  methods: {
    formatDate(dateString, formatString="%Y-%m-%d") {
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
      this.downloadData([this.getMetadata(filename)], "text/plain", `${this.filename}_README.txt`);
    },
    downloadData(dwnld_data, encodingFormat, filename) {
      // Send GA event
      // https://matteo-gabriele.gitbook.io/vue-gtag/methods/events
        this.$gtag.event("download", {
        'event_category': this.type,
        'event_label': `downloading ${this.type} data as ${encodingFormat}`,
        'value': this.$route.fullPath
      })

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
      const refs = document.getElementsByClassName(this.figureRef);
      var emptySvg = window.document.createElementNS(this.prefix.svg, 'svg');
      window.document.body.appendChild(emptySvg);
      var emptySvgDeclarationComputed = getComputedStyle(emptySvg);

      const svgObject = this.getSvgSources(refs, emptySvgDeclarationComputed);
      const filenames = svgObject.map(svg => this.filename + "_" + svg.name + ".svg").join(", ");

      this.downloadData([this.getMetadata(filenames)], "text/plain", `${this.filename}_README.txt`);
      svgObject.forEach(svg =>
        this.downloadData(svg.source, "text/xml", this.filename + "_" + svg.name + ".svg")
      )
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

        const title = svg.getAttribute("name");
        const footer = this.getFooter(rect.width, rect.height);
        const header = this.getHeader(rect.width, title);


        svgInfo.push({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          class: svg.getAttribute("class"),
          id: svg.getAttribute("id"),
          name: title,
          childElementCount: svg.childElementCount,
          source: [doctype + `<svg width="${rect.width}" height="${rect.height + 100}">` + header + '<g transform="translate(0,35)">' + source + footer + "</g></svg>"]
        });
      });
      return svgInfo;
    },
    getHeader(width, title) {
      return (`<svg id="title" width="${width}" height="20">
      <text x="0" y="0" transform="translate(10,10)" fill="currentColor"
        style="dominant-baseline: hanging; font-size:18px;display:block;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;height:auto;line-height:15px;outline-color:rgb(44, 62, 80);overflow-x:visible;overflow-y:visible;text-align:center;text-decoration:none solid rgb(44, 62, 80);text-decoration-color:rgb(44, 62, 80);vertical-align:baseline;white-space:nowrap;width:auto;column-rule-color:rgb(44, 62, 80);-webkit-font-smoothing:antialiased;perspective-origin:0px 0px;-webkit-text-emphasis-color:rgb(44, 62, 80);-webkit-text-fill-color:rgb(44, 62, 80);-webkit-text-stroke-color:rgb(44, 62, 80);transform-origin:0px 0px;fill:rgb(44, 62, 80);text-anchor:start;caret-color:rgb(44, 62, 80);">
      ${title}</text>
      </svg>`)
    },
    getFooter(width, height) {
      return (`<svg width="${width}" height="50" id="footer" class="sources mt-2" transform="translate(0, ${height + 15})">
      <g id="background">
      <rect width="${width}" height="50" style="fill: #dee2e6"></rect>
      </g>

          <g id="top_border">
            <line x1="0" y1="2" x2="${width}" y2="2" stroke="#126B93" stroke-width="5"></line>
          </g>

      <g id="citation" transform="translate(10,5)">
        <g transform="translate(0, -8)" id="logo">
          <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="25px"
          	 viewBox="0 0 396.4 396.4" style="enable-background:new 0 0 396.4 396.4;" xml:space="preserve">
          <g>
          	<circle cx="198.2" cy="203" r="180"/>
          	<g>
          		<circle style="fill:#114068;" cx="198.2" cy="204.7" r="151.6"/>
          	</g>
          	<linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="195.2239" y1="53.7053" x2="333.4954" y2="293.1985">
          		<stop  offset="0" style="stop-color:#39C2E2"/>
          		<stop  offset="0.6781" style="stop-color:#39C2E2;stop-opacity:0"/>
          	</linearGradient>
          	<path style="fill:url(#SVGID_1_);" d="M196.1,212.6l114.2,94c24.5-26.9,39.6-62.6,39.6-101.9c0-83.7-67.9-151.6-151.6-151.6
          		c-0.7,0-1.4,0.1-2.1,0.1V212.6z"/>
          	<g>
          		<path style="fill:#FFFFFF;" d="M198.2,272.2c-32.4,0-58.8-26.4-58.8-58.8s26.4-58.8,58.8-58.8s58.8,26.4,58.8,58.8
          			S230.6,272.2,198.2,272.2z M198.2,161.6c-28.5,0-51.7,23.2-51.7,51.7s23.2,51.7,51.7,51.7c28.5,0,51.7-23.2,51.7-51.7
          			S226.7,161.6,198.2,161.6z"/>
          	</g>
          	<g>
          		<path style="fill:#FFFFFF;" d="M198.2,330.8c-64.7,0-117.4-52.7-117.4-117.4S133.5,95.9,198.2,95.9c64.7,0,117.4,52.7,117.4,117.4
          			S262.9,330.8,198.2,330.8z M198.2,103c-60.8,0-110.3,49.5-110.3,110.3s49.5,110.3,110.3,110.3s110.3-49.5,110.3-110.3
          			S259,103,198.2,103z"/>
          	</g>
          	<g>
          		<circle style="fill:#D13B62;" cx="269.7" cy="172.8" r="18.7"/>
          	</g>
          	<g>
          		<circle style="fill:#D13B62;" cx="126.5" cy="259.3" r="9.4"/>
          	</g>
          	<g>
          		<circle style="fill:#D13B62;" cx="225.3" cy="259.3" r="27.1"/>
          	</g>
          	<path style="fill:#FFFFFF;" d="M194.6,23c-0.3,0.6,0,2.4,0,3.1v186.4c0,2.3,1.6,4.1,3.6,4.1s3.6-1.9,3.6-4.1V26.1
          		c0-0.7,0.3-2.5,0-3.1c-0.9,0-2,0-2.9,0C197.6,23,195.8,23,194.6,23z"/>
          </g>
          </svg>
          </g>
          <g id="outbreak-info" transform="translate(0, 22.3)">
            <text x="0" y="0" transform="translate(30,0)" style="font-size:17px; dominant-baseline: middle;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;">outbreak.info</text>
            <text x="0" y="0" transform="translate(${width - 30},0)" style="dominant-baseline: middle; font-size:13px; text-anchor: end;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;">${this.formatDate(this.today, "%d %B %Y")}</text>
          </g>

          <g id="sources" transform="translate(0, 36)">
            <text x="0" y="0" transform="translate(30,0)" style="dominant-baseline: middle;font-size: 10px;fill: #6c757d;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;">Source: ${this.sourceString}</text>
          </g>
          </g>
        </svg>`)
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
        // create a copy so the real stuff isn't mutated
        this.downloadable = cloneDeep(data);

        // clean up based on the type of data being exported
        if (this.type == "epidemiology") {
          this.downloadable = this.downloadable.flatMap(location => location.value).filter(d => !d.calculated);

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
        } else if(this.type == "resources") {
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
