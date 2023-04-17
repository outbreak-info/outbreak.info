<template>
  <div class="text-left mx-4 my-5">
    <div class="mb-4">
      <h3>Resource topic categories</h3>
      <p class="m-0">
        To increase the findability of
        <router-link :to="{ name: 'Resource Summary' }">
          COVID-19 resources
        </router-link>
        , we've grouped all the resources into the following categories.
      </p>
      <small>
        Suggest changes by submitting a

        <a
          href="https://github.com/outbreak-info/outbreak.info-resources/issues/new/choose"
          target="_blank"
          rel="noreferrer"
        >
          Github issue
        </a>

        or creating a pull request on the
        <a
          href="https://github.com/outbreak-info/outbreak.info-resources/blob/master/covid_topic_categories.tsv"
          target="_blank"
          rel="noreferrer"
        >
          categories
        </a>
        .
      </small>
    </div>

    <div v-for="(topic, idx) in topicArr" :key="idx" class="mb-5">
      <div class="d-flex align-items-center">
        <h5 class="m-0 mr-3 mb-1 border-bottom text-uppercase">
          {{ topic.key }}
        </h5>
        <p class="text-muted m-0" v-html="topic.value.description" />
      </div>

      <div
        v-for="(subtopic, subIdx) in topic.value.subcats"
        :key="subIdx"
        class="mb-2 ml-4"
      >
        <h6 class="m-0">
          {{ subtopic.topicCategory }}
        </h6>
        <p class="m-0 text-muted" v-html="subtopic.description" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { nest } from 'd3-collection';
import { tsv } from 'd3-fetch';

const topicUrl = ref(
  'https://raw.githubusercontent.com/outbreak-info/outbreak.info-resources/master/covid_topic_categories.tsv',
);
const topicArr = ref([]);

const getTopics = () => {
  tsv(topicUrl.value).then((data) => {
    topicArr.value = nest()
      .key((d) => d.category)
      .rollup((values) => {
        return {
          description: values.filter((d) => d.subcategory === 'false')[0][
            'description'
          ],
          subcats: values.filter((d) => d.subcategory === 'true'),
        };
      })
      .entries(data)
      .sort((a, b) => (a.key < b.key ? -1 : 1));
  });
};

onMounted(() => {
  getTopics();
});
</script>
