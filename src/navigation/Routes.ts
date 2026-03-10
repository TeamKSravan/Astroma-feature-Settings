import * as React from 'react';

export const navigationRef = React.createRef();

export function navigate({ name, params }: any) {
  navigationRef.current?.navigate(name, params);
  console.log('navi ref', name);
}
