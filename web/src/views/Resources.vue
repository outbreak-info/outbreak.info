<template>
<div class="">
  <!-- header -->
  <section class="d-flex justify-content-center align-items-center bg-main__darker text-light py-3">
    <div class="row m-0 w-100">
      <div class="col-sm-12 m-auto">
        <h4>COVID-19 and SARS-CoV-2 datasets, analyses, and resources</h4>
      </div>
    </div>
  </section>

  <section class="d-flex py-2">
    <div class="row m-0 w-100">
      <!-- search bar -->
      <div class="col-sm-12 col-md-8">
        <div class="py-3">
          <form autocomplete="off" class="m-auto">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text bg-grey text-muted border-0" id="sb"><i class="fas fa-search"></i></span>
              </div>
              <input id="sBar" class="form-control border" placeholder="Search" aria-label="search" aria-describedby="sb" type="text" v-model="search" @input="onChange" @keydown.down="onArrowDown" @keydown.up="onArrowUp"
                @keydown.enter.prevent="onEnter" @keydown.delete="onBackspace" @keydown.ctrl.65="onSelectAll" @keydown.meta.65="onSelectAll" />
              <!-- <ul id="autocomplete-results" v-show="isOpen" class="autocomplete-results bg-dark text-light">
                <li class="loading" v-if="isLoading">
                  Loading results...
                </li>
                <li v-else v-for="(result, i) in results" :key="i" @click="setResult(result)" class="autocomplete-result" :class="{ 'is-active': i === arrowCounter }">
                  {{ result.label }}
                </li>
              </ul> -->
            </div>
          </form>
        </div>
      </div>

      <!-- sidebar: links -->
      <div class="col-sm-12 col-md-4 d-flex justify-content-center align-items-center flex-column">
        <router-link class="btn btn-main mb-2" :to="{ name: 'Contributing' }"><i class="fas fa-bolt"></i> subscribe to updates</router-link>
        <router-link :to="{ name: 'Sources' }">Where do we get our data?</router-link>
        <router-link :to="{ name: 'Contributing' }">Contributing a source</router-link>
      </div>

      <!-- what's new -->
      <div class="col-sm-12">
        <div class="text-highlight d-flex justify-content-between align-items-center mb-2">
          <h5>WHAT'S NEW</h5>
        </div>

        <table id='whats-new'>
          <tbody>
            <tr v-for="(item, idx) in newData" :key="idx" class="new-item">
              <td class="resource-type d-flex align-items-center" :class="item['@type']">
                <StripeAccent :className="item['@type']" />

                {{item['@type']}}
              </td>
              <td class="resource-name text-left" valign="top">{{item.name}}</td>
              <td class="resource-affiliation text-left text-muted" valign="top">
                <template v-if="item.author">
                  {{item.author[0].name ? item.author[0].name : item.author[0].givenName + " " + item.author[0].familyName}}
                  <span v-if="item.author.length > 1"> et al.</span>
                </template>
              </td>
              <td class="resource-date" valign="top">{{format(item.date)}}</td>

            </tr>

          </tbody>
        </table>

      </div>
    </div>
  </section>

  <!-- mini-nav for resource types -->
  <section class="d-flex justify-content-end py-2 bg-sec">
    <div class="row d-flex justify-content-center w-100">
      <nav class="navbar navbar-expand-lg navbar-dark">
        <ul class="navbar-nav">
          <li class="nav-item text-light" v-for="(resource, idx) in resourceTypes" :key="idx">
            <router-link class="nav-link no-underline p-0" :to="{ name: 'Resource Type', params: {id: resource.id} }">
              {{resource.label}}
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </section>

  <!-- RESULTS -->
  <section class="d-flex justify-content-end py-2">
    <div class="row m-0">
      <!-- FILTERS -->
      <div class="col-sm-2 p-0">
        <div class="border-bottom border-secondary alert-secondary p-1">
          <!-- Toggle Header -->
          <div class="row m-0">
            <div class="col-sm-10 p-1">
              <h6>FITLER TYPE</h6>
            </div>
            <div class="col-sm-2 text-center p-1">
              <!-- toggle fa class up->down -->
              <i class="fas fa-chevron-down"></i>
            </div>
          </div>
          <!-- Toggle content -->
          <form>
            <div>
              <!-- Search -->
              <div class="p-1 bg-light">
                <input type="text" class="border border-secondary p-1" placeholder="Search">
              </div>
              <!-- Filters -->
              <ul class="list-group rounded-0">
                <li class="list-group-item rounded-0 text-left list-group-item-action p-1 active">
                  <input type="checkbox" class="mr-1" name="item" id="i" value="item" checked="checked">
                  <label for="i" class="m-0">
                    <small>Option Label</small>
                  </label>
                </li>
                <li class="list-group-item rounded-0 text-left list-group-item-action p-1">
                  <input type="checkbox" class="mr-1" name="item" id="i2" value="item">
                  <label for="i2" class="m-0">
                    <small>Option Label</small>
                  </label>
                </li>
              </ul>
            </div>
          </form>
        </div>
      </div>
      <div class="col-sm-9 pl-5" id="results">
        <!-- results header + sort options -->
        <div class="row w-100 d-flex justify-content-between" id="selectors">
          <div class="d-flex align-items-center">
            <h4 class="m-0 mr-4" v-if="search">
              You searched for {{search}}
            </h4>
            <small class="m-0 text-highlight">
              {{data.length}} results
            </small>
          </div>

          <select>
            <option>
              date: newest to oldest
            </option>
            <option>
              date: oldest to newest
            </option>
            <option>
              A-Z
            </option>
            <option>
              Z-A
            </option>
          </select>
        </div>

        <!-- Results: loop -->
        <div id="results-container" class="my-3">
          <div class="row w-100 d-flex flex-column text-left py-2 search-result" v-for="(item, idx) in data" :key="idx">
            <div class="d-flex w-100 align-items-center">
              <StripeAccent :className="item['@type']" />
              <small :class="[item['@type'], 'resource-type', 'mr-2']">{{item['@type']}}</small>
              <router-link :to="{ name: item['@type'], params: {id: item._id} }">
                <h5 class="m-0">{{item.name}}</h5>
              </router-link>
            </div>

            <div class="row">
              <!-- LEFT -->
              <div class="col-sm-5 text-muted">
                <!-- authors -->
                <div class="attribution text-body">
                  <small v-if="item.author">
                    {{item.author[0].name ? item.author[0].name : item.author[0].givenName + " " + item.author[0].familyName}}
                    <span v-if="item.author.length > 1"> et al.</span>
                  </small>
                </div>
                <!-- publication name -->
                <div class="publication">
                  <small v-if="item.journalNameAbbrev">{{item.journalNameAbbrev}}</small>
                  <small v-else-if="item.journalName">{{item.journalName}}</small>
                </div>
                <!-- dates -->
                <div class="dates">
                  <small v-if="item.dateModified || item.dateCreated || item.datePublished">
                    <i class="far fa-clock"></i>
                    <span v-if="item.dateModified"> updated {{item.dateModified}}
                    </span>
                    <span v-if="item.dateModified && item.datePublished">&bull;</span>
                    <span v-if="item.datePublished">
                      published {{item.datePublished}}
                    </span>
                    <span v-if="item.dateModified && item.dateCreated || item.datePublished && item.dateCreated ">&bull;</span>
                    <span v-if="item.dateCreated">
                      created {{item.dateCreated}}
                    </span>

                  </small>
                </div>
                <div v-if="item.studyDesign && item.studyDesign.phaseNumber">
                <TrialPhase :phases="item.studyDesign.phaseNumber"/>
                </div>

                <!-- relatedTo -->
                <router-link to="search" v-if="item['@type']=='Dataset'">
                  <small>find analyses/publications that use this data</small>
                </router-link>
                <div v-if="item.isBasedOn && item.isBasedOn.length" class="px-1 bg-grey__lightest">
                  based on |
                  <router-link to="search" v-for="(resource, idx) in item.isBasedOn" :key="idx">
                    {{resource["@type"]}}
                  </router-link>
                </div>
                <router-link to="search" v-if="item.relatedTo">
                  <small>related resources</small>
                </router-link>
              </div>

              <!-- RIGHT     -->
              <div class="col-sm-7 text-muted">
                <template v-if="item.descriptionExpanded">
                  <span v-html="item.longDescription"></span>
                  <span>
                    <a class="show-more" v-if="item.descriptionTooLong" href="#" @click.prevent="expandDescription(item)">(show less)</a>
                  </span>
                </template>
                <template v-else>
                  <span v-html="item.shortDescription"></span>
                  <span v-if="item.descriptionTooLong">... <a class="show-more" href="#" @click.prevent="expandDescription(item)">(show more)</a></span>
                </template>
              </div>

              <!-- Bottom -->
              <div class="col-sm-12 keyword-container mt-2">
                <small class="keyword px-2 py-1 my-1 mr-1" v-for="(keyword, idx) in item.keywords" :key="idx" :data-tippy-info="`search ${keyword}`">
                  <router-link :to='{ name: "Resources", query: {search: `"${keyword}"`} }' class="no-underline text-dark">
                    {{keyword}}
                  </router-link>
                </small>
              </div>
            </div>

          </div>
        </div>


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

import StripeAccent from "@/components/StripeAccent.vue";
import TrialPhase from "@/components/TrialPhase.vue"

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

export default {
  name: "Resources",
  props: {
    search: String
  },
  components: {
    StripeAccent,
    TrialPhase
  },
  methods: {
    format: function(dateStr) {
      const parsed = timeParse("%Y-%m-%d")(dateStr);
      return (timeFormat("%d %B")(parsed));
    },
    expandDescription: function(item) {
      item.descriptionExpanded = !item.descriptionExpanded;
    },
    onChange: function(item) {
      console.log("searching")
    }

  },
  mounted() {
    this.data.forEach(d => {
      d["date"] = d.dateModified ? d.dateModified : (d.datePublished ? d.datePublished : d.dateCreated);
      d["longDescription"] = d.abstract ? d.abstract : d.description;
      if (d.longDescription) {
        let descriptionArray = d.longDescription.split(" ");
        d['shortDescription'] = descriptionArray.slice(0, this.maxDescriptionLength).join(" ");
        d['descriptionTooLong'] = descriptionArray.length >= this.maxDescriptionLength;
      }
    })
    this.data.sort((a, b) => a.date > b.date ? -1 : 1);


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
  },
  computed: {
    newData() {
      return (this.data.slice(0, this.new2Display));
    }
  },
  data() {
    return {
      resourceTypes: [{
        label: "What's New",
        id: "whats-new"
      }, {
        label: "Topics",
        id: "topics"
      }, {
        label: "Publications",
        id: "publication"
      }, {
        label: "Analyses",
        id: "analysis"
      }, {
        label: "Protocols",
        id: "protocol"
      }, {
        label: "Clinical Trials",
        id: "clinicaltrial"
      }, {
        label: "Datasets",
        id: "dataset"
      }, ],
      new2Display: 3,
      maxDescriptionLength: 75,
      data: [{
          _id: "virological1",
          descriptionExpanded: false,
          "@type": "Analysis",
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
        }, {
          _id: "nejm1",
          "@type": "Publication",
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
          topicCategory: ["prevention"]

        },
        {
          _id: "ihme",
          "@type": "Analysis",
          descriptionExpanded: false,
          url: "https://covid19.healthdata.org/projections",
          name: "COVID-19 U.S. State by State Projections",
          author: [{
            name: "Institute for Health Metrics and Evaluation",
            affiliation: "University of Washington"
          }],
          mainEntity: "https://covid19.healthdata.org/",
          dateCreated: "2020-03-30",
          dateModified: "2020-03-31",
          lastReviewed: "2020-04-01",
          analysisTechnique: "Whole Genome Sequencing",
          isPartOf: "http://www.healthdata.org/research-article/forecasting-covid-19-impact-hospital-bed-days-icu-days-ventilator-days-and-deaths",
          isBasedOn: [{
            "@type": "Dataset",
            url: ""
          }],
          variableMeasured: "", // something similiar?
          keywords: ["epidemiology", "outbreak size model"],
          infectiousAgent: "SARS-CoV-2",
          description: "The charts below show projected hospital resource use based on COVID-19 deaths. The model assumes continued social distancing until the end of May 2020. In locations without social distancing measures currently in place, we have assumed they will be in place within seven days of the last model update. If not, the number of deaths and burden on their hospital systems will likely be higher than the model predicts.",
        },
        {
          _id: "jhu",
          "@type": "Dataset",
          descriptionExpanded: false,
          url: "https://github.com/CSSEGISandData/COVID-19",
          description: "This is the data repository for the 2019 Novel Coronavirus Visual Dashboard operated by the Johns Hopkins University Center for Systems Science and Engineering (JHU CSSE). Also, Supported by ESRI Living Atlas Team and the Johns Hopkins University Applied Physics Lab (JHU APL).",
          name: "Novel Coronavirus (COVID-19) Cases",
          keywords: ["epidemiology"],
          author: [{
            name: "Johns Hopkins University"
          }],
          dateCreated: "2020-01-22",
          dateModified: "2020-04-01",
          lastReviewed: "2020-04-01",
        },
        {
          "@type": "ClinicalTrial",
          "_id": "NCT04313322",
          "identifier": "NCT04313322",
          "identifierSource": "ClinicalTrials.gov",
          "url": "https://clinicaltrials.gov/ct2/show/NCT04313322",
          "name": "Treatment of COVID-19 Patients Using Wharton's Jelly-Mesenchymal Stem Cells",
          "alternateName": ["Treatment of COVID-19 Patients Using Wharton's Jelly-Mesenchymal Stem Cells"],
          "abstract": "The purpose of this study is to investigate the potential use of Wharton's Jelly Mesenchymal stem cells (WJ-MSCs) for treatment of patient diagnosed with Corona Virus SARS-CoV-2 infection, and showing symptoms of COVID-19.",
          "description": "COVID-19 is a condition caused by infection with Coronoa Virus (SARS-CoV-2). This virus has a high transmission rate and is spreading at very high rates. causing a worldwide pandemic. Patients diagnosed with COVID-19 and confirmed positive with the virus, will be given three IV doses of WJ-MSCs consisting of 1X10e6\\/kg. The three doses will be 3 days apart form each other.\\n\\nPatients will be followed up for a period of three weeks to assess the severity of the condition and measure the viral titers.",
          "sponsor": [{
            "@type": "Organization",
            "name": "Stem Cells Arabia",
            "class": "other",
            "role": "lead sponsor"
          }],
          "author": [{
            "@type": "Person",
            "name": "Adeeb Al Zoubi",
            "affiliation": ["Stem Cells Arabia"],
            "title": "President, Chief Scientific Officer",
            "role": "Principal Investigator"
          }, {
            "@type": "Person",
            "name": "Adeeb M AlZoubi, Ph.D.",
            "role": "Contact"
          }, {
            "@type": "Person",
            "name": "Ahmad Y AlGhadi, M.Sc.",
            "role": "Contact"
          }],
          "studyStatus": {
            "@type": "StudyStatus",
            "status": "recruiting",
            "statusDate": "March 2020",
            "enrollmentCount": 5,
            "enrollmentType": "anticipated"
          },
          "studyEvent": [{
            "@type": "StudyEvent",
            "studyEventType": "start",
            "studyEventDate": "March 16, 2020",
            "studyEventDateType": "anticipated"
          }, {
            "@type": "StudyEvent",
            "studyEventType": "primary completion",
            "studyEventDate": "June 30, 2020",
            "studyEventDateType": "anticipated"
          }, {
            "@type": "StudyEvent",
            "studyEventType": "completion",
            "studyEventDate": "September 30, 2020",
            "studyEventDateType": "anticipated"
          }, {
            "@type": "StudyEvent",
            "studyEventType": "first posting to clinicaltrials.gov",
            "studyEventDate": "March 18, 2020",
            "studyEventDateType": "actual"
          }, {
            "@type": "StudyEvent",
            "studyEventType": "last posting to clinicaltrials.gov",
            "studyEventDate": "March 18, 2020",
            "studyEventDateType": "actual"
          }, {
            "@type": "StudyEvent",
            "studyEventType": "first submission",
            "studyEventDate": "March 15, 2020"
          }, {
            "@type": "StudyEvent",
            "studyEventType": "first submission that met quality control criteria",
            "studyEventDate": "March 15, 2020"
          }, {
            "@type": "StudyEvent",
            "studyEventType": "last update submission",
            "studyEventDate": "March 15, 2020"
          }],
          "hasResults": false,
          "dateCreated": "2020-03-15",
          "datePublished": "2020-03-18",
          "dateModified": "2020-03-18",
          "curatedBy": {
            "@type": "Organization",
            "name": "ClinicalTrials.gov",
            "url": "https://clinicaltrials.gov/ct2/results?cond=COVID-19",
            "versionDate": "2020-04-29"
          },
          "healthCondition": ["Use of Stem Cells for COVID-19 Treatment"],
          "keywords": ["Stem Cells, COVID-19, SARS CoV2, WJ MSCs, Immunomodulation,"],
          "studyDesign": {
            "@type": "StudyDesign",
            "studyType": "interventional",
            "designModel": "single group assignment",
            "designPrimaryPurpose": "treatment",
            "phase": ["Phase 1"],
            "phaseNumber": [1]
          },
          "outcome": [{
            "@type": "Outcome",
            "outcomeMeasure": "Clinical outcome",
            "outcomeTimeFrame": "3 weeks",
            "outcomeType": "primary"
          }, {
            "@type": "Outcome",
            "outcomeMeasure": "CT Scan",
            "outcomeTimeFrame": "3 weeks",
            "outcomeType": "primary"
          }, {
            "@type": "Outcome",
            "outcomeMeasure": "RT-PCR results",
            "outcomeTimeFrame": "3 weeks",
            "outcomeType": "primary"
          }, {
            "@type": "Outcome",
            "outcomeMeasure": "RT-PCR results",
            "outcomeTimeFrame": "8 weeks",
            "outcomeType": "secondary"
          }],
          "eligibilityCriteria": [{
            "@type": "Eligibility",
            "inclusionCriteria": ["COVID-19 positive according to diagnosis and clinical management of COVID-19 criteria."],
            "exclusionCriteria": ["Participants in other clinical trials", "patients with malignant tumors", "pregnant and lactating women", "co-infection with other infectious viruses or bacteria", "History of several allergies",
              "Patients with history of pulmonary embolism", "any liver or kidney diseases", "HIV positive patients", "Considered by researchers to be not suitable to participate in this clinical trial",
              "Chronic heart failure with ejection fraction less than 30%."
            ],
            "minimumAge": "18 years",
            "gender": "all",
            "healthyVolunteers": null,
            "stdAge": ["adult", "older adult"]
          }],
          "isBasedOn": [],
          "relatedTo": null,
          "studyLocation": [{
            "@type": "Place",
            "name": "Stem Cells Arabia",
            "studyLocationCity": "Amman",
            "studyLocationCountry": "Jordan",
            "studyLocationStatus": "recruiting"
          }],
          "armGroup": [{
            "@type": "ArmGroup",
            "name": "WJ-MSCs",
            "description": "WJ-MSCs will be derived from cord tissue of newborns, screened for HIV1\\/2, HBV, HCV, CMV, Mycoplasma, and cultured to enrich for MSCs.\\n\\nWJ-MSCs will be counted and suspended in 25 ml of Saline solution containing 0.5% human serum Albumin, and will be given to patient intravenously.",
            "role": "experimental",
            "intervention": [{
              "@type": "Intervention",
              "category": "biological",
              "name": "wj-mscs",
              "description": "WJ-MSCs will be derived from cord tissue of newborns, screened for HIV1\\/2, HBV, HCV, CMV, Mycoplasma, and cultured to enrich for MSCs.\\n\\nWJ-MSCs will be counted and suspended in 25 ml of Saline solution containing 0.5% human serum Albumin, and will be given to patient intravenously."
            }]
          }]
        },
        {
          _id: "protocols",
          "@type": "Protocol",
          url: "https://mammoth.bio/2020/02/15/white-paper-a-protocol-for-rapid-detection-of-sars-cov-2-using-crispr-sars-cov-2-detectr/",
          curatedBy: {
            url: "https://www.protocols.io/view/a-protocol-for-rapid-detection-of-the-2019-novel-c-bcmtiu6n",
            name: "protocols.io"
          },
          name: "A protocol for rapid detection of the 2019 novel coronavirus SARS-CoV-2 using CRISPR diagnostics: SARS-CoV-2 DETECTR",
          description: 'Given the global health emergency, rapid transmission, and severe respiratory disease associated with the outbreak of the 2019 novel coronavirus (SARS-CoV-2), Mammoth Biosciences has reconfigured our DETECTR platform to rapidly and accurately detect SARS-CoV-2 using a visual lateral flow strip format within 30 minutes from sample to result. To ensure specificity of detection, we selected a high-fidelity CRISPR detection enzyme and designed sets of gRNAs that can either 1) differentiate SARS-CoV-2 or 2) provide multi-coronavirus strain detection. SARS-CoV-2 DETECTR couples CRISPR detection with isothermal pre-amplification using primers based on protocols validated by the US Centers for Disease Control and Prevention (CDC) and World Health Organization (WHO). Currently in the United States, the CDC SARS-CoV-2 real-time RT-PCR diagnostic panel has a laboratory turnaround time of approximately 4-6 hours, with results that can be delayed for >24 hours after sample collection due to shipping requirements. In addition, these tests are only available in CDC-designated public health laboratories certified to perform high-complexity testing. Mammoth is working to enable point of care testing (POCT) solutions that can be deployed in areas at greatest risk of transmitting SARS-CoV-2 infection, including airports, emergency departments, and local community hospitals, particularly in low-resource countries. Leveraging an “off-the-shelf” strategy to enable practical solutions within a short time frame, we describe here a protocol that is fast (<30 min), practical (available immediately from international suppliers), and validated using contrived samples.',
          measurementTechnique: "CRISPR",
          identifier: "dx.doi.org/10.17504/protocols.io.bcmtiu6n",
          author: [{
              name: "Mammoth Biosciences"
            },
            {
              name: "James P. Broughton"
            },
            {
              name: "Wayne Deng"
            },
            {
              name: "Clare L. Fasching"
            },
            {
              name: "Jasmeet Singh"
            },
            {
              name: "Charles Y. Chiu"
            },
            {
              name: "Janice S. Chen"
            }
          ],
          keywords: ["coronavirus", "SARS", "SARS-CoC-2", "CRISPR", "SARS-CoV-2 DETECTR"],
          topicCategory: ["diagnostics"],
          datePublished: "2020-02-17",
          dateModified: "2020-03-17"
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
}

.resource-date {
    width: 80px;
}

.resource-affiliation {
    // width: 150px;
}

#whats-new td {
    padding-left: 5px;
    padding-right: 5px;
    padding-bottom: 10px;
    font-size: 0.9em;
    line-height: 1em;
}

.filters {
    background: lighten(yellow, 35%);
}

.search-result {
    border-bottom: 3px solid $grey-40;
    padding: 5px;
}

.search-result:nth-child(odd) {
    background-color: $grey-30;
}

.keyword {
    background: lighten($warning-color, 35%);
    border-radius: 5px;
}
.list-group-item.active {
    background-color: $secondary-color !important;
    border-color: $secondary-color !important;
    color: white !important;
}
</style>
