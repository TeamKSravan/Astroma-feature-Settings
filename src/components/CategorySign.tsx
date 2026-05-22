import React from 'react'
import { BusinessIcon, Love, FutureIcon, CarrierIcon, HealthIcon, TravelIcon, EducationIcon, FinanceIcon,
    BusinessIconBW, LoveIconBW, FutureIconBW, CarrierIconBW, HealthIconBW, TravelIconBW, EducationIconBW, FinanceIconBW,
    Family_Compatibility, Business_Compatibility, Friendship_Compatibility, Overall_Compare, Personality_Alignment_Compare, Self_Growth_Compare
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
    Family_Compatibility = 'Family Report',
    Business_Compatibility = 'Partership/ Business',
    Friendship_Compatibility = 'Friendship',
    Overall_Compare = 'overall',
    Personality_Alignment_Compare = 'Personality Alignment',
    Self_Growth_Compare = 'self-growth',
    Marriage_Matchmaking = 'Marriage Matchmaking',
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
    switch (sign.trim()) {
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
        case CategorySigns.Family_Compatibility:
            return type === Type.color ? <Family_Compatibility width={width} height={height} /> : <Family_Compatibility width={width} height={height} />;
        case CategorySigns.Business_Compatibility:
            return type === Type.color ? <Business_Compatibility width={width} height={height} /> : <Business_Compatibility width={width} height={height} />;
        case CategorySigns.Friendship_Compatibility:
            return type === Type.color ? <Friendship_Compatibility width={width} height={height} /> : <Friendship_Compatibility width={width} height={height} />;
        case CategorySigns.Overall_Compare:
            return type === Type.color ? <Overall_Compare width={width} height={height} /> : <Overall_Compare width={width} height={height} />;
        case CategorySigns.Personality_Alignment_Compare:
            return type === Type.color ? <Personality_Alignment_Compare width={width} height={height} /> : <Personality_Alignment_Compare width={width} height={height} />;
        case CategorySigns.Self_Growth_Compare:
            return type === Type.color ? <Self_Growth_Compare width={width} height={height} /> : <Self_Growth_Compare width={width} height={height} />;
        case CategorySigns.Marriage_Matchmaking:
            return type === Type.color ? <Friendship_Compatibility width={width} height={height} /> : <Friendship_Compatibility width={width} height={height} />;
        default:
            return <View />;
    }
}