// Form validation utilities
export const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phoneNumber: (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
    return phoneRegex.test(phone);
  },

  required: (value) => {
    if (typeof value === 'string') return value.trim().length > 0;
    return value !== null && value !== undefined;
  },

  minLength: (value, min) => {
    return value && value.length >= min;
  },

  maxLength: (value, max) => {
    return !value || value.length <= max;
  },

  numbers: (value) => {
    return /^\d+$/.test(value);
  },

  frenchPhoneNumber: (phone) => {
    const phoneRegex = /^(?:(?:\+|00)33|0)[1-9](?:[0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  dateFormat: (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
  },

  fileSize: (file, maxSizeMB) => {
    return file.size <= maxSizeMB * 1024 * 1024;
  },

  fileType: (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
  },
};

export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  minLength: (min) => `Minimum length is ${min} characters`,
  maxLength: (max) => `Maximum length is ${max} characters`,
  fileSize: (size) => `File size must not exceed ${size}MB`,
  fileType: 'Invalid file type',
  numbers: 'Only numbers are allowed',
  dateFormat: 'Please use YYYY-MM-DD format',
};

export const validateForm = (formData, rules) => {
  const errors = {};

  Object.entries(rules).forEach(([field, fieldRules]) => {
    const value = formData[field];

    fieldRules.forEach((rule) => {
      if (rule.type === 'required' && !validators.required(value)) {
        errors[field] = rule.message || validationMessages.required;
      } else if (rule.type === 'email' && value && !validators.email(value)) {
        errors[field] = rule.message || validationMessages.email;
      } else if (rule.type === 'minLength' && value && !validators.minLength(value, rule.value)) {
        errors[field] = rule.message || validationMessages.minLength(rule.value);
      } else if (rule.type === 'maxLength' && value && !validators.maxLength(value, rule.value)) {
        errors[field] = rule.message || validationMessages.maxLength(rule.value);
      } else if (rule.type === 'phone' && value && !validators.frenchPhoneNumber(value)) {
        errors[field] = rule.message || validationMessages.phone;
      } else if (rule.type === 'fileSize' && value && !validators.fileSize(value, rule.value)) {
        errors[field] = rule.message || validationMessages.fileSize(rule.value);
      } else if (rule.type === 'fileType' && value && !validators.fileType(value, rule.value)) {
        errors[field] = rule.message || validationMessages.fileType;
      }
    });
  });

  return errors;
};
