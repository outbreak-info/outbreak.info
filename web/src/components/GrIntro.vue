<template>
  <div class="intro">
    <div class="intro-copy">
      <p>
        The relative <span class="bold"> growth rate </span> of a lineage shows if said lineage is growing or shrinking compared to the background in a location, averaged over seven days. A positive relative growth rate indicates that a lineage may have a competitive advantage, and could eventually become a variant of interest. 
          <a 
            href="#notes"
          >
            Learn more about growth rates
          </a>
      </p>
      <p>
        Choose a lineage and one or more locations to build growth rate visualizations.
      </p>
    </div>
  </div>
</template>
  
<style scoped>
  .intro {
    display: flex;
    flex-direction: column;
    max-width: 1000px;
    width: 100%;
    text-align: left;
  }
  .intro-copy {
    margin: 10px 50px 10px 50px;
  }
  .intro-copy a {
    color: #d13b62;
  }
  .bold {
    font-weight: 700;
  }  
</style>
  