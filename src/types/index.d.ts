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
export type TaskResBody<
  Data = unknown,
  HasTotal extends boolean = false,
> = HasTotal extends boolean
  ? (TaskResBodySuccess<Data> & { total: number }) | TaskResBodyError
  : TaskResBodySuccess<Data> | TaskResBodyError;
export type TaskResBodySuccess<Data = unknown> = {
  status: "success";
  data: Data;
};
export type TaskResBodyError = {
  status: "error";
  message: string;
};
export type GetTasksResBody = TaskResBody<Task[], true>;
export type PostTaskReqBody = Pick<
  Task,
  "name" | "description" | "is_completed" | "created_at" | "updated_at"
>;
export type PostTaskResBody = TaskResBody<Task>;
export type PutTaskReqBody = Pick<Task, "name" | "description" | "updated_at">;
export type PutTaskResBody = TaskResBody<Task>;
export type PatchTaskResBody = TaskResBody<Task>;
