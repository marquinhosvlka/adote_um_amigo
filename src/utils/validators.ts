// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Brazilian format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/;
  return phoneRegex.test(phone);
};

// Name validation (2-50 characters)
export const isValidName = (name: string): boolean => {
  return name.length >= 2 && name.length <= 50;
};

// Format phone number to (XX) XXXXX-XXXX
export const formatPhone = (phone: string | undefined | null): string => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};