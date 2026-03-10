import AxiosBase from './AxiosBase';

export const verifyPurchase = async (data: any) => {
  try {
    const response = await AxiosBase.post('/astrology/future_prediction', data);
    return response;
  } catch (error) {
    console.error('Error in verifypurchase:', error?.response);
    return error?.response;
  }
};
