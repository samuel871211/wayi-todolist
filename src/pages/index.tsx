import { GetServerSideProps } from "next";
import { useRef, useState } from "react";

// Related third party imports.
import {
  Card,
  Checkbox,
  CardContent,
  Typography,
  Fab,
  SxProps,
  Theme,
  Grid,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  AlertColor,
  Pagination,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

// Local application/library specific imports.
import styles from "./index.module.scss";
import {
  deleteTaskAPI,
  getTasksAPI,
  patchTaskAPI,
  postTaskAPI,
  putTaskAPI,
} from "@/apis/task";
import { GetTasksAPIParamTypes, Task } from "@/types";
import Header from "@/components/Header";

// Stateless vars declare.
/**
 * @default -1
 * @description "新增任務"的時候，此值必定為-1
 * @description "修改任務"的時候，此值為目前的任務id
 */
let curSelectedTaskId = -1;
const taskNameInputProps = { maxLength: 10 };
const taskDescriptionInputProps = { maxLength: 30 };
const paginationCss: SxProps<Theme> = {
  mb: 1,
};
const taskDescriptionCss: SxProps<Theme> = {
  minHeight: "48px", // 30個字，約2行文字
};
const backdropCss: SxProps<Theme> = {
  zIndex: (theme) => theme.zIndex.modal + 1,
};
const fabCss: SxProps<Theme> = {
  position: "fixed",
  zIndex: (theme) => theme.zIndex.snackbar + 1,
  bottom: "16px",
  right: "16px",
};
function determineGetTasksAPIParamType(
  isCompleted: boolean,
  isNotCompleted: boolean,
): GetTasksAPIParamTypes | "none" {
  if (isCompleted && isNotCompleted) return "all";
  if (isCompleted && !isNotCompleted) return "completed";
  if (!isCompleted && isNotCompleted) return "uncompleted";
  return "none";
}
type HomePageProps = {
  page: string;
  type: GetTasksAPIParamTypes;
  tasks: Task[];
  total: number;
};

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (
  ctx,
) => {
  const page = (ctx.query.page || "1") as string;
  const type = (ctx.query.type || "all") as GetTasksAPIParamTypes;
  // API文件表示，page是從1開始
  if (page === "0") return { notFound: true };
  const response = await getTasksAPI({ page, type });
  // API錯誤，目前先顯示NEXTJS預設的500Page
  if (response.status !== 200) throw new Error(String(response.data));
  if (response.data?.status !== "success")
    throw new Error(response.data?.message);
  return {
    props: {
      page,
      type,
      tasks: response.data.data,
      total: response.data.total,
    },
  };
};

export default function HomePage(props: HomePageProps) {
  const { page, type } = props;
  const [backdropOpen, toggleBackdropOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(props.tasks);
  const [total, setTotal] = useState(props.total);
  const [taskDialogOpen, toggleTaskDialogOpen] = useState(false);
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    text: "",
    severity: "success" as AlertColor,
  });
  const taskNameInputRef = useRef({} as HTMLInputElement);
  const taskDescriptionInputRef = useRef({} as HTMLInputElement);
  const isCompletedRef = useRef({} as HTMLInputElement);
  const isNotCompletedRef = useRef({} as HTMLInputElement);
  async function toggleTaskCompletedAndGetTasks(params: Pick<Task, "id">) {
    const patchTaskResponse = await patchTaskAPI(params);
    if (patchTaskResponse.data?.status !== "success")
      return setSnackbarState({
        open: true,
        text: "修改任務狀態失敗",
        severity: "error",
      });
    // 修改完任務之後，由於 `updated_at` 需要刷新，故還是重新跟API拉資料
    const getTasksResponse = await getTasksAPI({ page, type });
    if (getTasksResponse.data?.status !== "success")
      return setSnackbarState({
        open: true,
        text: "取得任務失敗",
        severity: "error",
      });
    setTasks(getTasksResponse.data.data);
    setTotal(getTasksResponse.data.total);
    setSnackbarState({
      open: true,
      text: "修改任務狀態成功",
      severity: "success",
    });
  }
  function updateParamsTypeAndNavigate() {
    const isCompleted = Boolean(isCompletedRef.current.checked);
    const isNotCompleted = Boolean(isNotCompletedRef.current.checked);
    const type = determineGetTasksAPIParamType(isCompleted, isNotCompleted);
    if (type === "none") return alert("請至少勾選一項！");
    const url = new URL(location.href);
    url.searchParams.set("type", type);
    location.assign(url);
  }
  async function addOrModifyTaskAndGetTasks() {
    if (!taskNameInputRef.current.value) return alert("請輸入任務名稱");
    const nowStr = new Date().toISOString();
    const actionName = curSelectedTaskId === -1 ? "新增" : "修改";
    const addOrModifyTaskResponse =
      curSelectedTaskId === -1
        ? await postTaskAPI({
            body: {
              name: taskNameInputRef.current.value,
              description: taskDescriptionInputRef.current.value,
              created_at: nowStr,
              updated_at: nowStr,
              is_completed: false,
            },
          })
        : await putTaskAPI({
            id: curSelectedTaskId,
            body: {
              name: taskNameInputRef.current.value,
              description: taskDescriptionInputRef.current.value,
              updated_at: nowStr,
            },
          });
    if (addOrModifyTaskResponse.data?.status !== "success")
      return setSnackbarState({
        open: true,
        text: `${actionName}任務失敗`,
        severity: "error",
      });
    // 新增/修改完任務之後，由於分頁內容會變，故還是重新跟API拉資料
    const getTasksResponse = await getTasksAPI({ page, type });
    if (getTasksResponse.data?.status !== "success")
      return setSnackbarState({
        open: true,
        text: "取得任務失敗",
        severity: "error",
      });
    setTasks(getTasksResponse.data.data);
    setTotal(getTasksResponse.data.total);
    setSnackbarState({
      open: true,
      text: `${actionName}任務成功`,
      severity: "success",
    });
    toggleTaskDialogOpen(false);
  }
  async function deleteTaskAndGetTasks(taskId: Task["id"]) {
    const response = await deleteTaskAPI({ id: taskId });
    if (response.status !== 204)
      return setSnackbarState({
        open: true,
        text: "刪除任務失敗",
        severity: "error",
      });
    // 刪除完任務之後，由於該分頁的資料會少一筆，故還是重新跟API拉資料
    const getTasksResponse = await getTasksAPI({ page, type });
    if (getTasksResponse.data?.status !== "success")
      return setSnackbarState({
        open: true,
        text: "取得任務失敗",
        severity: "error",
      });
    setTasks(getTasksResponse.data.data);
    setTotal(getTasksResponse.data.total);
    setSnackbarState({
      open: true,
      text: "刪除任務成功",
      severity: "success",
    });
  }
  return (
    <main>
      <Header></Header>
      <section className={styles.searchSection}>
        <FormControlLabel
          label="已完成的任務"
          control={
            <Checkbox
              inputRef={isCompletedRef}
              defaultChecked={type === "all" || type === "completed"}
            />
          }
        ></FormControlLabel>
        <FormControlLabel
          label="未完成的任務"
          control={
            <Checkbox
              inputRef={isNotCompletedRef}
              defaultChecked={type === "all" || type === "uncompleted"}
            />
          }
        ></FormControlLabel>
        <div>
          <Button variant="contained" onClick={updateParamsTypeAndNavigate}>
            搜尋
          </Button>
        </div>
      </section>
      <section className={styles.taskSection}>
        <Grid padding={2} container spacing={2}>
          {tasks.map((task) => (
            // @todo 每頁10筆，用12網格來切版，數字不會整除(只影響畫面排序的美觀，不影響功能)
            <Grid item xs={12} sm={6} md={4} lg={3} key={task.id}>
              <Card key={task.id}>
                <CardContent>
                  <Typography fontWeight="bold" fontSize="24px">
                    {task.name}
                  </Typography>
                  <Typography sx={taskDescriptionCss}>
                    {task.description}
                  </Typography>
                  <Typography>
                    {new Date(task.updated_at).toLocaleString()}
                  </Typography>
                  <FormControlLabel
                    label={task.is_completed ? "已完成" : "未完成"}
                    checked={task.is_completed}
                    control={<Checkbox />}
                    onChange={() => {
                      toggleBackdropOpen(true);
                      toggleTaskCompletedAndGetTasks({ id: task.id }).finally(
                        () => toggleBackdropOpen(false),
                      );
                    }}
                  ></FormControlLabel>
                  <IconButton
                    onClick={() => {
                      const confirmDelete = confirm(
                        `確定要刪除 ${task.name}？`,
                      );
                      if (!confirmDelete) return;
                      toggleBackdropOpen(true);
                      deleteTaskAndGetTasks(task.id).finally(() =>
                        toggleBackdropOpen(false),
                      );
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      toggleTaskDialogOpen(true);
                      taskNameInputRef.current.value = task.name;
                      taskDescriptionInputRef.current.value = task.description;
                      curSelectedTaskId = task.id;
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {tasks.length === 0 && (
            <Grid item xs={12}>
              目前沒有任務囉
            </Grid>
          )}
        </Grid>
        <Pagination
          size="large"
          color="primary"
          count={Math.ceil(total / 10)}
          sx={paginationCss}
          page={parseInt(page)}
          onChange={(e, page) => {
            const url = new URL(location.href);
            url.searchParams.set("page", String(page));
            location.assign(url.href);
          }}
        ></Pagination>
      </section>
      <Fab
        color="primary"
        sx={fabCss}
        onClick={() => {
          toggleTaskDialogOpen(true);
          curSelectedTaskId = -1;
          taskNameInputRef.current.value = "";
          taskDescriptionInputRef.current.value = "";
        }}
      >
        <AddIcon />
      </Fab>
      <Dialog
        fullWidth
        keepMounted
        open={taskDialogOpen}
        onClose={() => toggleTaskDialogOpen(false)}
      >
        <DialogTitle>新增/修改任務</DialogTitle>
        <DialogContent>
          <TextField
            required
            fullWidth
            margin="normal"
            label="任務名稱"
            inputProps={taskNameInputProps}
            inputRef={taskNameInputRef}
          ></TextField>
          <TextField
            fullWidth
            margin="normal"
            label="任務描述"
            inputProps={taskDescriptionInputProps}
            inputRef={taskDescriptionInputRef}
          ></TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => toggleTaskDialogOpen(false)}>取消</Button>
          <Button
            variant="contained"
            onClick={() => {
              toggleBackdropOpen(true);
              addOrModifyTaskAndGetTasks().finally(() =>
                toggleBackdropOpen(false),
              );
            }}
          >
            確定
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={5000}
        onClose={() => setSnackbarState({ ...snackbarState, open: false })}
      >
        <Alert
          severity={snackbarState.severity}
          variant="filled"
          onClose={() => setSnackbarState({ ...snackbarState, open: false })}
        >
          {snackbarState.text}
        </Alert>
      </Snackbar>
      <Backdrop open={backdropOpen} sx={backdropCss}>
        <CircularProgress size={60} />
      </Backdrop>
    </main>
  );
}
