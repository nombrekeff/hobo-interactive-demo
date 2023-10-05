import { basicSetup } from "codemirror"
import { EditorView, keymap } from "@codemirror/view"
import { javascript } from "@codemirror/lang-javascript"
import { html } from "@codemirror/lang-html"
import { indentWithTab } from "@codemirror/commands"
import { autocompletion } from "@codemirror/autocomplete"
import { EditorState } from "@codemirror/state"
import { builders, Tag, TagBuilder, generate, doc, attach, detach } from 'hobo-js/dist/hobo.mjs';
import prettier from 'prettier/standalone.mjs';
import htmlPlugin from 'prettier/plugins/html.mjs';

function myCompletions(context) {
    let word = context.matchBefore(/\w*/)
    if (word.from == word.to && !context.explicit)
        return null;
    const completions = {
        from: word.from,
        options: [
            ...Object.getOwnPropertyNames(TagBuilder.prototype).map(m => {
                return { label: "." + m, type: "method", apply: m, detail: "macro" };
            }),
            ...Object.getOwnPropertyNames(Tag.prototype).map(m => {
                return { label: "." + m, type: "method", apply: m, detail: "macro" };
            }),
            ...Object.keys(builders).map(k => {
                return {
                    label: k,
                    type: "variable", info: "Creates a new " + k + " tag"
                };
            }),
        ],
    }
    console.log({ completions });
    return completions;
}


export let editor = new EditorView({
    doc: `const root = doc(); 
div.attach.addClass('test')('Hello World');
return root.doc;
    `,
    extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        javascript(),
        autocompletion({
            override: [myCompletions],
        }),
        EditorView.updateListener.of((v) => {
            if (v.docChanged) {
                console.log('changed');
                debounce(() => _handleHoboCode(v), 350);
            }
        }),
    ],
    parent: document.querySelector('#editor'),
});

export let editorResult = new EditorView({
    extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        html(),
        EditorState.readOnly.of(true)
    ],
    lineWrapping: true,
    parent: document.querySelector('#result'),
});


const sandboxProxies = new WeakMap()

function compileCode(src) {
    src = 'with (sandbox) { ' + src + '}'
    const code = new Function('sandbox', src)

    return function (sandbox) {
        if (!sandboxProxies.has(sandbox)) {
            const sandboxProxy = new Proxy(sandbox, { has, get })
            sandboxProxies.set(sandbox, sandboxProxy)
        }
        return code(sandboxProxies.get(sandbox))
    }
}

function has(target, key) {
    return true
}

function get(target, key) {
    if (key === Symbol.unscopables) return undefined
    return target[key]
}

async function _handleHoboCode() {
    const tree = compileCode(editor.state.doc.toString())({
        builders: builders,
        console,
        generate,
        doc, attach, detach,
        ...builders,
    }, {});

    let generated = '';

    if (tree instanceof Tag) {
        console.log('Is tag');
        generated = generate(tree);
    } else {
        generated = "ERROR: You must return a Tag"
    }

    const formatted = await prettier.format(generated, { parser: 'html', plugins: [htmlPlugin] });
    editorResult.dispatch(
        editorResult.state.update({
            changes: {
                from: 0, to: editorResult.state.doc.length, insert: formatted
            }
        })
    );
}
_handleHoboCode();

let timer;
function debounce(func, timeout = 450) {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, []); }, timeout);
}