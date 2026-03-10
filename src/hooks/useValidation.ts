import { useState } from 'react';
import moment from 'moment';
import { ToastMessage } from '../components/ToastMessage';

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
        if (!value?.trim()) error = 'Name is required';
        else if (value.trim().length < 2) error = 'Name too short';
        break;

      case 'email':
        if (!value?.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = 'Invalid email';
        break;

      case 'dob':
        if (!value) error = 'Date of birth is required';
        else if (moment(value).isSameOrAfter(moment(), 'day'))
          error = 'Please select a valid date of birth';
        break;

      case 'dateofbirth':
        if (!value) {
          error = 'Date of birth is required';
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
            error = 'Invalid date format. Please use DD/MM/YYYY format';
          } else {
            // Parse the date and validate
            const parsedDate = moment(dateStr, 'DD/MM/YYYY', true);
            
            if (!parsedDate.isValid()) {
              error = 'Invalid date of birth';
            } else if (parsedDate.isSameOrAfter(moment(), 'day')) {
              error = 'Please select a valid date of birth (cannot be today or future)';
            } else {
              // Additional validation: check if day/month are valid
              const day = parseInt(dateStr.split('/')[0], 10);
              const month = parseInt(dateStr.split('/')[1], 10);
              const year = parseInt(dateStr.split('/')[2], 10);
              
              if (day < 1 || day > 31 || month < 1 || month > 12) {
                error = 'Invalid date of birth';
              } else if (year < 1900 || year > moment().year()) {
                error = 'Please enter a valid year';
              }
            }
          }
        }
        break;

      case 'otp':
        if (!value?.trim()) error = 'OTP is required';
        else if (!/^\d{4,6}$/.test(value)) error = 'Invalid OTP';
        break;

      case 'place':
        if (!value?.trim()) error = 'Place of birth is required';
        break;

      case 'time':
        // if (!value?.trim()) error = 'Time of birth is required';
        // else 
        console.log('value : ', value);
        
        if (!/^\d{2}:\d{2}$/.test(value)) error = 'Invalid time of birth';
        break;

      case 'gender':
        if (!value?.trim()) error = 'Gender is required';
        else if (value.trim() !== 'male' && value.trim() !== 'female' && value.trim() !== 'other') error = 'Invalid gender';
        break;

      case 'phone':
        if (!value?.trim()) {
          error = 'Phone number is required';
        } else {
          // Remove any non-digit characters for validation
          const cleanedPhone = value.replace(/\D/g, '');

          // Get min/max length from options or use defaults
          const minLength = options?.minLength || 7;
          const maxLength = options?.maxLength || 15;

          // Basic validation
          if (cleanedPhone.length < minLength) {
            error = `Phone number must be at least ${minLength} digits`;
          } else if (cleanedPhone.length > maxLength) {
            error = `Phone number cannot exceed ${maxLength} digits`;
          } else if (!/^\d+$/.test(cleanedPhone)) {
            error = 'Phone number can only contain digits';
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
      // ToastMessage(error);
      setErrors(prev => ({ ...prev, [field]: error }));
      return error;
      // return false;
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
        return `Invalid phone number for ${countryCode}. Expected ${countryPattern.length} digits`;
      }
      if (countryPattern.pattern && !countryPattern.pattern.test(phone)) {
        return `Invalid phone number format for ${countryCode}`;
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
