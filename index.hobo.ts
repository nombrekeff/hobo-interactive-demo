import * as fs from 'fs';
import path from 'path';
import { builders, generate, doc } from 'hobo-js/src/hobo';

const { script, h3, h4, div, hr, style, p } = builders;

const indexDoc = doc('Hobo Interactive Demo');
style.attach({
  '.cm-editor': {
    minHeight: '15em',
    maxHeight: '50em',
    height: '15em',
    border: '1px solid #ddd',
    borderRadius: '8px',
    wordWrap: 'break-word',
  },
});

h3.attach('Welcome to Hobo demo');
hr.build();

h4.attach('Write hobo code');
p.attach('You must return a tag to generate it');
div.attach.id('editor').build();

h4.attach('Generated html');
div.attach.id('result').build();

script.attach.setAttr({ src: 'editor.bundle.js' }).build(() => {});

fs.writeFileSync(path.join(__dirname, 'index.html'), generate(indexDoc.doc));
