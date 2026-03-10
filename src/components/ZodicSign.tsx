import React from 'react'
import Imagepath from '../constants/imagepath';
import { Image } from 'react-native';
import { WAries, WTaurus, WScorpio, WSagittarius, WPisces, WCancer, WCapricorn, WGemini, WLeo, WLibra, WVirgo, WAquarius } from '../constants/svgpath';

enum ZodicSigns {
    Aries = 'Aries',
    Cancer = 'Cancer',
    Capricorn = 'Capricorn',
    Gemini = 'Gemini',
    Leo = 'Leo',
    Libra = 'Libra',
    Pisces = 'Pisces',
    Sagittarius = 'Sagittarius',
    Scorpio = 'Scorpio',
    Taurus = 'Taurus',
    Aquarius = 'Aquarius',
    Virgo = 'Virgo',
}

export enum Type {
    image = 'image',
    svg = 'svg',
}

interface ZodicSignProps {
    width?: number;
    height?: number;
    sign: ZodicSigns;
    type?: Type;
}

export default function ZodicSign({ sign, width = 100, height = 100, type = Type.image }: ZodicSignProps) {

    switch (sign) {
        case ZodicSigns.Aries:
            return type === Type.image ? <Image source={Imagepath.Aries} style={{ width, height }} /> : <WAries />;
        case ZodicSigns.Cancer:
            return type === Type.image ? <Image source={Imagepath.Cancer} style={{ width, height }} /> : <WCancer />;
        case ZodicSigns.Capricorn:
            return type === Type.image ? <Image source={Imagepath.Capricorn} style={{ width, height }} /> : <WCapricorn />;
        case ZodicSigns.Gemini:
            return type === Type.image ? <Image source={Imagepath.Gemini} style={{ width, height }} /> : <WGemini />;
        case ZodicSigns.Leo:
            return type === Type.image ? <Image source={Imagepath.Leo} style={{ width, height }} /> : <WLeo />;
        case ZodicSigns.Libra:
            return type === Type.image ? <Image source={Imagepath.Libra} style={{ width, height }} /> : <WLibra />;
        case ZodicSigns.Pisces:
            return type === Type.image ? <Image source={Imagepath.Pisces} style={{ width, height }} /> : <WPisces />;
        case ZodicSigns.Sagittarius:
            return type === Type.image ? <Image source={Imagepath.Sagittarius} style={{ width, height }} /> : <WSagittarius />;
        case ZodicSigns.Scorpio:
            return type === Type.image ? <Image source={Imagepath.Scorpio} style={{ width, height }} /> : <WScorpio />;
        case ZodicSigns.Taurus:
            return type === Type.image ? <Image source={Imagepath.Taurus} style={{ width, height }} /> : <WTaurus />;
        case ZodicSigns.Virgo:
            return type === Type.image ? <Image source={Imagepath.Virgo} style={{ width, height }} /> : <WVirgo />;
        case ZodicSigns.Aquarius:
            return type === Type.image ? <Image source={Imagepath.Aquarius} style={{ width, height }} /> : <WAquarius />;
        default:
            return type === Type.image ? <Image source={Imagepath.Aries} style={{ width, height }} /> : <WAries />;
    }
}