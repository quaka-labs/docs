/**
 * A small port of the app's highlighting: highlight.js's JavaScript grammar run one line at a
 * time (as the diff views do, so a JSDoc line reads as code), and `highlightShell` from
 * chat-ui src/lib/highlight.ts. Colours are the atom-one-dark theme the app imports.
 */

export type Tone =
  | "comment"
  | "keyword"
  | "string"
  | "number"
  | "literal"
  | "title"
  | "builtin"
  | "subst"
  | "attr"
  | "variable"
  | "meta";

export interface Token {
  text: string;
  tone?: Tone;
}

export const TONE: Record<Tone, string> = {
  comment: "text-[#5c6370] italic",
  keyword: "text-[#c678dd]",
  string: "text-[#98c379]",
  number: "text-[#d19a66]",
  literal: "text-[#56b6c2]",
  title: "text-[#61aeee]",
  builtin: "text-[#e6c07b]",
  subst: "text-[#e06c75]",
  attr: "text-[#d19a66]",
  variable: "text-[#d19a66]",
  meta: "text-[#61aeee]",
};

const KEYWORDS = new Set(
  "as async await break case catch class const continue default delete do else export extends finally for from function if import in instanceof let new of return static switch throw try typeof var void while yield".split(
    " ",
  ),
);
const LITERALS = new Set(["true", "false", "null", "undefined", "NaN", "Infinity"]);
const BUILTINS = new Set(["Math", "Number", "String", "Object", "Array", "JSON", "Intl", "Promise", "console", "Error", "TypeError", "RangeError", "Date"]);

/** One line of JavaScript as tokens. */
export function highlightJs(line: string): Token[] {
  const out: Token[] = [];
  let plain = "";
  let prevWord = "";
  const flush = () => {
    if (plain) out.push({ text: plain });
    plain = "";
  };
  const push = (text: string, tone: Tone) => {
    flush();
    out.push({ text, tone });
  };

  let i = 0;
  while (i < line.length) {
    const c = line[i];
    const rest = line.slice(i);

    if (rest.startsWith("//")) {
      push(rest, "comment");
      break;
    }
    if (rest.startsWith("/*")) {
      const end = line.indexOf("*/", i + 2);
      const j = end < 0 ? line.length : end + 2;
      push(line.slice(i, j), "comment");
      i = j;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== c) j += line[j] === "\\" ? 2 : 1;
      push(line.slice(i, j + 1), "string");
      i = j + 1;
      continue;
    }
    if (c === "`") {
      flush();
      let j = i + 1;
      let seg = "`";
      while (j < line.length && line[j] !== "`") {
        if (line[j] === "$" && line[j + 1] === "{") {
          if (seg) out.push({ text: seg, tone: "string" });
          seg = "";
          let depth = 1;
          let k = j + 2;
          while (k < line.length && depth > 0) {
            if (line[k] === "{") depth++;
            else if (line[k] === "}") depth--;
            k++;
          }
          out.push({ text: line.slice(j, k), tone: "subst" });
          j = k;
          continue;
        }
        seg += line[j];
        j++;
      }
      if (line[j] === "`") seg += "`";
      if (seg) out.push({ text: seg, tone: "string" });
      i = j + 1;
      continue;
    }
    if (/[0-9]/.test(c) && !/[\w$]/.test(line[i - 1] ?? "")) {
      const num = /^\d[\d_]*(\.\d+)?/.exec(rest)![0];
      push(num, "number");
      i += num.length;
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      const word = /^[A-Za-z_$][\w$]*/.exec(rest)![0];
      const after = line.slice(i + word.length);
      const member = line[i - 1] === ".";
      let tone: Tone | undefined;
      if (KEYWORDS.has(word) && !member) tone = "keyword";
      else if (LITERALS.has(word)) tone = "literal";
      else if (BUILTINS.has(word) && !member) tone = "builtin";
      else if (prevWord === "function" || /^\s*\(/.test(after)) tone = "title";
      else if (/^[A-Z][a-z]/.test(word) && !member) tone = "builtin";
      if (tone) push(word, tone);
      else plain += word;
      prevWord = word;
      i += word.length;
      continue;
    }
    plain += c;
    i++;
  }
  flush();
  return out;
}

const SHELL_KEYWORDS = new Set(["if", "then", "else", "elif", "fi", "for", "while", "until", "do", "done", "case", "esac", "in", "function", "select"]);
const PREFIXES = new Set(["sudo", "env", "time", "exec", "nohup", "xargs", "watch"]);

/** `highlightShell`: commands, flags, strings and variables each by role. */
export function highlightShell(code: string): Token[] {
  const out: Token[] = [];
  const add = (text: string, tone?: Tone) => out.push({ text, tone });
  let i = 0;
  let atCommand = true;
  const n = code.length;
  const word = (from: number) => {
    let j = from;
    while (j < n && !/[\s|&;()<>"'`#]/.test(code[j])) j += code[j] === "\\" && j + 1 < n ? 2 : 1;
    return j;
  };

  while (i < n) {
    const c = code[i];
    if (c === " " || c === "\t" || c === "\n") {
      add(c);
      if (c === "\n") atCommand = true;
      i++;
      continue;
    }
    if (c === "#" && (i === 0 || /\s/.test(code[i - 1]))) {
      const end = code.indexOf("\n", i);
      const stop = end === -1 ? n : end;
      add(code.slice(i, stop), "comment");
      i = stop;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      let j = i + 1;
      while (j < n && code[j] !== c) j += c !== "'" && code[j] === "\\" ? 2 : 1;
      add(code.slice(i, Math.min(j + 1, n)), "string");
      i = j + 1;
      atCommand = false;
      continue;
    }
    if (c === "$") {
      const m = /^\$(\{[^}]*\}|\(|[A-Za-z_][A-Za-z0-9_]*|[0-9@*#?$!-])/.exec(code.slice(i));
      if (m) {
        add(m[1] === "(" ? "$(" : m[0], "variable");
        atCommand = m[1] === "(";
        i += m[0].length;
        continue;
      }
    }
    const redirect = /^(&>>?|>>?&\d|>>?|<<?)/.exec(code.slice(i));
    if (redirect) {
      add(redirect[0]);
      i += redirect[0].length;
      continue;
    }
    const op = /^(\|\||&&|;;|\||;|&|\(|\))/.exec(code.slice(i));
    if (op) {
      add(op[0]);
      i += op[0].length;
      atCommand = op[0] !== ")";
      continue;
    }
    const end = Math.max(word(i), i + 1);
    const w = code.slice(i, end);
    i = end;
    if (atCommand) {
      if (/^--?[A-Za-z0-9]/.test(w)) add(w, "attr");
      else if (SHELL_KEYWORDS.has(w)) {
        add(w, "keyword");
        atCommand = !["for", "case", "select", "function", "in"].includes(w);
      } else {
        add(w, "builtin");
        atCommand = PREFIXES.has(w);
      }
    } else if (/^--?[A-Za-z0-9]/.test(w)) add(w, "attr");
    else if (/^\d+$/.test(w)) add(w, "number");
    else add(w);
  }
  return out;
}
