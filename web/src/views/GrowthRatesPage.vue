<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-notification-provider>
      <div class="page-wrapper">
        <GrHeader />
        <GrIntro />
        <GrForm 
          @query-button-clicked="handleQueryButtonClick"
        />
        <GrVisualizations
          v-if="filteredData.length > 0"
          :data="filteredData"
        />
        <GrWarning
          v-if="locationsWithoutData.length > 0"
          :lineage="chosenLineage"
          :data="locationsWithoutData"
        />
        <GrNotes />
        <GrAcknowledgements />
        <n-back-top :right="100">
          <div class="back-top">
            Back to top
          </div>
        </n-back-top>
      </div>
    </n-notification-provider>
  </n-config-provider>
</template>
  
<script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import _ from 'lodash';
  import { quantile } from 'd3-array';
  import { NConfigProvider, NNotificationProvider, NBackTop } from 'naive-ui';
  import { lazyLoad } from '@/js/lazy-load';
  import { themeOverrides } from '@/assets/growth-rates/naiveThemeVariables.js';
  import { getGrowthRatesByLocation } from '@/api/growth-rates.js';
  import { useMetadataStore } from '@/stores/metadataStore';
  import { useSeoMeta } from 'unhead';

  const GrHeader = lazyLoad('GrHeader');
  const GrIntro = lazyLoad('GrIntro');
  const GrForm = lazyLoad('GrForm');
  const GrVisualizations = lazyLoad('GrVisualizations');
  const GrWarning = lazyLoad('GrWarning');
  const GrNotes = lazyLoad('GrNotes');
  const GrAcknowledgements = lazyLoad('GrAcknowledgements');

  const props = defineProps({
    lin: {
      type: String,
      default: '',
    },
    loc: {
      type: Array,
      default: () => [],
    },
  });

  const router = useRouter();

  const chosenLineage = ref(props.lin);
  const chosenLocations = ref(props.loc);
  const chosenLocationInfo = ref([]);
    
  const growthRateApiUrl = "https://api.outbreak.info/growth_rate/query";
   
  const apiData = ref([]);
  const apiDataWithLabels = ref([]);

  const filteredData = ref([]);
  
  const locationsWithData = ref([]);
  const locationsWithoutData = ref([]);
 
  const lowPercentile = 0.0;
  const highPercentile = 1.0;

  const snrThreshold = 0.0;

  const isDataAggregated = ref(false);

  onMounted(() => {
    const metadataStore = useMetadataStore();
    const metadata = metadataStore.defaultMetadata;
    useSeoMeta(metadata);
  });

  const handleQueryButtonClick = ({ lineage, locations, locationsInfo }) => {
    chosenLineage.value = lineage;
    chosenLocations.value = locations;
    chosenLocationInfo.value = locationsInfo;
    locationsWithoutData.value = [];

    if (chosenLineage.value.includes('*')) {
      chosenLineage.value = chosenLineage.value.replace('*', '+');
      isDataAggregated.value = true;
    }
  
    const lineageAndLocationsString = `lineage:${chosenLineage.value} AND location:(${chosenLocations.value.join(' OR ')})`
   
    getData(growthRateApiUrl, lineageAndLocationsString);
    changeUrl();
  }

  const getData = (url, selections) => {
    getGrowthRatesByLocation(url, selections)
      .then((response) => {
        apiData.value = response.data.hits;
        filteredData.value = flattenandFilterArray(apiData.value);
        locationsWithoutData.value = findLocationsWithoutData(apiData.value);
      })
      .catch((e) => {
        console.log('%c Error in getting growth rate data!', 'color: red');
        console.log(e);
      });
  }

  const flattenandFilterArray = (nestedArray) => {
    if (isDataAggregated.value) {
      apiDataWithLabels.value = nestedArray.map(x => {
        return { ...x, label: chosenLocationInfo.value.find(y => x.location === y.value)?.label, lineageLabel: x.lineage.replace('+', '*') }
      });
    } else {
      apiDataWithLabels.value = nestedArray.map(x => {
        return { ...x, label: chosenLocationInfo.value.find(y => x.location === y.value)?.label, lineageLabel: x.lineage }
      });
    }

    const flatArray = _.flatMap(apiDataWithLabels.value, ({ _id, _score, lineage, location, lineageLabel, label, values }) =>
        _.map(values, value => ({ _id, _score, lineage, location, lineageLabel, label, ...value })));  

    const lowerBound = quantile(flatArray, lowPercentile, d => d.G_7_linear);
    const upperBound = quantile(flatArray, highPercentile, d => d.G_7_linear);

    const filteredArray = flatArray.filter(
      d => d.G_7_linear >= lowerBound && d.G_7_linear <= upperBound && d.snr >= snrThreshold,
    );

    locationsWithData.value = [...new Set(filteredArray.map(obj => obj.label)) ];
    
    return filteredArray;
  }

  const findLocationsWithoutData = () => { 
    const chosenLocationNames = chosenLocationInfo.value.map(obj => obj.label);

    const locationsWithoutDataArray = (chosenLocationNames.filter(element => !locationsWithData.value.includes(element)));

    return locationsWithoutDataArray;
  }

  const changeUrl = () => {
    router.push({
      path: 'growth-rates',
      query: {
        lin: chosenLineage.value,
        loc: chosenLocations.value,
      }
    })
  };
</script>

<style scoped>
  .page-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    width: 100%;
  }
  .back-top {
    width: 150px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    font-family: 'DM Sans', 'Avenir', 'Helvetica', 'Arial', sans-serif;
    font-size: 14px;
    color: #2c3e50;
  }
</style>
  