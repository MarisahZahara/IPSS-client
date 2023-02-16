import api from ".";

export function createProject(body, token) {
  return api("post", "/project", { data: body, token });
}

export function getListProject(token) {
  return api("get", `/projects`, {token});
}

export function getProjectID(idProject, token) {
  return api("get", `/project/${idProject}`, {token});
}

export function editProject(idProject, body, token) {
  return api("put", `/project/${idProject}`, {data: body, token});
}

export function deleteProject(idProject, token) {
  return api("delete", `/project/${idProject}`, {token});
}