import { renderJson } from './json.js';
import { renderMarkdown } from './markdown.js';
import { renderText } from './text.js';

export const FORMATS = Object.freeze({ text: renderText, json: renderJson, markdown: renderMarkdown });
