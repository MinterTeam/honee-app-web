import murmurhash from 'murmurhash-js';
import {LCH_to_sRGB_string} from '~/assets/csswg-color4.js';

const hashColor = hashColorLCH;
export default hashColor;

/**
 * @param {string} str
 * @return {string}
 */
function hashColorLCH(str) {
    const hash = Math.abs(murmurhash.murmur2(str));
    const BASE_L = 40;
    // lightness 40-60
    let L = BASE_L + hash % 20;
    // chroma 75-85
    let C = 65 + hash % 20;
    // hue
    let H = hash % 359;

    const DIRT_LOW = 70;
    const DIRT_HIGH = 95;
    // shift to more red to discard dirt colors
    if (H > DIRT_LOW && H < DIRT_HIGH) {
        H = H - (DIRT_HIGH - DIRT_LOW);
    }

    const ORANGE_LOW = 55;
    // make orange colors lighter to not be dirt
    if (H > ORANGE_LOW && H <= DIRT_HIGH) {
        L = BASE_L + 20 + hash % 5;
        C = C + 10;
    }

    const BLUE_LOW = 240;
    const BLUE_HIGH = 300;
    // reduce white to make blue colors juicy
    if (H > BLUE_LOW && H < BLUE_HIGH) {
        L = BASE_L - 5 + hash % 10;
        C = C + 10;
    }

    const VIOLET_HIGH = 330;
    // make violet not to light
    if (H >= BLUE_HIGH && H < VIOLET_HIGH) {
        L = BASE_L + hash % 10;
        C = C + 10;
    }
    console.log({L, C, H}, LCH_to_sRGB_string(L, C, H), str);
    return LCH_to_sRGB_string(L, C, H);
}

/**
 * @param {string} str
 * @return {string}
 */
function hashColorPalette(str) {
    const COLORS = ["#3f9c37", "#cb1736", "#6f33bc", "#3b9bb9", "#ffa800", "#c71b6e", "#0061f5", "#2ea496", "#fa5a00"];
    const hash = Math.abs(murmurhash.murmur2(str));
    const index = hash % COLORS.length;
    console.log(index, COLORS[index], str);
    return COLORS[index];
}
