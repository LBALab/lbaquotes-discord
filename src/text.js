import { loadHqr } from './hqr';

function getLanguageTextIndex(language, index) {
    const languageIndex = index + (30 * language.index);
    return { data: language, index: languageIndex };
}

export function loadTextData(hqr, language) {
    const mapData = new Uint16Array(hqr.getEntry(language.index));
    const data = new DataView(hqr.getEntry(language.index + 1));
    const texts = [];
    let start;
    let end;
    let idx = 0;

    do {
        start = data.getUint16(idx * 2, true);
        end = data.getUint16((idx * 2) + 2, true);
        const type = data.getUint8(start, true);
        let value = '';
        for (let i = start + 1; i < end - 1; i += 1) {
            value += String.fromCharCode((language.data.charmap) ?
                language.data.charmap[data.getUint8(i)]
                : data.getUint8(i)
            );
        }
        texts.push({type, index: idx, value: value.replace(' @ ','\n\n')});
        idx += 1;
    } while (end < data.byteLength);

    return texts;
}

export function getTextFile(language) {
    const fanSuffix = language.isFan ? `_${language.code}` : '';
    return `TEXT2${fanSuffix}.HQR`;
}

export function loadTexts(language, index) {
    const textHqr = loadHqr(getTextFile(language));
    return loadTextData(textHqr, getLanguageTextIndex(language, index));
}
