import React from 'react'
import { BusinessIcon, Love, FutureIcon, CarrierIcon, HealthIcon, TravelIcon, EducationIcon, FinanceIcon,
    BusinessIconBW, LoveIconBW, FutureIconBW, CarrierIconBW, HealthIconBW, TravelIconBW, EducationIconBW, FinanceIconBW
 } from '../constants/svgpath';
import { View } from 'react-native';

enum CategorySigns {
    Business = 'business',
    Love = 'love',
    Future = 'future prediction',
    Career = 'career',
    Health = 'health',
    Travel = 'travel and relocation',
    Education = 'education',
    Finance = 'wealth',
}
export enum Type {
    bw = 'bw',
    color = 'color',
}

interface CategorySignProps {
    width?: number;
    height?: number;
    sign: CategorySigns;
    type?: Type;
}

export default function CategorySign({ sign, width = 25, height = 25, type = Type.color}: CategorySignProps) {

    switch (sign) {
        case CategorySigns.Business:
            return type === Type.color ? <BusinessIcon width={width} height={height} /> : <BusinessIconBW width={width} height={height} />;
        case CategorySigns.Love:
            return type === Type.color ? <Love width={width} height={height} /> : <LoveIconBW width={width} height={height} />;
        case CategorySigns.Future:
            return type === Type.color ? <FutureIcon width={width} height={height} /> : <FutureIconBW width={width} height={height} />;
        case CategorySigns.Career:
            return type === Type.color ? <CarrierIcon width={width} height={height} /> : <CarrierIconBW width={width} height={height} />;
        case CategorySigns.Health:
            return type === Type.color ? <HealthIcon width={width} height={height} /> : <HealthIconBW width={width} height={height} />;
        case CategorySigns.Travel:
            return type === Type.color ? <TravelIcon width={width} height={height} /> : <TravelIconBW width={width} height={height} />;
        case CategorySigns.Education:
            return type === Type.color ? <EducationIcon width={width} height={height} /> : <EducationIconBW width={width} height={height} />;
        case CategorySigns.Finance:
            return type === Type.color ? <FinanceIcon width={width} height={height} /> : <FinanceIconBW width={width} height={height} />;
        default:
            return <View />;
    }
}