import chai = require("chai");
import gutil = require("gulp-util");
import stream = require("stream");
import ts = require("typescript");
import VinylFile = require("vinyl");
import tsfmt from "../src/index";

var assert = chai.assert;

describe("gulp-tsfmt", () => {
  describe("params", () => {
    it("should handle no params", () => {
      tsfmt();
    });

    describe("options", () => {
      it("should handle options", () => {
        tsfmt({
          options: {
            IndentSize: 4,
            IndentStyle: ts.IndentStyle.Smart,
            TabSize: 4,
            NewLineCharacter: "\r\n",
            ConvertTabsToSpaces: true,
            InsertSpaceAfterCommaDelimiter: true,
            InsertSpaceAfterSemicolonInForStatements: true,
            InsertSpaceBeforeAndAfterBinaryOperators: true,
            InsertSpaceAfterKeywordsInControlFlowStatements: true,
            InsertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
            InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
            InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
            PlaceOpenBraceOnNewLineForFunctions: false,
            PlaceOpenBraceOnNewLineForControlBlocks: false
          }
        });
      });

      it("should handle some options", () => {
        tsfmt({
          options: {
            IndentSize: 2,
            TabSize: 2
          }
        });
      });
    });

    describe("target", () => {
      it("should handle target", () => {
        tsfmt({ compilerOptions: { target: ts.ScriptTarget.ES6 } });
      });

      // it("should throw an error for an invalid target", () => {
      //   const proxy = (): any => { return { 'target': "Fail" } };
      //   const fn = () => {
      //     console.log({ compilerOptions: proxy() as ts.CompilerOptions })
      //     tsfmt({ compilerOptions: proxy() as ts.CompilerOptions });
      //   };
      //   assert.throws(fn, "Fail is not a valid script target");
      // });
    });
  });

  describe("buffers", () => {
    it("should format the code", done => {
      var file = new VinylFile({
        path: "foo.ts",
        contents: new Buffer("var a=function(v:number){return 0+1+2+3;}", "utf8")
      });
      var formatter = tsfmt();
      formatter.once("data", (file: VinylFile) => {
        assert.equal(file.contents.toString(), "var a = function(v: number) { return 0 + 1 + 2 + 3; }");
        done();
      });
      formatter.write(<any>file);
    });
  });

  describe("formatting", () => {
    it("correctly indents tags", done => {
      var file = new VinylFile({
        path: "foo.tsx",
        contents: new Buffer("console.log(\n  <Tag>\n    <b>text</b>\n</Tag>\n);", "utf8")
      });
      var formatter = tsfmt();
      formatter.once("data", (file: VinylFile) => {
        assert.equal(file.contents.toString(), "console.log(\n  <Tag>\n    <b>text</b>\n  </Tag>\n);");
        done();
      });
      formatter.write(<any>file);
    });
  });

  describe("streams", () => {
    it("should not be supported", (done) => {
      var file = new VinylFile({
        contents: new stream.Transform()
      });
      var formatter = tsfmt();
      formatter.once("error", (error: Error) => {
        assert.equal(error.message, "Streams are not supported");
        assert.equal((<{ plugin?: string }>error).plugin, "gulp-tsfmt");
        assert.instanceOf(error, gutil.PluginError);
        done();
      });
      formatter.write(<any>file);
    });
  });
});
