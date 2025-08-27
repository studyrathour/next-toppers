export const ADMIN_CREDENTIALS = {
  username: 'ravi',
  password: '2008'
};

export const isAdminAuthenticated = (): boolean => {
  return localStorage.getItem('adminAuth') === 'true';
};

export const adminLogin = (username: string, password: string): boolean => {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    localStorage.setItem('adminAuth', 'true');
    return true;
  }
  return false;
};

export const adminLogout = (): void => {
  localStorage.removeItem('adminAuth');
};
