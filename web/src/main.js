import { createApp, h } from 'vue';
import VueGtag from 'vue-gtag';
import VueCookies from 'vue-cookies';
import { library } from '@fortawesome/fontawesome-svg-core';
import { createPinia } from 'pinia';
import { createHead } from "@unhead/vue";
import 'd3-transition';

// free regular svg icons
import { faClock } from '@fortawesome/free-regular-svg-icons/faClock';
import { faCopy } from '@fortawesome/free-regular-svg-icons/faCopy';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons/faTimesCircle';
import { faCheckSquare } from '@fortawesome/free-regular-svg-icons/faCheckSquare';
import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare';
import { faPlusSquare } from '@fortawesome/free-regular-svg-icons/faPlusSquare';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons/faQuestionCircle';
import { faFile } from '@fortawesome/free-regular-svg-icons/faFile';
import { faWindowClose } from '@fortawesome/free-regular-svg-icons/faWindowClose';

// free solid svg icons
import { faAt } from '@fortawesome/free-solid-svg-icons/faAt';
import { faAngleDoubleRight } from '@fortawesome/free-solid-svg-icons/faAngleDoubleRight';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faPhone } from '@fortawesome/free-solid-svg-icons/faPhone';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons/faExclamationCircle';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faSync } from '@fortawesome/free-solid-svg-icons/faSync';
import { faPills } from '@fortawesome/free-solid-svg-icons/faPills';
import { faDna } from '@fortawesome/free-solid-svg-icons/faDna';
import { faVirus } from '@fortawesome/free-solid-svg-icons/faVirus';
import { faMortarPestle } from '@fortawesome/free-solid-svg-icons/faMortarPestle';
import { faNotesMedical } from '@fortawesome/free-solid-svg-icons/faNotesMedical';
import { faTabletAlt } from '@fortawesome/free-solid-svg-icons/faTabletAlt';
import { faVial } from '@fortawesome/free-solid-svg-icons/faVial';
import { faCapsules } from '@fortawesome/free-solid-svg-icons/faCapsules';
import { faUserNurse } from '@fortawesome/free-solid-svg-icons/faUserNurse';
import { faRadiation } from '@fortawesome/free-solid-svg-icons/faRadiation';
import { faVenus } from '@fortawesome/free-solid-svg-icons/faVenus';
import { faMars } from '@fortawesome/free-solid-svg-icons/faMars';
import { faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons/faAngleDoubleDown';
import { faAngleDoubleUp } from '@fortawesome/free-solid-svg-icons/faAngleDoubleUp';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons/faPlusCircle';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import { faLink } from '@fortawesome/free-solid-svg-icons/faLink';
import { faShare } from '@fortawesome/free-solid-svg-icons/faShare';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons/faSearchPlus';
import { faCompressArrowsAlt } from '@fortawesome/free-solid-svg-icons/faCompressArrowsAlt';
import { faSort } from '@fortawesome/free-solid-svg-icons/faSort';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faPause } from '@fortawesome/free-solid-svg-icons/faPause';
import { faStepForward } from '@fortawesome/free-solid-svg-icons/faStepForward';
import { faFastForward } from '@fortawesome/free-solid-svg-icons/faFastForward';
import { faStepBackward } from '@fortawesome/free-solid-svg-icons/faStepBackward';
import { faFastBackward } from '@fortawesome/free-solid-svg-icons/faFastBackward';

// free brands svg icons
import { faTwitter } from '@fortawesome/free-brands-svg-icons/faTwitter';
import { faLinkedinIn } from '@fortawesome/free-brands-svg-icons/faLinkedinIn';
import { faFacebookF } from '@fortawesome/free-brands-svg-icons/faFacebookF';
import { faRedditAlien } from '@fortawesome/free-brands-svg-icons/faRedditAlien';

// vue fontawesome component
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import App from './App.vue';
import router from './router';

import 'tippy.js/dist/tippy.css';

library.add(
  faAt,
  faArrowLeft,
  faArrowRight,
  faChevronUp,
  faChevronDown,
  faAngleDoubleRight,
  faPhone,
  faPlus,
  faClock,
  faGithub,
  faInfoCircle,
  faExclamationCircle,
  faSpinner,
  faSearch,
  faSync,
  faTimesCircle,
  faLinkedinIn,
  faTwitter,
  faPills,
  faDna,
  faVirus,
  faMortarPestle,
  faNotesMedical,
  faTabletAlt,
  faVial,
  faCapsules,
  faUserNurse,
  faRadiation,
  faCheckSquare,
  faSquare,
  faAngleDoubleUp,
  faAngleDoubleDown,
  faVenus,
  faMars,
  faQuestionCircle,
  faCopy,
  faPlusSquare,
  faFile,
  faWindowClose,
  faArrowUp,
  faArrowDown,
  faChevronRight,
  faPlusCircle,
  faTrashAlt,
  faLink,
  faShare,
  faEnvelope,
  faSearchPlus,
  faCompressArrowsAlt,
  faSort,
  faPlay,
  faPause,
  faStepForward,
  faStepBackward,
  faFastForward,
  faFastBackward,
  faFacebookF,
  faRedditAlien,
);

const pinia = createPinia();

const head = createHead();

const app = createApp({
  render() {
    return h(App);
  },
})
  .use(router)
  .use(pinia)
  .use(head)
  .use(VueCookies)
  .use(
    VueGtag,
    {
      config: {
        id: 'G-H3QB0DV85N',
      },
      // fix via https://github.com/MatteoGabriele/vue-gtag/issues/229 to track query params in GA
      pageTrackerSkipSamePath: false,
      pageTrackerTemplate(to) {
        return {
          page_title: to.name,
          page_path: to.fullPath,
          page_location: window.location.href,
        };
      },
    },
    router,
  );

app.component('font-awesome-icon', FontAwesomeIcon);
app.config.globalProperties.$apiurl = 'https://api.outbreak.info/covid19/';
app.config.globalProperties.$resourceurl =
  'https://api.outbreak.info/resources/';
app.config.globalProperties.$genomicsurl =
  'https://api.outbreak.info/genomics/';

app.config.globalProperties.$filters = {
  capitalize(value) {
    if (!value) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  },
};

app.provide('apiUrl', 'https://api.outbreak.info/covid19/');
app.provide('resourceUrl', 'https://api.outbreak.info/resources/');
app.provide('genomicsUrl', 'https://api.outbreak.info/genomics/');
app.provide('filters', {
  capitalize: (value) => {
    if (!value) return '';
    value = value.toString();
    return value.charAt(0).toUpperCase() + value.slice(1);
  },
});

app.mount('#app');
