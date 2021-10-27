import murmurhash from 'murmurhash-js';
import {LCH_to_sRGB_string} from '~/assets/csswg-color4.js';

/**
 *
 * @param {string} str
 * @return {string}
 */
export default function hashColor(str) {
    const hash = Math.abs(murmurhash.murmur2(str));
    // lightness 40-50
    const L = 40 + hash % 10;
    // chroma 75-85
    const C = 75 + hash % 10;
    // hue
    const H = hash % 359;
    console.log({L, C, H}, LCH_to_sRGB_string(L, C, H), str);
    return LCH_to_sRGB_string(L, C, H);
}
