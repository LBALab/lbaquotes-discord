import { loadHqr } from './hqr';

function getLanguageText2Index(language, index) {
    const languageIndex = index + (30 * language.index);
    return { data: language, index: languageIndex };
}

function getLanguageText1Index(language, index) {
    const languageIndex = index + (28 * language.index);
    return { data: language, index: languageIndex };
}

export function loadTextData(game, hqr, language) {
    const mapData = new Uint16Array(hqr.getEntry(language.index));
    const data = new DataView(hqr.getEntry(language.index + 1));
    const texts = [];
    let start;
    let end;
    let idx = 0;

    do {
        start = data.getUint16(idx * 2, true);
        end = data.getUint16((idx * 2) + 2, true);
        const type = game === 'lba2' ? data.getUint8(start++, true) : null;
        let value = '';
        for (let i = start; i < end - 1; i += 1) {
            value += String.fromCharCode((language.data.charmap) ?
                language.data.charmap[data.getUint8(i)]
                : data.getUint8(i)
            );
        }
        texts.push({type, index: idx, value: value.replace(' @ ','\n\n').replace('@','\n\n')});
        idx += 1;
    } while (end < data.byteLength);

    return texts;
}

export function getText1File(language) {
    const fanSuffix = language.isFan ? `_${language.code}` : '';
    return `TEXT1${fanSuffix}.HQR`;
}

export function getText2File(language) {
    const fanSuffix = language.isFan ? `_${language.code}` : '';
    return `TEXT2${fanSuffix}.HQR`;
}

export function loadTexts2(language, index) {
    const textHqr = loadHqr(getText2File(language));
    return loadTextData('lba2', textHqr, getLanguageText2Index(language, index));
}

export function loadTexts1(language, index) {
    const textHqr = loadHqr(getText1File(language));
    return loadTextData('lba1', textHqr, getLanguageText1Index(language, index));
}
