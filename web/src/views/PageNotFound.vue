<template>
<div class="half-page my-5">
  <h1>Oops! Page not found
  </h1>
  <div>
    Return to:
    <ul class="list-unstyled">
      <li>
        <router-link :to="{name: 'Home'}">Home</router-link>
      </li>
      <li>
        <router-link :to="{name: 'Epidemiology'}">Cases &amp; Deaths</router-link>
      </li>
      <li>
        <router-link :to="{name: 'SituationReports'}">Variant Reports</router-link>
      </li>
      <li>
        <router-link :to="{name: 'SituationReports'}">Research Library</router-link>
      </li>
    </ul>

  </div>


</div>
</template>
