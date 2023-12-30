export type GetTasksAPIParamTypes = "completed" | "uncompleted" | "all";
export type Task = {
  id: number;
  /**
   * max length = 10
   */
  name: string;
  /**
   * max length = 30
   */
  description: string;
  is_completed: boolean;
  /**
   * format "2023-01-01T17:00:00.000Z"
   */
  created_at: string;
  /**
   * format "2023-01-01T17:00:00.000Z"
   */
  updated_at: string;
};
export type TaskResBodySuccess<Data = unknown> = {
  status: "success";
  data: Data;
};
export type TaskResBodyError = {
  status: "error";
  message: string;
};
export type GetTasksResBody =
  | (TaskResBodySuccess<Task[]> & { total: number })
  | TaskResBodyError;
export type PostTaskReqBody = Pick<
  Task,
  "name" | "description" | "is_completed" | "created_at" | "updated_at"
>;
export type PostTaskResBody = TaskResBodySuccess<Task> | TaskResBodyError;
export type PutTaskReqBody = Pick<Task, "name" | "description" | "updated_at">;
export type PutTaskResBody = TaskResBodySuccess<Task> | TaskResBodyError;
export type PatchTaskResBody = TaskResBodySuccess<Task> | TaskResBodyError;
