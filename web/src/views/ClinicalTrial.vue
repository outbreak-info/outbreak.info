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
        "_id": "NCT04346628",
        "identifier": "NCT04346628",
        "identifierSource": "ClinicalTrials.gov",
        "url": "https:\\/\\/clinicaltrials.gov\\/ct2\\/show\\/NCT04346628",
        "name": "A Phase 2 Randomized, Open Label Study of Oral Favipiravir Compared to Standard Supportive Care in Subjects With Mild COVID-19",
        "alternateName": ["Oral Favipiravir Compared to Standard Supportive Care in Subjects With Mild COVID-19"],
        "abstract": "The objective of this study is to evaluate the efficacy of oral favipiravir compared with SOC in reducing the duration of viral shedding of SARS-CoV-2 virus in patients with uncomplicated COVID-19 disease.",
        "description": null,
        "sponsor": [{
          "@type": "Organization",
          "name": "Stanford University",
          "class": "other",
          "role": "lead sponsor"
        }],
        "author": [{
          "@type": "Person",
          "name": "Yvonne (Bonnie) A Maldonado, MD",
          "role": "Principal Investigator",
          "affiliation": "Stanford University"
        }],
        "studyStatus": {
          "@type": "StudyStatus",
          "status": "not yet recruiting",
          "statusDate": "April 2020",
          "enrollmentCount": 120,
          "enrollmentType": "anticipated"
        },
        "studyEvent": [{
          "@type": "StudyEvent",
          "studyEventType": "start",
          "studyEventDate": "April 2020",
          "studyEventDateType": "anticipated"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "primary completion",
          "studyEventDate": "April 2021",
          "studyEventDateType": "anticipated"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "completion",
          "studyEventDate": "April 2021",
          "studyEventDateType": "anticipated"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "first posting to clinicaltrials.gov",
          "studyEventDate": "April 15, 2020",
          "studyEventDateType": "actual"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "last posting to clinicaltrials.gov",
          "studyEventDate": "April 15, 2020",
          "studyEventDateType": "actual"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "first submission",
          "studyEventDate": "April 10, 2020"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "first submission that met quality control criteria",
          "studyEventDate": "April 14, 2020"
        }, {
          "@type": "StudyEvent",
          "studyEventType": "last update submission",
          "studyEventDate": "April 14, 2020"
        }],
        "hasResults": false,
        "dateCreated": "2020-04-10",
        "datePublished": "2020-04-15",
        "dateModified": "2020-04-15",
        "curatedBy": {
          "@type": "Organization",
          "name": "ClinicalTrials.gov",
          "url": "https:\\/\\/clinicaltrials.gov\\/ct2\\/results?cond=COVID-19",
          "versionDate": "2020-04-29"
        },
        "healthCondition": ["COVID"],
        "keywords": null,
        "studyDesign": [{
          "@type": "StudyDesign",
          "studyType": "interventional",
          "designAllocation": "randomized",
          "designModel": "parallel assignment",
          "designPrimaryPurpose": "treatment",
          "phase": ["Phase 2"],
          "phaseNumber": [2]
        }],
        "outcome": [{
          "@type": "Outcome",
          "outcomeMeasure": "Time until cessation of oral shedding of SARS-CoV-2 virus",
          "outcomeTimeFrame": "Up to 28 days",
          "outcomeType": "primary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Count of participants with clinical worsening of COVID-19 disease",
          "outcomeTimeFrame": "Up to 28 days",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Sars-CoV-2 viral load",
          "outcomeTimeFrame": "Up to 28 days",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Count of participants with development of SARS-CoV-2 antibodies",
          "outcomeTimeFrame": "Up to 28 days",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Time until cessation of symptoms",
          "outcomeTimeFrame": "Up to 28 days",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Cmax of favipiravir",
          "outcomeTimeFrame": "Days 1 and 10 (samples taken 30 minutes prior to and 1 hour following favipiravir administration)",
          "outcomeType": "secondary"
        }, {
          "@type": "Outcome",
          "outcomeMeasure": "Cmin of favipiravir",
          "outcomeTimeFrame": "Days 1 and 10 (samples taken 30 minutes prior to and 1 hour following favipiravir administration)",
          "outcomeType": "secondary"
        }],
        "eligibilityCriteria": [{
          "@type": "Eligibility",
          "inclusionCriteria": ["Patients with laboratory confirmation of infection with SARS-CoV-2 and who are PCR positive (within five days or fewer prior to enrollment)",
            "Asymptomatic or mild respiratory disease, defined as a respiratory rate no more than 20 breaths per minute and a normal oxygen saturation"
          ],
          "minimumAge": "18 years",
          "gender": "all",
          "healthyVolunteers": false,
          "stdAge": ["adult", "older adult"]
        }],
        "isBasedOn": null,
        "relatedTo": null,
        "studyLocation": [{
          "@type": "Place",
          "name": "Stanford University",
          "studyLocationCity": "Stanford",
          "studyLocationCountry": "United States",
          "studyLocationState": "California"
        }],
        "armGroup": [{
          "@type": "ArmGroup",
          "name": "Favipiravir",
          "description": "Participants will receive favipiravir for 10 days plus standard of care treatment for COVID-19 infection.",
          "role": "experimental",
          "intervention": [{
            "@type": "Intervention",
            "category": "drug",
            "name": "favipiravir",
            "description": "Favipiravir administered orally, 1800 mg on the first dose (day 1) followed by 800 mg twice daily for the next 9 days (days 2-10)."
          }, {
            "@type": "Intervention",
            "category": "other",
            "name": "standard of care treatment",
            "description": "Standard of care treatment for COVID-19 infection"
          }]
        }, {
          "@type": "ArmGroup",
          "name": "Standard of Care",
          "description": "Participants will receive standard of care treatment for COVID-19 infection.",
          "role": "active comparator",
          "intervention": [{
            "@type": "Intervention",
            "category": "other",
            "name": "standard of care treatment",
            "description": "Standard of care treatment for COVID-19 infection"
          }]
        }]
      }


    };
  }
}
</script>

<style lang="scss" scoped>
</style>
