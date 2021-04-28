<!-- html code which renders the page -->
<template>
<div class="row" style="min-height: 75vh;">
  <div class="col-sm-12 my-5">

    <div class="container text-left mb-5">
      <h1>Frequently Asked Questions</h1>
      <!-- automatically pull Q&A from /assets/faq.json -->
      <section id="faq" class="my-3">
        <div v-for="(group, gIdx) in faqGroups" :key="gIdx">
          <h3>{{group}}</h3>
          <ol>
            <li v-for="(question, qIdx) in faq[group]" :key="qIdx" class="mb-3">
              <b>{{question.q}}</b>
              <div v-html="question.a"></div>
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
