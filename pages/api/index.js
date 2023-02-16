import axios from "axios";

const api = (method, path, config) => {
  let options = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    withCredentials: false,
    ...config,
  };

  if (options.token) {
    options.headers.access_token = `${config.token}`;
  }

  return axios({
    method,
    url: `${process.env.REACT_APP_API}${path}`,
    ...options,
  });
};

export default api;
