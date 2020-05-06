<template>
  <svg :width="width" :height="height" class="mr-1">
    <rect
      :width="width"
      :height="height"
      x="0"
      y="0"
      :class="[className, 'light']"
    ></rect>
    <polygon
      :points="
        `0,0 ${this.width},0 ${this.width},${this.height * (2 / 3) -
          2.5} 0,${this.height * (2 / 3) + 2.5}`
      "
      :class="className"
    ></polygon>
    <polygon
      :points="
        `0,0 ${this.width},0 ${this.width},${this.height / 3 - 2.5} 0,${this
          .height /
          3 +
          2.5}`
      "
      :class="[className, 'dark']"
    ></polygon>
  </svg>
</template>

<script>
export default {
  name: "StripeAccent",
  props: {
    width: {
      type: Number,
      default: 6
    },
    height: {
      type: Number,
      default: 25
    },
    className: String
  },
  data() {
    return {};
  }
};
</script>

<style lang="scss">
svg {
  min-width: 6px;
}
</style>
