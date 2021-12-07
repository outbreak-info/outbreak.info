<template>
<div class="at-a-glance box-shadow p-2 position-relative mb-width">
  <div class="d-flex flex-column mb-width">
    <router-link class="no-underline" :data-tippy-info="`view ${data.name} over time`" :to="{
        name: 'Epidemiology',
        query: { location: data.location_id }
      }">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="underline m-0">{{ data.name }}</h5>
        <div class="text-muted badge bg-grey__lightest">
          {{ updatedDate }}
        </div>
      </div>

      <div class="d-flex mb-flex">
        <!-- cases increase -->
        <router-link class="no-underline" :data-tippy-info="`view ${data.name} over time`" :to="{
            name: 'Epidemiology',
            query: { location: data.location_id, variable:'confirmed_numIncrease' }
          }">
          <div class="d-flex align-items-end justify-content-start router-link-black mr-2 p-1">
            <div class="d-flex flex-column text-left">
              <h6>total cases</h6>
              <div class="muted">
                <span class="accent">{{ cases }}</span>: today
              </div>
              <div class="muted">
                <span class="yesterday">{{ casesYesterday }}</span>: yesterday
              </div>
            </div>
            <svg class="mx-1" height="3em" width="20px">
              <defs>
                <marker id="arrow" markerWidth="13" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" fill="#939ba2" />
                </marker>
              </defs>
              <path marker-end="url(#arrow)" d="M 5, 40 C 20, 35 20, 10 5, 10" class="swoopy-arrow" fill="none" stroke="#6c757d" stroke-width="0.8"></path>
            </svg>
            <div class="d-flex flex-column number-changes">
              <div class="changes">+ {{ casesIncrease }}</div>
              <div class="changes">
                <font-awesome-icon class="increasing" :icon="['fas', 'arrow-up']" v-if="data.confirmed_pctIncrease > 0" />
                {{ casesPct }}
              </div>
            </div>
          </div>
        </router-link>

        <!-- deaths -->
        <router-link class="no-underline" :data-tippy-info="`view ${data.name} over time`" :to="{
    name: 'Epidemiology',
    query: { location: data.location_id, variable:'dead_numIncrease' }
  }">
          <div class="d-flex align-items-end justify-content-start router-link-black mb-ml-2 p-1 mb-pl-2" id="deaths">
            <div class="d-flex flex-column text-left">
              <h6>total deaths</h6>
              <div class="muted">
                <span class="accent">{{ deaths }}</span>: today
              </div>
              <div class="muted">
                <span class="yesterday">{{ deadYesterday }}</span>: yesterday
              </div>
            </div>
            <svg class="mx-1" height="3em" width="20px">
              <defs>
                <marker id="arrow" markerWidth="13" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" fill="#939ba2" />
                </marker>
              </defs>
              <path marker-end="url(#arrow)" d="M 5, 40 C 20, 35 20, 10 5, 10" class="swoopy-arrow" fill="none" stroke="#6c757d" stroke-width="0.8"></path>
            </svg>
            <div class="d-flex flex-column number-changes">
              <div class="changes">+ {{ deadIncrease }}</div>
              <div class="changes">
                <font-awesome-icon class="increasing" :icon="['fas', 'arrow-up']" v-if="data.dead_pctIncrease > 0" />
                {{ deadPct }}
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <!-- SPARKS -->
      <div class="d-flex router-link-black mini-graphs mt-2 p-1 mb-flex">
        <div class="d-flex flex-column">
          <h6>cumulative cases</h6>
          <Sparkline :data="[data.longitudinal]" variable="confirmed" :width="140" :height="40" :id="'glance_' + idx" :color="'#126B93'" />
        </div>

        <!-- case increase barplot -->
        <div class="d-flex flex-column mb-ml-4">
          <router-link class="no-underline" :data-tippy-info="`view ${data.name} over time`" :to="{
            name: 'Epidemiology',
            query: { location: data.location_id, variable:'confirmed_numIncrease' }
          }">
            <h6 class="text-dark">new cases per day</h6>
            <Bargraph :data="data.longitudinal" :variableObj="{ value: 'confirmed_numIncrease' }" :width="140" :height="40" :id="'glance_' + idx" :color="'#126B93'" colorAverage="#D13B62" />
          </router-link>
        </div>

        <!-- death increase barplot -->
        <div class="d-flex flex-column mb-ml-4">
          <router-link class="no-underline" :data-tippy-info="`view ${data.name} over time`" :to="{
            name: 'Epidemiology',
            query: { location: data.location_id, variable:'dead_numIncrease' }
          }">
            <h6 class="text-dark">new deaths per day</h6>
            <Bargraph :data="data.longitudinal" :variableObj="{ value: 'dead_numIncrease' }" :width="150" :height="40" :id="'glance2_' + idx" :color="'#126B93'" colorAverage="#D13B62" />
          </router-link>
        </div>
      </div>
    </router-link>

    <!-- VOCs / VOIs -->
    <router-link :to="{name: 'LocationReport', query:{ loc: data.location_id }}" class="no-underline">
      <div class="d-flex flex-column router-link-black mini-graphs mt-2 p-1">
        <div class="d-flex justify-content-between align-items-center mb-flex">
          Variants of Concern
          <small class="text-muted" v-if="data.voc">Cumulative prevalence since detection</small>
        </div>
        <div class="d-flex flex-wrap" v-if="data.voc">
          <div v-for="(variant, vIdx) in data.voc" :key="vIdx" class="mr-3 d-flex flex-column justify-content-center align-items-center">
            <small class="d-flex align-items-center px-2 py-1 justify-content-center" :style="{ color: variant.color, backgroundColor: variant.fill }">
              {{variant.proportion_formatted}}
            </small>
            <small class="font-weight-bold">
              {{variant.label}}
            </small>
            <small class="tiny" :class="variant.type +'-color'">
              {{variant.type}}
            </small>
          </div>
        </div>

        <small class="text-muted" v-else>
          No known sequencing
        </small>
      </div>
    </router-link>
  </div>

  <div class="delete-me d-flex align-items-center justify-content-center flex-column" v-if="deletable" @click="removeSummary">
    <font-awesome-icon :icon="['far', 'trash-alt']" class="delete-icon" />
    <h6 class="mt-2">remove {{ data.name }}</h6>
  </div>
</div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  format
} from "d3";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faArrowUp
} from "@fortawesome/free-solid-svg-icons";
import {
  faTrashAlt
} from "@fortawesome/free-regular-svg-icons";

library.add(faArrowUp, faTrashAlt);

import Sparkline from "@/components/Sparkline.vue";
import Bargraph from "@/components/Bargraph.vue";

export default Vue.extend({
  name: "GlanceSummary",
  props: {
    data: Object,
    idx: String,
    deletable: Boolean
  },
  data() {
    return {};
  },
  watch: {},
  components: {
    FontAwesomeIcon,
    Sparkline,
    Bargraph
  },
  methods: {
    formatPct(pct) {
      if (!pct) {
        return null;
      }

      if (pct < 0) {
        return "count corrected";
      }

      if (pct < 0.005) {
        return "< 1%";
      }

      if (!isFinite(pct)) {
        return "* first reported *";
      }

      return format(".0%")(pct);
    },
    removeSummary() {
      this.$emit("removed", this.idx);
    }
  },
  computed: {
    updatedDate() {
      return this.data.date;
    },
    cases() {
      return this.data.confirmed.toLocaleString();
    },
    casesIncrease() {
      return this.data.confirmed_numIncrease.toLocaleString();
    },
    casesPct() {
      return this.formatPct(this.data.confirmed_pctIncrease);
    },
    casesYesterday() {
      return (
        this.data.confirmed - this.data.confirmed_numIncrease
      ).toLocaleString();
    },
    deaths() {
      return this.data.dead.toLocaleString();
    },
    deadIncrease() {
      return this.data.dead_numIncrease.toLocaleString();
    },
    deadPct() {
      return this.formatPct(this.data.dead_pctIncrease);
    },
    deadYesterday() {
      return (this.data.dead - this.data.dead_numIncrease).toLocaleString();
    }
  }
});
</script>

<style lang="scss" scoped>
.at-a-glance {
    background: white;
}
.underline:hover {
    text-decoration: underline;
}
#deaths {
    border-left: 1px dashed $base-grey;
}
.number-changes {
    color: $warning-color;
}
.mini-graphs {
    border-top: 1px dashed $grey-40;
}

.delete-me {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background: #cbd7e3e0;
    background: #ecf1f5e6;
    color: $grey-70;
    &:hover {
        background: #ecf1f5f7;
        color: $warning-color;
        cursor: pointer;
    }
}

.delete-icon {
    font-size: 36px;
    color: $grey-60;
}
.accent {
    font-weight: 600;
    color: $base-grey;
}
.yesterday {
    color: $base-grey;
}

.muted {
    color: $grey-80;
}
.increasing {
    color: lighten($warning-color, 30%);
}
.changes {
    font-weight: 600;
}
.tiny {
  font-size: x-small;
}
.mb-ml-4{
margin-left: 1.5rem;
}
.mb-ml-2{
  margin-left: .5rem;
}
.mb-pl-2{
  padding-left: .5rem;
}
@media only screen and (max-width: 500px) {
.mb-width{
  width:100%;
}

#deaths{
  border-left:none;
}
.mb-ml-4{
  margin-left:0;
}
.mb-ml-2{
  margin-left: 0;
}
.mb-pl-2{
  padding-left: 0;
}
}
</style>
