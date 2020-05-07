<template>
<div>
  <div v-if="data.studyStatus">
    <TrialStatus :status="data.studyStatus" :includeDate="true" :locations="data.studyLocation" :mapWidth="500" />
  </div>

  <div v-if="data.studyEvent">
    <div class="mt-3 mb-2">
      Study Timeline
    </div>
    <div class="update-container">
      <div class="d-flex mb-4" v-for="(update, idx) in data.studyEvent" :key="idx">
        <span class="update-linker" :class="{'past': update.inPast}"> </span>
        <span class="update-date pl-3" :class="{'past': update.inPast}">
          {{ update.dateStr }}
        </span>
        <div class="d-flex text-left">
          <span class="m-0 mb-1" v-if="update.studyEventDateType">
            <span class="update-type mr-2"> {{ update.studyEventDateType }}</span>
          </span>
          <span v-html="update.studyEventType" class="text-muted"></span>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import {
  timeFormat,
  timeParse
} from "d3";

import TrialStatus from "@/components/TrialStatus.vue";

export default {
  name: "TrialEvents",
  props: {
    data: Object
  },
  components: {
    TrialStatus
  },
  methods: {
    formatDate: function(date) {
      // const parseDate = timeParse("%Y-%m-%d");
      return (timeFormat("%e %B %Y")(date))
    },
    parseDate: function(date) {
      // const parseDate = timeParse("%Y-%m-%d");
      return (timeParse("%Y-%m-%d")(date))
    }
  },
  mounted() {
    const today = new Date();
    if (this.data.studyEvent) {
      this.data.studyEvent.forEach(d => {
        d["date"] = this.parseDate(d.studyEventDate);
        d["dateStr"] = this.formatDate(d.date);
        d["inPast"] = d.date <= today;
      });

      this.data.studyEvent.sort((a, b) => a.date - b.date)
    }
  }
};
</script>

<style lang="scss" scoped>
$circle-width: 8px;
.update-type {
    text-transform: uppercase;
    font-weight: 700;
    opacity: 0.5;
    color: $secondary-color;
}

.update-container {
    border-left: 1px solid $grey-40;
}

.update-date {
    opacity: 0.6;
    min-width: 200px;
    position: relative;
    left: 22px;
}

.update-linker {
    position: relative;
}

.update-linker:before {
    background: $grey-40;
    content: "";
    left: 0;
    height: 1px;
    position: absolute;
    top: 0.75em;
    transform: translateY(-50%);
    width: 20px;
    z-index: 1;
}

.update-linker:after {
    content: "";
    display: inline-block;
    width: $circle-width;
    height: $circle-width;
    -moz-border-radius: 7.5px;
    -webkit-border-radius: 7.5px;
    border-radius: 7.5px;
    background: $grey-40;
    position: absolute;
    top: 0.75em;
    transform: translate(22px, -50%);
}

.update-linker.past:after,
.update-linker.past:before {
    background: saturate($clinical-trial-color, 20%);
    opacity: 0.5;
}

.past {
    color: saturate($clinical-trial-color, 20%);
    opacity: 1;
}
</style>
