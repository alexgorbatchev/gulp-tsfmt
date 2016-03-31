import gutil = require("gulp-util");
import path = require("path");
import through = require("through2");
import ts = require("typescript");

var PLUGIN_NAME = "gulp-tsfmt";

export interface FormatCodeOptionsWithDefaults {
  IndentSize?: number;
  IndentStyle?: ts.IndentStyle;
  TabSize?: number;
  NewLineCharacter?: string;
  ConvertTabsToSpaces?: boolean;
  InsertSpaceAfterCommaDelimiter?: boolean;
  InsertSpaceAfterSemicolonInForStatements?: boolean;
  InsertSpaceBeforeAndAfterBinaryOperators?: boolean;
  InsertSpaceAfterKeywordsInControlFlowStatements?: boolean;
  InsertSpaceAfterFunctionKeywordForAnonymousFunctions?: boolean;
  InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis?: boolean;
  InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets?: boolean;
  PlaceOpenBraceOnNewLineForFunctions?: boolean;
  PlaceOpenBraceOnNewLineForControlBlocks?: boolean;
}

export interface Params {
  options?: FormatCodeOptionsWithDefaults;
  compilerOptions?: ts.CompilerOptions;
}

interface SourceFileVersion {
  filename: string;
  version: number;
  text: string;
}

var DEFAULTS: { options?: ts.FormatCodeOptions; compilerOptions?: ts.CompilerOptions } = {
  options: <ts.FormatCodeOptions>{
    IndentSize: 2,
    IndentStyle: ts.IndentStyle.Smart,
    TabSize: 2,
    NewLineCharacter: "\n",
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
  },
  compilerOptions: {
    target: ts.ScriptTarget.ES5
  }
};

function process(file: VinylFile, options: ts.FormatCodeOptions, compilerOptions: ts.CompilerOptions): void {
  const sourceFile: SourceFileVersion = {
      filename: path.basename(file.path),
      version: 1,
      text: file.contents.toString()
    };

  const langSvc = inMemoryLanguageService(sourceFile);
  const textChanges = langSvc.getFormattingEditsForDocument(sourceFile.filename, options);
  const formatted = formatCode(sourceFile.text, textChanges);

  file.contents = new Buffer(formatted, "utf8");
}

function formatOptions(options: FormatCodeOptionsWithDefaults): ts.FormatCodeOptions {
  var defaults = DEFAULTS.options;
  var params: any = options;
  var result: any = {};
  Object.keys(defaults).forEach((key) => {
    result[key] = params.hasOwnProperty(key) ? params[key] : defaults[key];
  });
  return result;
}

// From https://github.com/Microsoft/TypeScript/issues/1651#issuecomment-69877863
function formatCode(orig: string, changes: ts.TextChange[]): string {
    var result = orig;
    for (var i = changes.length - 1; i >= 0; i--) {
        var change = changes[i];
        var head = result.slice(0, change.span.start);
        var tail = result.slice(change.span.start + change.span.length);
        result = head + change.newText + tail;
    }
    return result;
}

function inMemoryLanguageService(file: SourceFileVersion): ts.LanguageService {
    var host: ts.LanguageServiceHost = {
      getScriptFileNames: () => [ file.filename ],
      getScriptVersion: filename => file.version.toString(),
      getScriptSnapshot: filename => ts.ScriptSnapshot.fromString(file.text),
      log: message => undefined,
      trace: message => undefined,
      error: message => undefined,
      getDefaultLibFileName: () => "lib.d.ts",
      getCurrentDirectory: () => "",
      getCompilationSettings: () => { return {}; },
    };

    return ts.createLanguageService(host, ts.createDocumentRegistry());
}

export default function format(params?: Params): NodeJS.ReadWriteStream {
  params = params || DEFAULTS;

  var options = formatOptions(params.options || DEFAULTS.options);

  return through.obj(function(file: VinylFile, encoding: string, callback: () => void) {
    var stream = <NodeJS.ReadWriteStream>this;
    if (file.isStream()) {
      stream.emit("error", new gutil.PluginError(PLUGIN_NAME, "Streams are not supported"));
    }
    if (file.isBuffer()) {
      process(file, options, params.compilerOptions);
    }
    (<any>stream).push(file);
    callback();
  });
}

interface VinylFile {
  path: string;
  contents: Buffer;
  isBuffer(): boolean;
  isStream(): boolean;
}
