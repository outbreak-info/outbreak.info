<template>
<div class="container d-flex py-2">
  <div class="row w-100 m-0">
    <div class="col-md-9 my-3">
      <div class="d-flex flex-column text-left">
        <div class="Publication">
          <!-- <StripeAccent :height="20" :width="4" className="Publication" /> -->
          Publication <span class="pub-type mx-2" v-if="data.publicationType[0]">
            <!-- <span class="mx-1">•</span> -->
            {{data.publicationType[0]}}
          </span>
        </div>
        <!-- title -->
        <h4 class="d-flex align-items-center m-0 mb-2">
          {{data.name}}
        </h4>
        <!-- authors -->
        <div class="author-container d-flex flex-wrap">
          <div class="author" v-for="(author, idx) in data.author" :key="idx">
            <span>{{author.name ? author.name : author.givenName + " " + author.familyName}}</span>
            <span v-if="idx < data.author.length - 2" v-html="',&nbsp;'"></span>
            <span v-if="idx == data.author.length - 2" v-html="',&nbsp;and&nbsp;'"></span>
          </div>
          <a @click.prevent="showAffiliation=!showAffiliation" href=""><small class="text-muted ml-2">
              <span>{{showAffiliation ? 'hide affiliations' : 'view affiliations'}}</span>
              <i class="fas fa-angle-double-down mx-1" v-if="!showAffiliation"></i>
              <i class="fas fa-angle-double-up mx-1" v-if="showAffiliation"></i>
            </small>
          </a>
        </div>
        <!-- publication -->
        <div class="text-muted">
          {{data.journalName}}, volume {{data.volumeNumber}}, {{datePublished}}
        </div>

        <!-- keywords -->
        <div class="keyword-container mt-2">
          <small class="keyword px-2 py-1 mt-1 mr-1" v-for="(keyword, idx) in data.keywords" :key="idx"> {{keyword}}</small>
        </div>
        <!-- abstract -->
        <div class="mt-4" v-html="data.abstract">
        </div>
      </div>

    </div>

    <!-- RIGHT SIDE -->
    <div class="col-md-3 my-3">
      <ResourceSidebar :doi="data.doi" :date="datePublished" :url="data.url" type="Publication" v-if="data" />
    </div>

  </div>
</div>
</template>


<script>
import StripeAccent from "@/components/StripeAccent.vue";
import ResourceSidebar from "@/components/ResourceSidebar.vue";

import {
  timeFormat,
  timeParse
} from "d3";

export default {
  name: "Resources",
  components: {
    ResourceSidebar
    // StripeAccent
  },
  methods: {},
  computed: {
    datePublished: function() {
      const parseDate = timeParse("%Y-%m-%d");
      const formatDate = timeFormat("%d %B %Y")
      return (formatDate(parseDate(this.data.datePublished)))
    }
  },
  data() {
    return {
      showAffiliation: false,
      data: {
        _id: "nejm1",
        type: "Publication",
        descriptionExpanded: false,
        url: "http://doi.org/10.1056/NEJMc2007942",
        name: "Stability and Viability of SARS-CoV-2",
        identifier: "1533-4406",
        doi: "10.1056/NEJMc2007942",
        pmid: "32283575",
        datePublished: "2020-04-13",
        journalName: "The New England journal of medicine",
        journalNameAbbrev: "N Engl J Med.",
        volumeNumber: 382,
        publicationType: ["Letter", "Comment"],
        abstract: "The letter by van Doremalen et al. (published March 17 at NEJM.org)1 provides important information on the viability of severe acute respiratory syndrome coronavirus 2 (SARS-CoV-2, the virus that causes Covid-19), and the implication that the virus remains viable in aerosols is likely to influence infection-control practices. The authors used a three-jet Collison nebulizer to generate artificial particles that, because of their small size (<5 μm), remained suspended in aerosols. However, the authors did not provide data to support the choice of particle size or viral inoculum.",
        author: [{
            "familyName": "Rubens",
            "givenName": "Jessica H",
            "affiliation": "Johns Hopkins Hospital, Baltimore, MD sjain5@jhmi.edu."
          },
          {

            "familyName": "Karakousis",
            "givenName": "Petros C",
            "Initials": "PC",
            "affiliation": "Johns Hopkins Hospital, Baltimore, MD sjain5@jhmi.edu."
          },
          {

            "familyName": "Jain",
            "givenName": "Sanjay K",
            "Initials": "SK",
            "affiliation": "Johns Hopkins Hospital, Baltimore, MD sjain5@jhmi.edu."
          }
        ],
        keywords: ["prevention"],
        topicCategory: ["prevention"],
        relatedTo: ["random paper 1", "random paper 2"]
      },

    };
  }
}
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

.helper {
    line-height: 1.2em;
}

.section-header {
    text-transform: uppercase;
}

.keyword {
    background: lighten($warning-color, 35%);
    border-radius: 5px;
}
</style>
