<template>
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue';
import tippy from 'tippy.js';
import 'tippy.js/themes/light.css';

const props = defineProps({
  report: Object,
});

onMounted(() => {
  tippy('.voc-logo', {
    content: 'Loading...',
    maxWidth: '200px',
    placement: 'bottom',
    animation: 'fade',
    theme: 'light',
    onShow(instance) {
      let info = instance.reference.dataset.tippyInfo;
      instance.setContent(info);
    },
  });
  tippy('.voi-logo', {
    content: 'Loading...',
    maxWidth: '200px',
    placement: 'bottom',
    animation: 'fade',
    theme: 'light',
    onShow(instance) {
      let info = instance.reference.dataset.tippyInfo;
      instance.setContent(info);
    },
  });
});
</script>

<style lang="scss" scoped>
// $voc-height: 20px;
//
// .variant-logo {
//     height: $voc-height;
// }
//
// .variant-logo-large {
//     height: $voc-height * 1.25;
// }
//
// .tracked-variant-badge {
//     color: white;
//     font-weight: 700;
//     font-size: $voc-height * 0.75;
//     display: flex;
//     align-items: center;
//     padding: 0.25rem 0.5rem 0.25rem 0.35rem;
//     border-radius: 0.25rem;
// }
//
// .voc-logo {
//     // border: 2px solid $publication-color;
//     // color: $publication-color;
//     background: $publication-color;
// }
//
// .voi-logo {
//     background: $website-color;
//     // border: 2px solid $website-color;
//     // color: $website-color;
// }
</style>
