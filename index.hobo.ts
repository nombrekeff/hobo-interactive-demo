import * as fs from 'fs';
import path from 'path';
import { builders, generate, doc } from 'hobo-js/src/hobo';

const { script, h3, h4, div, hr, style, p, link, a, br } = builders;

const indexDoc = doc('Hobo Interactive Demo');
indexDoc.head.append(link.aa('href', 'https://fonts.googleapis.com'));
indexDoc.head.append(
  link.aa('href', 'https://fonts.googleapis.com/css2?family=AR+One+Sans:wght@400;500;600;700&display=swap'),
);
indexDoc.head.append(link.aa('href', 'https://yarnpkg.com/en/package/normalize.css'));

style.attach.build({
  ':root': {
    fontFamily: "'AR One Sans', sans-serif",
    color: '#333',
  },
  h4: {
    margin: '8px 0',
    padding: '0',
  },
  p: {
    color: '#666',
    margin: '8px 0',
  },
  '.cm-editor': {
    minHeight: '15em',
    maxHeight: '50em',
    height: '15em',
    border: '1px solid #ddd',
    borderRadius: '8px',
    wordWrap: 'break-word',
  },
  '.space-between': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  'hr':{
    border: '1px solid #ddd',
  }
});

div.attach.addClass('space-between')(
  h3('Welcome to Hobo Interactive Demo'),
  div.b(
    a.addAttr('href', 'https://github.com/nombrekeff/hobo-js')('GitHub'),
    ' ',
    a.addAttr('href', 'https://nombrekeff.github.io/hobo-js/')('Docs'),
  ),
);
hr.attach.build();
br.attach.build();

h4.attach('Write hobo code');
p.attach('You must return a tag to generate it');
div.attach.id('editor').build();

h4.attach('Generated html');
div.attach.id('result').build();

script.attach.setAttr({ src: 'editor.bundle.js' }).build(() => {});

fs.writeFileSync(path.join(__dirname, 'index.html'), generate(indexDoc.doc));
