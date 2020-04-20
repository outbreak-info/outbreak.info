<template>
<div class="container d-flex py-2">
  <div class="row w-100 m-0">
    <div class="col-md-9 my-3">
  <ResourceDescription :data="data" type="Protocol" />
    </div>

    <!-- RIGHT SIDE -->
    <div class="col-md-3 my-3">
      <ResourceSidebar :id="data['_id']" :doi="data.doi" :date="datePublished" :url="data.url" type="Protocol" v-if="data" />
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
  name: "Protocol",
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
      data:   {
        _id: "protocols",
        type: "Protocol",
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
