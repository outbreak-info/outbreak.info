<template>
<div class="container d-flex py-2">
  <div class="row w-100 m-0">
    <div class="col-md-9 my-3">
      <div class="d-flex flex-column text-left">
        <div class="Analysis">
          <!-- <StripeAccent :height="20" :width="4" className="Analysis" /> -->
          Analysis
        </div>
        <!-- title -->
        <h4 class="d-flex align-datas-center m-0 mb-2">
          {{data.name}}
        </h4>
        <!-- authors -->
        <div class="author-container d-flex flex-wrap">
          <div class="author" v-for="(author, idx) in data.author" :key="idx">
            <span>{{author.name ? author.name : author.givenName + " " + author.familyName}}</span>
            <span v-if="idx < data.author.length - 2" v-html="',&nbsp;'"></span>
            <span v-if="idx == data.author.length - 2  && !data.author.length == 2" v-html="',&nbsp;and&nbsp;'"></span>
            <span v-if="idx == data.author.length - 2 && data.author.length == 2" v-html="'&nbsp;and&nbsp;'"></span>
          </div>
          <a @click.prevent="showAffiliation=!showAffiliation" href=""><small class="text-muted ml-2">
              <span>{{showAffiliation ? 'hide affiliations' : 'view affiliations'}}</span>
              <i class="fas fa-angle-double-down mx-1" v-if="!showAffiliation"></i>
              <i class="fas fa-angle-double-up mx-1" v-if="showAffiliation"></i>
            </small>
          </a>
        </div>
        <!-- Citation -->
        <small class="text-muted">
          <i class="far fa-clock"></i>
          <span v-if="data.dateModified"> updated {{this.formatDate(data.dateModified)}}
          </span>
          <span v-if="data.dateModified && data.datePublished">&bull;</span>
          <span v-if="data.datePublished">
            published {{this.formatDate(data.datePublished)}}
          </span>
          <span v-if="data.dateModified && data.dateCreated || data.datePublished && data.dateCreated ">&bull;</span>
          <span v-if="data.dateCreated">
            created {{this.formatDate(data.dateCreated)}}
          </span>
        </small>

        <!-- keywords -->
        <div class="keyword-container mt-2">
          <small class="keyword px-2 py-1 mt-1 mr-1" v-for="(keyword, idx) in data.keywords" :key="idx"> {{keyword}}</small>
        </div>
        <!-- source -->
        <div class="keyword-container mt-2">
          <small>Record provided by <a href="https" target="_blank" rel="noreferrer">Virological.org</a></small>
        </div>
        <!-- description -->
        <div class="mt-4" v-html="data.description">
        </div>
      </div>

    </div>

    <!-- RIGHT SIDE -->
    <div class="col-md-3 my-3">
      <ResourceSidebar :doi="data.doi" :date="datePublished" :url="data.url" type="Analysis" v-if="data" />
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
  methods: {
    formatDate(dateStr) {
      const parseDate = timeParse("%Y-%m-%d");
      const formatDate = timeFormat("%d %B %Y");
      return formatDate(parseDate(dateStr));
    }
  },
  computed: {
    datePublished: function() {
      return (this.formatDate(this.data.dateModified))
    }
  },
  data() {
    return {
      showAffiliation: false,
      data: {
          _id: "virological1",
          descriptionExpanded: false,
          type: "Analysis",
          url: "http://virological.org/t/preliminary-in-silico-assessment-of-the-specificity-of-published-molecular-assays-and-design-of-new-assays-using-the-available-whole-genome-sequences-of-2019-ncov/343",
          name: "Preliminary in silico assessment of the specificity of published molecular assays and design of new assays using the available whole genome sequences of 2019-nCoV",
          author: [{
            name: "Mitchell Holland",
            affiliation: "Noblis, Reston, VA 20191"
          }, {
            name: "Daniel Negrón",
            affiliation: "Noblis, Reston, VA 20191"
          }],
          mainEntity: "http://virological.org/",
          dateCreated: "2020-01-24",
          dateModified: "2020-03-29",
          lastReviewed: "2020-04-01",
          relatedTo: ["http://virological.org/t/initial-assessment-of-the-ability-of-published-coronavirus-primers-sets-to-detect-the-wuhan-coronavirus/321Source"],
          analysisTechnique: "Whole Genome Sequencing",
          variableMeasured: "", // something similiar?
          keywords: ["Whole Genome Sequencing", "Assay Design"],
          infectiousAgent: "SARS-CoV-2",
          description: "BioLaboro is an application for rapidly designing de novo assays and validating existing PCR detection assays. It is a user-friendly new assay discovery pipeline composed of three tools: BioVelocity®, Primer3, and PSET. BioVelocity® uses a rapid, accurate hashing algorithm to align sequencing reads to a large set of references (e.g. Genbank) (Sozhamannan et al., 2015). BioVelocity® creates a k-mer index to determine all possible matches between query sequences and references simultaneously using a large RAM system (i.e. an IBM Power8). This algorithm makes it possible to very quickly identify sequences conserved within or omitted from a set of target references. Primer3 (http://primer3.sourceforge.net/ 29) is a tool for designing primers and probes for real-time PCR reactions. It considers a range of criteria such as oligonucleotide melting temperature, size, GC content, and primer-dimer possibilities. We use Primer3 along with our signature detection process to identify potential new primer sets. PSET (PCR Signature Erosion Tool) tests PCR assays in silico against the latest versions of public sequence repositories, or other reference datasets, to determine if primers and probes match only to their intended targets. Using this information, an assay provider can be better aware of potential false hits and be better prepared to design new primers when false hits become intractable.",
        }

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

.keyword {
    background: lighten($warning-color, 35%);
    border-radius: 5px;
}
</style>
