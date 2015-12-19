import rimraf = require("rimraf");
import dts = require("dts-bundle");
import gulp = require("gulp");
import istanbul = require("gulp-istanbul");
import mocha = require("gulp-mocha");
import through = require("through2");
import tslint = require("gulp-tslint");
import typescript = require("gulp-typescript");

// Tasks
enum Task {
    bundle,
    clean,
    copy,
    lint,
    scripts,
    spec,
    test
}

// Directories
var ROOT_DIR = __dirname;
var BUILD_DIR = `${ROOT_DIR}/build`;

register(Task.bundle, [Task.copy], () => {
    dts.bundle({
        main: "index.d.ts",
        name: "gulp-tsfmt",
        prefix: "",
        removeSource: false
    });
});

register(Task.clean, [], callback => rimraf(BUILD_DIR, callback));

register(Task.copy, [Task.scripts], () =>
    gulp.src(`${BUILD_DIR}/src/*`)
        .pipe(gulp.dest(ROOT_DIR))
);

register(Task.lint, [], () => {
    return gulp.src(`${ROOT_DIR}/{src,test}/**/*.ts`)
        .pipe(tslint())
        .pipe(tslint.report("verbose", {
            emitError: true
        }));
});

register(Task.scripts, [Task.clean], () => {
    var compiler = gulp.src([`${ROOT_DIR}/typings/tsd.d.ts`, `${ROOT_DIR}/{src,test}/**/*.ts`])
        .pipe(typescript({
            declarationFiles: true,
            module: "commonjs",
            noImplicitAny: true,
            noLib: false,
            removeComments: true,
            sortOutput: false,
            target: "ES5"
        }));
    var results = through.obj();
    var sources = [compiler.js, compiler.dts];
    sources.forEach((source) => {
        source.once("end", () => {
            sources = sources.filter((element) => {
                return element !== source;
            });
            if (sources.length === 0) {
                results.end();
            }
        });
        source.pipe(results, { end: false });
    });
    return results.pipe(gulp.dest(BUILD_DIR));
});

register(Task.spec, [Task.scripts], callback => {
    gulp.src(`${BUILD_DIR}/src/**/*.js`)
        .pipe(istanbul({
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire())
        .on("finish", () => {
            gulp.src(`${BUILD_DIR}/test/**/*.js`)
                .pipe(mocha())
                .pipe(istanbul.writeReports())
                .on("finish", () => {
                    var err: Error = null;
                    var coverage = istanbul.summarizeCoverage();
                    var incomplete = Object.keys(coverage).filter(key =>
                        coverage[key].hasOwnProperty("pct") && coverage[key].pct !== 100
                    );
                    if (incomplete.length > 0) {
                        err = new Error(`Incomplete coverage for ${incomplete.join(", ") }`);
                    }
                    callback(err);
                });
        });
});

register(Task.test, [Task.lint, Task.spec]);

function name(task: Task): string {
    return Task[task];
}

function register(task: Task, deps: Task[], callback?: gulp.TaskCallback): void {
    gulp.task(name(task), deps.map(name), callback);
}
