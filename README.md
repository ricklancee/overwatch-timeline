# timeline

Please note: Scripts are written in ES2015 and CSS use variables and, as such, require direct browser support. You can transpile scripts with BabelJS and css with PostCSS:

```bash
babel --presets=es2015 scripts/timeline.js --out-file scripts/timeline-es5.js
postcss --use postcss-css-variables -o styles/style-dist.css styles/style.css
```
