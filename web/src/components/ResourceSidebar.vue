<template>
<div class="d-flex flex-column border-top">
  <div class="border-bottom py-3" v-if="date">
    <!-- date -->
    <div>
      {{date}}
    </div>
    <!-- DOI -->
    <div class="text-muted" v-if="data.doi">
      DOI: {{data.doi}}
    </div>
  </div>

  <!-- link out -->
  <div class="py-4 border-bottom" v-if="data.url">
    <a class="btn btn-main" :href="data.url" target="_blank" rel="noreferrer">View {{type}}
    </a>
  </div>

  <!-- cite -->
  <div href="fdfs" class="py-3 border-bottom">
    <small class="text-muted section-header">download citation</small>
    <div class="citation-container flex">
      <a class="mr-3 share-link" @click="downloadCitation()">RIS</a>
      <a :href="citationRIS" target="_blank" rel="noreferrer" download="outbreakinfo_citation.ris" ref="risDownload"></a>
    </div>
  </div>

  <!-- edit -->
  <div class="pt-4 pb-3 border-bottom d-flex flex-column">
    <div>
      <a class="btn btn-main-outline router-link no-underline" role="button" target="_blank" rel="noreferrer" href="http://discovery.biothings.io/outbreak">Edit metadata
      </a>
    </div>
    <small class="mt-2 helper text-muted">Improve this record by adding additional information</small>
  </div>

  <!-- share -->
  <div class="py-3 border-bottom text-muted">
    <small class="text-muted section-header">share</small>
    <div class="d-flex flex-wrap justify-content-center mt-1">
      <a :href="`https://twitter.com/intent/tweet?url=${outbreakUrl}&hashtags=covid-19,outbreak.info`" target="_blank" rel="noreferrer" class="twitter-share-button">
        <i class="fab fa-twitter mr-3"></i>
      </a>
      <a :href="`mailto:?subject=outbreak.info%20${type}&body=${outbreakUrl}`">
        <i class="fas fa-envelope mr-3"></i>
      </a>
      <a @click="copy2Clipboard">
        <i class="share-link fas fa-link mr-3"></i>
      </a>
      <p :class="{'snackbar': true, 'show': showSnackbar}">
        copied to clipboard
      </p>
      <a @click="shareLink" v-if="canShare">
        <i class="share-link fas fa-share mr-3"></i>
      </a>
    </div>
  </div>

</div>
</template>

<script>
import { formatRIS } from "@/js/citationConverter.js";

export default {
  name: "ResourceSidebar",
  props: {
    data: Object,
    type: String,
    date: String,
  },
  data() {
    return ({
      showSnackbar: false,
      citationRIS: null
    })
  },
  computed: {
    outbreakUrl() {
      return (window.location.href);
    },
    canShare() {
      return (navigator.share ? true : false)
    }
  },
  methods: {
    copy2Clipboard: function() {
      this.showSnackbar = true;
      setTimeout(() => {
        this.showSnackbar = false;
      }, 3000)
      navigator.clipboard.writeText(this.outbreakUrl);
    },
    downloadCitation: function() {
      const ris = formatRIS(this.data);

      if(ris) {
        this.citationRIS = `data:text/plain;charset=utf-8,${encodeURI(ris)}`;
        this.$refs.risDownload.href = this.citationRIS;
        this.$refs.risDownload.click();
      }

    },
    shareLink: function() {
      if (navigator.share) {
        navigator.share({
          title: `outbreak.info ${this.type}`,
          url: window.location.href
        });
      }
    }
  }
}
</script>

<style lang="scss">
.share-link {
    color: $link-color !important;
    cursor: pointer;
    &:hover {
        color: $link-hover !important;

    }
}
</style>
