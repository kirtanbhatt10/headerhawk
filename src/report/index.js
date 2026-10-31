import { renderJson } from './json.js';
import { renderText } from './text.js';

export const FORMATS = Object.freeze({ text: renderText, json: renderJson });
