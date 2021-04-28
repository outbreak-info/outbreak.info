<!-- html code which renders the page -->
<template>
<div class="row" style="min-height: 75vh;">
  <div class="col-sm-12 my-5">

    <div class="container text-left mb-5">
      <h1>Frequently Asked Questions</h1>
      <!-- automatically pull Q&A from /assets/faq.json -->
      <section id="faq" class="my-3">
        <div v-for="(group, gIdx) in faqGroups" :key="gIdx">
          <h3 data-toggle="collapse" :href="'#group' + gIdx" class="pointer my-5 py-2 border-left-main">{{group}}</h3>
          <ol :id="'group' + gIdx" class="collapse multi-collapse">
            <li v-for="(question, qIdx) in faq[group]" :key="qIdx" class="mb-3 font-size-xlarge">
              <b>{{question.q}}</b>
              <div class="font-size-normal" v-html="question.a"></div>
            </li>
          </ol>
        </div>

      </section>
    </div>
  </div>
</div>
</template>

<!-- Javascript code to import variables, manipulate them, etc. -->
<script>
import Vue from "vue";

import FAQ from "@/assets/faq.json";
export default Vue.extend({
  name: "Faq",
  data() {
    return ({
      faq: null,
      faqGroups: null
    })
  },
  mounted() {
    this.faq = FAQ;
    this.faqGroups = Object.keys(this.faq);
    console.log(this.faq)
  }
})
</script>

<style lang="scss">
.border-left-main {
    border-left: 8px solid $secondary-color;
    padding-left: 0.75rem;
}

.font-size-xlarge {
  font-size: large;
}

.font-size-normal {
  font-size: initial !important;
}
</style>
