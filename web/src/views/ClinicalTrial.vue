<template>
<div class="container d-flex py-2">
  <div class="row w-100 m-0">
    <div class="col-md-9 my-3">
      <ResourceDescription :data="data" type="Clinical Trial" />
    </div>

    <!-- RIGHT SIDE -->
    <div class="col-md-3 my-3">
      <ResourceSidebar :data="data" :date="datePublished" type="Clinical Trial" v-if="data" />
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
  name: "Dataset",
  components: {
    ResourceDescription,
    ResourceSidebar
    // StripeAccent
  },
  methods: {
    formatDate(dateStr) {
      const parseDate = timeParse("%Y-%m-%d");
      const formatDate = timeFormat("%d %B %Y");
      return dateStr ? formatDate(parseDate(dateStr)) : null;
    }
  },
  computed: {
    datePublished: function() {
      return (this.formatDate(this.data.dateModified))
    }
  },
  data() {
    return {
      data: {
        "@type": "ClinicalTrial",
        "_id": "NCT04342650",
        "identifier": "NCT04342650",
        "identifierSource": "ClinicalTrials.gov",
        "url": "https:\\/\\/clinicaltrials.gov\\/ct2\\/show\\/NCT04342650",
        "name": "Phase IIb Study to Evaluate the Efficacy and Safety of Chloroquine Diphosphate in the Treatment of Patients With Comorbidities, Without Severe Acute Respiratory Syndrome, Under the New Coronavirus (SARS-CoV2): a Double-blind, Randomized, Placebo-controlled Clinical Trial",
        "alternateName": ["CloroCOVID19II", "Chloroquine Diphosphate in the Prevention of SARS in Covid-19 Infection"],
        "abstract": "This is a double-blind, randomized, placebo-controlled clinical trial. A total of 210 individuals aged over 18 years old, without a diagnosis of severe respiratory disease, who came to the study site with clinical and radiological suspicion of SARS-CoV2, will be randomized into two treatment groups at a 1:1 ratio to receive a 5-day CQ diphosphate tablets or placebo (tablet without active ingredient produced with the same physical characteristics).",
        "description": null,
        "sponsor": [{
          "@type": "Organization",
          "name": "Funda\\u00e7\\u00e3o de Medicina Tropical Dr. Heitor Vieira Dourado",
          "class": "other",
          "role": "lead sponsor"
        }],
        "author": [{
          "@type": "Person",
          "name": "Fernando Val, PhD",
          "role": "Contact"
        }],
        "studyStatus": {
          "@type": "StudyStatus",
          "status": "recruiting",
          "statusDate": "April 2020",
          "enrollmentCount": 210,
          "enrollmentType": "anticipated"
        },
        "studyEvent": [{
          "@type": "StudyEvent",
          "studyEventType": "start",
          "studyEventDate": "April 8, 2020",
          "studyEventDateType": "actual"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "primary completion",
          "studyEventDate": "September 2020",
          "studyEventDateType": "anticipated"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "completion",
          "studyEventDate": "September 2020",
          "studyEventDateType": "anticipated"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "first posting to clinicaltrials.gov",
          "studyEventDate": "April 13, 2020",
          "studyEventDateType": "actual"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "last posting to clinicaltrials.gov",
          "studyEventDate": "April 14, 2020",
          "studyEventDateType": "actual"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "first submission",
          "studyEventDate": "April 4, 2020"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "first submission that met quality control criteria",
          "studyEventDate": "April 8, 2020"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "last update submission",
          "studyEventDate": "April 10, 2020"
        }],
        "hasResults": false,
        "dateCreated": "2020-04-04",
        "datePublished": "2020-04-13",
        "dateModified": "2020-04-14",
        "curatedBy": {
          "@type": "Organization",
          "name": "ClinicalTrials.gov",
          "url": "https:\\/\\/clinicaltrials.gov\\/ct2\\/results?cond=COVID-19",
          "versionDate": "2020-04-28"
        },
        "healthCondition": ["COVID-19", "SARS-CoV Infection", "Severe Acute Respiratory Syndrome (SARS) Pneumonia", "Clinical Trial"],
        "keywords": null,
        "studyDesign": [{
          "@type": "StudyDesign",
          "studyType": "interventional",
          "designAllocation": "randomized",
          "designModel": "parallel assignment",
          "designPrimaryPurpose": "treatment",
          "phase": ["Phase 2"]
        }],
        "outcome": [{
          "@type": "Outcome",
          "outcomeMeasure": "Proportion of patients with onset of severe acute respiratory syndrome (SARS)",
          "outcomeTimeFrame": "7 days after randomization",
          "outcomeType": "primary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Mortality rate",
          "outcomeTimeFrame": "after randomization, up to 28 days",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Number of participants in need of intensive care support",
          "outcomeTimeFrame": "during and after intervention, up to 28 days",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Viral concentration",
          "outcomeTimeFrame": "After randomization, up to 7 days",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Cumulative incidence of serious adverse events",
          "outcomeTimeFrame": "During and after intervention, up to 28 days",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Cumulative incidence of grade 3 and 4 adverse events",
          "outcomeTimeFrame": "During and after intervention, up to 28 days",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Proportion of patients with discontinued treatment",
          "outcomeTimeFrame": "after randomization, up to 28 days",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Incidence of cardiac lesions",
          "outcomeTimeFrame": "after randomization, up to 120 days",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Incidence of cardiac disfunctions",
          "outcomeTimeFrame": "after randomization, up to 120 days",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Change in respiratory capacity",
          "outcomeTimeFrame": "Day 120 after randomization",
          "outcomeType": "secondary"
        }],
        "eligibilityCriteria": [{
          "@type": "Eligibility",
          "inclusionCriteria": ["Suspected cases of COVID-19, due to clinical and radiological data, during the epidemic;", "Adult aged 18 or over, at the time of inclusion",
            "Not having severe acute respiratory syndrome (SARS), that is, not using mechanical ventilation or supplemental oxygen, peripheral oxygen saturation> 94% in room air, and having a respiratory rate below 24 incursions per minute.",
            "Patients with comorbidities only, due to the increased risk of developing SARS"
          ],
          "exclusionCriteria": ["1. Patients with chronic use of drugs known to prolong QTc interval."],
          "minimumAge": "18 years",
          "gender": "all",
          "healthyVolunteers": false,
          "stdAge": ["adult", "older adult"]
        }],
        "isBasedOn": [],
        "relatedTo": null,
        "studyLocation": [{
          "@type": "Place",
          "name": "Hospital e Pronto Socorro Delphina Rinaldi Abdel Aziz",
          "studyLocationCity": "Manaus",
          "studyLocationCountry": "Brazil",
          "studyLocationState": "Amazonas",
          "studyLocationStatus": "recruiting"
        }],
        "armGroup": [{
          "@type": "ArmGroup",
          "name": "Intervention",
          "description": "CQ 450mg twice daily (3 tablets of 150mg, every 12 hours) on day 1, followed by CQ 450mg once daily (3 tablets of 150mg) from D2 to D5. Oral administration.",
          "role": "active comparator",
          "intervention": [{
            "@type": "Intervention",
            "category": "drug",
            "name": "chloroquine diphosphate",
            "description": "150mg tablets"
          }]
        }, {
          "@type": "ArmGroup",
          "name": "Placebo",
          "description": "Placebo tables of equal characteristics and duration of treatment.",
          "role": "placebo comparator",
          "intervention": [{
            "@type": "Intervention",
            "category": "drug",
            "name": "placebo oral tablet",
            "description": "150mg placebo tablets"
          }]
        }]
      }

    };
  }
}
</script>

<style lang="scss" scoped>
</style>
