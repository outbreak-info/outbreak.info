<template>
<div>
  <div class="bg-main__darker interest-banner border-top py-4">
    <h3 class="m-0 text-grey">SARS-CoV-2 (hCoV-19) Mutation Reports</h3>
    <h1 class="m-0 interest-header font-weight-bold">Variants &amp; Mutations We're Tracking</h1>
  </div>

  <div class="mb-1">
    <img src="@/assets/sars-virus.svg" alt="map" class="bg-image" />
    <div class="d-flex flex-column justify-content-center align-items-center my-3">
      <!-- <div class="d-flex w-75 justify-content-around align-items-center">
        <div class="text-left d-flex align-items-center my-3 border-top border-bottom py-2 px-2">
          Enabled by data from
          <a href="https://www.gisaid.org/" rel="noreferrer" target="_blank">
            <img src="@/assets/resources/gisaid.png" class="gisaid ml-2" alt="GISAID Initiative" />
          </a>
        </div>
      </div> -->



      <div class="w-75 mt-2 text-left">The <a href="https://cvisb.org/" rel="noreferrer" target="_blank">CViSB Team</a> at Scripps Research is tacking a series of variants and mutuations with evidence or potential to influence the transmissibility or
        severity of COVID-19 disease, or to change the efficacy of vaccine and therapeutics. Here's what we're currently following:
      </div>
      <div id="date-updated" class="mr-2">
        <small class="text-muted badge bg-grey__lightest mt-1" v-if="lastUpdated">
          <font-awesome-icon class="mr-1" :icon="['far', 'clock']" /> VOC/VOI/MOC/MOI updated {{ lastUpdated }}
        </small>
      </div>
      <section id="definitions" class="container my-3 py-3 border-top border-bottom">
        <div class="d-flex">
          <h5 class="mr-3">How we decide what to track</h5>
          <ul class="text-left">
            <li>
              We follow the Public Health Agencies in designating Variants of Concern and Interest. <router-link :to="{name: 'SituationReportCaveats', hash: '#variant'}">Learn more</router-link>
            </li>
            <li>
              We review our designations at least once a week.
            </li>
            <li>
              Suggest variants / mutations on <a href="https://github.com/outbreak-info/outbreak.info/issues" target="_blank">GitHub</a> or on our <a
                href="https://docs.google.com/spreadsheets/d/1uvKgF3h-DDDZPr3-e04D7UNnkFNGyE2QVbDMohkHKkQ/edit?usp=sharing" target="_blank">spreadsheet</a>.
            </li>
          </ul>
        </div>

        <div class="d-flex align-items-stretch text-left">
          <div class="w-25">
            <div class="d-flex flex-column  m-3 p-2 VOC">
              <h5 class="py-1 mb-0">Variant of Concern</h5>
              <div class="text-dark ml-3">
                <b>VOC</b> A genome with a set of mutations associated with an increase in <b>transmissibility</b>, <b>virulence</b>,and/or <b>decrease in vaccine/therapeutic efficacy</b>.
                <router-link :to="{name: 'SituationReportCaveats', hash: '#variant'}">View formal definition</router-link>
              </div>
            </div>
          </div>

          <div class="w-25">
            <div class="d-flex flex-column  m-3 p-2 VOI">
              <h5 class="py-1 mb-0">Variant of Interest</h5>
              <div class="text-dark ml-3">
                <b>VOI</b> A genome with a set of mutations which are increasing in prevalence, but whose evidence for biological change is still being investigated.
                <router-link :to="{name: 'SituationReportCaveats', hash: '#variant'}">View formal definition</router-link>
              </div>
            </div>
          </div>
          <div class="w-25">
            <div class="d-flex flex-column  m-3 p-2 MOC">
              <h5 class="py-1 mb-0">Mutation of Concern</h5>
              <div class="text-dark ml-3">
                <b>MOC</b> A mutation which has been linked to an increase in <b>transmissibility</b>, <b>virulence</b>,and/or <b>decrease in vaccine/therapeutic efficacy</b>.
                <router-link :to="{name: 'SituationReportCaveats', hash: '#variant'}">View formal definition</router-link>
              </div>
            </div>
          </div>
          <div class="w-25">
            <div class="d-flex flex-column  m-3 p-2 MOI">
              <h5 class="py-1 mb-0">Mutation of Interest</h5>
              <div class="text-dark ml-3">
                <b>MOI</b> A mutation in a biologically relevant region without conclusive evidence for virus changes.
                <router-link :to="{name: 'SituationReportCaveats', hash: '#variant'}">View formal definition</router-link>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section id="voc">
        <h3>Variants of Concern</h3>
      </section>

      <section id="moi">
        <h3>Mutations of Interest</h3>
        <table>
          <thead>
            <tr>
              <th>
                mutation
              </th>
              <th>
                increased transmissibility
              </th>
              <th>
                increased infectivity
              </th>
              <th>
                increased virulence
              </th>
              <th>
                immune evasion
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(mutation, mIdx) in moi" :key="mIdx">
              <td>
                {{mutation.mutation_name}}
              </td>
              <td>
                <font-awesome-icon v-if="mutation.evidence.transmissibility && mutation.evidence.transmissibility.isAltered" class="fa-lg is-altered" :icon="['far', 'check-circle']" />
                <font-awesome-icon v-else-if="mutation.evidence.transmissibility && mutation.evidence.transmissibility.isAltered === false" class="fa-lg is-not-altered" :icon="['far', 'times-circle']" />
                <font-awesome-icon v-else class="fa-lg unknown-altered" :icon="['far', 'question-circle']" />
                <span class="ml-2" v-if="mutation.evidence.transmissibility && mutation.evidence.transmissibility.citation">{{mutation.evidence.transmissibility.citation}}</span>
              </td>
              <td>
                <font-awesome-icon v-if="mutation.evidence.infectivity && mutation.evidence.infectivity.isAltered" class="fa-lg is-altered" :icon="['far', 'check-circle']" />
                <font-awesome-icon v-else-if="mutation.evidence.infectivity && mutation.evidence.infectivity.isAltered === false" class="fa-lg is-not-altered" :icon="['far', 'times-circle']" />
                <font-awesome-icon v-else class="fa-lg unknown-altered" :icon="['far', 'question-circle']" />
                <span v-if="mutation.evidence.infectivity && mutation.evidence.infectivity.citation">{{mutation.evidence.infectivity.citation}}</span>
              </td>
              <td>
                <font-awesome-icon v-if="mutation.evidence.virulence && mutation.evidence.virulence.isAltered" class="fa-lg is-altered" :icon="['far', 'check-circle']" />
                <font-awesome-icon v-else-if="mutation.evidence.virulence && mutation.evidence.virulence.isAltered === false" class="fa-lg is-not-altered" :icon="['far', 'times-circle']" />
                <font-awesome-icon v-else class="fa-lg unknown-altered" :icon="['far', 'question-circle']" />
                <span class="ml-2" v-if="mutation.evidence.virulence && mutation.evidence.virulence.citation">{{mutation.evidence.virulence.citation}}</span>
              </td>
              <td>
                <font-awesome-icon v-if="mutation.evidence.evasion && mutation.evidence.evasion.isAltered" class="fa-lg is-altered" :icon="['far', 'check-circle']" />
                <font-awesome-icon v-else-if="mutation.evidence.evasion && mutation.evidence.evasion.isAltered === false" class="fa-lg is-not-altered" :icon="['far', 'times-circle']" />
                <font-awesome-icon v-else class="fa-lg unknown-altered" :icon="['far', 'question-circle']" />
                <span class="ml-2"  v-if="mutation.evidence.evasion && mutation.evidence.evasion.citation">{{mutation.evidence.evasion.citation}}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

    </div>

  </div>


</div>
</template>

<script>
import Vue from "vue";

// import ReportLogos from "@/components/ReportLogos.vue";
import ReportCard from "@/components/ReportCard.vue";
import CustomReportForm from "@/components/CustomReportForm.vue";
import ReportAcknowledgements from "@/components/ReportAcknowledgements.vue";
import SARSMutationMap from "@/components/SARSMutationMap.vue";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faClock,
  faQuestionCircle,
  faTimesCircle,
  faCheckCircle
} from "@fortawesome/free-regular-svg-icons";
import {
  faSpinner
} from "@fortawesome/free-solid-svg-icons";

library.add(faClock, faSpinner, faQuestionCircle, faTimesCircle, faCheckCircle);


export default {
  name: "SituationReports",
  components: {
    FontAwesomeIcon
  },
  data() {
    return ({
      lastUpdated: "19 April 2021",
      moi: [{
        mutation_name: "S:N439K",
        evidence: {
          virulence: {
            isAltered: false,
            citation: "fake citation",
            url: "https://doi.org/10.1016/j.cell.2021.01.037"
          },
          evasion: {
            isAltered: true,
            citation: "Thomson et al. Cell 2021",
            url: "https://doi.org/10.1016/j.cell.2021.01.037"
          }
        }

      }]
    })
  }
}
</script>

<style lang="scss" scoped>
.logo {
    width: 150px;
}

.gisaid {
    height: 25px;
}

.bg-image {
    width: 16%;
    position: absolute;
    left: 0;
    opacity: 0.55;
    z-index: -1;
}

.MOC,
.MOI,
.VOC,
.VOI {
    text-transform: none !important;
}

.is-altered {
    color: $warning-color;
}

.is-not-altered {
    color: lighten($secondary-color, 15%);
}

.unknown-altered {
    opacity: 0.5;
}
th, td {
  padding: 0.5rem;
}

tr {
  border-bottom: 1pt solid #aaa;
}
</style>
