// Related third party imports
import { AppBar, Toolbar, Typography } from "@mui/material";

// Local application/library specific imports.

// Stateless vars declare.

export default function Header() {
  return (
    <AppBar position="relative">
      <Toolbar variant="dense">
        <Typography variant="h1" fontSize="32px" fontWeight="bold">
          Wayi Todolist
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
