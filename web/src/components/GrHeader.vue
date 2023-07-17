<template>
  <div class="gr-header">
    <div class="hero">
      <h1>SARS-CoV-2 Growth Rates</h1>
    </div>
    <div class="statistics">
      <div>
        <p>
          Updated {{ lastUpdated }} ago with {{ total }} sequences from GISAID
        </p>
      </div>
      <div>
        <p>Enabled by data from
          <a
            href="https://www.gisaid.org/"
            rel="noreferrer"
            target="_blank"
          >
            <img
              src="@/assets/resources/gisaid.png"
              class="gisaid-small"
              alt="GISAID Initiative"
            />
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { inject, ref, onMounted, onBeforeUnmount } from 'vue';
  import { getLocationBasics } from '@/api/genomics.js';

  const genomicsUrl = inject('genomicsUrl');

  const curatedSubscription = ref(null);
  const lastUpdated = ref(null);
  const total = ref(null);

  onMounted(() => {
    curatedSubscription.value = getLocationBasics(genomicsUrl).subscribe(
      (results) => {
        lastUpdated.value = results.dateUpdated;
        total.value = results.total;
      },
    );
  });

  onBeforeUnmount(() => {
    if (curatedSubscription.value) {
      curatedSubscription.value.unsubscribe();
    }
  });
</script>

<style scoped>
  .gr-header {
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    width: 100%;
    text-align: left;
  }
  .gr-header h1 {
    font-size: 30px;
    font-weight: 700;
  }
  .hero {
    margin: 25px 50px 0px 50px;
  }
  .statistics {
    display: flex;
    flex-direction: row wrap;
    justify-content: space-between;
    max-width: 1000px;
    margin: 0px 50px 0px 50px;
  }
</style>
