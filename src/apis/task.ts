import axios, { AxiosResponse, isAxiosError } from "axios";
import {
  GetTasksResBody,
  PostTaskReqBody,
  PostTaskResBody,
  PutTaskReqBody,
  PutTaskResBody,
  PatchTaskResBody,
  Task,
} from "@/types";

const taskAPI = axios.create({
  baseURL: "https://wayi.league-funny.com/api/task",
  timeout: 5000,
});
taskAPI.interceptors.response.use(
  undefined,
  /**
   * @returns `AxiosResponse<any, any>` if `isAxiosError` and `err.response` exists.
   * @throws `error` otherwise.
   */
  function onRejected(error) {
    if (isAxiosError(error) && error.response) return error.response;
    throw error;
  },
);

export function getTasksAPI(params?: {
  /**
   * @default 1
   */
  page?: number;
  /**
   * @default "all"
   */
  type?: "completed" | "uncompleted" | "all";
}): Promise<AxiosResponse<GetTasksResBody>> {
  const page = params?.page || 1;
  const type = params?.type || "all";
  return taskAPI.get(`?page=${page}&type=${type}`);
}
export function postTaskAPI(params: {
  body: PostTaskReqBody;
}): Promise<AxiosResponse<PostTaskResBody>> {
  return taskAPI.post("", params.body);
}
export function putTaskAPI(params: {
  id: Task["id"];
  body: PutTaskReqBody;
}): Promise<AxiosResponse<PutTaskResBody>> {
  return taskAPI.put(`/${params.id}`, params.body);
}
export function patchTaskAPI(params: {
  id: Task["id"];
}): Promise<AxiosResponse<PatchTaskResBody>> {
  return taskAPI.patch(`/${params.id}`);
}
export function deleteTaskAPI(params: {
  id: Task["id"];
}): Promise<AxiosResponse> {
  return taskAPI.delete(`/${params.id}`);
}
