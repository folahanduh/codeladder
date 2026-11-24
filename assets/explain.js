/* Code Ladder: "explore your code". After you finish an exercise, every word in the code can be
   hovered (or tapped, or reached with the arrow keys) to show what it is, how it works and why it is
   on that line. Highlight several words to explain them together, or hand them to the AI coach.

   Explanations come from three places:
   1. assets/code-docs.js: what built-in functions, keywords, commands and flags are and how they work.
   2. Your own code: names you chose (variables, functions, contracts) are found where they are defined.
   3. The exercise's hints: each line's hint says why that line is there. */
window.CL_EXPLAIN = (function () {
  'use strict';

  const DOCS = window.CL_CODEDOCS || {};
  const HL = { js: 'javascript', ts: 'typescript', html: 'xml', css: 'css', bash: 'bash', python: 'python', solidity: 'solidity', sql: 'sql', json: 'json', yaml: 'yaml' };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const md = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // What counts as one hoverable word, per language
  const WORD = {
    bash: /#!\/bin\/sh|\$\{?[A-Za-z_]\w*\}?|--?[A-Za-z][\w-]*|0x\w+|\d+(?:\.\d+){3}|https?:\/\/\S+|[A-Za-z_~./][\w./~:@+-]*|\|\||&&|[|>]/g,
    css: /@[\w-]+|::?[\w-]+|\.[A-Za-z_][\w-]*|--[\w-]+|[A-Za-z_][\w-]*/g,
    html: /[A-Za-z][\w-]*/g,
    yaml: /\$\{\{|[A-Za-z_][\w-]*/g,
    sql: /[A-Za-z_]\w*/g,
    text: /[A-Za-z][\w-]*/g,
    code: /\$\{|=>|===|!==|==|!=|&&|\|\||\?\?|\?\.|\.\.\.|\+\+|\+=|\*\*|<=|>=|[A-Za-z_$][\w$]*|[=%!<>]/g,
  };
  const wordRe = (lang) => WORD[lang] || WORD.code;
  const isCodeLang = (lang) => ['js', 'ts', 'solidity', 'python'].includes(lang);
  const lookup = (lang, key) => {
    const d = DOCS[lang] || {};
    return Object.prototype.hasOwnProperty.call(d, key) ? d[key] : null;
  };
  const entry = (word, e, extra) => ({ word, kind: e[0], what: e[1], how: e[2] || '', ...extra });

  // ------------------------------------------------------------ names defined in the code itself
  function findDeclaration(w, lines, lang) {
    const W = reEsc(w);
    const tests = {
      js: [
        [new RegExp(`\\b(?:const|let|var)\\s+${W}\\b`), 'a variable'],
        [new RegExp(`\\b(?:const|let)\\s*[[{][^=]*\\b${W}\\b[^=]*[\\]}]\\s*=`), 'a variable unpacked (destructured) from the value on the right'],
        [new RegExp(`\\bfunction\\s*\\*?\\s*${W}\\s*\\(`), 'a function'],
        [new RegExp(`\\bclass\\s+${W}\\b`), 'a class'],
        [new RegExp(`\\b(?:type|interface|enum)\\s+${W}\\b`), 'a TypeScript type (a named shape of data)'],
        [new RegExp(`\\bimport\\s*(?:\\w+\\s*,\\s*)?\\{[^}]*\\b${W}\\b`), 'imported from another module'],
        [new RegExp(`\\bimport\\s+${W}\\b`), 'imported from another module'],
        [new RegExp(`\\bfor\\s*\\(\\s*(?:const|let)\\s+${W}\\b`), 'the loop variable'],
        [new RegExp(`\\(([^()]*\\b${W}\\b[^()]*)\\)\\s*=>`), 'a parameter (an input) of the arrow function'],
        [new RegExp(`\\b${W}\\s*=>`), 'a parameter (an input) of the arrow function'],
        [new RegExp(`\\bfunction\\s*\\w*\\s*\\(([^)]*\\b${W}\\b[^)]*)\\)`), 'a parameter (an input) of the function'],
      ],
      solidity: [
        [new RegExp(`\\bcontract\\s+${W}\\b`), 'a contract'],
        [new RegExp(`\\bfunction\\s+${W}\\s*\\(`), 'a function'],
        [new RegExp(`\\b(?:event)\\s+${W}\\b`), 'an event'],
        [new RegExp(`\\berror\\s+${W}\\b`), 'a custom error'],
        [new RegExp(`\\bmodifier\\s+${W}\\b`), 'a modifier'],
        [new RegExp(`\\bstruct\\s+${W}\\b`), 'a struct (a custom type)'],
        [new RegExp(`\\b(?:u?int\\d*|address|bool|bytes\\d*|string|mapping\\s*\\([^;]*\\)|[A-Z]\\w*)(?:\\[\\])?(?:\\s+(?:public|private|internal|external|constant|immutable|memory|calldata|storage|payable|indexed|override))*\\s+${W}\\b`), 'a variable or parameter'],
      ],
      python: [
        [new RegExp(`\\bdef\\s+${W}\\s*\\(`), 'a function'],
        [new RegExp(`\\bdef\\s+\\w+\\s*\\(([^)]*\\b${W}\\b[^)]*)\\)`), 'a parameter (an input) of the function'],
        [new RegExp(`\\bfor\\s+${W}\\s+in\\b`), 'the loop variable'],
        [new RegExp(`^\\s*${W}\\s*=[^=]`), 'a variable'],
      ],
    };
    const list = tests[lang === 'ts' ? 'js' : lang];
    if (!list) return null;
    for (let i = 0; i < lines.length; i++) {
      for (const [re, what] of list) if (re.test(lines[i])) return { line: i, what };
    }
    return null;
  }

  // ------------------------------------------------------------ explain one token
  const OPERATOR = /^(?:=>|===|!==|==|!=|&&|\|\||\?\?|\?\.|\.\.\.|\+\+|\+=|\*\*|<=|>=|[=%!<>]|\$\{)$/;
  const generic = (word, kind, what, how) => ({ word, kind, what, how: how || '', generic: true });

  // What the code around a name tells us, when the name is defined outside this snippet.
  function usage(line, t) {
    const after = line.slice(t.col + t.text.length);
    if (/^\s*\(/.test(after)) return 'It is called like a function here (the brackets run it).';
    if (/^\s*\[/.test(after)) return 'The square brackets look something up inside it, so it is a list, array or mapping.';
    if (/^\s*\./.test(after)) return 'The dot reads something stored inside it, so it is an object, struct or contract.';
    if (/^\s*(?:=(?!=)|\+=|-=)/.test(after)) return 'A new value is being stored in it here.';
    return '';
  }

  function explainToken(t, ctx) {
    const { lang, lines } = ctx;
    const line = lines[t.line] || '';
    const w = t.text;
    const before = line.slice(0, t.col);
    const after = line.slice(t.col + w.length);
    if (t.cls === 'comment') return { word: w.length > 40 ? w.slice(0, 40) + '...' : w, kind: 'comment', what: 'A note for humans. The computer skips it completely.', how: 'Good comments explain why the code does something, not what it does.' };
    if (t.cls === 'key') return jsonKey(w);
    if (t.cls === 'string' || t.cls === 'regexp') return stringInfo(w, lang, t.cls, before, line);
    if (t.cls === 'number') return numberInfo(w, lang, before);
    if (t.cls === 'meta' && lang === 'bash') return entry(w, lookup('bash', '#!/bin/sh') || ['shebang', 'Says which program runs this script.', '']);

    if (lang === 'bash') return bashInfo(t, line);
    if (lang === 'yaml') return yamlInfo(t, line);
    if (lang === 'css') {
      const e = lookup('css', w) || lookup('css', w.replace(/^[:@]+/, ''));
      if (e) return entry(w, e);
      if (w.startsWith('.')) return { word: w, kind: 'class selector', what: `Styles every element with class="${w.slice(1)}".`, how: 'A dot means "class". Reuse one class on many elements.' };
      if (w.startsWith('--')) return { word: w, kind: 'CSS variable', what: 'A custom property: a value you name once and reuse with `var()`.', how: 'Change it in one place and every use updates. Great for brand colours.' };
      return generic(w, 'CSS name', 'A CSS selector, property or value.');
    }
    if (lang === 'html') {
      const e = lookup('html', w);
      return e ? entry(w, e) : generic(w, 'HTML name', 'An HTML tag or attribute name.');
    }
    if (lang === 'sql') {
      const e = lookup('sql', w.toUpperCase());
      if (e) return entry(w, e);
      const dotted = /\.\s*$/.test(before);
      return { word: w, kind: dotted ? 'column' : 'table or column', what: dotted ? `The column ${w} of the table named just before the dot.` : 'A table or column name in your database.', how: 'Short names like o and c are aliases, set after the table name in FROM and JOIN.' };
    }
    if (lang === 'text' || lang === 'json') {
      const e = lookup(lang, w);
      if (e) return entry(w, e);
      if (lang === 'text' && /=\s*$/.test(before)) return { word: w, kind: 'value', what: `The value of the setting on the left of the =.`, how: /session/i.test(before) ? 'For a session cookie this is the session ID: whoever has it is logged in as you.' : '' };
      if (lang === 'text' && /=/.test(after)) return { word: w, kind: 'cookie name', what: `The name of the cookie (here ${w}).`, how: 'Everything after the first ; are attributes that control how the browser treats it.' };
      return generic(w, 'value', 'A value in this file.');
    }

    // JavaScript, TypeScript, Solidity, Python
    const docLang = lang === 'ts' ? 'js' : lang;
    const doc = lookup(docLang, w) || (OPERATOR.test(w) && lookup('js', w));
    if (OPERATOR.test(w)) return doc ? entry(w, doc) : generic(w, 'operator', 'An operator: a symbol that does something with the values around it.');

    // JSX (HTML-like code inside JavaScript)
    if (t.el && t.el.closest('.hljs-tag')) {
      if (t.el.closest('.hljs-attr')) {
        const e = lookup('js', `jsx:${w}`) || lookup('html', w);
        return e ? entry(w, e) : { word: w, kind: 'JSX attribute', what: `An attribute (a prop) called ${w} on this element.`, how: 'Values in quotes are text; values in { } are JavaScript.' };
      }
      if (/^[A-Z]/.test(w)) {
        const d = findDeclaration(w, lines, docLang);
        return { word: w, kind: 'React component', what: `Uses the component ${w} here, like an HTML tag.${d ? ` It is defined on line ${d.line + 1}.` : ''}`, how: 'Components are functions that return JSX; capital letters tell React it is a component, not an HTML tag.' };
      }
      const e = lookup('html', w);
      return { word: w, kind: 'HTML element (in JSX)', what: e ? e[1] : `The HTML element <${w}>.`, how: 'JSX looks like HTML but compiles to JavaScript that builds the page.' };
    }
    if ((lang === 'js' || lang === 'ts') && /<\/?\s*$/.test(before) && /^[a-z]/.test(w)) {
      const e = lookup('html', w);
      return { word: w, kind: 'HTML element (in JSX)', what: e ? e[1] : `The HTML element <${w}>.`, how: 'JSX looks like HTML but compiles to JavaScript that builds the page.' };
    }
    if (insideQuotes(before)) return { word: w, kind: 'text', what: 'Part of a piece of text (a string) shown or used exactly as written.', how: 'Hover the quotes around it to see the whole string.' };
    if ((lang === 'js' || lang === 'ts') && isJsxText(before, after)) {
      return { word: w, kind: 'text on the page', what: 'Plain text shown on the page, inside a JSX element.', how: 'Anything in { } next to it is JavaScript; everything else between the tags is shown as written.' };
    }

    // a word after a dot: a property or method of the thing before it
    const member = before.match(/([A-Za-z_$][\w$]*)\s*(?:\??\.)\s*$/);
    if (member || /\.\s*$/.test(before)) {
      const obj = member ? member[1] : '';
      const e = (obj && lookup(docLang, `${obj}.${w}`)) || lookup(docLang, `.${w}`);
      if (e) return entry(w, e, obj ? { on: obj } : {});
      const call = /^\s*\(/.test(after);
      return generic(w, call ? 'method' : 'property',
        call ? `A method (an action) called ${w}${obj ? ` on ${obj}` : ''}.` : `A property (a stored value) called ${w}${obj ? ` on ${obj}` : ' on the thing before the dot'}.`,
        call ? 'The dot means "inside"; the brackets run it.' : 'The dot means "inside": this reads the value named after the dot from the thing before it.');
    }

    // a key in an object literal, such as { httpOnly: true }
    if (/^\s*:(?!:)/.test(after) && /(?:^|[{,(]|\b(?:type|interface)\s+\w+\s*=?\s*\{)\s*$/.test(before) && !/\?\s*$/.test(before)) {
      const e = lookup(docLang, `opt:${w}`);
      if (e) return entry(w, e);
      return { word: w, kind: 'property name', what: `The label (key) ${w}, for the value after the colon.`, how: 'Objects group named values: { key: value, key: value }.' };
    }

    // a name introduced by a keyword just before it
    const kw = before.match(/\b(revert|emit|new|is|extends)\s+$/);
    if (kw && !findDeclaration(w, lines, docLang)) {
      const what = { revert: `A custom error called ${w}: the transaction is cancelled with this error.`, emit: `An event called ${w}: a log entry front ends and bots can listen for.`, new: `Creates a new ${w}${lang === 'solidity' ? ' (deploys a new contract)' : ' (an instance of a class)'}.`, is: `A parent contract: this contract inherits everything ${w} has.`, extends: `A parent class: this class inherits everything ${w} has.` }[kw[1]];
      return { word: w, kind: kw[1] === 'revert' ? 'custom error' : kw[1] === 'emit' ? 'event' : 'class or contract', what, how: 'It is defined elsewhere in the project or imported from a library.' };
    }

    const decl = findDeclaration(w, lines, docLang);
    if (doc && !decl) return entry(w, doc);
    if (decl && /^imported/.test(decl.what)) {
      const mod = (lines[decl.line].match(/from\s+['"]([^'"]+)['"]/) || [])[1] || 'another module';
      return {
        word: w,
        kind: doc ? doc[0] : 'imported',
        what: `${doc ? `${doc[1]} ` : ''}Imported on line ${decl.line + 1} from \`${mod}\`${mod.startsWith('node:') ? ' (built into Node)' : mod.startsWith('.') ? ' (another file in your project)' : ' (a package installed with npm)'}.`,
        how: doc && doc[2] ? doc[2] : 'Importing a name lets this file use code written somewhere else.',
      };
    }
    if (decl) {
      const m = new RegExp(`(^|[^\\w$])${reEsc(w)}(?![\\w$])`).exec(lines[decl.line]);
      const here = decl.line === t.line && m && m.index + m[1].length === t.col;
      const where = here ? 'Created here' : `Defined on line ${decl.line + 1}`;
      return {
        word: w,
        kind: 'name you chose',
        what: doc ? `${where}: ${decl.what}. ${doc[1]}` : `${where}: ${decl.what}. You picked this name, so it means whatever the code puts in it.`,
        how: here ? (doc && doc[2]) || 'Clear names matter: code is read far more often than it is written.' : `Line ${decl.line + 1} shows what it holds: \`${lines[decl.line].trim().slice(0, 90)}\``,
      };
    }
    const use = usage(line, t);
    if (/^[A-Z][A-Z0-9_]+$/.test(w)) return generic(w, 'constant', 'A constant: a fixed value, written in capitals by convention.', `Defined elsewhere in the project. Capitals tell readers "this never changes".${use ? ` ${use}` : ''}`);
    if (/^[A-Z]/.test(w)) return generic(w, 'type or component', 'A class, type, contract or component name (these start with a capital letter).', `Defined elsewhere in the project or imported from a library.${use ? ` ${use}` : ''}`);
    if (/^_[\d_]+$/.test(w)) return numberInfo(w, lang, before);
    return generic(w, 'name', `A name defined elsewhere in the ${lang === 'solidity' ? 'contract' : 'project'}, outside this snippet.${use ? ` ${use}` : ''}`, 'Hover the words around it, or ask the AI coach about this line.');
  }

  // True when the text before a word has an unclosed ' or " (the word sits inside a string).
  function insideQuotes(before) {
    let q = '';
    for (let i = 0; i < before.length; i++) {
      const c = before[i];
      if (q) { if (c === '\\') i++; else if (c === q) q = ''; }
      else if (c === "'" || c === '"') q = c;
      else if (c === '/' && before[i + 1] === '/') break;
    }
    return Boolean(q);
  }

  // Text between JSX tags, such as the words in <h2>Linen Wrap Dress</h2>
  function isJsxText(before, after) {
    const gt = before.lastIndexOf('>');
    if (gt < 0 || gt < before.lastIndexOf('<') || before[gt - 1] === '=') return false;
    const seg = before.slice(gt + 1);
    if ((seg.match(/\{/g) || []).length !== (seg.match(/\}/g) || []).length) return false;
    return /^[^<>]*<\//.test(after) || /^[^<>{}]*\{/.test(after) && /<\//.test(after);
  }

  function jsonKey(k) {
    const name = k.replace(/^"|"$/g, '');
    const e = lookup('json', name);
    return e ? entry(k, e) : { word: k, kind: 'key', what: `The setting name ${name}: the value after the colon belongs to it.`, how: 'JSON keys are always in double quotes.' };
  }

  function stringInfo(s, lang, cls, before, line) {
    const inner = s.replace(/^['"`]|['"`]$/g, '');
    const word = s.length > 42 ? s.slice(0, 42) + '...' : s;
    if (cls === 'regexp') return { word, kind: 'regular expression', what: 'A pattern for matching text.', how: 'Inside, `\\d` means a digit, `+` one or more, `^` the start and `$` the end.' };
    if (lang === 'yaml') return yamlInfo({ text: s, col: before.length }, line);
    if (lang === 'html') return { word, kind: 'attribute value', what: 'The value given to the attribute on its left.', how: 'Always put attribute values in quotes.' };
    if (lang === 'json') {
      const key = (before.match(/"([^"]+)"\s*:\s*$/) || [])[1];
      return { word, kind: 'value', what: key ? `The value of ${key}.` : 'A value.', how: /--|^\w+ /.test(inner) ? 'Here it is a terminal command: npm runs it when you type `npm run` and the name.' : '' };
    }
    if (lang === 'bash') {
      const prev = (before.trim().match(/(\S+)$/) || [])[1] || '';
      if (prev === '-m') return { word, kind: 'commit message', what: 'The message saved with this commit.', how: 'Say what changed and why, in the present tense: "Add contact form".' };
      if (/grep/.test(before)) return { word, kind: 'search pattern', what: 'The pattern grep looks for.', how: 'Quotes stop the shell changing special characters before grep sees them.' };
      return { word, kind: 'text', what: 'Text in quotes: passed to the command as one piece, even with spaces in it.', how: 'Single quotes keep everything exactly; double quotes still expand $VARIABLES.' };
    }
    if (/(?:\bfrom|\bimport|require\()\s*$/.test(before)) return { word, kind: 'module name', what: inner.startsWith('.') ? 'A path to another file in your project.' : `The package (module) to load${inner.startsWith('node:') ? ', built into Node' : ', installed with npm'}.`, how: 'Names starting `./` or `../` are your own files; plain names come from node_modules.' };
    if (/^use (client|server|strict)$/.test(inner)) return { word, kind: 'directive', what: { 'use client': 'Tells Next.js this file runs in the browser, so it can use state and click handlers.', 'use server': 'Marks functions that only ever run on the server.', 'use strict': 'Turns on JavaScript\'s strict mode, which catches common mistakes.' }[inner], how: 'Directives must be the very first line of the file.' };
    if (/^__Host-/.test(inner)) return { word, kind: 'cookie name', what: 'A cookie name with the `__Host-` prefix.', how: 'Browsers only accept it if it is Secure, has path / and no domain, so a subdomain can never overwrite it.' };
    let what = 'Text (a string): a value written exactly as it appears between the quotes.';
    if (/^https?:\/\/[^\s${}]+$/.test(inner)) {
      try {
        const u = new URL(inner);
        const params = [...u.searchParams].map(([k, v]) => `\`${k}\` = \`${v}\``);
        return {
          word,
          kind: 'web address (URL)',
          what: `An address on the web: the server \`${u.hostname}\`${u.pathname !== '/' ? `, the page or API path \`${u.pathname}\`` : ''}${params.length ? `, sending ${params.join(', ')}` : ''}.`,
          how: `${u.protocol === 'https:' ? 'https means the connection is encrypted.' : 'http is NOT encrypted: anyone on the network can read it.'}${params.length ? ' Everything after ? is the query string: settings sent to the server as name=value pairs joined by &.' : ''}`,
        };
      } catch (e) { what = 'A web address (URL), as text.'; }
    } else if (/^0x[0-9a-f]+$/i.test(inner)) what = 'Hexadecimal data or an address, written as text.';
    else if (/^ey[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\./.test(inner)) what = 'A JWT (JSON Web Token): three Base64URL parts separated by dots. The middle part is readable by anyone.';
    else if (/^[A-Za-z0-9+/=_-]{16,}$/.test(inner) && /[0-9]/.test(inner)) what = 'Encoded data (Base64 or hex), written as text.';
    else if (/^(aes|sha|hmac|AES|SHA|PBKDF2|ECDSA|HMAC|RSA)/.test(inner)) what = 'The name of a cryptographic algorithm, as text.';
    else if (/^(utf8|hex|base64|utf-8)$/i.test(inner)) what = 'An encoding name: how bytes are turned into text (or back).';
    else if (/^(click|input|submit|change|keydown|load)$/.test(inner)) what = `The name of the event to listen for: "${inner}".`;
    else if (/^[#.]?[a-z][\w-]*$/i.test(inner) && /querySelector|getBy|closest/.test(before)) what = 'A CSS selector: which element to find (`#` means id, `.` means class).';
    const how = s.startsWith('`') ? 'Backticks make a template string: `${...}` inside inserts a value.' : 'Single and double quotes mean the same thing in JavaScript; pick one style and stick to it.';
    return { word, kind: 'string', what, how: lang === 'js' || lang === 'ts' ? how : lang === 'solidity' ? 'Strings in require and revert are the error message users see.' : '' };
  }

  function numberInfo(n, lang, before = '') {
    if (/^#[0-9a-f]{3,8}$/i.test(n) || (lang === 'css' && /^[0-9a-f]{3,8}$/i.test(n))) return { word: n, kind: 'colour', what: 'A colour in hex: red, green and blue, two hex digits each.', how: '' };
    if (lang === 'css' && /^[\d.]+[a-z%]+$/i.test(n)) return { word: n, kind: 'size', what: `A size: ${n}.`, how: '`px` is pixels, `rem` is relative to the base text size, `%` relative to the parent.' };
    const notes = [];
    if (n.includes('_')) notes.push('The underscores are only for readability: `1_000_000` is one million.');
    if (/n$/.test(n)) notes.push('The `n` makes it a BigInt, a whole number with no size limit, needed for token amounts.');
    if (/^0x/i.test(n)) notes.push('`0x` means the number is written in hexadecimal (base 16).');
    if (/e\d+$/i.test(n)) notes.push('`e` means "times ten to the power of".');
    if (/\[\s*$/.test(before)) notes.push('In square brackets it is a position: counting starts at 0, so [0] is the first item.');
    return { word: n, kind: 'number', what: 'A number written directly in the code (a literal).', how: notes.join(' ') || (lang === 'solidity' ? 'Solidity has no decimals: amounts are whole numbers in the smallest unit.' : '') };
  }

  function yamlInfo(t, line) {
    const w = t.text;
    const km = line.match(/^(\s*-?\s*)([\w-]+)\s*:/);
    const keyEnd = km ? km[1].length + km[2].length : -1;
    if (km && t.col < keyEnd) {
      const e = lookup('yaml', w);
      return e ? entry(w, e) : { word: w, kind: 'setting name', what: `A setting (key) called ${w}: the value after the colon belongs to it.`, how: 'Indentation shows what belongs inside what, so it must be exact.' };
    }
    const key = km ? km[2] : '';
    const value = km ? line.slice(line.indexOf(':', keyEnd) + 1).trim() : line.trim();
    if (/\$\{\{/.test(value)) {
      const name = (value.match(/secrets\.(\w+)/) || [])[1];
      return { word: w, kind: 'secret', what: name ? `GitHub swaps \`${value}\` for your encrypted secret ${name} when the job runs.` : `A GitHub expression: \`${value}\` is filled in when the job runs.`, how: 'The real value never appears in the file, and GitHub hides it in the logs.' };
    }
    const e = lookup('yaml', w);
    if (e) return entry(w, e);
    if (key === 'run') return { word: w, kind: 'command', what: `Part of the shell command this step runs: \`${value}\`.`, how: 'Each run step is a terminal command, exactly as you would type it.' };
    return { word: w, kind: 'value', what: `The value of ${key || 'this setting'}.`, how: '' };
  }

  const VALUE_FLAGS = /^(?:-[omiRrecQp]|--[\w-]+)$/;
  function bashInfo(t, line) {
    const w = t.text;
    if (w === '|' || w === '>' || w === '&&' || w === '||') return entry(w, lookup('bash', w) || ['operator', w === '&&' ? 'Runs the next command only if this one succeeded.' : 'Runs the next command only if this one failed.', '']);
    if (w.startsWith('$')) return { word: w, kind: 'environment variable', what: `The value of the variable ${w.replace(/[${}]/g, '')}.`, how: 'Set outside the command (in your shell, a .env file or a secret store), so secrets and settings stay out of the script.' };
    // NAME=value lines (a .env file)
    const env = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (env) {
      if (w === env[1]) return { word: w, kind: 'variable name', what: `Sets the variable ${w} to the value after the =.`, how: 'In a .env file each line is NAME=value. Keep the real file out of Git (.gitignore) and commit a .env.example instead.' };
      return { word: w, kind: 'value', what: `The value stored in ${env[1]}.`, how: /SECRET|KEY|TOKEN|PASSWORD/.test(env[1]) ? 'A secret: this placeholder is fine, but real values must never be committed.' : 'Your code reads it with process.env.' + env[1] + '.' };
    }
    if (/^\d+(?:\.\d+){3}$/.test(w)) return { word: w, kind: 'IP address', what: `An IP address${w === '127.0.0.1' ? ': 127.0.0.1 always means "this computer" (localhost)' : ''}.`, how: 'Only scan or test addresses you own or have permission to test.' };
    if (/^https?:\/\//.test(w)) return { word: w, kind: 'web address', what: `The address of the server: \`${w}\`.`, how: '' };
    // the command this word belongs to: the first word after the last | or && before it
    const segment = line.slice(0, t.col).split(/\|\||&&|\||;/).pop();
    const words = (segment.match(/\S+/g) || []).filter((x, i, a) => !(i === 0 && /^(?:if|then|!|while|do)$/.test(x)) && !(i === 1 && /^(?:if|then|!|while|do)$/.test(a[0]) && false));
    while (words.length && /^(?:if|then|!|while|do|else)$/.test(words[0])) words.shift();
    const cmd = words[0];
    if (!cmd) {
      const e = lookup('bash', w);
      return e ? entry(w, e) : { word: w, kind: 'command', what: `Runs the program ${w}.`, how: `Most programs explain themselves with \`${w} --help\`.` };
    }
    const sub = words[1];
    const prev = words[words.length - 1].replace(/=.*$/, '');
    const e = lookup('bash', `${cmd} ${w}`) || (sub && !sub.startsWith('-') && w !== sub && lookup('bash', `${cmd} ${sub} ${w}`)) || lookup('bash', w);
    if (e) return entry(w, e, { on: cmd });
    if (w.startsWith('-')) return generic(w, 'flag', `An option for ${cmd} that changes how it behaves.`, `Run \`${cmd} --help\` to see every option.`);
    // a value for the flag just before it (--config auto, --match-test name, --audit-level=high)
    if (VALUE_FLAGS.test(prev) || /=$/.test(segment.trim())) {
      const flag = /=$/.test(segment.trim()) ? (segment.trim().match(/(--?[\w-]+)=$/) || [])[1] : prev;
      const fe = lookup('bash', `${cmd} ${flag}`) || lookup('bash', flag);
      return { word: w, kind: 'option value', what: `The value for the ${flag} option${fe ? `: ${fe[1].replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase())}` : ''}.`, how: fe && fe[2] ? fe[2] : '' };
    }
    if (/^0x/i.test(w)) return { word: w, kind: 'address', what: 'A placeholder for a contract address (0x followed by 40 hex characters).', how: 'Swap in the real address you want to inspect.' };
    const role = {
      'npm install': 'the package (library) to install from npm', 'uv add': 'a Python package to add', 'forge install': 'the GitHub repository of the library to install',
      mkdir: 'the name of the new folder', cd: 'the folder to move into', 'forge init': 'the name of the new project folder', 'uv init': 'the name of the new project folder',
      'git switch': 'the branch to switch to (with -c, the new branch to create)', 'git merge': 'the branch whose changes to bring in', 'git push': 'the branch to upload',
      grep: 'the text to search for', 'cast storage': 'the storage slot number to read', chmod: 'the file whose permissions change', cat: 'the file to print',
    }[`${cmd} ${sub}`] || { mkdir: 'the name of the new folder', cd: 'the folder to move into', grep: 'the text to search for', chmod: 'the file whose permissions change', cat: 'the file to print', ls: 'the folder to list', tar: 'the folder (or files) to pack into the archive' }[cmd];
    if (role) return { word: w, kind: 'argument', what: `This is ${role}.`, how: '' };
    if (/[./~]/.test(w)) return { word: w, kind: 'file or path', what: 'A file or folder name.', how: '`~` means your home folder, `.` this folder, and `..` the folder above.' };
    return generic(w, 'argument', `A value given to ${cmd}${sub && !sub.startsWith('-') && sub !== w ? ` ${sub}` : ''}.`, 'Commands read their arguments in order.');
  }

  // ------------------------------------------------------------ render the explorable code
  function highlight(code, lang) {
    const name = HL[lang];
    if (window.hljs && name && window.hljs.getLanguage(name)) {
      try { return window.hljs.highlight(code, { language: name, ignoreIllegals: true }).value; } catch (e) { /* plain */ }
    }
    return esc(code);
  }
  const WHOLE = { 'hljs-string': 'string', 'hljs-comment': 'comment', 'hljs-regexp': 'regexp', 'hljs-number': 'number', 'hljs-meta': 'meta', 'hljs-attr': 'key' };

  function tokenize(codeEl, code, lang) {
    const lineStarts = [0];
    for (let i = 0; i < code.length; i++) if (code[i] === '\n') lineStarts.push(i + 1);
    const pos = (off) => { let l = 0; while (l + 1 < lineStarts.length && lineStarts[l + 1] <= off) l++; return { line: l, col: off - lineStarts[l] }; };
    const walker = document.createTreeWalker(codeEl, NodeFilter.SHOW_TEXT);
    const nodes = [];
    for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n);
    const tokens = [];
    const done = new Set();
    const make = (text, cls, off) => {
      const span = document.createElement('span');
      span.className = 'xt';
      span.dataset.i = tokens.length;
      tokens.push({ text, cls, ...pos(off), el: span });
      return span;
    };
    let offset = 0;
    for (const node of nodes) {
      const text = node.nodeValue;
      const start = offset;
      offset += text.length;
      // whole strings, comments and numbers are one token each (unless a string has ${...} inside)
      let whole = null;
      for (let el = node.parentElement; el && el !== codeEl; el = el.parentElement) {
        const c = [...el.classList].find((k) => WHOLE[k]);
        if (c && !(c === 'hljs-meta' && lang !== 'bash') && !(c === 'hljs-attr' && lang !== 'json') && !el.querySelector('.hljs-subst')) { whole = { el, cls: WHOLE[c] }; }
      }
      // the literal text of a template string with ${...} inside is text, not code
      if (!whole && node.parentElement.closest('.hljs-string') && !node.parentElement.closest('.hljs-subst')) continue;
      if (whole) {
        if (!done.has(whole.el)) {
          done.add(whole.el);
          const span = make(whole.el.textContent, whole.cls, start);
          whole.el.parentNode.insertBefore(span, whole.el);
          span.append(whole.el);
        }
        continue;
      }
      if (lang === 'html' && !node.parentElement.closest('.hljs-name, .hljs-attr')) continue;
      const frag = document.createDocumentFragment();
      let last = 0;
      let any = false;
      for (const m of text.matchAll(wordRe(lang))) {
        if (m.index > last) frag.append(text.slice(last, m.index));
        const span = make(m[0], 'word', start + m.index);
        span.textContent = m[0];
        frag.append(span);
        last = m.index + m[0].length;
        any = true;
      }
      if (!any) continue;
      if (last < text.length) frag.append(text.slice(last));
      node.replaceWith(frag);
    }
    return tokens;
  }

  // ------------------------------------------------------------ the floating explanation
  let pop = null;
  let renders = 0;
  let current = null; // { box, tokenEl, pinned }
  let showTimer = 0;
  let hideTimer = 0;
  function popup() {
    if (pop) return pop;
    pop = document.createElement('div');
    pop.className = 'xp-pop';
    pop.id = 'xpPop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Explanation');
    pop.setAttribute('aria-live', 'polite');
    pop.hidden = true;
    document.body.append(pop);
    pop.addEventListener('mouseenter', () => clearTimeout(hideTimer));
    pop.addEventListener('mouseleave', () => { if (current && !current.pinned) scheduleHide(); });
    document.addEventListener('mousedown', (e) => { if (!pop.hidden && !pop.contains(e.target) && !e.target.closest('.xt')) hide(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !pop.hidden) { const back = current && current.tokenEl && current.tokenEl.closest('.xp-pre'); hide(); if (back) back.focus(); } });
    window.addEventListener('resize', hide);
    window.addEventListener('hashchange', hide);
    return pop;
  }
  function hide() {
    clearTimeout(showTimer);
    if (!pop) return;
    pop.hidden = true;
    document.querySelectorAll('.xt-on, .xt-same').forEach((el) => el.classList.remove('xt-on', 'xt-same'));
    current = null;
  }
  const scheduleHide = () => { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 250); };
  function place(rect) {
    const p = popup();
    p.hidden = false;
    p.style.left = '0px';
    p.style.top = '0px';
    const w = p.offsetWidth;
    const h = p.offsetHeight;
    const vw = document.documentElement.clientWidth;
    let left = Math.min(Math.max(8, rect.left), vw - w - 8);
    let top = rect.bottom + 8;
    if (top + h > window.innerHeight - 8 && rect.top - h - 8 > 0) top = rect.top - h - 8;
    p.style.left = `${left + window.scrollX}px`;
    p.style.top = `${top + window.scrollY}px`;
  }
  function section(label, html) { return html ? `<p class="xp-sec"><span class="xp-label">${label}</span>${html}</p>` : ''; }
  function lineHint(box, lineNo) {
    const text = box.lines[lineNo] || '';
    for (const h of box.opts.hints || []) {
      try { if (new RegExp(h.re, 'm').test(text)) return h.text; } catch (e) { /* ignore a bad pattern */ }
    }
    return '';
  }
  function askButton(question) {
    if (!window.CL_AI) return '';
    return `<div class="row xp-actions"><button type="button" class="btn btn-sm xp-ask" data-q="${esc(question)}">Ask the AI coach</button></div>`;
  }
  function wirePop(box) {
    const b = pop.querySelector('.xp-ask');
    if (!b) return;
    b.addEventListener('click', () => {
      const q = b.dataset.q;
      hide();
      window.CL_AI.openDrawer({
        title: 'AI coach',
        intro: 'Ask me about any part of this code.',
        suggestions: [],
        autoAsk: q,
        getContext: () => `Coding exercise: ${box.opts.title || ''} (${box.lang}). The learner has finished it and is exploring this code:\n${box.code}`,
      });
    });
  }

  function showToken(box, el, pinned) {
    const t = box.tokens[+el.dataset.i];
    if (!t) return;
    const info = explainToken(t, box);
    const hint = lineHint(box, t.line);
    const p = popup();
    p.innerHTML = `
      <div class="xp-head"><code class="xp-word">${esc(info.word)}</code><span class="xp-kind">${esc(info.kind)}</span></div>
      ${section('What it is', md(info.what))}
      ${section('How it works', md(info.how))}
      ${section(`Why it is on line ${t.line + 1}`, hint)}
      ${askButton(`In my code, what does \`${t.text.slice(0, 80)}\` do on this line, how does it work and why is it needed?\n\nLine ${t.line + 1}: ${box.lines[t.line].trim()}`)}`;
    document.querySelectorAll('.xt-on, .xt-same').forEach((x) => x.classList.remove('xt-on', 'xt-same'));
    el.classList.add('xt-on');
    if (t.cls === 'word' && /^[A-Za-z_$]/.test(t.text)) box.tokens.forEach((o) => { if (o !== t && o.cls === 'word' && o.text === t.text) o.el.classList.add('xt-same'); });
    current = { box, tokenEl: el, pinned };
    place(el.getBoundingClientRect());
    wirePop(box);
  }

  function showSelection(box, range) {
    const text = range.toString().trim();
    if (!text) return;
    const inside = box.tokens.filter((t) => range.intersectsNode(t.el));
    const seen = new Set();
    const items = [];
    for (const t of inside) {
      const info = explainToken(t, box);
      const key = `${info.kind}|${info.word}`;
      if (seen.has(key) || /^[=!<>%]$/.test(t.text)) continue;
      seen.add(key);
      items.push(info);
      if (items.length >= 6) break;
    }
    const linesHit = [...new Set(inside.map((t) => t.line))];
    const hints = linesHit.map((l) => lineHint(box, l)).filter(Boolean);
    const p = popup();
    p.innerHTML = `
      <div class="xp-head"><span class="xp-kind">Your selection</span><code class="xp-word xp-sel">${esc(text.length > 60 ? text.slice(0, 60) + '...' : text)}</code></div>
      ${items.length ? `<ul class="xp-list">${items.map((i) => `<li><code>${esc(i.word)}</code> <span class="xp-kind">${esc(i.kind)}</span> ${md(i.what)}</li>`).join('')}</ul>` : ''}
      ${hints.length ? section(linesHit.length > 1 ? `Why these lines are here` : `Why it is on line ${linesHit[0] + 1}`, [...new Set(hints)].join('<br>')) : ''}
      ${askButton(`Explain this part of my code: what it does, how it works and why it is needed.\n\n${text.slice(0, 800)}`)}`;
    current = { box, tokenEl: null, pinned: true };
    place(range.getBoundingClientRect());
    wirePop(box);
  }

  // Render code you can explore. opts: { file, hints, title, onEdit }
  function render(code, lang, opts = {}) {
    popup();
    const root = document.createElement('div');
    root.className = 'xp';
    const lines = code.replace(/\r/g, '').split('\n');
    while (lines.length > 1 && !lines[lines.length - 1].trim()) lines.pop();
    const clean = lines.join('\n');
    root.innerHTML = `
      <div class="xp-bar">
        <span class="xp-file">${esc(opts.file || 'code')}</span>
        <span class="xp-mode">Explore</span>
        <span class="xp-tip">Hover or tap any word to see what it is, how it works and why it is there. Highlight several words to explain them together.</span>
        ${opts.onEdit ? '<button type="button" class="btn btn-sm xp-edit">Edit code</button>' : ''}
      </div>
      <div class="xp-body">
        <div class="xp-gutter" aria-hidden="true">${lines.map((_, i) => i + 1).join('\n')}</div>
        <pre class="xp-pre" tabindex="0" aria-label="Your code. Use the arrow keys to move between words and hear what each one does."><code class="hljs xp-code">${highlight(clean, lang)}</code></pre>
      </div>`;
    const codeEl = root.querySelector('.xp-code');
    const box = { lang, code: clean, lines, opts, tokens: tokenize(codeEl, clean, lang) };
    root.explain = () => box.tokens.map((t) => ({ t: t.text, cls: t.cls, line: t.line, ...explainToken(t, box) })); // used by tests
    const uid = `xp${++renders}`;
    box.tokens.forEach((t, i) => { t.el.id = `${uid}-${i}`; });
    const pre = root.querySelector('.xp-pre');

    pre.addEventListener('mouseover', (e) => {
      const el = e.target.closest('.xt');
      if (!el || e.buttons || (current && current.pinned)) return; // e.buttons: dragging to highlight
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
      showTimer = setTimeout(() => { if (!window.getSelection().toString()) showToken(box, el, false); }, 140);
    });
    pre.addEventListener('mouseout', (e) => {
      const el = e.target.closest('.xt');
      if (!el) return;
      clearTimeout(showTimer);
      if (current && !current.pinned) scheduleHide();
    });
    pre.addEventListener('click', (e) => {
      if (window.getSelection().toString().trim()) return; // a highlight, handled below
      const el = e.target.closest('.xt');
      if (!el) return;
      showToken(box, el, true);
    });
    const onSelect = () => {
      const sel = window.getSelection();
      if (!sel.rangeCount || sel.isCollapsed) return;
      const range = sel.getRangeAt(0);
      if (!pre.contains(range.commonAncestorContainer)) return;
      if (!sel.toString().trim()) return;
      showSelection(box, range);
    };
    pre.addEventListener('mouseup', () => setTimeout(onSelect, 0));
    pre.addEventListener('touchend', () => setTimeout(onSelect, 350));
    pre.addEventListener('keyup', (e) => { if (e.shiftKey) onSelect(); });

    // Keyboard: the code box takes focus, and the arrow keys move an "active word" (announced through
    // aria-activedescendant and the live explanation), so the mouse never focuses single words.
    let active = -1;
    const activate = (i) => {
      const t = box.tokens[i];
      if (!t) return;
      active = i;
      pre.setAttribute('aria-activedescendant', t.el.id);
      t.el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      showToken(box, t.el, true);
    };
    pre.addEventListener('keyup', (e) => {
      if (e.key === 'Tab' && document.activeElement === pre && active < 0) activate(0); // arrived by keyboard
    });
    pre.addEventListener('blur', () => { active = -1; pre.removeAttribute('aria-activedescendant'); });
    pre.addEventListener('keydown', (e) => {
      if (e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) return;
      const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      if (active < 0) { activate(0); return; }
      const t = box.tokens[active];
      let next = active;
      if (e.key === 'ArrowRight') next = Math.min(active + 1, box.tokens.length - 1);
      else if (e.key === 'ArrowLeft') next = Math.max(active - 1, 0);
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const target = t.line + (e.key === 'ArrowDown' ? 1 : -1);
        const row = box.tokens.map((o, i) => ({ o, i })).filter(({ o }) => o.line === target);
        if (row.length) next = row.reduce((a, b) => (Math.abs(b.o.col - t.col) < Math.abs(a.o.col - t.col) ? b : a)).i;
      } else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = box.tokens.length - 1;
      activate(next);
    });
    const edit = root.querySelector('.xp-edit');
    if (edit) edit.addEventListener('click', () => { hide(); opts.onEdit(); });
    return root;
  }

  return { render, hide, explainToken, findDeclaration };
})();
