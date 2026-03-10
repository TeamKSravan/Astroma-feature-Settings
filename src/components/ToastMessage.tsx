import { Toast } from 'react-native-toast-notifications';
import { colors } from '../constants/colors';

enum ToastType {
  NORMAL = "normal",
  SUCCESS = "success",
  WARNING = "warning",
  DANGER = "danger",
  CUSTOM = "custom",
}

enum ToastPosition {
  TOP = "top",
  BOTTOM = "bottom",
  CENTER = "center",
}

enum ToastAnimationType {
  SLIDE_IN = "slide-in",
  ZOOM_IN = "zoom-in",
  NONE = "none",
}

export const ToastMessage = (
  message: string,
  type: ToastType = ToastType.NORMAL,
  position: ToastPosition = ToastPosition.TOP,
  animationType: ToastAnimationType = ToastAnimationType.SLIDE_IN
) => {
  if (!message) return;
  Toast?.show?.(message, {
    type: type,
    placement: position,
    duration: 5000,
    animationType: animationType as "slide-in" | "zoom-in",
    style: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      marginTop: 20,
      zIndex: 1000
    },
    textStyle: {
      textAlign: "center",
      width: "100%",
      borderRadius: 10,
      padding: 10,
    },
  });
};
// import Toast from 'react-native-simple-toast';
// import i18n from '../translation/i18n';
// import { colors } from '../constants/colors';

// export const ToastMessage = (message: string) => {

//   if (message) {
//     Toast.showWithGravityAndOffset(message, Toast.SHORT, Toast.BOTTOM, 0, -100, {
//       backgroundColor: colors.primary,
//     });
//   } else {
//     Toast.showWithGravityAndOffset(i18n.t('common.somethingWentWrong'), Toast.SHORT, Toast.BOTTOM, 0, -100, {
//       backgroundColor: colors.primary,
//     });
//   }
// };