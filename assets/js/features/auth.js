import { getAuthValidationError } from './authValidation.js';

const setMessage = (element, message) => {
  element.textContent = message;
  element.hidden = !message;
};

const requestAuth = async (path, body) => {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? 'Authentication request failed.');
  }

  return result;
};

export const getCurrentUser = async () => {
  const response = await fetch('/api/auth/session', {
    credentials: 'same-origin',
    headers: { Accept: 'application/json' },
  });

  if (response.status === 401) {
    return null;
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error ?? 'Could not restore your session.');
  }

  return result.user;
};

export const signOut = async () => requestAuth('/api/auth/logout', {});

export const initAuth = (onAuthenticated) => {
  const authScreen = document.querySelector('#authScreen');
  const app = document.querySelector('#app');
  const form = document.querySelector('#authForm');
  const emailInput = document.querySelector('#authEmail');
  const passwordInput = document.querySelector('#authPassword');
  const submitButton = document.querySelector('#authSubmitButton');
  const modeButton = document.querySelector('#authModeButton');
  const title = document.querySelector('#authTitle');
  const description = document.querySelector('#authDescription');
  const errorMessage = document.querySelector('#authError');
  const successMessage = document.querySelector('#authSuccess');

  if (
    !authScreen ||
    !app ||
    !form ||
    !emailInput ||
    !passwordInput ||
    !submitButton ||
    !modeButton ||
    !title ||
    !description ||
    !errorMessage ||
    !successMessage
  ) {
    throw new Error('Authentication form elements are missing.');
  }

  let mode = 'login';

  const setMode = (nextMode) => {
    mode = nextMode;
    const isRegistering = mode === 'register';

    title.textContent = isRegistering ? 'Create your account' : 'Welcome back';
    description.textContent = isRegistering
      ? 'Create an account to keep your tasks in sync.'
      : 'Sign in to continue to your TaskFlow workspace.';
    submitButton.textContent = isRegistering ? 'Create account' : 'Sign in';
    modeButton.textContent = isRegistering
      ? 'Already have an account? Sign in'
      : 'New to TaskFlow? Create an account';
    passwordInput.autocomplete = isRegistering ? 'new-password' : 'current-password';
    setMessage(errorMessage, '');
    setMessage(successMessage, '');
  };

  const showAuthScreen = () => {
    app.hidden = true;
    authScreen.hidden = false;
  };

  modeButton.addEventListener('click', () => {
    setMode(mode === 'login' ? 'register' : 'login');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(errorMessage, '');
    setMessage(successMessage, '');

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const validationError = getAuthValidationError(email, password);

    if (validationError) {
      setMessage(errorMessage, validationError);
      return;
    }

    submitButton.disabled = true;
    modeButton.disabled = true;
    submitButton.textContent = mode === 'register' ? 'Creating account…' : 'Signing in…';

    try {
      const result = await requestAuth(
        mode === 'register' ? '/api/auth/register' : '/api/auth/login',
        { email, password },
      );

      if (mode === 'register' && result.needsEmailConfirmation) {
        passwordInput.value = '';
        setMessage(
          successMessage,
          'Account created. Check your email to confirm your address, then sign in.',
        );
        return;
      }

      onAuthenticated(result.user);
    } catch (error) {
      console.error('Authentication request failed.', error);
      setMessage(errorMessage, error.message);
    } finally {
      submitButton.disabled = false;
      modeButton.disabled = false;
      submitButton.textContent = mode === 'register' ? 'Create account' : 'Sign in';
    }
  });

  setMode('login');
  showAuthScreen();

  return {
    showAuthScreen,
    showApp: () => {
      authScreen.hidden = true;
      app.hidden = false;
    },
  };
};
