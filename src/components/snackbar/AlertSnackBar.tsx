import { Alert, AlertTitle, Snackbar } from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

interface Props {
  open: boolean;
  handleClose: () => void;
  title: string;
  content: string;
}

const AlertSnackBar = ({ open, handleClose, title, content }: Props) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ marginTop: "2.5%", marginRight: "11.5%", width: "18%" }}
    >
      <Alert
        icon={<NotificationsActiveIcon fontSize="inherit" />}
        onClose={handleClose}
        severity="warning"
        variant="filled"
        sx={{ width: "100%" }}
      >
        <AlertTitle>{title}</AlertTitle>
        {content}
      </Alert>
    </Snackbar>
  );
};

export default AlertSnackBar;
