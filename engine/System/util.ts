
import { option3D } from './interface';
import { Vector3 } from '@babylonjs/core/Maths/math'

export let util = {
    Pim2: Math.PI * 2,
    Pi: Math.PI,
    Pio4: Math.PI / 4,
    Pio2: Math.PI / 2,
    radianToDegreeRatio: (180 / Math.PI),
    degreeToRadianRatio: (Math.PI / 180),
    degreeToRadianVector: new Vector3(Math.PI / 180, Math.PI / 180, Math.PI / 180),

    deg2rad(deg: number): number {
        return deg * this.degreeToRadianRatio;
    },

    rad2deg(rad: number): number {
        return rad * this.degreeToRadianRatio;
    },

    sumAxis(point1: option3D, point2: option3D): option3D {
        let newpoint: any = {};
        for (let key in point1) {
            newpoint[key] = point1[key] + point2[key];
        }
        return newpoint;
    },

    substractAxis(point1: option3D, point2: option3D): option3D {
        let newpoint: any = {};
        for (let key in point1) {
            newpoint[key] = point1[key] - point2[key];
        }
        return newpoint;
    },

    negateAxis(point: option3D): option3D {
        let newpoint: any = {};
        for (let key in point) {
            newpoint[key] = -point[key];
        }
        return newpoint;
    },

    divideAxisNumber(point: option3D, divider: number): option3D {
        let newpoint: option3D = {};
        for (let key in point) {
            newpoint[key] = point[key] / divider;
        }
        return newpoint;
    },

    multiplyAxis(point1: option3D, point2: option3D): option3D {
        let newpoint: any = {};
        for (let key in point1) {
            newpoint[key] = point1[key] * point2[key];
        }
        return newpoint;
    },

    multiplyAxisNumber(point1: option3D, multiplier: number): option3D {
        let newpoint: any = {};
        for (let key in point1) {
            newpoint[key] = point1[key] * multiplier;
        }
        return newpoint;
    },

    positiveAxis(point: option3D): option3D {
        let newpoint: any = {};
        for (let key in point) {
            newpoint[key] = Math.abs(point[key]);
        }
        return newpoint;
    },

    maximizeAxis(point1: option3D, point2: option3D): option3D {
        let newpoint: any = {};
        for (let key in point1) {
            newpoint[key] = Math.max(point1[key], point2[key]);
        }
        return newpoint;
    },

    getMaximum(point: option3D): number {
        let max: number = -100000000000;
        for (let key in point) {
            if (Math.abs(point[key]) > max) max = point[key];
        }
        return max;
    },

    componentToHex(c: number) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },

    babylonRgbToHex(brgb: any): string {
        let rgb = { r: Math.round(brgb.r * 250), g: Math.round(brgb.g * 250), b: Math.round(brgb.b * 250) };
        return this.rgbToHex(rgb);
    },

    rgbToHex(rgb: any): string {
        return "#" + this.componentToHex(rgb.r) + this.componentToHex(rgb.g) + this.componentToHex(rgb.b);
    },

    hexToRgb(hex: string): Array<number> {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    },

    hexToRgba(hex: string): Array<number> {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16),
            1
        ] : [0, 0, 0, 0];
    },

    hexToRgbBabylon(hex: string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : null;
    },

    rgbaToString(rgba: Array<number>): string {
        return 'rgba(' + rgba[0] + ', ' + rgba[1] + ', ' + rgba[2] + ', ' + rgba[3] + ')';
    },

}
