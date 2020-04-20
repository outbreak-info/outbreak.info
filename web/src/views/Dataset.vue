<template>
<div class="container d-flex py-2">
  <div class="row w-100 m-0">
    <div class="col-md-9 my-3">
      <ResourceDescription :data="data" type="Dataset" />
    </div>

    <!-- RIGHT SIDE -->
    <div class="col-md-3 my-3">
      <ResourceSidebar :id="data['_id']" :doi="data.doi" :date="datePublished" :url="data.url" type="Dataset" v-if="data" />
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
      data: {
        _id: "jhu",
        type: "Dataset",
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
      }
    };
  }
}
</script>

<style lang="scss" scoped>
</style>
