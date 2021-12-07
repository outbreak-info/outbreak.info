
<template>
<div class="d-flex py-2 m-2">
  <!-- loading -->
  <div v-if="loading" class="loader">
    <font-awesome-icon class="fa-pulse fa-4x text-highlight" :icon="['fas', 'spinner']" />
  </div>

  <div class="row w-100 m-0" v-if="data">

    <div class="col-sm-12 text-left">

      <!-- mini-nav for resource types -->
      <section class="d-flex justify-content-end w-100 bg-grey__lighter my-4">
        <div class="row d-flex justify-content-center w-100">
          <nav class="navbar navbar-expand-lg navbar-dark">
            <ul class="navbar-nav">
              <li class="nav-item text-light mr-4" v-for="(anchor, idx) in anchorsArr" :key="idx">
                <router-link class="nav-link no-underline p-0" :to="`#${anchor.replace(' ', '_')}`">
                  {{ anchor }}
                </router-link>
              </li>
            </ul>
          </nav>
        </div>
      </section>

      <!-- type label -->
      <div :class="type.replace(/\s/g, '')" v-if="type">
        <!-- <StripeAccent :height="20" :width="4" :className="type" /> -->
        {{ type }}
        <span class="pub-type mx-3" v-if="data.publicationType && data.publicationType[0]">
          <template v-if="Array.isArray(data.publicationType)">
            <span v-for="(pub, idx) in data.publicationType" :key="idx">{{ pub }}<span v-if="idx < data.publicationType.length - 1" class="mx-2">&bull;</span></span>

          </template>
          <template v-else>{{ data.publicationType }}</template>
        </span>
      </div>

    </div>

    <div class="col-md-9 my-3 pr-5">

      <!-- description -->
      <ResourceDescription :data="data" :type="type" class="border-bottom pb-3" />

      <!-- special clinical trials description -->
      <ClinicalTrialDescription :data="data" v-if="type == 'ClinicalTrial'" />

      <div class="mr-5">
        <!-- downloads -->
        <div id="downloads" class="text-left border-bottom text-muted py-3 my-3" v-if="anchorsArr.includes('downloads')">
          <h6 class="m-0">Downloads</h6>
          <ul v-if="data.distribution" id="download-list">
            <li v-for="(item, idx) in data.distribution" :key="idx">
              <a :href="item.contentUrl" target="_blank" rel="noreferrer">
                {{ item.name ? item.name : item.contentUrl }}
              </a>
            </li>
          </ul>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>


        <!-- funding info -->
        <div id="funder" class="text-left border-bottom text-muted py-3 mb-3" v-if="anchorsArr.includes('funder')">
          <h6 class="m-0">Funder</h6>
          <div v-if="data.funding || data.funder">
            <div v-if="data.funding">
              <ul>
                <template v-if="Array.isArray(data.funding)">
                  <li v-for="(funding, idx) in data.funding" :key="idx" class="mb-3">
                    <template v-if="Array.isArray(funding.funder)">
                      <div v-for="(funder, idx) in funding.funder" :key="idx">
                        <b v-if="funder.name">{{funder.name}}</b>
                        <span v-if="funder.name && funding.identifier">:&nbsp;</span>
                        <span v-if="funding.identifier">{{funding.identifier}}</span>
                        <span v-if="funder.role"> ({{funder.role}})</span>
                      </div>
                    </template>

                    <template v-else>
                      <div class="m-0">
                        <b v-if="funding.funder && funding.funder.name">{{funding.funder.name}}</b>
                        <span v-if="funding.funder && funding.funder.name && funding.identifier">:&nbsp;</span>
                        <span v-if="funding.identifier">{{funding.identifier}}</span>
                        <span v-if="funding.funder && funding.funder.role"> ({{funding.funder.role}})</span>
                      </div>
                    </template>
                    <div v-if="funding.description" class="line-height-1">
                      {{funding.description}}
                    </div>
                  </li>
                </template>
                <template v-else>
                  <li class="mb-3">
                    <template v-if="Array.isArray(data.funding.funder)">
                      <div v-for="(funder, idx) in data.funding.funder" :key="idx">
                        <b v-if="funder.name">{{funder.name}}</b>
                        <span v-if="funder.name && data.funding.identifier">:&nbsp;</span>
                        <span v-if="data.funding.identifier">{{data.funding.identifier}}</span>
                        <span v-if="funder.role"> ({{funder.role}})</span>
                      </div>
                    </template>

                    <template v-else>
                      <div class="m-0">
                        <b v-if="data.funding.funder && data.funding.funder.name">{{data.funding.funder.name}}</b>
                        <span v-if="data.funding.funder && data.funding.funder.name && data.funding.identifier">:&nbsp;</span>
                        <span v-if="data.funding.identifier">{{data.funding.identifier}}</span>
                        <span v-if="data.funding.funder && data.funding.funder.role"> ({{data.funding.funder.role}})</span>
                      </div>
                    </template>
                    <div v-if="data.funding.description" class="line-height-1">
                      {{data.funding.description}}
                    </div>
                  </li>
                </template>

              </ul>
            </div>
            <template v-if="data.funder">

              <template v-if="Array.isArray(data.funder)">
                <ul>
                  <li v-for="(funder, idx) in data.funder" :key="idx" class="mb-3">
                    <b v-if="funder.name">{{funder.name}}</b>
                    <span v-if="funder.name && funder.identifier">:&nbsp;</span>
                    <span v-if="funder.identifier">{{funder.identifier}}</span>
                    <span v-if="funder.role"> ({{funder.role}})</span>
                  </li>
                </ul>
              </template>

              <template v-else>
                <ul>
                  <li>
                    <b v-if="funder.name">{{funder.name}}</b>
                    <span v-if="funder.name && funder.identifier">:&nbsp;</span>
                    <span v-if="funder.identifier">{{funder.identifier}}</span>
                    <span v-if="funder.role"> ({{funder.role}})</span>
                  </li>
                </ul>
              </template>

            </template>
          </div>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>

        <!-- corrections -->
        <div id="corrections" class="text-left border-bottom text-muted py-1 my-3" v-if="anchorsArr.includes('corrections')">
          <h6 class="m-0">Corrections</h6>
          <ul v-if="data.correction" id="correction-list">
            <li v-for="(item, idx) in data.correction" :key="idx">
              <a :href="item.url" target="_blank" rel="noreferrer">
                {{ item.correctionType[0].toUpperCase() }}{{ item.correctionType.slice(1) }} {{item.identifier.toUpperCase()}}
              </a>
            </li>
          </ul>
          <div v-else>
            <small>none</small>
          </div>
        </div>

        <!-- license -->
        <div id="license" class="text-left border-bottom text-muted pb-3 mb-3" v-if="anchorsArr.includes('license')">
          <h6 class="m-0">License</h6>
          <div v-if="data.license">
            <a v-if="data.license.startsWith('http')" :href="data.license" target="_blank">{{ data.license }}
            </a>
            <span v-else v-html="data.license"></span>
          </div>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>

        <!-- based on -->
        <div id="based_on" class="text-left border-bottom text-muted pb-3 mb-3" v-if="anchorsArr.includes('based on')">
          <h6 class="m-0 mb-2">Based on</h6>
          <div v-if="data.isBasedOn && data.isBasedOn.length">
            <Citation :data="item" v-for="(item, idx) in data.isBasedOn" :key="idx" />
          </div>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>

        <!-- cited by -->
        <div id="cited_by" class="text-left border-bottom text-muted pb-3 mb-3" v-if="anchorsArr.includes('cited by')">
          <h6 class="m-0 mb-2">Cited by</h6>
          <div v-if="data.citedBy && data.citedBy.length">
            <Citation :data="item" v-for="(item, idx) in data.citedBy" :key="idx" />
          </div>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>

        <!-- related -->
        <div id="related" class="text-left border-bottom text-muted pb-3 mb-3" v-if="anchorsArr.includes('related')">
          <h6 class="m-0 mb-2">Related resources</h6>
          <div v-if="data.relatedTo && data.relatedTo.length">
            <Citation :data="item" v-for="(item, idx) in data.relatedTo" :key="idx" />
          </div>
          <div v-else>
            <small>not specified</small>
          </div>
        </div>


      </div>
    </div>
    <!-- RIGHT SIDE -->
    <div class="col-md-3 my-3">
      <ResourceSidebar :data="data" :date="dateModified" :type="data['@type']" v-if="data" />
    </div>
  </div>
  <!-- <div v-else class="min-height">
    Sorry, data on {{id}} is not found. Let us know at <a :href="`mailto:help@outbreak.info?subject=Missing metadata for id ${id}`" target="_blank">help@outbreak.info</a>
  </div> -->
</div>
</template>

<script lang="js">
import Vue from "vue";

import {
  timeFormat,
  timeParse
} from "d3";

import {
  mapState
} from "vuex";

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

import {
  getResourceMetadata
} from "@/api/resources.js";

import cloneDeep from "lodash/cloneDeep";

import ResourceDescription from "@/components/ResourceDescription.vue";
import ResourceSidebar from "@/components/ResourceSidebar.vue";
import ClinicalTrialDescription from "@/components/ClinicalTrialDescription.vue";
import Citation from "@/components/Citation.vue";

export default Vue.extend({
  name: "ResourcePage",
  components: {
    ResourceDescription,
    ResourceSidebar,
    ClinicalTrialDescription,
    Citation,
    FontAwesomeIcon
  },
  data() {
    return ({
      type: null,
      data: null,
      id: null,
      anchors: {
        default: ["authors", "description", "downloads", "license", "funder", "based on", "cited by", "related"],
        Publication: ["authors", "description", "funder", "corrections", "based on", "cited by", "related"],
        ClinicalTrial: ["authors", "description", "design", "interventions", "eligibility", "outcome", "status", "funder", "publications", "based on", "related"]
      }
    })
  },
  methods: {
    formatDate(dateStr) {
      const parseDate = timeParse("%Y-%m-%d");
      const formatDate = timeFormat("%d %B %Y");
      return dateStr ? formatDate(parseDate(dateStr)) : null;
    },
    getData(id) {
      this.resultsSubscription = getResourceMetadata(this.$resourceurl, id).subscribe(results => {
        this.data = results;

        this.type = this.data["@type"];
        this.dateModified = this.formatDate(this.data.date);
      })
    }
  },
  beforeRouteUpdate(to, from, next) {
    this.id = to.params.id;
    this.getData(to.params.id);
    next();
  },
  metaInfo() {
    var metadata = null;
    // Based on https://scholar.google.com/intl/en/scholar/inclusion.html#indexing
    // Dublin Core ref: https://www.dublincore.org/specifications/dublin-core/dcmi-terms/#section-4
    var citationTags = [];
    if (this.data) {
      metadata = cloneDeep(this.data);

      // phaseNumber causes problems
      if (metadata.studyDesign && metadata.studyDesign.phaseNumber) {
        delete metadata.studyDesign.phaseNumber;
      };
      // [null] will have problems embedding...
      metadata.citedBy = metadata.citedBy ? metadata.citedBy.filter(d => d) : null;

      metadata["includedInDataCatalog"] = {
        "@type": "DataCatalog",
        name: "outbreak.info",
        description: "During outbreaks of emerging diseases such as COVID-19, efficiently collecting, sharing, and integrating data is critical to scientific research. outbreak.info is a resource to aggregate all this information into a single location.",
        url: "https://outbreak.info/resources",
        publisher: {
          "@type": "Organization",
          name: "outbreak.info",
          url: "https://outbreak.info/"
        }
      }

      citationTags.push({
        title: "DC.type",
        content: this.data["@type"],
        vmid: "DC.type"
      });

      citationTags.push({
        title: "citation_title",
        content: this.data.name,
        vmid: "citation_title"
      });

      if (this.data.description) {
        citationTags.push({
          title: "DC.description",
          content: this.data.description,
          vmid: "DC.description"
        });
      }

      if (this.data.abstract) {
        citationTags.push({
          title: "DC.abstract",
          content: this.data.abstract,
          vmid: "DC.abstract"
        });
      }

      if (this.data.doi) {
        citationTags.push({
          title: "DC.identifier.DOI",
          content: this.data.doi,
          vmid: "DC.identifier.DOI"
        });
      }

      if (this.data.datePublished) {
        citationTags.push({
          title: "citation_publication_date",
          content: this.data.datePublished,
          vmid: "citation_publication_date"
        });
      }

      if (this.data.journalName) {
        citationTags.push({
          title: "citation_journal_title",
          content: this.data.journalName,
          vmid: "citation_journal_title"
        });
      }

      if (this.data.volumeNumber) {
        citationTags.push({
          title: "citation_volume",
          content: this.data.volumeNumber,
          vmid: "citation_volume"
        });
      }

      if (this.data.issueNumber) {
        citationTags.push({
          title: "citation_issue",
          content: this.data.issueNumber,
          vmid: "citation_issue"
        });
      }

      if (this.data.pagination) {
        citationTags.push({
          title: "citation_issue",
          content: this.data.issueNumber,
          vmid: "citation_issue"
        });
      }

      if (this.data.author) {
        if (Array.isArray(this.data.author)) {
          citationTags = citationTags.concat(this.data.author.map(d => {
            return ({
              title: "citation_author",
              content: d.name ? d.name : `${d.givenName} ${d.familyName}`,
              vmid: "citation_author"
            })
          }))
        } else {
          citationTags = citationTags.concat({
            title: "citation_author",
            content: this.data.author.name ? this.data.author.name : `${this.data.author.givenName} ${this.data.author.familyName}`,
            vmid: "citation_author"
          })
        }
      }

      if (this.data.creator) {
        citationTags = citationTags.concat(this.data.creator.map(d => {
          return ({
            title: "DC.creator",
            content: d.name ? d.name : `${d.givenName} ${d.familyName}`,
            vmid: "DC.creator"
          })
        }))
      }

    }

    if (metadata) {
      return {
        script: [{
          type: 'application/ld+json',
          json: metadata
        }],
        meta: citationTags
      }
    }
  },
  computed: {
    ...mapState("admin", ["loading"]),
    anchorsArr() {
      if (Object.keys(this.anchors).includes(this.type)) {
        return (this.anchors[this.type])
      }
      return (this.anchors["default"])
    }
  },
  mounted() {
    this.id = this.$route.params.id;

    this.getData(this.id);
  }
});
</script>

<style lang="scss" scoped>
.pub-type {
    opacity: 0.6;
}

.helper {
    line-height: 1.2em;
}

.section-header {
    text-transform: uppercase;
}
.min-height {
    min-height: 72vh;
}
</style>
