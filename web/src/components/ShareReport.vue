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

    <p :class="{ snackbar: true, show: showSnackbar }">
      copied to clipboard
    </p>
  </div>
</template>

<script>
import Vue from 'vue';
// --- font awesome --
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import {
  faLink,
  faShare,
  faEnvelope,
  faSync,
} from '@fortawesome/free-solid-svg-icons';
import {
  faTwitter,
  faFacebookF,
  faRedditAlien,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons';

library.add(
  faLink,
  faShare,
  faEnvelope,
  faTwitter,
  faFacebookF,
  faRedditAlien,
  faLinkedinIn,
);

export default Vue.extend({
  name: 'ShareReport',
  components: {
    FontAwesomeIcon,
  },
  props: {
    title: String,
    url: String,
  },
  data() {
    return {
      showSnackbar: false,
    };
  },
  computed: {
    outbreakUrl() {
      return window.location.href;
    },
    twitterUrl() {
      return `https://twitter.com/intent/tweet?url=${this.outbreakUrl}&hashtags=covid-19,outbreak.info`;
    },
    facebookUrl() {
      return `https://www.facebook.com/sharer/sharer.php?u=${this.outbreakUrl}`;
    },
    redditUrl() {
      return `http://www.reddit.com/submit?url=${this.outbreakUrl}`;
    },
    linkedinUrl() {
      return `https://www.linkedin.com/sharing/share-offsite/?url=${this.outbreakUrl}`;
    },
    emailUrl() {
      return `mailto:?subject=outbreak.info%20Mutation%20Report&body=${this.outbreakUrl}`;
    },
    canShare() {
      return !!navigator.share;
    },
  },
  methods: {
    copy2Clipboard() {
      this.showSnackbar = true;
      setTimeout(() => {
        this.showSnackbar = false;
      }, 3000);
      navigator.clipboard.writeText(this.outbreakUrl);
    },
    shareLink() {
      if (navigator.share) {
        navigator.share({
          title: `outbreak.info Mutation Report`,
          url: this.outbreakUrl,
        });
      }
    },
  },
});
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
