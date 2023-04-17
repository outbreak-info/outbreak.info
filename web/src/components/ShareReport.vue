<template>
  <div
    class="d-flex flex-wrap w-100 justify-content-end align-items-center text-muted mb-2"
  >
    <a
      :href="twitterUrl"
      target="_blank"
      rel="noreferrer"
      class="twitter-share-button"
      aria-label="twitter link"
    >
      <font-awesome-icon class="ml-3" :icon="['fab', 'twitter']" />
    </a>

    <a
      :href="facebookUrl"
      target="_blank"
      rel="noreferrer"
      class="facebook-share-button"
      aria-label="facebook link"
    >
      <font-awesome-icon class="ml-3" :icon="['fab', 'facebook-f']" />
    </a>

    <a
      :href="redditUrl"
      target="_blank"
      rel="noreferrer"
      class="reddit-share-button"
      aria-label="reddit link"
    >
      <font-awesome-icon class="ml-3" :icon="['fab', 'reddit-alien']" />
    </a>

    <a
      :href="linkedinUrl"
      target="_blank"
      rel="noreferrer"
      class="linkedin-share-button"
      aria-label="twitter link"
    >
      <font-awesome-icon class="ml-3" :icon="['fab', 'linkedin-in']" />
    </a>

    <a :href="emailUrl" aria-label="email" target="_blank">
      <font-awesome-icon class="ml-3" :icon="['fas', 'envelope']" />
    </a>

    <a v-if="canShare" aria-label="share" @click="shareLink">
      <font-awesome-icon class="share-link ml-3" :icon="['fas', 'share']" />
    </a>

    <a aria-label="copy to clipboard" @click="copy2Clipboard">
      <font-awesome-icon class="share-link ml-3" :icon="['fas', 'link']" />
    </a>

    <p :class="{ snackbar: true, show: showSnackbar }">copied to clipboard</p>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  title: String,
  url: String,
});

const showSnackbar = ref(false);

const outbreakUrl = computed(() => {
  return window.location.href;
});

const twitterUrl = computed(() => {
  return `https://twitter.com/intent/tweet?url=${outbreakUrl.value}&hashtags=covid-19,outbreak.info`;
});

const facebookUrl = computed(() => {
  return `https://www.facebook.com/sharer/sharer.php?u=${outbreakUrl.value}`;
});

const redditUrl = computed(() => {
  return `https://www.reddit.com/submit?url=${outbreakUrl.value}`;
});

const linkedinUrl = computed(() => {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${outbreakUrl.value}`;
});

const emailUrl = computed(() => {
  return `mailto:?subject=outbreak.info%20Mutation%20Report&body=${outbreakUrl.value}`;
});

const canShare = computed(() => {
  return !!navigator.share;
});

const copy2Clipboard = () => {
  showSnackbar.value = true;
  setTimeout(() => {
    showSnackbar.value = false;
  }, 3000);
  navigator.clipboard.writeText(outbreakUrl.value);
};

const shareLink = () => {
  if (navigator.share) {
    navigator.share({
      title: `outbreak.info Mutation Report`,
      url: outbreakUrl.value,
    });
  }
};
</script>

<style lang="scss">
.share-link {
  color: $link-color !important;
  cursor: pointer;
  &:hover {
    color: $link-hover !important;
  }
}
</style>
