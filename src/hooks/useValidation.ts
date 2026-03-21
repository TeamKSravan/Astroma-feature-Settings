import { useState } from 'react';
import moment from 'moment';
import i18n from '../translation/i18n';

type ValidationField = 'name' | 'email' | 'dob' | 'dateofbirth' | 'otp' | 'phone' | 'place' | 'gender' | 'time';

interface ValidationErrors {
  [key: string]: string;
}

interface PhoneValidationOptions {
  countryCode?: string;
  minLength?: number;
  maxLength?: number;
}

const useValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validate = (
    field: ValidationField,
    value: any,
    options?: PhoneValidationOptions,
  ): string => {
    let error = '';

    switch (field) {
      case 'name':
        if (!value?.trim()) error = i18n.t('validation.nameRequired');
        else if (value.trim().length < 2) error = i18n.t('validation.nameTooShort');
        break;

      case 'email':
        if (!value?.trim()) error = i18n.t('validation.emailRequired');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = i18n.t('validation.invalidEmail');
        break;

      case 'dob':
        if (!value) error = i18n.t('validation.dobRequired');
        else if (moment(value).isSameOrAfter(moment(), 'day'))
          error = i18n.t('validation.invalidDob');
        break;

      case 'dateofbirth':
        if (!value) {
          error = i18n.t('validation.dobRequired');
        } else {
          // CustomDateInput stores date as DDMMYYYY (8 digits) or it might be DD/MM/YYYY format
          let dateStr = value;

          // If it's 8 digits (DDMMYYYY), convert to DD/MM/YYYY format for validation
          if (/^\d{8}$/.test(value)) {
            const day = value.slice(0, 2);
            const month = value.slice(2, 4);
            const year = value.slice(4, 8);
            dateStr = `${day}/${month}/${year}`;
          }

          // Validate format: DD/MM/YYYY
          if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
            error = i18n.t('validation.invalidDateFormat');
          } else {
            // Parse the date and validate
            const parsedDate = moment(dateStr, 'DD/MM/YYYY', true);

            if (!parsedDate.isValid()) {
              error = i18n.t('validation.dobRequired');
            } else if (parsedDate.isSameOrAfter(moment(), 'day')) {
              error = i18n.t('validation.invalidDobFuture');
            } else {
              // Additional validation: check if day/month are valid
              const day = parseInt(dateStr.split('/')[0], 10);
              const month = parseInt(dateStr.split('/')[1], 10);
              const year = parseInt(dateStr.split('/')[2], 10);

              if (day < 1 || day > 31 || month < 1 || month > 12) {
                error = i18n.t('validation.dobRequired');
              } else if (year < 1900 || year > moment().year()) {
                error = i18n.t('validation.invalidYear');
              }
            }
          }
        }
        break;

      case 'otp':
        if (!value?.trim()) error = i18n.t('validation.otpRequired');
        else if (!/^\d{4,6}$/.test(value)) error = i18n.t('validation.invalidOtpFormat');
        break;

      case 'place':
        if (!value?.trim()) error = i18n.t('validation.placeRequired');
        break;

      case 'time':
        console.log('value : ', value);

        if (!/^\d{2}:\d{2}$/.test(value)) error = i18n.t('validation.invalidTimeOfBirth');
        break;

      case 'gender':
        if (!value?.trim()) error = i18n.t('validation.genderRequired');
        else if (value.trim() !== 'male' && value.trim() !== 'female' && value.trim() !== 'other') error = i18n.t('validation.invalidGender');
        break;

      case 'phone':
        if (!value?.trim()) {
          error = i18n.t('validation.phoneRequired');
        } else {
          // Remove any non-digit characters for validation
          const cleanedPhone = value.replace(/\D/g, '');

          // Get min/max length from options or use defaults
          const minLength = options?.minLength || 7;
          const maxLength = options?.maxLength || 15;

          // Basic validation
          if (cleanedPhone.length < minLength) {
            error = i18n.t('validation.phoneMinLength', { min: minLength });
          } else if (cleanedPhone.length > maxLength) {
            error = i18n.t('validation.phoneMaxLength', { max: maxLength });
          } else if (!/^\d+$/.test(cleanedPhone)) {
            error = i18n.t('validation.phoneDigitsOnly');
          } else {
            // Country-specific validation
            if (options?.countryCode) {
              error = validatePhoneByCountry(cleanedPhone, options.countryCode);
            }
          }
        }
        break;
    }

    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
      return error;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    return '';
  };

  // Helper function for country-specific phone validation
  const validatePhoneByCountry = (
    phone: string,
    countryCode: string,
  ): string => {
    const patterns: { [key: string]: { length: number; pattern?: RegExp } } = {
      IN: { length: 10, pattern: /^[6-9]\d{9}$/ }, // India
      US: { length: 10, pattern: /^[2-9]\d{9}$/ }, // USA
      GB: { length: 10, pattern: /^[1-9]\d{9}$/ }, // UK
      AU: { length: 9, pattern: /^[4]\d{8}$/ }, // Australia
      CA: { length: 10, pattern: /^[2-9]\d{9}$/ }, // Canada
      CN: { length: 11, pattern: /^1[3-9]\d{9}$/ }, // China
      JP: { length: 10, pattern: /^[0-9]\d{9}$/ }, // Japan
      DE: { length: 10, pattern: /^[1-9]\d{9,10}$/ }, // Germany
      FR: { length: 9, pattern: /^[1-9]\d{8}$/ }, // France
      BR: { length: 11, pattern: /^[1-9]\d{10}$/ }, // Brazil
      MX: { length: 10, pattern: /^[1-9]\d{9}$/ }, // Mexico
    };

    const countryPattern = patterns[countryCode];

    if (countryPattern) {
      if (phone.length !== countryPattern.length) {
        return i18n.t('validation.invalidPhoneCountry', { country: countryCode, length: countryPattern.length });
      }
      if (countryPattern.pattern && !countryPattern.pattern.test(phone)) {
        return i18n.t('validation.invalidPhoneFormat', { country: countryCode });
      }
    }

    return '';
  };

  const clearErrors = () => {
    setErrors({});
  };

  const clearError = (field: ValidationField) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  return { validate, errors, clearErrors, clearError };
};

export default useValidation;
