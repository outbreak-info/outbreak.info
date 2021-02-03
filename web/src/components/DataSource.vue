<template>
<div class="source my-3 d-flex align-items-center">
  <small>Source:
    <span v-for="(source, idx) in filteredSources" :key="idx">
      <a :href="source.url" target="_blank" rel="noreferrer">{{ source.name }} <span v-if="source.scope">({{ source.scope }})</span></a>
      <span v-if="idx < filteredSources.length - 1">; </span> </span>, updated daily.
    <router-link :to="{ name: 'Sources' }" class="mx-2">Read more</router-link>
  </small>

  <!-- date updated -->
  <DataUpdated />
  <div class="btn ml-3 py-0 px-2 btn-main-outline">
    <font-awesome-icon :icon="['far', 'copy']" @click="copyPng" v-if="copyable" />
  </div>
  <DownloadData class="ml-3" id="download-btn" v-if="data" :type="dataType" :figureRef="figureRef" :data="data" :sourceString="sourceString" />

  <p :class="{ snackbar: true, show: showSnackbar }">
    {{ snackbarText }}
  </p>

</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  mapState
} from "vuex";
import {
  getPng
} from "@/js/get_svg.js";
import DownloadData from "@/components/DownloadData.vue";
import DataUpdated from "@/components/DataUpdated.vue";
import {
  timeFormat
} from "d3";


// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faCopy
} from "@fortawesome/free-regular-svg-icons";

library.add(faCopy);

export default Vue.extend({
  name: "DataSource",
  props: {
    ids: Array,
    data: Array,
    dataType: String,
    numSvgs: {
      type: Number,
      default: 1
    },
    figureRef: String
  },
  components: {
    DownloadData,
    DataUpdated,
    FontAwesomeIcon
  },
  computed: {
    ...mapState("admin", ["sources"]),
    filteredSources() {
      if (this.ids && this.ids.length) {
        return this.sources.filter(d => this.ids.includes(d.id));
      } else {
        return this.sources;
      }
    },
    copyable() {
      return (this.numSvgs <= this.copyThreshold && typeof(ClipboardItem) == "function");
    },
    sourceString() {
      return (this.filteredSources.map(d => d.scope ? `${d.name} (${d.scope})` : `${d.name}`).join("; ") + ", updated daily")
    },
    todayFormatted() {
      return (this.formatDate())
    },
  },
  data() {
    return {
      showSnackbar: false,
      snackbarText: "copying figure to the clipboard",
      copyThreshold: 9
    };
  },
  watch: {},
  methods: {
    formatDate(formatString = "%d %b %Y") {
      const dateString = new Date();
      const formatDate = timeFormat(formatString);
      return (formatDate(dateString))
    },
    copyPng() {
      this.showSnackbar = true;
      this.snackbarText = "copying figure to the clipboard";
      this.$gtag.event("copy_vis", {
        'event_category': `${this.dataType}_vis`,
        'event_label': `copying {vis} from [${this.$route.fullPath}]`
      })

      getPng(`svg.${this.figureRef}`, this.sourceString, this.todayFormatted).then(msg => {
        this.snackbarText = msg;
        setTimeout(() => {
          this.showSnackbar = false;
        }, 3000);
      }).catch((error) => {
        console.log(error)
        this.snackbarText = "Error copying image";
        setTimeout(() => {
          this.showSnackbar = false;
        }, 3000);
        console.log("Error: in copying that image")
      });
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
