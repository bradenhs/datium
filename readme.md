#Datium

##Requirements

Have `npm` installed on your system.

##Getting Started

Run `npm install` on the command line in the root of the project to get up and running. Then run `live-server` and click the [Develop](http://localhost:8081/develop.html) link.

##Usage

Look at DatiumOptions.ts

##Development

All source code is located in the `scr` folder in the root of the project. `Datium.ts` is the start file. This is loaded and transpiled into javascript client-side with systemjs. This should allow painless development in the typescript language because the build step has effectively been eliminated.

##Production

In order to build the project run the command `gulp build` in the root of the project. This will transpile, combine, and minify everything in `src` into a single file named `Datium.js` in `out`. After this run `live-server`. Click on the [Production](http://localhost:8081/production.html) link. This will take you to a page using the production `Datium.js` file.