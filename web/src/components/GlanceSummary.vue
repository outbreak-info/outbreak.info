<template>
  <div class="at-a-glance box-shadow p-2 position-relative mb-width">
    <div class="d-flex flex-column mb-width">
      <router-link
        class="no-underline"
        :data-tippy-info="`view ${data.name} over time`"
        :to="{
          name: 'Epidemiology',
          query: { location: data.location_id },
        }"
      >
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="underline m-0">
            {{ data.name }}
          </h5>
          <div class="text-muted badge bg-grey__lightest">
            {{ updatedDate }}
          </div>
        </div>

        <div class="d-flex mb-flex">
          <!-- cases increase -->
          <router-link
            class="no-underline"
            :data-tippy-info="`view ${data.name} over time`"
            :to="{
              name: 'Epidemiology',
              query: {
                location: data.location_id,
                variable: 'confirmed_numIncrease',
              },
            }"
          >
            <div
              class="d-flex align-items-end justify-content-start router-link-black mr-2 p-1"
            >
              <div class="d-flex flex-column text-left">
                <h6>total cases</h6>
                <div class="muted">
                  <span class="accent">{{ cases }}</span>
                  : today
                </div>
                <div class="muted">
                  <span class="yesterday">{{ casesYesterday }}</span>
                  : yesterday
                </div>
              </div>
              <svg class="mx-1" height="3em" width="20px">
                <defs>
                  <marker
                    id="arrow"
                    markerWidth="13"
                    markerHeight="10"
                    refX="9"
                    refY="5"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path
                      d="M5,0 L12,5 L5,10"
                      class="swoopy-arrowhead"
                      fill="#939ba2"
                    />
                  </marker>
                </defs>
                <path
                  marker-end="url(#arrow)"
                  d="M 5, 40 C 20, 35 20, 10 5, 10"
                  class="swoopy-arrow"
                  fill="none"
                  stroke="#6c757d"
                  stroke-width="0.8"
                />
              </svg>
              <div class="d-flex flex-column number-changes">
                <div class="changes">+ {{ casesIncrease }}</div>
                <div class="changes">
                  <font-awesome-icon
                    v-if="data.confirmed_pctIncrease > 0"
                    class="increasing"
                    :icon="['fas', 'arrow-up']"
                  />
                  {{ casesPct }}
                </div>
              </div>
            </div>
          </router-link>

          <!-- deaths -->
          <router-link
            class="no-underline"
            :data-tippy-info="`view ${data.name} over time`"
            :to="{
              name: 'Epidemiology',
              query: {
                location: data.location_id,
                variable: 'dead_numIncrease',
              },
            }"
          >
            <div
              id="deaths"
              class="d-flex align-items-end justify-content-start router-link-black mb-ml-2 p-1 mb-pl-2"
            >
              <div class="d-flex flex-column text-left">
                <h6>total deaths</h6>
                <div class="muted">
                  <span class="accent">{{ deaths }}</span>
                  : today
                </div>
                <div class="muted">
                  <span class="yesterday">{{ deadYesterday }}</span>
                  : yesterday
                </div>
              </div>
              <svg class="mx-1" height="3em" width="20px">
                <defs>
                  <marker
                    id="arrow"
                    markerWidth="13"
                    markerHeight="10"
                    refX="9"
                    refY="5"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path
                      d="M5,0 L12,5 L5,10"
                      class="swoopy-arrowhead"
                      fill="#939ba2"
                    />
                  </marker>
                </defs>
                <path
                  marker-end="url(#arrow)"
                  d="M 5, 40 C 20, 35 20, 10 5, 10"
                  class="swoopy-arrow"
                  fill="none"
                  stroke="#6c757d"
                  stroke-width="0.8"
                />
              </svg>
              <div class="d-flex flex-column number-changes">
                <div class="changes">+ {{ deadIncrease }}</div>
                <div class="changes">
                  <font-awesome-icon
                    v-if="data.dead_pctIncrease > 0"
                    class="increasing"
                    :icon="['fas', 'arrow-up']"
                  />
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
            <Sparkline
              :id="'glance_' + idx"
              :data="[data.longitudinal]"
              variable="confirmed"
              :width="140"
              :height="40"
              :color="'#126B93'"
            />
          </div>

          <!-- case increase barplot -->
          <div class="d-flex flex-column mb-ml-4">
            <router-link
              class="no-underline"
              :data-tippy-info="`view ${data.name} over time`"
              :to="{
                name: 'Epidemiology',
                query: {
                  location: data.location_id,
                  variable: 'confirmed_numIncrease',
                },
              }"
            >
              <h6 class="text-dark">new cases per day</h6>
              <Bargraph
                :id="'glance_' + idx"
                :data="data.longitudinal"
                :variableObj="{ value: 'confirmed_numIncrease' }"
                :width="140"
                :height="40"
                :color="'#126B93'"
                colorAverage="#D13B62"
              />
            </router-link>
          </div>

          <!-- death increase barplot -->
          <div class="d-flex flex-column mb-ml-4">
            <router-link
              class="no-underline"
              :data-tippy-info="`view ${data.name} over time`"
              :to="{
                name: 'Epidemiology',
                query: {
                  location: data.location_id,
                  variable: 'dead_numIncrease',
                },
              }"
            >
              <h6 class="text-dark">new deaths per day</h6>
              <Bargraph
                :id="'glance2_' + idx"
                :data="data.longitudinal"
                :variableObj="{ value: 'dead_numIncrease' }"
                :width="150"
                :height="40"
                :color="'#126B93'"
                colorAverage="#D13B62"
              />
            </router-link>
          </div>
        </div>
      </router-link>

      <!-- VOCs / VOIs -->
      <router-link
        :to="{ name: 'LocationReport', query: { loc: data.location_id } }"
        class="no-underline"
      >
        <div class="d-flex flex-column router-link-black mini-graphs mt-2 p-1">
          <div
            class="d-flex justify-content-between align-items-center mb-flex"
          >
            Variants of Concern
            <small v-if="data.voc" class="text-muted">
              Cumulative prevalence since detection
            </small>
          </div>
          <div v-if="data.voc" class="d-flex flex-wrap">
            <div
              v-for="(variant, vIdx) in data.voc"
              :key="vIdx"
              class="mr-3 d-flex flex-column justify-content-center align-items-center"
            >
              <small
                class="d-flex align-items-center px-2 py-1 justify-content-center"
                :style="{ color: variant.color, backgroundColor: variant.fill }"
              >
                {{ variant.proportion_formatted }}
              </small>
              <small class="font-weight-bold">
                {{ variant.label }}
              </small>
              <small class="tiny" :class="variant.type + '-color'">
                {{ variant.type }}
              </small>
            </div>
          </div>

          <small v-else class="text-muted">No known sequencing</small>
        </div>
      </router-link>
    </div>

    <div
      v-if="deletable"
      class="delete-me d-flex align-items-center justify-content-center flex-column"
      @click="removeSummary"
    >
      <font-awesome-icon :icon="['far', 'trash-alt']" class="delete-icon" />
      <h6 class="mt-2">remove {{ data.name }}</h6>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { format } from 'd3-format';

import { lazyLoad } from '@/js/lazy-load';

const Sparkline = lazyLoad('Sparkline');
const Bargraph = lazyLoad('Bargraph');

const props = defineProps({
  data: Object,
  idx: String,
  deletable: Boolean,
});

const emit = defineEmits(['removed']);

const updatedDate = computed(() => {
  return props.data.date;
});

const cases = computed(() => {
  return props.data.confirmed.toLocaleString();
});

const casesIncrease = computed(() => {
  return props.data.confirmed_numIncrease.toLocaleString();
});

const casesPct = computed(() => {
  return formatPct(props.data.confirmed_pctIncrease);
});

const casesYesterday = computed(() => {
  return (
    props.data.confirmed - props.data.confirmed_numIncrease
  ).toLocaleString();
});

const deaths = computed(() => {
  return props.data.dead.toLocaleString();
});

const deadIncrease = computed(() => {
  return props.data.dead_numIncrease.toLocaleString();
});

const deadPct = computed(() => {
  return formatPct(props.data.dead_pctIncrease);
});

const deadYesterday = computed(() => {
  return (props.data.dead - props.data.dead_numIncrease).toLocaleString();
});

const formatPct = (pct) => {
  if (!pct) {
    return null;
  }

  if (pct < 0) {
    return 'count corrected';
  }

  if (pct < 0.005) {
    return '< 1%';
  }

  if (!isFinite(pct)) {
    return '* first reported *';
  }

  return format('.0%')(pct);
};

const removeSummary = () => {
  emit('removed', props.idx);
};
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
.mb-ml-4 {
  margin-left: 1.5rem;
}
.mb-ml-2 {
  margin-left: 0.5rem;
}
.mb-pl-2 {
  padding-left: 0.5rem;
}
@media only screen and (max-width: 500px) {
  .mb-width {
    width: 100%;
  }

  #deaths {
    border-left: none;
  }
  .mb-ml-4 {
    margin-left: 0;
  }
  .mb-ml-2 {
    margin-left: 0;
  }
  .mb-pl-2 {
    padding-left: 0;
  }
}
</style>
