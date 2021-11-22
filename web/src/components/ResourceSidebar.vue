<template>
<div class="d-flex flex-column border-top">
  <div class="border-bottom py-3" v-if="date">
    <!-- date -->
    <div>
      {{ date }}
    </div>
    <!-- DOI -->
    <div v-if="data.doi" class="text-muted">
      DOI: <a class="text-muted" :href="`https://doi.org/${data.doi}`" target="_blank">{{ data.doi }}</a>
    </div>

    <div class="text-muted" v-if="!data.pmid">ID: {{ data._id }}</div>
    <div v-if="data.pmid" class="text-muted">
      PMID: <a class="text-muted" :href="`https://pubmed.ncbi.nlm.nih.gov/${data.pmid}`" target="_blank">{{ data.pmid }}</a>
    </div>

  </div>

  <!-- link out -->
  <div class="py-4 border-bottom d-flex flex-column justify-content-center" v-if="data.url">
    <span class="sidebar-header">View {{ type }}</span>
    <div class="d-flex align-items-center justify-content-center">
      <a class="btn btn-main-outline line-height-1" :href="data.url" target="_blank" rel="noreferrer">{{resourceLinkLabel}}
      </a>
    </div>

  </div>

  <!-- cite -->
  <div class="py-3 border-bottom d-flex flex-column">
    <span class="sidebar-header">Download Citation</span>
    <div class="citation-container flex">
      <a class="mr-3 share-link" @click="downloadCitation()">RIS</a>
      <a :href="citationRIS" target="_blank" rel="noreferrer" download="outbreakinfo_citation.ris" ref="risDownload"></a>
    </div>
  </div>

  <!-- evaluations -->
  <template v-if="data.evaluations && data.evaluations.length">
    <div v-for="(evaluation, eIdx) in data.evaluations" :key="eIdx">
      <!-- COVID-19 LST -->
      <div id="covid19-lst" v-if="evaluation.name == 'covid19LST'" class="py-3 border-bottom d-flex flex-column">
        <span class="sidebar-header">Level of Evidence in Study</span>
        <span class="mt-2">&larr; more evidence </span>
        <div class="d-flex justify-content-center mt-1 mb-3">
          <div class="circle-rating mx-2" v-for="(rating, dIdx) in 5" :key="dIdx" :class="[rating == evaluation.ratingValue ? 'rating-selected' : 'rating-unselected']">
            <span class="fa-xs">{{rating}}
            </span>
          </div>
        </div>
        <div class="line-height-1 text-left mb-2">
          <span class="text-underline">Level {{evaluation.ratingValue}}</span><span v-if="evaluation.ratingExplanation">: {{evaluation.ratingExplanation}}</span>
        </div>

        <div class="text-muted section-header fa-sm mb-2 line-height-1">rated by <a :href="evaluation.author.url" target="_blank">{{evaluation.author.name}}</a></div>
        <small class="text-muted section-header fa-xs line-height-1" v-if="evaluation.reviewAspect">based on
          <a href="https://www.cebm.ox.ac.uk/resources/levels-of-evidence/explanation-of-the-2011-ocebm-levels-of-evidence" target="_blank" v-if="evaluation.reviewAspect == 'Oxford 2011 Levels of Evidence'">{{evaluation.reviewAspect}}</a>
          <span v-else>{{evaluation.reviewAspect}}</span>
        </small>
      </div>
    </div>
  </template>

  <!-- altmetrics badges -->
  <div class="py-3 border-bottom d-flex flex-column" v-if="data.doi">
    <span class="sidebar-header">
      <a class="text-white" href="https://help.altmetric.com/support/solutions/articles/6000233311-how-is-the-altmetric-attention-score-calculated" target="_blank">Altmetric</a> Rating
    </span>
    <div class="altmetric-embed my-2" data-badge-type='medium-donut' data-badge-popover='left' :data-doi='data.doi'></div>
    <small class="text-muted line-height-1">Altmetric tracks mentions of scholarly works across the social web</small>
  </div>

  <div class="py-3 border-bottom d-flex flex-column" v-else-if="data.curatedBy.name=='ClinicalTrials.gov'">
    <span class="sidebar-header">
      <a class="text-white" href="https://help.altmetric.com/support/solutions/articles/6000233311-how-is-the-altmetric-attention-score-calculated" target="_blank">Altmetric</a> Rating
    </span>
    <div class="altmetric-embed my-2" data-badge-type='medium-donut' data-badge-popover='left' :data-nct-id='data.identifier'></div>
    <small class="text-muted line-height-1">Altmetric tracks mentions of scholarly works across the social web</small>
  </div>






  <!-- edit -->
  <!-- <div class="pt-4 pb-3 border-bottom d-flex flex-column">
      <div>
        <a
          class="btn btn-main-outline router-link no-underline"
          role="button"
          target="_blank"
          rel="noreferrer"
          href="http://discovery.biothings.io/outbreak"
          >Edit metadata
        </a>
      </div>
      <small class="mt-2 helper text-muted"
        >Improve this record by adding additional information</small
      >
    </div> -->

  <!-- share -->
  <div class="py-3 border-bottom text-muted d-flex flex-column">
    <span class="sidebar-header">Share</span>
    <div class="d-flex flex-wrap justify-content-center mt-1">
      <a :href="
            `https://twitter.com/intent/tweet?url=${outbreakUrl}&hashtags=covid-19,outbreak.info`
          " target="_blank" rel="noreferrer" class="twitter-share-button" aria-label="twitter link">
        <font-awesome-icon class="mr-3" :icon="['fab', 'twitter']" />
      </a>
      <a :href="`mailto:?subject=outbreak.info%20${type}&body=${outbreakUrl}`" aria-label="email" target="_blank">
        <font-awesome-icon class="mr-3" :icon="['fas', 'envelope']" />
      </a>
      <a @click="copy2Clipboard" aria-label="copy to clipboard">
        <font-awesome-icon class="share-link mr-3" :icon="['fas', 'link']" />
      </a>
      <p :class="{ snackbar: true, show: showSnackbar }">
        copied to clipboard
      </p>
      <a @click="shareLink" v-if="canShare" aria-label="share">
        <font-awesome-icon class="share-link mr-3" :icon="['fas', 'share']" />
      </a>
    </div>
  </div>
</div>
</template>

<script>
import {
  formatRIS
} from "@/js/citationConverter.js";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faLink,
  faShare,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import {
  faTwitter
} from "@fortawesome/free-brands-svg-icons";

library.add(faLink, faShare, faEnvelope, faTwitter);

export default {
  name: "ResourceSidebar",
  props: {
    data: Object,
    type: String,
    date: String
  },
  components: {
    FontAwesomeIcon
  },
  data() {
    return {
      showSnackbar: false,
      citationRIS: null
    };
  },
  computed: {
    outbreakUrl() {
      return window.location.href;
    },
    resourceLinkLabel() {
      console.log(this.data)
      if (this.type == "Publication") {
        return this.data.journalName ? this.data.journalName : this.data.journalNameAbbrev ? this.data.journalNameAbbrev : this.data.curatedBy.name;
      } else {
        return (this.data.curatedBy.name)
      }
    },
    canShare() {
      return navigator.share ? true : false;
    }
  },
  mounted() {
    // append Altmetrics script
    let altmetricsScript = document.createElement("script")
    altmetricsScript.setAttribute('src', 'https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js')
    document.body.appendChild(altmetricsScript);
  },
  methods: {
    copy2Clipboard: function() {
      this.showSnackbar = true;
      setTimeout(() => {
        this.showSnackbar = false;
      }, 3000);
      navigator.clipboard.writeText(this.outbreakUrl);
    },
    downloadCitation: function() {
      const ris = formatRIS(this.data);

      if (ris) {
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
};
</script>

<style lang="scss">
.share-link {
    color: $link-color !important;
    cursor: pointer;
    &:hover {
        color: $link-hover !important;
    }
}

$circle-width: 20px;
.circle-rating {
    justify-content: center;
    align-items: center;
    border-radius: 100%;
    text-align: center;
    display: flex;
    flex-shrink: 0 !important;
    color: white;

    font-size: calc(#{$circle-width} * 0.9);
    line-height: $circle-width;
    background: $secondary-color;
    width: $circle-width;
    height: $circle-width;
}

.rating-selected {
    background: $warning-color !important;
    color: white;
}

.rating-unselected {
    background: lighten(#bab0ab, 10%) !important;
    color: #555555 !important;
}

.sidebar-header {
    // text-transform: uppercase;
    // background: #6c757d!important;
    background: lighten(#bab0ab, 0%) !important;
    width: 100%;
    margin-bottom: 0.5rem;
    padding: 0.25rem 0;
    color: white;
    font-weight: bold;
}
</style>
