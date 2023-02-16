import api from ".";

export function register(body, token) {
  return api("post", "/user/register", { data: body, token});
}

export function getListEmployee(token) {
  return api("get", `/employees`, {token});
}

export function getEmployeeID(idEmployee, token) {
  return api("get", `/employee/${idEmployee}`, {token});
}

export function editEmployee(idEmployee, body, token) {
  return api("put", `/employee/${idEmployee}`, {data: body, token});
}

export function deleteEmployee(idEmployee, token) {
  return api("delete", `/employee/${idEmployee}`, {token});
}

export function resetPassword(idEmployee, body, token) {
  return api("patch", `/employee/reset_password/${idEmployee}`, {data: body, token});
}

export function getRoles(token) {
  return api("get", `/roles`, {token});
}
