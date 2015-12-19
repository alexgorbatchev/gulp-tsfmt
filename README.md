# gulp-tsfmt

[![Dependency status](http://img.shields.io/david/alexgorbatchev/gulp-tsfmt.svg?style=flat)](https://david-dm.org/alexgorbatchev/gulp-tsfmt)
[![devDependency Status](http://img.shields.io/david/dev/alexgorbatchev/gulp-tsfmt.svg?style=flat)](https://david-dm.org/alexgorbatchev/gulp-tsfmt#info=devDependencies)
[![Build Status](http://img.shields.io/travis/alexgorbatchev/gulp-tsfmt.svg?style=flat&branch=master)](https://travis-ci.org/alexgorbatchev/gulp-tsfmt)

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

### Options

Here are the default values and available configuration options:

```javascript
IndentSize: 2
TabSize: 2
NewLineCharacter: "\n"
ConvertTabsToSpaces: true
InsertSpaceAfterCommaDelimiter: true
InsertSpaceAfterSemicolonInForStatements: true
InsertSpaceBeforeAndAfterBinaryOperators: true
InsertSpaceAfterKeywordsInControlFlowStatements: true
InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false
InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false
PlaceOpenBraceOnNewLineForFunctions: false
PlaceOpenBraceOnNewLineForControlBlocks: false
```

### License

MIT
