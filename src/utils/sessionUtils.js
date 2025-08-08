const SESSION_KEY = "last-login-time";
const TIME_LIMIT_MINUTES = 100;

export const saveLoginTime = () => {
    localStorage.setItem(SESSION_KEY, Date.now().toString());
};

export const isSessionValid = () => {
    const lastLogin = localStorage.getItem(SESSION_KEY);
    if (!lastLogin) return false;

    const diff = Date.now() - parseInt(lastLogin, 10);
    const diffInMinutes = diff / (1000 * 60);
    return diffInMinutes < TIME_LIMIT_MINUTES;
};
