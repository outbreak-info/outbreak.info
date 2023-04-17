<template>
  <div>
    <div
      v-if="loading && showLoading"
      class="loader dialog d-flex flex-column align-items-center"
    >
      <font-awesome-icon
        class="fa-pulse fa-4x text-highlight"
        :icon="['fas', 'spinner']"
      />
      <div class="text-light mt-3">Fetching data, please be patient</div>
      <div class="text-light">{{ formatPercent(progress) }} complete</div>
      <svg :width="progressBarWidth" height="20">
        <rect
          x="0"
          y="0"
          :width="progressBarWidth"
          height="20"
          class="progress-background"
        ></rect>
        <rect
          x="0"
          y="0"
          :width="progressBarWidth * progress"
          height="20"
          class="progress-bar"
        ></rect>
        <rect
          x="0"
          y="0"
          :width="progressBarWidth"
          height="20"
          class="progress-stroke"
        ></rect>
      </svg>
    </div>

    <div class="d-inline">
      <!-- button to download -->
      <button
        class="download-btn btn-main-outline router-link no-underline my-1"
        role="button"
        @click="showDialogBox"
      >
        <small>download {{ downloadLabel }}</small>
      </button>
      <a class="hidden" ref="download_link"></a>

      <div
        id="download-dialog"
        class="dialog position-fixed text-left d-flex flex-column text-light rounded w-75 h-75 px-5 py-4"
        v-if="showDialog"
      >
        <h2>Download</h2>

        <!-- <a href="#download" class="my-4">download files</a> -->
        <!-- Data Usage and citations -->
        <DataUsage />
        <CiteUs class="mt-5" />

        <!-- Actual data download -->
        <h2 class="my-3">Download</h2>
        <div
          v-if="
            type === 'epidemiology' ||
            type === 'regions' ||
            type === 'maps' ||
            type === 'report'
          "
          class="mb-4"
        >
          <h4 class="m-0">Figure</h4>
          <a class="text-uppercase pointer" @click="downloadSvg">
            <p class="focustext m-0">svg</p>
          </a>
          <a class="text-uppercase pointer" @click="downloadPng">
            <p class="focustext m-0">png</p>
          </a>
        </div>

        <h4 class="m-0">Data</h4>
        <a class="text-uppercase pointer" @click="prepData('json')">
          <p class="focustext m-0">json</p>
        </a>
        <a class="text-uppercase pointer" @click="prepData('tsv')">
          <p class="focustext m-0">tsv</p>
        </a>

        <!-- close button -->
        <button
          class="btn btn-main router-link no-underline m-5 background-white"
          role="button"
          @click="closeDialogBox"
        >
          close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { event } from 'vue-gtag';
import { storeToRefs } from 'pinia';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import cloneDeep from 'lodash/cloneDeep';
import uniq from 'lodash/uniq';

import { getAll, progressState$ } from '@/api/biothings.js';
import { getPng, getSvg } from '@/js/get_svg.js';
import { lazyLoad } from '@/js/lazy-load';
import { adminStore } from '@/stores/adminStore';

const DataUsage = lazyLoad('DataUsage');
const CiteUs = lazyLoad('CiteUs');

const props = defineProps({
  data: Array,
  type: String,
  figureRef: String,
  query: String,
  api: String,
  downloadLabel: {
    type: String,
    default: 'vis & data',
  },
  isVertical: {
    type: Boolean,
    default: false,
  },
  darkMode: {
    type: Boolean,
    default: false,
  },
  sourceString: {
    type: String,
    default:
      'Johns Hopkins University Center for Systems Science and Engineering;The COVID Tracking Project (testing data), updated daily.',
  },
});

const showDialog = ref(false);
const showLoading = ref(false);
const downloadable = ref(null);
const dataSubscription = ref(null);
const progress = ref(0);
const progressBarWidth = ref(225);
// missing variable in previous version
const progressSubscription = ref(null);
// this.$refs
const download_link = ref(null);

// this.$route
const route = useRoute();
// this.$router
const router = useRouter();

const store = adminStore();
const { loading, sources, resources } = storeToRefs(store);

const today = computed(() => {
  return new Date();
});

const todayFormatted = computed(() => {
  return formatDate(today.value);
});

const todayFormattedLong = computed(() => {
  return formatDate(today.value, '%d %b %Y');
});

const filename = computed(() => {
  if (props.data && props.data.length === 1 && props.type === 'epidemiology') {
    return `${props.data[0].key}_outbreakinfo_epidemiology_data_${todayFormatted.value}`;
  } else if (props.type === 'resources') {
    return `outbreakinfo_resources_metadata_${todayFormatted.value}`;
  } else if (props.type === 'report') {
    return `outbreakinfo_mutation_report_data_${todayFormatted.value}`;
  } else {
    return `outbreakinfo_epidemiology_data_${todayFormatted.value}`;
  }
});

const formatDate = (dateString, formatString = '%Y-%m-%d') => {
  const formatDate = timeFormat(formatString);
  return formatDate(dateString);
};

const formatPercent = (value) => {
  return format('.0%')(value);
};

const closeDialogBox = () => {
  showDialog.value = false;
};

const showDialogBox = () => {
  showDialog.value = true;
};

const downloadAll = (dwnld_data, encodingFormat, filename) => {
  downloadData(dwnld_data, encodingFormat, filename);
  downloadData(
    [getMetadata(filename)],
    'text/plain',
    `${filename.value}_README.txt`,
    true,
  );
};

const downloadData = (
  dwnld_data,
  encodingFormat,
  filename,
  isReadme = false,
) => {
  // Send GA event
  // https://matteo-gabriele.gitbook.io/vue-gtag/methods/events
  if (isReadme) {
    event('download', {
      event_category: `${props.type}_${props.figureRef}_${props.downloadLabel}_README`,
      event_label: `downloading |${props.figureRef}| {${props.downloadLabel} README} data from [${route.fullPath}] as (${encodingFormat})`,
    });
  } else {
    event('download', {
      event_category: `${props.type}_${props.figureRef}_${props.downloadLabel}`,
      event_label: `downloading |${props.figureRef}| {${props.downloadLabel}} data from [${route.fullPath}] as (${encodingFormat})`,
    });
  }

  // code adapted from CViSB
  const blob = new Blob(dwnld_data, {
    type: encodingFormat,
  });

  const hiddenElement = download_link.value;
  hiddenElement.href = window.URL.createObjectURL(blob);
  hiddenElement.target = '_blank';
  hiddenElement.download = filename;
  hiddenElement.click();
  showDialog.value = false;

  setTimeout(() => {
    window.URL.revokeObjectURL(hiddenElement.href);
  }, 10);
};

const getMetadata = (filename) => {
  const sourceText = props.query
    ? `${window.location.origin}/${route.fullPath}\nQuery: ${props.query}`
    : `${window.location.origin}/${route.fullPath}`;

  const epiString = store.$state.sources
    .map((d) => `${d.scope}: ${d.citation}`)
    .join('\n\n');
  const resourcesString = store.$state.resources
    .flatMap((d) => d.sources)
    .map((d) => `${d.name}: ${d.citation}`)
    .join('\n\n');

  return `${filename}

Downloaded: ${today.value}
Source: ${sourceText}

\n\n\nPlease cite the data sources, as appropriate, and follow the terms of their licenses:
\n\n${'-'.repeat(75)}
outbreak.info
${'-'.repeat(75)}
${store.$state.genomicsCitation}\n
${store.$state.resourcesCitation}
\n\n${'-'.repeat(75)}
epidemiology
${'-'.repeat(75)}
${epiString}
\n\n${'-'.repeat(75)}
resources
${'-'.repeat(75)}
${resourcesString}
\n\n${'-'.repeat(75)}
`;
};

const downloadSvg = () => {
  const svgObject = getSvg(
    props.figureRef,
    props.sourceString,
    todayFormattedLong.value,
    props.darkMode,
  );

  const filenames = svgObject
    .map((svg) => filename.value + '_' + svg.name + '.svg')
    .join(', ');

  downloadData(
    [getMetadata(getMetadata(filenames))],
    'text/plain',
    `${filename.value}_README.txt`,
    true,
  );
  svgObject.forEach((svg) =>
    downloadData(
      svg.source,
      'text/xml',
      filename.value + '_' + svg.name + '.svg',
    ),
  );
};

const downloadPng = () => {
  event('download', {
    event_category: `${props.type}_${props.figureRef}_${props.downloadLabel}`,
    event_label: `downloading |${props.figureRef}| {${props.downloadLabel}} data from [${route.fullPath}] as (.png)`,
  });
  getPng(
    `svg.${props.figureRef}`,
    props.sourceString,
    todayFormattedLong.value,
    props.isVertical,
    props.darkMode,
    true,
    `${filename.value}.png`,
  );
  downloadData(
    [getMetadata(filename.value)],
    'text/plain',
    `${filename.value}_README.txt`,
    true,
  );
};

const prepData = (fileType) => {
  if (!downloadable.value && props.query && props.api) {
    showDialog.value = false;
    showLoading.value = true;
    dataSubscription.value = getAll(props.api, props.query).subscribe(
      (results) => {
        downloadable.value = cleanData(results, fileType);
        showLoading.value = false;
      },
    );
  } else {
    cleanData(props.data, fileType);
  }
};

const cleanData = (data, fileType) => {
  if (data) {
    // create a copy so the real stuff isn't mutated
    downloadable.value = cloneDeep(data);

    // clean up based on the type of data being exported
    if (props.type === 'epidemiology') {
      downloadable.value = downloadable.value
        .flatMap((location) => location.value)
        .filter((d) => !d.calculated);

      downloadable.value.forEach((d) => {
        d['source'] =
          d.country_name === 'United States of America' ||
          d.iso3 === 'USA' ||
          d.location_id === 'USA'
            ? 'The New York Times, The COVID Tracking Project'
            : 'JHU COVID-19 Data Repository';
        d['date'] = formatDate(d.date);
        delete d._score;
        delete d.color;
      });
    } else if (props.type === 'maps') {
      downloadable.value.forEach((d) => {
        d['source'] =
          d.country_name === 'United States of America' ||
          d.iso3 === 'USA' ||
          d.location_id === 'USA'
            ? 'The New York Times'
            : 'JHU COVID-19 Data Repository';
        delete d._score;
        delete d.datetime;
        delete d.fill;
      });
    } else if (props.type === 'regions') {
      downloadable.value.forEach((d) => {
        d['source'] = 'JHU COVID-19 Data Repository, The New York Times';
        d['date'] = formatDate(d.date);
        delete d._score;
      });
    } else if (props.type === 'resources') {
      downloadable.value.forEach((d) => {
        d['source'] = d.curatedBy ? d.curatedBy.name : null;
        delete d._score;
        delete d.color;
      });
    } else {
      downloadable.value.forEach((d) => {
        d['source'] = d.curatedBy ? d.curatedBy.name : null;
        delete d._score;
        delete d.color;
      });
    }

    if (fileType === 'tsv') {
      downloadTsv();
    } else {
      downloadJson();
    }
  }
};

const data2Str = (data, columnDelimiter = '\t') => {
  const lineDelimiter = '\n';

  let colnames = uniq(data.flatMap((d) => Object.keys(d)));

  let dwnld_data = '';
  dwnld_data += colnames.join(columnDelimiter);
  dwnld_data += lineDelimiter;

  data.forEach(function (item) {
    let counter = 0;
    colnames.forEach(function (key) {
      if (counter > 0) dwnld_data += columnDelimiter;

      // For null values, return empty string.
      // Make sure the values are encased in quotes, in case the item[key] includes html like `\n` which will break the parsing
      dwnld_data +=
        item[key] || item[key] === 0 || item[key] === false
          ? `${JSON.stringify(item[key])}`
          : '';
      counter++;
    });
    dwnld_data += lineDelimiter;
  });

  return dwnld_data;
};

const downloadJson = () => {
  const dataString = JSON.stringify(downloadable.value);
  downloadAll(
    [dataString],
    'text/json;charset=utf-8',
    filename.value + '.json',
  );
};

const downloadTsv = () => {
  const dataString = data2Str(downloadable.value);
  downloadAll(
    [dataString],
    'text/tab-separated-values;charset=utf-8',
    filename.value + '.tsv',
  );
};

onMounted(() => {
  progressSubscription.value = progressState$.subscribe((progressRes) => {
    progress.value = progressRes;
  });

  // this.$nextTick in optionsAPI
  nextTick(() => {
    // window.addEventListener("click", this.closeDialogBox), { passive: true };
    // Close on escape
    document.addEventListener(
      'keyup',
      (evt) => {
        if (evt.keyCode === 27) {
          closeDialogBox();
        }
      },
      {
        passive: true,
      },
    );
  });
});

onUnmounted(() => {
  if (dataSubscription.value) {
    dataSubscription.value.unsubscribe();
  }
  if (progressSubscription.value) {
    progressSubscription.value.unsubscribe();
  }
  // window.removeEventListener("click", this.closeDialogBox);
  document.removeEventListener('keyup', closeDialogBox);
});
</script>

<style lang="scss">
.dialog {
  background: rgba(40, 40, 40, 0.95);
  top: 50%;
  left: 50%;
  box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
  padding: 10px;
  z-index: 99;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  overflow-y: auto;
}

.btn-main.background-white {
  background: white !important;
  color: $primary-color !important;
  &:hover {
    color: white !important;
  }
}

#download-dialog.text-light a {
  color: rgba(255, 255, 255, 0.5) !important; //#3d9bff
  &:hover {
    color: #85c0ff !important;
  }
}

#download-dialog.text-light .text-highlight {
  color: #ff7096 !important;
}

.progress-bar {
  fill: $warning-color;
}

.progress-background {
  fill: $grey-40;
}

.progress-stroke {
  stroke: white;
  stroke-width: 1.5;
  fill: none;
}

.download-btn {
  min-width: 160px;
}
</style>
