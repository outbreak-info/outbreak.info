<template>
<div class="container d-flex py-2">
  <div class="row w-100 m-0">
    <div class="col-md-9 my-3">
      <ResourceDescription :data="data" type="Analysis" />
    </div>

    <!-- RIGHT SIDE -->
    <div class="col-md-3 my-3">
      <ResourceSidebar :id="data['_id']" :doi="data.doi" :date="datePublished" :url="data.url" type="Analysis" v-if="data" />
    </div>

  </div>
</div>
</template>


<script>
import StripeAccent from "@/components/StripeAccent.vue";
import ResourceDescription from "@/components/ResourceDescription.vue";
import ResourceSidebar from "@/components/ResourceSidebar.vue";

import {
  timeFormat,
  timeParse
} from "d3";

export default {
  name: "Analysis",
  components: {
    ResourceDescription,
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
