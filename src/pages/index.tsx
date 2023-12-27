import { GetServerSideProps } from "next";
import Error from "next/error";
import { useMemo, useRef, useState } from "react";

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
  DialogActions
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';

// Local application/library specific imports.
import styles from "./index.module.scss";
import { getTasksAPI } from "@/apis/task";
import { GetTasksAPIParamTypes, Task } from "@/types";
import Header from "@/components/Header";

// Stateless vars declare.
const fabCss: SxProps<Theme> = {
  position: "fixed",
  bottom: "16px",
  right: "16px"
};
function determineGetTasksAPIParamType (
  isCompleted: boolean,
  isNotCompleted: boolean
): GetTasksAPIParamTypes | "none" {
  if (isCompleted && isNotCompleted) return "all";
  if (isCompleted && !isNotCompleted) return "completed";
  if (!isCompleted && isNotCompleted) return "uncompleted";
  return "none";
}
type HomePageProps = {
  page: string;
  type: GetTasksAPIParamTypes;
  statusCode: number;
  body: Awaited<ReturnType<typeof getTasksAPI>>["data"];
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async (ctx) => {
  const page = (ctx.query.page || "1") as string;
  const type = (ctx.query.type || "all") as GetTasksAPIParamTypes;
  const response = await getTasksAPI({ page, type });
  // if (response.data.status === "error") return { }
  return { 
    props: {
      page,
      type,
      statusCode: response.status,
      body: response.data
    }
  };
}

export default function HomePage (props: HomePageProps) {
  const { page, type, statusCode, body } = props;
  // 取得資料失敗，暫時先顯示 NextJs 的 Error Component...
  if (body.status === "error") return <Error statusCode={statusCode}/>;

  const [tasks, setTasks] = useState<Task[]>(body.data);
  const [taskName, setTaskName] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDialogOpen, toggleTaskDialogOpen] = useState(false);
  const isCompletedRef = useRef<HTMLInputElement>(null);
  const isNotCompletedRef = useRef<HTMLInputElement>(null);
  const TaskCards = useMemo(() => tasks.map(task =>
    <Grid item xs={12} sm={6} md={4}>
      <Card key={task.id}>
        <CardContent>
          <Typography
            fontWeight="bold"
            fontSize="24px"
          >
            {task.name}
          </Typography>
          <Typography>{task.description}</Typography>
          <Typography>
            {new Date(task.updated_at).toLocaleString()}
          </Typography>
          <FormControlLabel
            label={task.is_completed ? "已完成" : "未完成"}
            defaultChecked={task.is_completed}
            control={<Checkbox />}
          ></FormControlLabel>
        </CardContent>
      </Card>
    </Grid>
  ), [tasks]);
  async function getTasksByIsCompleted () {
    const isCompleted = Boolean(isCompletedRef.current?.checked);
    const isNotCompleted = Boolean(isNotCompletedRef.current?.checked);
    const type = determineGetTasksAPIParamType(isCompleted, isNotCompleted);
    if (type === "none") return alert("請至少勾選一項！");
    const getTasksResponse = await getTasksAPI({ page, type });
    type
  }
  return (
    <main>
      <Header></Header>
      <section className={styles.searchSection}>
        <FormControlLabel
          label="已完成的任務"
          control={<Checkbox inputRef={isCompletedRef} />}
          defaultChecked={type === "all" || type === "completed"}
        ></FormControlLabel>
        <FormControlLabel
          label="未完成的任務"
          control={<Checkbox inputRef={isNotCompletedRef}/>}
          defaultChecked={type === "all" || type === "uncompleted"}
        ></FormControlLabel>
        <div>
          <Button
            variant="contained"
            onClick={() => getTasksByIsCompleted()
              .then()
              .catch()
            }
          >
            搜尋
          </Button>
        </div>
      </section>
      <section className={styles.taskSection}>
        <Grid padding={2} container spacing={2}>
          {TaskCards}
        </Grid>
      </section>
      <Fab
        color="primary"
        sx={fabCss}
        onClick={() => toggleTaskDialogOpen(true)}
      >
        <AddIcon />
      </Fab>
      <Dialog
        fullWidth
        open={taskDialogOpen}
        onClose={() => toggleTaskDialogOpen(false)}
      >
        <DialogTitle>
          新增/編輯任務
        </DialogTitle>
        <DialogContent>
          <TextField
            required
            fullWidth
            margin="normal"
            label="任務名稱"
            defaultValue=""
            inputProps={{ maxLength: 10 }}
            onBlur={(e) => setTaskName(e.target.value)}
            // inputRef={}
          ></TextField>
          <TextField
            fullWidth
            multiline
            rows={3}
            margin="normal"
            label="任務描述"
            inputProps={{ maxLength: 30 }}
            // inputRef={}
          ></TextField>
          {/* <for */}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => toggleTaskDialogOpen(false)}
          >
            取消
          </Button>
          <Button
            variant="contained"
            onClick={() => {}}
          >
            確定
          </Button>
        </DialogActions>
      </Dialog>
    </main>
  )
}