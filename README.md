# timeline

Please note: these scripts are written in ES2015 and css use variables and, as such, require direct browser support. You can transpile scripts with BabelJS and css with PostCSS:

```bash
babel --presets=es2015 scripts/timeline.js --out-file timeline-es5.js
postcss --use postcss-css-variables -o styles/style-dist.css styles/style.css
```
