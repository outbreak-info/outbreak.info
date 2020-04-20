<template>
<div class="container d-flex py-2">
  <div class="row w-100 m-0">
    <div class="col-md-9 my-3">
      <ResourceDescription :data="data" type="Clinical Trial" />
    </div>

    <!-- RIGHT SIDE -->
    <div class="col-md-3 my-3">
      <ResourceSidebar :id="data['_id']" :doi="data.doi" :date="datePublished" :url="data.url" type="Clinical Trial" v-if="data" />
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
        _id: "ChiCTR2000029953",
        type: "ClinicalTrial",
        descriptionExpanded: false,
        url: "http://www.chictr.org.cn/showproj.aspx?proj=49217",
        name: "Construction and Analysis of Prognostic Predictive Model of Novel Coronavirus Pneumonia (COVID-19)",
        studyType: "Observational",
        studyEvent: [{
          studyEventDate: "2020-02-01",
          studyEventType: "start"
        }]
      }
    };
  }
}
</script>

<style lang="scss" scoped>
</style>
