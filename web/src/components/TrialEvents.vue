<template>
  <div>
    <div v-if="data.studyStatus">
      <TrialStatus
        :status="data.studyStatus"
        :includeDate="true"
        :locations="data.studyLocation"
        :mapWidth="500"
      />
    </div>

    <div v-if="locations && locations.length" class="mt-3 mb-2">
      Study Locations
      <ul>
        <li v-for="(location, idx) in locations" :key="idx">
          {{ location.key }}
          <ul>
            <li v-for="(subnational, idx2) in location.values" :key="idx2">
              <span class="text-dark font-weight-700">
                {{ subnational.name }}
              </span>
              <span
                v-if="
                  subnational.studyLocationCity ||
                  subnational.studyLocationState
                "
              >
                &nbsp;(
              </span>
              <span v-if="subnational.studyLocationCity">
                {{ subnational.studyLocationCity }}
              </span>
              <span
                v-if="
                  subnational.studyLocationCity &&
                  subnational.studyLocationState
                "
              >
                ,&nbsp;
              </span>
              <span v-if="subnational.studyLocationState">
                {{ subnational.studyLocationState }}
              </span>
              <span
                v-if="
                  subnational.studyLocationCity ||
                  subnational.studyLocationState
                "
              >
                )
              </span>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="mt-3 mb-2">
      Has results:
      <span class="text-dark">
        {{
          data.hasResults
            ? 'yes'
            : data.hasResults === false
            ? 'no'
            : 'not specified'
        }}
      </span>
    </div>

    <div v-if="data.studyEvent">
      <div class="mt-3 mb-2">Study Timeline</div>
      <div class="update-container">
        <div
          v-for="(update, idx) in data.studyEvent"
          :key="idx"
          class="d-flex mb-4"
        >
          <span class="update-linker" :class="{ past: update.inPast }" />
          <span class="update-date pl-3" :class="{ past: update.inPast }">
            {{ update.dateStr }}
          </span>
          <div class="d-flex text-left">
            <span v-if="update.studyEventDateType" class="m-0 mb-1">
              <span class="update-type mr-2">
                {{ update.studyEventDateType }}
              </span>
            </span>
            <span class="text-muted" v-html="update.studyEventType" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { nest } from 'd3-collection';
import { timeFormat, timeParse } from 'd3-time-format';

import { lazyLoad } from '@/js/lazy-load';

const TrialStatus = lazyLoad('TrialStatus');

const props = defineProps({
  data: Object,
});

const locations = computed(() => {
  if (props.data.studyLocation) {
    return nest()
      .key((d) => d.studyLocationCountry)
      .entries(
        props.data.studyLocation
          .slice()
          .sort((a, b) =>
            a.studyLocationCountry < b.studyLocationCountry ? -1 : 1,
          ),
      );
  } else {
    return null;
  }
});

const formatDate = (date) => {
  return timeFormat('%e %B %Y')(date);
};

const parseDate = (date) => {
  return timeParse('%Y-%m-%d')(date);
};

onMounted(() => {
  const today = new Date();
  if (props.data.studyEvent) {
    props.data.studyEvent.forEach((d) => {
      d['date'] = parseDate(d.studyEventDate);
      d['dateStr'] = d.date ? formatDate(d.date) : d.studyEventDate;
      d['inPast'] = d.date <= today;
    });

    props.data.studyEvent.sort((a, b) => a.date - b.date);
  }
});
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
  content: '';
  left: 0;
  height: 1px;
  position: absolute;
  top: 0.75em;
  transform: translateY(-50%);
  width: 20px;
  z-index: 1;
}

.update-linker:after {
  content: '';
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
