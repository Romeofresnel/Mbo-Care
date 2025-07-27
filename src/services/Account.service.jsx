let saveToken = (token) => {
  localStorage.setItem("token", token);
};
let saveId = (id) => {
  localStorage.setItem("_id", id);
};
let logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("_id");
};

let isLogged = () => {
  let token = localStorage.getItem("token");
  return !!token;
};

let getToken = () => {
  return localStorage.getItem("token");
};
let getId = () => {
  return localStorage.getItem("_id");
};
export const accountService = {
  saveToken,
  logout,
  isLogged,
  getToken,
  getId,
  saveId,
};
