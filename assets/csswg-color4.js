// compilation of:
// https://drafts.csswg.org/css-color-4/multiply-matrices.js
// https://drafts.csswg.org/css-color-4/conversions.js
// https://drafts.csswg.org/css-color-4/utilities.js
// https://github.com/LeaVerou/css.land/blob/master/lch/lch.js



/**
 * Simple matrix (and vector) multiplication
 * Warning: No error handling for incompatible dimensions!
 * @author Lea Verou 2020 MIT License
 */
// A is m x n. B is n x p. product is m x p.
function multiplyMatrices(A, B) {
    let m = A.length;

    if (!Array.isArray(A[0])) {
        // A is vector, convert to [[a, b, c, ...]]
        A = [A];
    }

    if (!Array.isArray(B[0])) {
        // B is vector, convert to [[a], [b], [c], ...]]
        B = B.map((x) => [x]);
    }

    let p = B[0].length;
    let B_cols = B[0].map((_, i) => B.map((x) => x[i])); // transpose B
    let product = A.map((row) => B_cols.map((col) => {
        if (!Array.isArray(row)) {
            return col.reduce((a, c) => a + c * row, 0);
        }

        return row.reduce((a, c, i) => a + c * (col[i] || 0), 0);
    }));

    if (m === 1) {
        product = product[0]; // Avoid [[a, b, c, ...]]
    }

    if (p === 1) {
        return product.map((x) => x[0]); // Avoid [[a], [b], [c], ...]]
    }

    return product;
}



// Sample code for color conversions
// Conversion can also be done using ICC profiles and a Color Management System
// For clarity, a library is used for matrix multiplication (multiply-matrices.js)

// sRGB-related functions
/*
function lin_sRGB(RGB) {
    // convert an array of sRGB values
    // where in-gamut values are in the range [0 - 1]
    // to linear light (un-companded) form.
    // https://en.wikipedia.org/wiki/SRGB
    // Extended transfer function:
    // for negative values,  linear portion is extended on reflection of axis,
    // then reflected power function is used.
    return RGB.map(function(val) {
        let sign = val < 0? -1 : 1;
        let abs = Math.abs(val);

        if (abs < 0.04045) {
            return val / 12.92;
        }

        return sign * (Math.pow((abs + 0.055) / 1.055, 2.4));
    });
}
*/

function gam_sRGB(RGB) {
    // convert an array of linear-light sRGB values in the range 0.0-1.0
    // to gamma corrected form
    // https://en.wikipedia.org/wiki/SRGB
    // Extended transfer function:
    // For negative values, linear portion extends on reflection
    // of axis, then uses reflected pow below that
    return RGB.map(function(val) {
        let sign = val < 0? -1 : 1;
        let abs = Math.abs(val);

        if (abs > 0.0031308) {
            return sign * (1.055 * Math.pow(abs, 1/2.4) - 0.055);
        }

        return 12.92 * val;
    });
}

/*
function lin_sRGB_to_XYZ(rgb) {
    // convert an array of linear-light sRGB values to CIE XYZ
    // using sRGB's own white, D65 (no chromatic adaptation)

    var M = [
        [ 0.41239079926595934, 0.357584339383878,   0.1804807884018343  ],
        [ 0.21263900587151027, 0.715168678767756,   0.07219231536073371 ],
        [ 0.01933081871559182, 0.11919477979462598, 0.9505321522496607  ],
    ];
    return multiplyMatrices(M, rgb);
}
*/

function XYZ_to_lin_sRGB(XYZ) {
    // convert XYZ to linear-light sRGB

    var M = [
        [  3.2409699419045226,  -1.537383177570094,   -0.4986107602930034  ],
        [ -0.9692436362808796,   1.8759675015077202,   0.04155505740717559 ],
        [  0.05563007969699366, -0.20397695888897652,  1.0569715142428786  ],
    ];

    return multiplyMatrices(M, XYZ);
}

//  display-p3-related functions

/*
function lin_P3(RGB) {
    // convert an array of display-p3 RGB values in the range 0.0 - 1.0
    // to linear light (un-companded) form.

    return lin_sRGB(RGB);	// same as sRGB
}

function gam_P3(RGB) {
    // convert an array of linear-light display-p3 RGB  in the range 0.0-1.0
    // to gamma corrected form

    return gam_sRGB(RGB);	// same as sRGB
}

function lin_P3_to_XYZ(rgb) {
    // convert an array of linear-light display-p3 values to CIE XYZ
    // using  D65 (no chromatic adaptation)
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    var M = [
        [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
        [0.2289745640697488, 0.6917385218365064,  0.079286914093745],
        [0.0000000000000000, 0.04511338185890264, 1.043944368900976],
    ];
    // 0 was computed as -3.972075516933488e-17

    return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_P3(XYZ) {
    // convert XYZ to linear-light P3
    var M = [
        [ 2.493496911941425,   -0.9313836179191239, -0.40271078445071684],
        [-0.8294889695615747,   1.7626640603183463,  0.023624685841943577],
        [ 0.03584583024378447, -0.07617238926804182, 0.9568845240076872],
    ];

    return multiplyMatrices(M, XYZ);
}

// prophoto-rgb functions

function lin_ProPhoto(RGB) {
    // convert an array of prophoto-rgb values
    // where in-gamut colors are in the range [0.0 - 1.0]
    // to linear light (un-companded) form.
    // Transfer curve is gamma 1.8 with a small linear portion
    // Extended transfer function
    const Et2 = 16/512;
    return RGB.map(function(val) {
        let sign = val < 0? -1 : 1;
        let abs = Math.abs(val);

        if (abs <= Et2) {
            return val / 16;
        }

        return sign * Math.pow(val, 1.8);
    });
}

function gam_ProPhoto(RGB) {
    // convert an array of linear-light prophoto-rgb  in the range 0.0-1.0
    // to gamma corrected form
    // Transfer curve is gamma 1.8 with a small linear portion
    // TODO for negative values, extend linear portion on reflection of axis, then add pow below that
    const Et = 1/512;
    return RGB.map(function(val) {
        let sign = val < 0? -1 : 1;
        let abs = Math.abs(val);

        if (abs >= Et) {
            return sign * Math.pow(abs, 1/1.8);
        }

        return 16 * val;
    });
}

function lin_ProPhoto_to_XYZ(rgb) {
    // convert an array of linear-light prophoto-rgb values to CIE XYZ
    // using  D50 (so no chromatic adaptation needed afterwards)
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    var M = [
        [ 0.7977604896723027,  0.13518583717574031,  0.0313493495815248     ],
        [ 0.2880711282292934,  0.7118432178101014,   0.00008565396060525902 ],
        [ 0.0,                 0.0,                  0.8251046025104601     ],
    ];

    return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_ProPhoto(XYZ) {
    // convert XYZ to linear-light prophoto-rgb
    var M = [
        [  1.3457989731028281,  -0.25558010007997534,  -0.05110628506753401 ],
        [ -0.5446224939028347,   1.5082327413132781,    0.02053603239147973 ],
        [  0.0,                  0.0,                   1.2119675456389454  ],
    ];

    return multiplyMatrices(M, XYZ);
}

// a98-rgb functions

function lin_a98rgb(RGB) {
    // convert an array of a98-rgb values in the range 0.0 - 1.0
    // to linear light (un-companded) form.
    // negative values are also now accepted
    return RGB.map(function(val) {
        let sign = val < 0? -1 : 1;
        let abs = Math.abs(val);

        return sign * Math.pow(abs, 563/256);
    });
}

function gam_a98rgb(RGB) {
    // convert an array of linear-light a98-rgb  in the range 0.0-1.0
    // to gamma corrected form
    // negative values are also now accepted
    return RGB.map(function(val) {
        let sign = val < 0? -1 : 1;
        let abs = Math.abs(val);

        return sign * Math.pow(abs, 256/563);
    });
}

function lin_a98rgb_to_XYZ(rgb) {
    // convert an array of linear-light a98-rgb values to CIE XYZ
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    // has greater numerical precision than section 4.3.5.3 of
    // https://www.adobe.com/digitalimag/pdfs/AdobeRGB1998.pdf
    // but the values below were calculated from first principles
    // from the chromaticity coordinates of R G B W
    // see matrixmaker.html
    var M = [
        [ 0.5766690429101305,   0.1855582379065463,   0.1882286462349947  ],
        [ 0.29734497525053605,  0.6273635662554661,   0.07529145849399788 ],
        [ 0.02703136138641234,  0.07068885253582723,  0.9913375368376388  ],
    ];

    return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_a98rgb(XYZ) {
    // convert XYZ to linear-light a98-rgb
    var M = [
        [  2.0415879038107465,    -0.5650069742788596,   -0.34473135077832956 ],
        [ -0.9692436362808795,     1.8759675015077202,    0.04155505740717557 ],
        [  0.013444280632031142,  -0.11836239223101838,   1.0151749943912054  ],
    ];

    return multiplyMatrices(M, XYZ);
}

//Rec. 2020-related functions

function lin_2020(RGB) {
    // convert an array of rec2020 RGB values in the range 0.0 - 1.0
    // to linear light (un-companded) form.
    // ITU-R BT.2020-2 p.4

    const unitPlusMinus = 1.09929682680944;
    const unitSquare = 0.018053968510807;

    return RGB.map(function(val) {
        let sign = val < 0? -1 : 1;
        let abs = Math.abs(val);

        if (abs < unitSquare * 4.5 ) {
            return val / 4.5;
        }

        return sign * (Math.pow((abs + unitPlusMinus -1 ) / unitPlusMinus, 1/0.45));
    });
}

function gam_2020(RGB) {
    // convert an array of linear-light rec2020 RGB  in the range 0.0-1.0
    // to gamma corrected form
    // ITU-R BT.2020-2 p.4

    const unitPlusMinus = 1.09929682680944;
    const unitSquare = 0.018053968510807;


    return RGB.map(function(val) {
        let sign = val < 0? -1 : 1;
        let abs = Math.abs(val);

        if (abs > unitSquare) {
            return sign * (unitPlusMinus * Math.pow(abs, 0.45) - (unitPlusMinus - 1));
        }

        return 4.5 * val;
    });
}

function lin_2020_to_XYZ(rgb) {
    // convert an array of linear-light rec2020 values to CIE XYZ
    // using  D65 (no chromatic adaptation)
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    var M = [
        [0.6369580483012914, 0.14461690358620832,  0.1688809751641721],
        [0.2627002120112671, 0.6779980715188708,   0.05930171646986196],
        [0.000000000000000,  0.028072693049087428, 1.060985057710791],
    ];
    // 0 is actually calculated as  4.994106574466076e-17

    return multiplyMatrices(M, rgb);
}

function XYZ_to_lin_2020(XYZ) {
    // convert XYZ to linear-light rec2020
    var M = [
        [1.7166511879712674,   -0.35567078377639233, -0.25336628137365974],
        [-0.6666843518324892,   1.6164812366349395,   0.01576854581391113],
        [0.017639857445310783, -0.042770613257808524, 0.9421031212354738],
    ];

    return multiplyMatrices(M, XYZ);
}

// Chromatic adaptation

function D65_to_D50(XYZ) {
    // Bradford chromatic adaptation from D65 to D50
    // The matrix below is the result of three operations:
    // - convert from XYZ to retinal cone domain
    // - scale components from one reference white to another
    // - convert back to XYZ
    // http://www.brucelindbloom.com/index.html?Eqn_ChromAdapt.html
    var M =  [
        [  1.0479298208405488,    0.022946793341019088,  -0.05019222954313557 ],
        [  0.029627815688159344,  0.990434484573249,     -0.01707382502938514 ],
        [ -0.009243058152591178,  0.015055144896577895,   0.7518742899580008  ],
    ];

    return multiplyMatrices(M, XYZ);
}
*/

function D50_to_D65(XYZ) {
    // Bradford chromatic adaptation from D50 to D65
    var M = [
        [  0.9554734527042182,   -0.023098536874261423,  0.0632593086610217   ],
        [ -0.028369706963208136,  1.0099954580058226,    0.021041398966943008 ],
        [  0.012314001688319899, -0.020507696433477912,  1.3303659366080753   ],
    ];

    return multiplyMatrices(M, XYZ);
}

// Lab and LCH

/*
function XYZ_to_Lab(XYZ) {
    // Assuming XYZ is relative to D50, convert to CIE Lab
    // from CIE standard, which now defines these as a rational fraction
    var unitMu = 216/24389;  // 6^3/29^3
    var unitDeg = 24389/27;   // 29^3/3^3
    var white = [0.96422, 1.00000, 0.82521]; // D50 reference white

    // compute xyz, which is XYZ scaled relative to reference white
    var xyz = XYZ.map((value, i) => value / white[i]);

    // now compute f
    var f = xyz.map((value) => value > unitMu ? Math.cbrt(value) : (unitDeg * value + 16)/116);

    return [
        (116 * f[1]) - 16, 	 // L
        500 * (f[0] - f[1]), // a
        200 * (f[1] - f[2]),  // b
    ];
}
*/

function Lab_to_XYZ(Lab) {
    // Convert Lab to D50-adapted XYZ
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    var unitDeg = 24389/27;   // 29^3/3^3
    var unitMu = 216/24389;  // 6^3/29^3
    var white = [0.96422, 1.00000, 0.82521]; // D50 reference white
    var f = [];

    // compute f, starting with the luminance-related term
    f[1] = (Lab[0] + 16)/116;
    f[0] = Lab[1]/500 + f[1];
    f[2] = f[1] - Lab[2]/200;

    // compute xyz
    var xyz = [
        Math.pow(f[0], 3) > unitMu ?   Math.pow(f[0], 3)            : (116*f[0]-16)/unitDeg,
        Lab[0] > unitDeg * unitMu ?         Math.pow((Lab[0]+16)/116, 3) : Lab[0]/unitDeg,
        Math.pow(f[2], 3)  > unitMu ?  Math.pow(f[2], 3)            : (116*f[2]-16)/unitDeg,
    ];

    // Compute XYZ by scaling xyz by reference white
    return xyz.map((value, i) => value * white[i]);
}

/*
function Lab_to_LCH(Lab) {
    // Convert to polar form
    var hue = Math.atan2(Lab[2], Lab[1]) * 180 / Math.PI;
    return [
        Lab[0], // L is still L
        Math.sqrt(Math.pow(Lab[1], 2) + Math.pow(Lab[2], 2)), // Chroma
        hue >= 0 ? hue : hue + 360, // Hue, in degrees [0 to 360)
    ];
}
*/

function LCH_to_Lab(LCH) {
    // Convert from polar form
    return [
        LCH[0], // L is still L
        LCH[1] * Math.cos(LCH[2] * Math.PI / 180), // a
        LCH[1] * Math.sin(LCH[2] * Math.PI / 180), // b
    ];
}

// OKLab and OKLCH
// https://bottosson.github.io/posts/oklab/

// XYZ <-> LMS matrices recalculated for consistent reference white
// see https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-943521484

/*
function XYZ_to_OKLab(XYZ) {
    // Given XYZ relative to D65, convert to OKLab
    var XYZtoLMS = [
        [ 0.8190224432164319,    0.3619062562801221,   -0.12887378261216414  ],
        [ 0.0329836671980271,    0.9292868468965546,     0.03614466816999844 ],
        [ 0.048177199566046255,  0.26423952494422764,    0.6335478258136937  ],
    ];
    var LMStoOKLab = [
        [  0.2104542553,   0.7936177850,  -0.0040720468 ],
        [  1.9779984951,  -2.4285922050,   0.4505937099 ],
        [  0.0259040371,   0.7827717662,  -0.8086757660 ],
    ];

    var LMS = multiplyMatrices(XYZtoLMS, XYZ);
    return multiplyMatrices(LMStoOKLab, LMS.map((c) => Math.cbrt(c)));

}

function OKLab_to_XYZ(OKLab) {
    // Given OKLab, convert to XYZ relative to D65
    var LMStoXYZ =  [
        [  1.2268798733741557,  -0.5578149965554813,   0.28139105017721583 ],
        [ -0.04057576262431372,  1.1122868293970594,  -0.07171106666151701 ],
        [ -0.07637294974672142, -0.4214933239627914,   1.5869240244272418  ],
    ];
    var OKLabtoLMS = [
        [ 0.99999999845051981432,  0.39633779217376785678,   0.21580375806075880339  ],
        [ 1.0000000088817607767,  -0.1055613423236563494,   -0.063854174771705903402 ],
        [ 1.0000000546724109177,  -0.089484182094965759684, -1.2914855378640917399   ],
    ];

    var LMSnl = multiplyMatrices(OKLabtoLMS, OKLab);
    return multiplyMatrices(LMStoXYZ, LMSnl.map((c) => c ** 3));
}

function OKLab_to_OKLCH(OKLab) {
    var hue = Math.atan2(OKLab[2], OKLab[1]) * 180 / Math.PI;
    return [
        OKLab[0], // L is still L
        Math.sqrt(OKLab[1] ** 2 + OKLab[2] ** 2), // Chroma
        hue >= 0 ? hue : hue + 360, // Hue, in degrees [0 to 360)
    ];
}

function OKLCH_to_OKLab(OKLCH) {
    return [
        OKLCH[0], // L is still L
        OKLCH[1] * Math.cos(OKLCH[2] * Math.PI / 180), // a
        OKLCH[1] * Math.sin(OKLCH[2] * Math.PI / 180),  // b
    ];
}


// utility functions for color conversions
// needs conversions.js

function sRGB_to_luminance(RGB) {
    // convert an array of gamma-corrected sRGB values
    // in the 0.0 to 1.0 range
    // to linear-light sRGB, then to CIE XYZ
    // and return luminance (the Y value)

    var XYZ = lin_sRGB_to_XYZ(lin_sRGB(RGB));
    return XYZ[1];
}


function contrast(RGB1, RGB2) {
    // return WCAG 2.1 contrast ratio
    // https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
    // for two sRGB values
    // given as arrays of 0.0 to 1.0

    var L1 = sRGB_to_luminance(RGB1);
    var L2 = sRGB_to_luminance(RGB2);

    if (L1 > L2) {
        return (L1 + 0.05) / (L2 + 0.05);
    }

    return (L2 + 0.05) / (L1 + 0.05);
}

function sRGB_to_LCH(RGB) {
    // convert an array of gamma-corrected sRGB values
    // in the 0.0 to 1.0 range
    // to linear-light sRGB, then to CIE XYZ,
    // then adapt from D65 to D50,
    // then convert XYZ to CIE Lab
    // and finally, convert to CIE LCH

    return Lab_to_LCH(XYZ_to_Lab(D65_to_D50(lin_sRGB_to_XYZ(lin_sRGB(RGB)))));
}

function P3_to_LCH(RGB) {
    // convert an array of gamma-corrected display-p3 values
    // in the 0.0 to 1.0 range
    // to linear-light display-p3, then to CIE XYZ,
    // then adapt from D65 to D50,
    // then convert XYZ to CIE Lab
    // and finally, convert to CIE LCH

    return Lab_to_LCH(XYZ_to_Lab(D65_to_D50(lin_P3_to_XYZ(lin_P3(RGB)))));
}

function r2020_to_LCH(RGB) {
    // convert an array of gamma-corrected rec.2020 values
    // in the 0.0 to 1.0 range
    // to linear-light sRGB, then to CIE XYZ,
    // then adapt from D65 to D50,
    // then convert XYZ to CIE Lab
    // and finally, convert to CIE LCH

    return Lab_to_LCH(XYZ_to_Lab(D65_to_D50(lin_2020_to_XYZ(lin_2020(RGB)))));
}
*/


function LCH_to_sRGB(LCH) {
    // convert an array of CIE LCH values
    // to CIE Lab, and then to XYZ,
    // adapt from D50 to D65,
    // then convert XYZ to linear-light sRGB
    // and finally to gamma corrected sRGB
    // for in-gamut colors, components are in the 0.0 to 1.0 range
    // out of gamut colors may have negative components
    // or components greater than 1.0
    // so check for that :)

    return gam_sRGB(XYZ_to_lin_sRGB(D50_to_D65(Lab_to_XYZ(LCH_to_Lab(LCH)))));
}

/*
function LCH_to_P3(LCH) {
    // convert an array of CIE LCH values
    // to CIE Lab, and then to XYZ,
    // adapt from D50 to D65,
    // then convert XYZ to linear-light display-p3
    // and finally to gamma corrected display-p3
    // for in-gamut colors, components are in the 0.0 to 1.0 range
    // out of gamut colors may have negative components
    // or components greater than 1.0
    // so check for that :)

    return gam_P3(XYZ_to_lin_P3(D50_to_D65(Lab_to_XYZ(LCH_to_Lab(LCH)))));
}

function LCH_to_r2020(LCH) {
    // convert an array of CIE LCH values
    // to CIE Lab, and then to XYZ,
    // adapt from D50 to D65,
    // then convert XYZ to linear-light rec.2020
    // and finally to gamma corrected rec.2020
    // for in-gamut colors, components are in the 0.0 to 1.0 range
    // out of gamut colors may have negative components
    // or components greater than 1.0
    // so check for that :)

    return gam_2020(XYZ_to_lin_2020(D50_to_D65(Lab_to_XYZ(LCH_to_Lab(LCH)))));
}
*/

// this is straight from the CSS Color 4 spec

/*
function hslToRgb(hue, sat, light) {
    // 	For simplicity, this algorithm assumes that the hue has been normalized
    //  to a number in the half-open range [0, 6), and the saturation and lightness
    //  have been normalized to the range [0, 1]. It returns an array of three numbers
    //  representing the red, green, and blue channels of the colors,
    //  normalized to the range [0, 1]
    var t2;
    if( light <= .5 ) {
        t2 = light * (sat + 1);
    } else {
        t2 = light + sat - (light * sat);
    }
    var t1 = light * 2 - t2;
    var r = hueToRgb(t1, t2, hue + 2);
    var g = hueToRgb(t1, t2, hue);
    var b = hueToRgb(t1, t2, hue - 2);
    return [r, g, b];
}


function hueToRgb(t1, t2, hue) {
    if(hue < 0) hue += 6;
    if(hue >= 6) hue -= 6;

    if(hue < 1) return (t2 - t1) * hue + t1;
    else if(hue < 3) return t2;
    else if(hue < 4) return (t2 - t1) * (4 - hue) + t1;
    else return t1;
}

// These are the naive algorithms from CS Color 4


function naive_CMYK_to_sRGB(CMYK) {
    // CMYK is an array of four values
    // in the range [0.0, 1.0]
    // the optput is an array of [RGB]
    // also in the [0.0, 1.0] range
    // because the naive algorithm does not generate out of gamut colors
    // neither does it generate accurate simulations of practical CMYK colors

    var cyan = CMYK[0], magenta = CMYK[1], yellow = CMYK[2], black = CMYK[3];

    var red = 1 - Math.min(1, cyan * (1 - black) + black);
    var green = 1 - Math.min(1, magenta * (1 - black) + black);
    var blue = 1 - Math.min(1, yellow * (1 - black) + black);

    return [red, green, blue];

}

function naive_sRGB_to_CMYK(RGB) {
    // RGB is an arravy of three values
    // in the range [0.0, 1.0]
    // the output is an array of [CMYK]
    // also in the [0.0, 1.0] range
    // with maximum GCR and (I think) 200% TAC
    // the naive algorithm does not generate out of gamut colors
    // neither does it generate accurate simulations of practical CMYK colors

    var red = RGB[0], green= RGB[1], blue = RGB[2];

    var black = 1 - Math.max(red, green, blue);
    var cyan = (black == 1.0)? 0: (1 - red - black) / (1 - black);
    var magenta = (black == 1.0)? 0: (1 - green - black) / (1 - black);
    var yellow = (black == 1.0)? 0: (1 - blue - black) / (1 - black);

    return [cyan, magenta, yellow, black];
}

// Chromaticity utilities

function XYZ_to_xy(XYZ) {
    // Convert an array of three XYZ values
    // to x,y chromaticity coordinates

    var X = XYZ[0];
    var Y = XYZ[1];
    var Z = XYZ[2];
    var sum = X+Y+Z;
    return [X/sum, Y/sum];
}

function xy_to_uv(xy) {
    // convert an x,y chromaticity pair
    // to u*,v* chromaticities

    var x = xy[0];
    var y = xy[1];
    var denom = -2*x + 12*y +3;
    return [4*x / denom, 9*y / denom];
}

function XYZ_to_uv(XYZ) {
    // Convert an array of three XYZ values
    // to u*,v* chromaticity coordinates

    var X = XYZ[0];
    var Y = XYZ[1];
    var Z = XYZ[2];
    var denom = X + 15*Y +3*Z;
    return [4*X / denom, 9*Y / denom];
}
*/



// css.land/lch

function alpha_to_string(a = 100) {
    return (a < 100? ` / ${a}%` : "");
}

/**
 *
 * @param l
 * @param c
 * @param h
 * @param a
 * @param forceInGamut
 * @return {string}
 * @constructor
 */
function LCH_to_sRGB_string(l, c, h, a = 100, forceInGamut = true) {
    if (forceInGamut) {
        [l, c, h] = force_into_gamut(l, c, h, isLCH_within_sRGB);
    }

    return "rgb(" + LCH_to_sRGB([+l, +c, +h]).map((x) => {
        return Math.round(x * 10000)/100 + "%";
    }).join(" ") + alpha_to_string(a) + ")";
}

function force_into_gamut(l, c, h, isLCH_within) {
    // Moves an lch color into the sRGB gamut
    // by holding the l and h steady,
    // and adjusting the c via binary-search
    // until the color is on the sRGB boundary.
    if (isLCH_within(l, c, h)) {
        return [l, c, h];
    }

    let hiC = c;
    let loC = 0;
    const eps = .0001;
    c /= 2;

    // .0001 chosen fairly arbitrarily as "close enough"
    while (hiC - loC > eps) {
        if (isLCH_within(l, c, h)) {
            loC = c;
        }
        else {
            hiC = c;
        }
        c = (hiC + loC)/2;
    }

    return [l, c, h];
}

function isLCH_within_sRGB(l, c, h) {
    var rgb = LCH_to_sRGB([+l, +c, +h]);
    const eps = .000005;
    return rgb.reduce((a, b) => a && b >= (0 - eps) && b <= (1 + eps), true);
}

export {LCH_to_sRGB_string};
