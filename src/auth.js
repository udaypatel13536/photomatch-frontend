const KEY = "swenik_admin";
const PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "admin123";

export const isAdmin = () => sessionStorage.getItem(KEY) === "true";

export const login = (password) => {
  if (password === PASSWORD) {
    sessionStorage.setItem(KEY, "true");
    return true;
  }
  return false;
};

export const logout = () => sessionStorage.removeItem(KEY);
