<template>
<div class="">

  <section class="d-flex justify-content-center align-items-center bg-grag-main text-light py-5">
    <div class="row m-0 w-100">
      <div class="col-sm-12 m-auto">
        <h4>COVID-19 and SARS-CoV-2 datasets, analyses, and resources</h4>
      </div>
    </div>
  </section>

  <section class="d-flex py-2">
    <div class="row m-0 w-100">
      <div class="col-sm-12 col-md-7">
        <form autocomplete="off">
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text bg-grey text-muted border-0" id="sb"><i class="fas fa-search"></i></span>
            </div>
            <input id="sBar" class="form-control border-0" :placeholder="placeholder" aria-label="search" aria-describedby="sb" type="text" v-model="search" @input="onChange" @keydown.down="onArrowDown" @keydown.up="onArrowUp"
              @keydown.enter.prevent="onEnter" @keydown.delete="onBackspace" @keydown.ctrl.65="onSelectAll" @keydown.meta.65="onSelectAll" />
            <ul id="autocomplete-results" v-show="isOpen" class="autocomplete-results bg-dark text-light">
              <li class="loading" v-if="isLoading">
                Loading results...
              </li>
              <li v-else v-for="(result, i) in results" :key="i" @click="setResult(result)" class="autocomplete-result" :class="{ 'is-active': i === arrowCounter }">
                {{ result.label }}
              </li>
            </ul>
          </div>
        </form>
        <div>
          <router-link :to="{ name: 'Sources' }">Where do we get our data?</router-link>
        </div>
        <div>
          <router-link :to="{ name: 'Contributing' }">Contributing a source</router-link>
        </div>


      </div>
      <div class="col-sm-12 col-md-5">
        <h5 class="border-section">What's new</h5>
        <table id='whats-new'>
          <tbody>
            <div v-for="(item, idx) in data" :key="idx">
              <tr class="new-item" v-if="idx < new2Display">
                <td class="resource-type d-flex align-items-center" :class="item.type">
                  <svg width="8" height="25" class="mr-1">
                    <rect width="8" height="25" x="0" y="0" :class="[item.type, 'light']"></rect>
                    <polygon points="8,6 8,12 0,20 0,12" :class="item.type"></polygon>
                    <polygon points="0,0 8,0 8,6 0,12" :class="[item.type, 'dark']"></polygon>
                  </svg>
                  {{item.type}}
                </td>
                <td class="resource-name text-left" valign="top">{{item.name}}</td>
                <td class="resource-affiliation text-left" valign="top">{{item.author[0].name}}</td>
                <td class="resource-date" valign="top">{{format(item.dateModified)}}</td>

              </tr>

            </div>
          </tbody>
        </table>
        <router-link :to="{ name: 'Contributing' }">subscribe to updates</router-link>
      </div>
    </div>
  </section>

  <section class="d-flex justify-content-end py-2">
    <div class="row d-flex justify-content-center w-100">
      <nav class="navbar navbar-expand-lg navbar-dark">
        <ul class="navbar-nav">
          <li class="nav-item" v-for="(resource, idx) in resourceTypes" :key="idx">
            {{resource}}
          </li>
        </ul>
      </nav>
    </div>
  </section>

  <section class="d-flex justify-content-end py-2">
    <div class="row w-100">
      <div class="col-sm-3 filters">
        filters
      </div>
      <div class="col-sm-9" id="results">

      </div>
    </div>
  </section>

</div>
</template>

<script>
import {
  timeFormat,
  timeParse
} from "d3";
export default {
  name: "App",
  methods: {
    format: function(dateStr) {
      const parsed = timeParse("%Y-%m-%d")(dateStr);
      return (timeFormat("%d %B")(parsed));
    }
  },
  mounted() {
    this.data.sort((a, b) => a.date > b.date ? 1 : -1);
  },
  data() {
    return {
      resourceTypes: ["What's New", "Datasets", "Publications", "Analyses", "Protocols"],
      new2Display: 3,
      data: [{
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
          relatedTo: ["http://virological.org/t/initial-assessment-of-the-ability-of-published-coronavirus-primers-sets-to-detect-the-wuhan-coronavirus/321Source 70"],
          analysisTechnique: "Whole Genome Sequencing",
          variableMeasured: "", // something similiar?
          keywords: [],
          infectiousAgent: "SARS-CoV-2",
          description: "BioLaboro is an application for rapidly designing de novo assays and validating existing PCR detection assays. It is a user-friendly new assay discovery pipeline composed of three tools: BioVelocity®, Primer3, and PSET. BioVelocity® uses a rapid, accurate hashing algorithm to align sequencing reads to a large set of references (e.g. Genbank) (Sozhamannan et al., 2015). BioVelocity® creates a k-mer index to determine all possible matches between query sequences and references simultaneously using a large RAM system (i.e. an IBM Power8). This algorithm makes it possible to very quickly identify sequences conserved within or omitted from a set of target references. Primer3 (http://primer3.sourceforge.net/ 29) is a tool for designing primers and probes for real-time PCR reactions. It considers a range of criteria such as oligonucleotide melting temperature, size, GC content, and primer-dimer possibilities. We use Primer3 along with our signature detection process to identify potential new primer sets. PSET (PCR Signature Erosion Tool) tests PCR assays in silico against the latest versions of public sequence repositories, or other reference datasets, to determine if primers and probes match only to their intended targets. Using this information, an assay provider can be better aware of potential false hits and be better prepared to design new primers when false hits become intractable.",
        },
        {
          type: "Analysis",
          url: "https://covid19.healthdata.org/projections",
          name: "COVID-19 U.S. State by State Projections",
          author: [{
            name: "Institute for Health Metrics and Evaluation",
            affiliation: "University of Washington"
          }, {
            name: "Daniel Negrón",
            affiliation: "Noblis, Reston, VA 20191"
          }],
          mainEntity: "https://covid19.healthdata.org/",
          dateCreated: "2020-03-30",
          dateModified: "2020-03-31",
          lastReviewed: "2020-04-01",
          analysisTechnique: "Whole Genome Sequencing",
          isPartOf: "http://www.healthdata.org/research-article/forecasting-covid-19-impact-hospital-bed-days-icu-days-ventilator-days-and-deaths",
          variableMeasured: "", // something similiar?
          keywords: [],
          infectiousAgent: "SARS-CoV-2",
          description: "The charts below show projected hospital resource use based on COVID-19 deaths. The model assumes continued social distancing until the end of May 2020. In locations without social distancing measures currently in place, we have assumed they will be in place within seven days of the last model update. If not, the number of deaths and burden on their hospital systems will likely be higher than the model predicts.",
        },

        {
          type: "Dataset",
          name: "Novel Coronavirus (COVID-19) Cases",
          author: [{
            name: "Johns Hopkins University"
          }],
          dateCreated: "2020-01-22",
          dateModified: "2020-04-01",
          lastReviewed: "2020-04-01",
        }
      ]
    };
  }
}
</script>

<style lang="scss" scoped>
.nav-item {
    padding-right: 1rem;
    padding-left: 1rem;
}

// table
.resource-type {
    font-size: 1em;
    font-weight: 700;
    text-transform: uppercase;
    opacity: 0.7;
    width: 90px;
}

.resource-date {
    width: 80px;
}

.resource-affiliation {
    width: 150px;
}

#whats-new td {
    padding-left: 5px;
    padding-right: 5px;
    padding-bottom: 10px;
    font-size: 0.9em;
    line-height: 1em;
}
.Analysis {
    color: #D13B62;
    fill: #D13B62;
}

.Analysis.light {
    fill: #eeb7c5;
}

.Analysis.dark {
    fill: #9b2443;
}

.Dataset {
    color: #126B93;
    fill: #126B93;
}
.Dataset.dark {
    fill: #11537A;
}

.Dataset.light {
    fill: lighten(#507192, 10%);
}

.filters {
    background: lighten(yellow, 35%);
}
</style>
