import api from ".";

export function createTask(body) {
  return api("post", "/task", { data: body });
}

export function getListTask() {
  return api("get", `/task`);
}

export function editTask(idTask) {
  return api("put", `/task/${idTask}`);
}

export function deleteTask(idTask) {
  return api("delete", `/task/${idTask}`);
}