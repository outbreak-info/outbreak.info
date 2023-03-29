
# Outbreak.info front-end

This is a front-end project of outbreak.info built with Vue.js, d3.js



## Prerequisites
- Node.js >= 14.16.0
## Our Stacks
- Vue

  Vue is a JavaScript framework for building user   interfaces.
  
  Version: 3
  
  API Styles: Composition API

- Routing
  
  We are using Vue Router 4 (for Vue 3)
- State management

  We are using Pinia. Pinia is a store library for Vue, it allows you to share a state across components/pages.
- Build Toolchain

  We are using Vite as our build tool.

  Vue official guide is recommending to use Vite as the new build toolchain for Vue 3 projects. Vite is a new build tool that offers extremely  fast server and hot update performance.
- D3.js

  We didn't install entire d3 library to reduce bundle size, so only required libraries are installed such as d3-time, d3-array, d3-axis, d3-format.
  




## Environment Variables

You will need to add the following environment variables

`VITE_APP_API_ACCESS`

- Windows
  ``` bash
  set VITE_APP_API_ACCESS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
- Linux/Ubuntu/Mac
  ``` bash
  export VITE_APP_API_ACCESS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
    


## Run Locally

Clone the project

Go to the project directory

```bash
  cd web
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```


## References
- https://vuejs.org/guide/introduction.html
- https://router.vuejs.org/guide/
- https://pinia.vuejs.org/
- https://vitejs.dev/guide/