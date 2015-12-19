# gulp-tsfmt

A gulp plugin for formatting TypeScript files.

## Installation

```
npm install gulp-tsfmt
```

### Usage

The snippet below formats and replaces in place each TypeScript file.

```javascript
import tsfmt from 'gulp-tsfmt';

gulp.task('format', () => {
  gulp.src('**/*.ts')
    .pipe(tsfmt({ options: { ... }))
    .pipe(gulp.dest(file => path.dirname(file.path)));
});
```

You can also use [gulp-changed-in-place](https://github.com/alexgorbatchev/gulp-changed-in-place) plugin to prevent reformatting all files when only once changes.

```javascript
import tsfmt from 'gulp-changed-in-place';
import tsfmt from 'gulp-tsfmt';

gulp.task('format', () => {
  gulp.src('**/*.ts')
    .pipe(changedInPlace())
    .pipe(tsfmt({ options: { ... }))
    .pipe(gulp.dest(file => path.dirname(file.path)));
});
```

### License

MIT
