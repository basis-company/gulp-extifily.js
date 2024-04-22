# gulp-extifily.js
reorder ExtJS-project files and concat them into one bundle

### install

```shell
npm install basis-company/gulp-extifily.js
```

### gulpfile.js
```js
var extifily = require('gulp-extifily');

gulp.task('extifily', () =>
  gulp.src('src/js/**/*.js')
    .pipe(extifily('application.js'))
    .pipe(gulp.dest('build'))
);
```
