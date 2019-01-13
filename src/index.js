import { loadTexts } from './text';
import Languages from './constants';

const language = Languages.LBA2[0];
const texts = loadTexts(language, language.entries[Math.floor((Math.random() * language.entries.length))]);

const text = texts[Math.floor(Math.random() * texts.length)];
console.info(text.value);
