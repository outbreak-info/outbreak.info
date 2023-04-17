<template>
  <div class="d-flex flex-column border-top">
    <div v-if="date" class="border-bottom py-3">
      <!-- date -->
      <div>
        {{ date }}
      </div>
      <!-- DOI -->
      <div v-if="data.doi" class="text-muted">
        DOI:
        <a
          class="text-muted"
          :href="`https://doi.org/${data.doi}`"
          target="_blank"
        >
          {{ data.doi }}
        </a>
      </div>

      <div v-if="!data.pmid" class="text-muted">ID: {{ data._id }}</div>
      <div v-if="data.pmid" class="text-muted">
        PMID:
        <a
          class="text-muted"
          :href="`https://pubmed.ncbi.nlm.nih.gov/${data.pmid}`"
          target="_blank"
        >
          {{ data.pmid }}
        </a>
      </div>
    </div>

    <!-- link out -->
    <div
      v-if="data.url"
      class="py-4 border-bottom d-flex flex-column justify-content-center"
    >
      <span class="sidebar-header">View {{ type }}</span>
      <div class="d-flex align-items-center justify-content-center">
        <a
          class="btn btn-main-outline line-height-1"
          :href="data.url"
          target="_blank"
          rel="noreferrer"
        >
          {{ resourceLinkLabel }}
        </a>
      </div>
    </div>

    <!-- cite -->
    <div class="py-3 border-bottom d-flex flex-column">
      <span class="sidebar-header">Download Citation</span>
      <div class="citation-container flex">
        <a class="mr-3 share-link" @click="downloadCitation()">RIS</a>
        <a
          ref="risDownload"
          :href="citationRIS"
          target="_blank"
          rel="noreferrer"
          download="outbreakinfo_citation.ris"
        />
      </div>
    </div>

    <!-- evaluations -->
    <template v-if="data.evaluations && data.evaluations.length">
      <div v-for="(evaluation, eIdx) in data.evaluations" :key="eIdx">
        <!-- COVID-19 LST -->
        <div
          v-if="evaluation.name === 'covid19LST'"
          id="covid19-lst"
          class="py-3 border-bottom d-flex flex-column"
        >
          <span class="sidebar-header">Level of Evidence in Study</span>
          <span class="mt-2">&larr; more evidence</span>
          <div class="d-flex justify-content-center mt-1 mb-3">
            <div
              v-for="(rating, dIdx) in 5"
              :key="dIdx"
              class="circle-rating mx-2"
              :class="[
                rating === evaluation.ratingValue
                  ? 'rating-selected'
                  : 'rating-unselected',
              ]"
            >
              <span class="fa-xs">{{ rating }}</span>
            </div>
          </div>
          <div class="line-height-1 text-left mb-2">
            <span class="text-underline">
              Level {{ evaluation.ratingValue }}
            </span>
            <span v-if="evaluation.ratingExplanation">
              : {{ evaluation.ratingExplanation }}
            </span>
          </div>

          <div class="text-muted section-header fa-sm mb-2 line-height-1">
            rated by
            <a :href="evaluation.author.url" target="_blank">
              {{ evaluation.author.name }}
            </a>
          </div>
          <small
            v-if="evaluation.reviewAspect"
            class="text-muted section-header fa-xs line-height-1"
          >
            based on
            <a
              v-if="
                evaluation.reviewAspect === 'Oxford 2011 Levels of Evidence'
              "
              href="https://www.cebm.ox.ac.uk/resources/levels-of-evidence/explanation-of-the-2011-ocebm-levels-of-evidence"
              target="_blank"
            >
              {{ evaluation.reviewAspect }}
            </a>
            <span v-else>{{ evaluation.reviewAspect }}</span>
          </small>
        </div>
      </div>
    </template>

    <!-- altmetrics badges -->
    <div v-if="data.doi" class="py-3 border-bottom d-flex flex-column">
      <span class="sidebar-header">
        <a
          class="text-white"
          href="https://help.altmetric.com/support/solutions/articles/6000233311-how-is-the-altmetric-attention-score-calculated"
          target="_blank"
        >
          Altmetric
        </a>
        Rating
      </span>
      <div
        class="altmetric-embed my-2"
        data-badge-type="medium-donut"
        data-badge-popover="left"
        :data-doi="data.doi"
      />
      <small class="text-muted line-height-1">
        Altmetric tracks mentions of scholarly works across the social web
      </small>
    </div>

    <div
      v-else-if="data.curatedBy && data.curatedBy.name === 'ClinicalTrials.gov'"
      class="py-3 border-bottom d-flex flex-column"
    >
      <span class="sidebar-header">
        <a
          class="text-white"
          href="https://help.altmetric.com/support/solutions/articles/6000233311-how-is-the-altmetric-attention-score-calculated"
          target="_blank"
        >
          Altmetric
        </a>
        Rating
      </span>
      <div
        class="altmetric-embed my-2"
        data-badge-type="medium-donut"
        data-badge-popover="left"
        :data-nct-id="data.identifier"
      />
      <small class="text-muted line-height-1">
        Altmetric tracks mentions of scholarly works across the social web
      </small>
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
        <a
          :href="`https://twitter.com/intent/tweet?url=${outbreakUrl}&hashtags=covid-19,outbreak.info`"
          target="_blank"
          rel="noreferrer"
          class="twitter-share-button"
          aria-label="twitter link"
        >
          <font-awesome-icon class="mr-3" :icon="['fab', 'twitter']" />
        </a>
        <a
          :href="`mailto:?subject=outbreak.info%20${type}&body=${outbreakUrl}`"
          aria-label="email"
          target="_blank"
        >
          <font-awesome-icon class="mr-3" :icon="['fas', 'envelope']" />
        </a>
        <a aria-label="copy to clipboard" @click="copy2Clipboard">
          <font-awesome-icon class="share-link mr-3" :icon="['fas', 'link']" />
        </a>
        <p :class="{ snackbar: true, show: showSnackbar }">
          copied to clipboard
        </p>
        <a v-if="canShare" aria-label="share" @click="shareLink">
          <font-awesome-icon class="share-link mr-3" :icon="['fas', 'share']" />
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { formatRIS } from '@/js/citationConverter.js';

const props = defineProps({
  data: Object,
  type: String,
  date: String,
});

const showSnackbar = ref(false);
const citationRIS = ref(null);
const risDownload = ref(null);

const outbreakUrl = computed(() => {
  return window.location.href;
});

const resourceLinkLabel = computed(() => {
  if (props.type === 'Publication') {
    return props.data.journalName
      ? props.data.journalName
      : props.data.journalNameAbbrev
      ? props.data.journalNameAbbrev
      : props.data.curatedBy.name;
  } else if (props.data.curatedBy) {
    return props.data.curatedBy.name;
  } else {
    return props.data.includedInDataCatalog.name;
  }
});

const canShare = computed(() => {
  return !!navigator.share;
});

onMounted(() => {
  // append Altmetrics script
  let altmetricsScript = document.createElement('script');
  altmetricsScript.setAttribute(
    'src',
    'https://d1bxh8uas1mnw7.cloudfront.net/assets/embed.js',
  );
  document.body.appendChild(altmetricsScript);
});

const copy2Clipboard = () => {
  showSnackbar.value = true;
  setTimeout(() => {
    showSnackbar.value = false;
  }, 3000);
  navigator.clipboard.writeText(outbreakUrl.value);
};

const downloadCitation = () => {
  const ris = formatRIS(props.data);

  if (ris) {
    citationRIS.value = `data:text/plain;charset=utf-8,${encodeURI(ris)}`;
    risDownload.value.href = citationRIS.value;
    risDownload.value.click();
  }
};

const shareLink = () => {
  if (navigator.share) {
    navigator.share({
      title: `outbreak.info ${props.type}`,
      url: window.location.href,
    });
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
