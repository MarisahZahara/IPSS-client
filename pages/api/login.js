import api from ".";

export function login(body) {
  return api("post", "/user/login", { data: body });
}

export function otpLogin(body, email) {
  return api("post", `/user/login/verify?email=${email}`, { data: body });
}
