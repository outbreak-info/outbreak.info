<template>
<div class="d-flex flex-column text-left" v-if="data">
  <!-- title -->
  <h3 class="d-flex align-item-center m-0 mb-4">
    <span class="font-weight-bold text-highlight mr-2" v-if="retractionText">RETRACTED: </span>
    <b>{{ data.name }}</b>
  </h3>

  <!-- retraction notice -->
  <div v-if="retractionText">
    <Warning :animate="true" class="w-100 mb-2 fa-lg" :text="retractionText"> </Warning>
  </div>

  <!-- authors -->
  <div class="author-container d-flex flex-wrap align-items-center my-2" v-if="data.author || data.creator">
    <template v-if="data.author && (data.author.length || data.author.name)">
      <template v-if="Array.isArray(data.author)">
        <div class="author font-weight-bold fa-lg line-height-1" v-for="(author, idx) in data.author" :key="'author2'+idx" id="authors">
          <span>{{
            author.name
              ? author.name
              : (author.givenName ? author.givenName + " " + author.familyName : "")
          }}</span>
          <span v-if="idx < data.author.length - 2" v-html="',&nbsp;'"></span>
          <span v-if="idx == data.author.length - 2 && data.author.length == 2" v-html="'&nbsp;and&nbsp;'"></span>
          <span v-if="idx == data.author.length - 2 && data.author.length > 2" v-html="',&nbsp;and&nbsp;'"></span>
        </div>
      </template>
      <div class="author font-weight-bold fa-lg line-height-1" v-else id="authors">
        <span>{{
            data.author.name
              ? data.author.name
              : ( data.author.givenName ? data.author.givenName + " " + data.author.familyName : "")
          }}</span>
      </div>

      <a @click.prevent="showAffiliation = !showAffiliation" href=""><small class="text-muted ml-2">
          <span>{{
              showAffiliation ? "hide affiliations" : "view affiliations"
            }}</span>
          <font-awesome-icon :icon="['fas', 'angle-double-down']" class="mx-1" v-if="!showAffiliation" />
          <font-awesome-icon :icon="['fas', 'angle-double-up']" class="mx-1" v-if="showAffiliation" />
        </small>
      </a>

      <div id="author-affiliations" class="d-flex flex-column w-100 mb-3" v-if="showAffiliation && Array.isArray(data.author)">
        <small v-for="(author, idx) in data.author" :key="'author3' +idx" class="text-muted">
          <b>{{
              author.name
                ? author.name
                : (author.givenName ? author.givenName + " " + author.familyName : "")
            }}</b>:
          <template v-if="Array.isArray(author.affiliation)">
            <span v-for="(affiliation, idx) in author.affiliation" :key="'author'+idx">{{ affiliation.name }}</span>
          </template>
          <template v-else>
            <span>{{ author.affiliation.name }}</span>
          </template>
        </small>
      </div>

      <div id="author-affiliations" class="d-flex flex-column w-100 mb-3" v-else-if="showAffiliation">
        <small class="text-muted">
          <b>{{
              data.author.name
                ? data.author.name
                : (data.author.givenName ? data.author.givenName + " " + data.author.familyName : "")
            }}</b>:
          <template v-if="Array.isArray(data.author.affiliation)">
            <span v-for="(affiliation, idx) in data.author.affiliation" :key="'affiliation'+idx">{{ affiliation.name }}</span>
          </template>
          <template v-else>
            <span>{{ data.author.affiliation.name }}</span>
          </template>
        </small>
      </div>
    </template>

    <template v-else-if="data.creator">
      <div class="creator" v-for="(creator, idx) in data.creator" :key="'creator'+idx" id="authors">
        <span>{{
            creator.name
              ? creator.name
              : (creator.givenName ? creator.givenName + " " + creator.familyName : "")
          }}</span>
        <span v-if="idx < data.creator.length - 2" v-html="',&nbsp;'"></span>
        <span v-if="idx == data.creator.length - 2 && !data.creator.length == 2" v-html="',&nbsp;and&nbsp;'"></span>
        <span v-if="idx == data.creator.length - 2 && data.creator.length == 2" v-html="'&nbsp;and&nbsp;'"></span>
      </div>

      <a @click.prevent="showAffiliation = !showAffiliation" href=""><small class="text-muted ml-2">
          <span>{{
              showAffiliation ? "hide affiliations" : "view affiliations"
            }}</span>
          <font-awesome-icon :icon="['fas', 'angle-double-down']" class="mx-1" v-if="!showAffiliation" />
          <font-awesome-icon :icon="['fas', 'angle-double-up']" class="mx-1" v-if="showAffiliation" />
        </small>
      </a>

      <div id="creator-affiliations" class="d-flex flex-column w-100 mb-3" v-if="showAffiliation">
        <small v-for="(creator, idx) in data.creator" :key="'affiliation2' + idx" class="text-muted">
          <b>{{
              creator.name
                ? creator.name
                : (creator.givenName ? creator.givenName + " " + creator.familyName : "")
            }}</b>:
          <template v-if="Array.isArray(creator.affiliation)">
            <span v-for="(affiliation, idx) in creator.affiliation" :key="'affiliation3'+idx">{{ affiliation.name }}</span>
          </template>
          <template v-else>
            <span>{{ creator.affiliation }}</span>
          </template>
        </small>
      </div>
    </template>
  </div>
  <div class="sponsor text-muted" v-if="data.sponsor" id="sponsor">
    sponsored by <span v-for="(sponsor, idx) in data.sponsor" :key="idx">
      {{sponsor.name}}
      <!-- <span v-if="sponsor.role"> ({{sponsor.role}})</span> -->
      <span v-if="idx < data.sponsor.length - 1">,&nbsp;</span>
    </span>
  </div>

  <!-- mini-citation -->
  <div v-if="data['@type'] && data['@type'] == 'Publication'" class="text-muted fa-lg line-height-1 mb-4">
    <span v-if="data.journalName" class="font-italic">{{data.journalName}}</span>
    <span v-else-if="data.journalAbbreviation" class="font-italic">{{data.journalAbbreviation}}</span>
    <span v-if="data.volumeNumber">, volume {{data.volumeNumber}}</span>
    <span v-if="data.issueNumber">, issue {{data.issueNumber}}</span>
  </div>

  <!-- dates -->
  <div id="dates">
    <div v-if="
        data.dateModified ||
          data.dateCreated ||
          data.dataUpdated ||
          data.datePublished ||
            data.curatedBy.curationDate ||
          data.curatedBy.versionDate" class="text-muted">

      <span class="badge bg-grey__lightest" v-if="data.dateModified">
        <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
        updated {{ this.formatDate(data.dateModified) }}
      </span>

      <span v-if="data.datePublished && data.dateModified
        " class="mx-1">&bull;</span>
      <span class="badge bg-grey__lightest" v-if="data.datePublished">
        <font-awesome-icon class="mr-1" :icon="['far', 'clock']" v-if="!data.dateModified" />
        published {{ this.formatDate(data.datePublished) }}
      </span>

      <span v-if="data.dateCreated && (data.datePublished || data.dateModified)" class="mx-1">&bull;</span>

      <span class="badge bg-grey__lightest" v-if="data.dateCreated">
        <font-awesome-icon class="mr-1" :icon="['far', 'clock']" v-if="!data.datePublished && !data.dateModified" />
        created {{ this.formatDate(data.dateCreated) }}
      </span>

      <span v-if="data.curatedBy && data.curatedBy.versionDate && (data.dateCreated || data.datePublished || data.dateModified)" class="mx-1">&bull;</span>
      <span class="badge bg-grey__lightest" v-if="data.curatedBy && data.curatedBy.versionDate">
        version {{ this.formatDate(data.curatedBy.versionDate) }}
      </span>

      <span v-if="data.curatedBy && data.curatedBy.curationDate && (data.dateCreated || data.datePublished || data.dateModified ||  data.curatedBy.versionDate )" class="mx-1">&bull;</span>
      <span class="badge bg-grey__lightest" v-if="data.curatedBy && data.curatedBy.curationDate">
        accessed {{ this.formatDate(data.curatedBy.curationDate) }}
      </span>
    </div>
  </div>

  <!-- source -->
  <div class="mt-1 mb-1" v-if="data.curatedBy">
    <small>Record provided by
      <a :href="data.curatedBy.url" target="_blank" rel="noreferrer">{{ data.curatedBy.name }}<img v-if="getLogo(data.curatedBy.name)" :src="require(`@/assets/resources/${getLogo(data.curatedBy.name)}`)" alt="data.curatedBy.name" width="auto"
          height="25" class="ml-1 mr-4" />
      </a>
      <router-link :to="{ name: 'Sources' }" aria-label="Learn more about data sources">Learn more</router-link>
    </small>
  </div>

  <ClinicalTrialSummary :data="data" v-if="type == 'ClinicalTrial'" />

  <!-- topics -->
  <div class="keyword-container flex flex-wrap align-items-center mt-4">
    <template v-if="data.topicCategory">
      <span class="text-muted mr-2">Topics: </span>
      <template v-if="Array.isArray(data.topicCategory)">
        <small class="topic px-2 py-1 mb-1 mr-1" v-for="(topic, idx) in data.topicCategory" :key="idx" :data-tippy-info="`search ${topic}`">
          <router-link :to="{
        name: 'Resources',
        query: { q: `&quot;${topic}&quot;` }
      }" class="no-underline">
            {{ topic }}
          </router-link>
        </small>
      </template>

      <small class="topic uppercase px-2 py-1 mb-1 mr-1" :data-tippy-info="`search ${data.topicCategory}`" v-else>
        <router-link :to="{
        name: 'Resources',
        query: { q: `&quot;${data.topicCategory}&quot;` }
      }" class="no-underline">
          {{ data.topicCategory }}
        </router-link>
      </small>
</template>
</div>

    <!-- keywords -->
    <div class="keyword-container flex flex-wrap mt-2" v-if="data.keywords">
      <span class="text-muted mr-2">Keywords: </span>
      <div v-for="(keyword, idx) in data.keywords" :key="'keyword'+idx" class="mb-1 mr-1">
        <small class="keyword px-2 py-1" v-if="keyword != ''" :data-tippy-info="`search ${keyword}`">
          <router-link :to="{
              name: 'Resources',
              query: { q: `&quot;${keyword}&quot;` }
            }" class="no-underline text-dark">
            {{ keyword }}
          </router-link>
        </small>
      </div>
    </div>

  <!-- description -->
  <div class="mt-5" id="description">
    <div v-html="data.description" v-if="data.description"></div>
    <div v-html="data.abstract" v-else-if="data.abstract"></div>
    <div v-else>
      <h6 class="m-0 text-muted">Description</h6>
      <small class="text-muted">not provided</small>
    </div>

  </div>
</div>
</template>

<script lang="js">
import Vue from "vue";

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

import {
  timeFormat,
  timeParse
} from "d3";

import {
  mapState
} from "vuex";

import {
  getResourceMetadata
} from "@/api/resources.js";

import ClinicalTrialSummary from "@/components/ClinicalTrialSummary.vue";
import Warning from "@/components/Warning.vue";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faClock
} from "@fortawesome/free-regular-svg-icons";
import {
  faAngleDoubleDown,
  faAngleDoubleUp
} from "@fortawesome/free-solid-svg-icons";

library.add(faClock, faAngleDoubleDown, faAngleDoubleUp);

export default Vue.extend({
  name: "ResourceDescription",
  props: {
    data: Object,
    type: String
  },
  components: {
    ClinicalTrialSummary,
    Warning,
    FontAwesomeIcon
  },
  data() {
    return ({
      showAffiliation: false
    })
  },
  methods: {
    getLogo(curator) {
      const source = this.resources.flatMap(d => d.sources).filter(d => d.id === curator.toLowerCase() || d.name.toLowerCase() === curator.toLowerCase());
      return source.length == 1 ? source[0].img : null;
    },
    formatDate(dateStr) {
      const parseDate = timeParse("%Y-%m-%d");
      const strictIsoParse = timeParse("%Y-%m-%dT%H:%M:%S.%f");
      const formatDate = timeFormat("%d %B %Y");
      if (dateStr) {
        let parsed = parseDate(dateStr);
        if (parsed) {
          return formatDate(parsed)
        } else {
          parsed = strictIsoParse(dateStr);
          return parsed ? formatDate(parsed) : null;
        }
      } else {
        return (null)
      }
    }
  },
  computed: {
    ...mapState("admin", ["loading", "resources"]),
    datePublished: function() {
      return (this.formatDate(this.data.dateModified))
    },
    retractionText() {
      if (this.data.correction && this.data.correction.some(d => d.correctionType == "retraction in")) {
        const retraction = this.data.correction.filter(d => d.correctionType == "retraction in")
        const retractionLink = retraction.map(d => `<a class="text-white" href="${d.url}" target="_blank">Retraction Notice </a>`);
        return (`This ${this.data['@type']} has been retracted. <span class="ml-3">View ${retractionLink}</span>`)
      }
      if (this.data.correction && this.data.correction.some(d => d.correctionType == "retraction of")) {
        const retraction = this.data.correction.filter(d => d.correctionType == "retraction of");
        const retractionLink = retraction.map(d => `<a class="text-white" href="${d.url}" target="_blank">${d.identifier.toUpperCase()} </a>`);
        return (`Retraction of ${retractionLink}`)
      }
      if (this.data.publicationType && this.data.publicationType.includes("Retracted Publication")) {
        return (`This ${this.data['@type']} has been retracted.`)
      } else {
        return (null)
      }
    }
  },
  mounted() {
    const id = this.$route.params.id;

    // console.log(this.data)

    tippy(".topic", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });

    tippy(".keyword", {
      content: "Loading...",
      maxWidth: "200px",
      placement: "bottom",
      animation: "fade",
      theme: "light",
      onShow(instance) {
        let info = instance.reference.dataset.tippyInfo;
        instance.setContent(info);
      }
    });
  }
});
</script>

<style lang="scss" scoped>
.resource-type {
    font-weight: 700;
    text-transform: uppercase;
    opacity: 0.7;
}

.pub-type {
    opacity: 0.6;
}

.topic {
    background: $warning-color;
    color: white;
    border-radius: 5px;
    white-space: nowrap;
    & a {
        color: white;
    }
}

.keyword-container {
    display: flex;
    min-width: 0;
}

.keyword {
    background: lighten($warning-color, 35%);
    border-radius: 5px;
    white-space: nowrap;
}

.pub-type {
    opacity: 0.6;
}

.helper {
    line-height: 1.2em;
}

.section-header {
    text-transform: uppercase;
}
</style>
