const USER_STORAGE_KEY = 'user';

export const getStoredUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);

  const rawUser = sessionStorage.getItem(USER_STORAGE_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    sessionStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearStoredUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
};
