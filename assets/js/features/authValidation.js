export const getAuthValidationError = (email, password) => {
  if (typeof email !== 'string' || typeof password !== 'string') {
    return 'Enter a valid email address and password.';
  }

  const normalizedEmail = email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalizedEmail)) {
    return 'Enter a valid email address.';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  return null;
};
