// vite.config.js
export default {
    root: "src",
    base: "./",
    clearScreen: false,
    server: {https: false},
    build:
        {
         outDir: "../dist/Scale",
         manifest: true 
        }    
  }