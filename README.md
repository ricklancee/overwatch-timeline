# timeline

Scripts are written in ES2015 and CSS use variables and, as such, require direct browser support. You can transpile scripts with BabelJS and css with PostCSS:

```bash
./node_modules/.bin/babel --presets=es2015 scripts/timeline.js --out-file scripts/timeline-es5.js
./node_modules/.bin/postcss --use autoprefixer styles/style-dist.css -o styles/style-dist.css
```

### Attribution & thanks

Blizzard Entertainment for this awesome game!   
https://playoverwatch.com  
http://overwatch.gamepedia.com  
http://overwatch.wikia.com/  
Overwatch lore doc by @Rauros\_TJ https://docs.google.com/spreadsheets/d/1o_RjYjVmUeJ6EnNJW5oHXI2xuxge3HMRJgB9SoepDFg/edit#gid=80059272  
Robot icon created by Julien Deveaux from the Noun Project  
