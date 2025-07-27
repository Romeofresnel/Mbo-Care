import axios from "axios";
import { accountService } from "./Account.service";

const Axios = axios.create({
  baseURL: "https://mboa-care-api.onrender.com/api/book-hearth/",
});

Axios.interceptors.request.use((req) => {
  if (accountService.isLogged()) {
    req.headers.Authorization = "Bearer " + accountService.getToken();
  }
  return req;
});

export default Axios;
