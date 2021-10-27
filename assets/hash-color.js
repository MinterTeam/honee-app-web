// import ColorHash from 'color-hash';
import murmurhash from 'murmurhash-js';

// https://github.com/zenozeng/color-hash
class ColorHash {
    L;
    S;
    hueRanges;
    hash;
    constructor(options = {
    }){
        const [L, S] = [
            options.lightness,
            options.saturation,
        ].map(function(param) {
            param = param !== undefined ? param : [
                0.35,
                0.5,
                0.65,
            ];
            return Array.isArray(param) ? param.concat() : [
                param,
            ];
        });
        this.L = L;
        this.S = S;
        if (typeof options.hue === 'number') {
            options.hue = {
                min: options.hue,
                max: options.hue,
            };
        }
        if (typeof options.hue === 'object' && !Array.isArray(options.hue)) {
            options.hue = [
                options.hue,
            ];
        }
        if (typeof options.hue === 'undefined') {
            options.hue = [];
        }
        this.hueRanges = options.hue.map(function(range) {
            return {
                min: typeof range.min === 'undefined' ? 0 : range.min,
                max: typeof range.max === 'undefined' ? 360 : range.max,
            };
        });
        // this.hash = Sha256ToInt;
        // if (typeof options.hash === 'function') {
        this.hash = options.hash;
        // }
        // if (options.hash === 'bkdr') {
        //     this.hash = BKDRHash;
        // }
    }
    hsl(str) {
        var H, S1, L1;
        var hash = this.hash(str);
        var hueResolution = 727;
        if (this.hueRanges.length) {
            const range = this.hueRanges[hash % this.hueRanges.length];
            H = hash / this.hueRanges.length % hueResolution * (range.max - range.min) / hueResolution + range.min;
        } else {
            H = hash % 359;
        }
        hash = Math.ceil(hash / 360);
        S1 = this.S[hash % this.S.length];
        hash = Math.ceil(hash / this.S.length);
        L1 = this.L[hash % this.L.length];
        return [
            H,
            S1,
            L1,
        ];
    }
    // rgb(str) {
    //     var hsl = this.hsl(str);
    //     return HSL2RGB.apply(this, hsl);
    // }
    // hex(str) {
    //     var rgb = this.rgb(str);
    //     return RGB2HEX(rgb);
    // }
}

const colorHash = new ColorHash({
    saturation: [0.4, 0.5, 0.6, 0.7, 0.8, 0.9],
    lightness: [0.4, 0.45, 0.5],
    hash: murmurhash.murmur2,
});

/**
 * @TODO https://wildbit.com/blog/2021/09/16/accessible-palette-stop-using-hsl-for-color-systems
 * @param {string} str
 * @return {`hsl(${string}`}
 */
export default function hashColor(str) {
    const hsl = colorHash.hsl(str);
    const s = hsl[1];
    // lightness should be inverted to saturation
    switch (s) {
        case 0.4:
            hsl[2] = 0.5;
            break;
        case 0.5:
        case 0.6:
            hsl[2] = 0.45;
            break;
        case 0.7:
        case 0.8:
        case 0.9:
            hsl[2] = 0.4;
            break;
    }

    hsl[1] = hsl[1] * 100 + '%';
    hsl[2] = hsl[2] * 100 + '%';

    return `hsl(${hsl.join(', ')})`;
}
