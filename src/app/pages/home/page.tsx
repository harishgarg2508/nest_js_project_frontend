"use client";
import * as React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useAppSelector } from "@/app/redux/hooks";

export default function HomePage() {
  const [open, setOpen] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sentOtp, setSentOtp] = React.useState<string | null>(null);
  
  const name = useAppSelector((state) => state.user.displayName);
  const email = useAppSelector((state) => state.user.email);
  const avatar = useAppSelector((state) => state.user.photoURL);
  

  const [user, setUser] = React.useState({
    name,
    email,
    avatar,
    isEmailVerified: false,
  });
  
  const sendOtp = async () => {
    try {
      const response = await fetch("http://localhost:3000/mail/send",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSentOtp(data.otp); 
      } else {
        throw new Error(data.message || "Failed to send OTP");
      }
      console.log("OTP sent:", data.otp);
    } catch (err) {
      console.error("Failed to send OTP:", err);
      setError("Failed to send OTP. Please try again.");
    }
  };
  
  const handleOpen = () => {
    setOpen(true);
    sendOtp(); 
  };
  const handleClose = () => {
    setOpen(false);
    setOtp("");
    setError("");
  };

  const handleVerify = async () => {
    setError("");
    if (otp === sentOtp) {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setUser({ ...user, isEmailVerified: true });
      setLoading(false);
      handleClose();
    } else if (sentOtp) {
      setError("Invalid OTP. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "grey.100",
      }}
    >
      <Card sx={{ minWidth: 345, maxWidth: 400, textAlign: "center", p: 2 }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            src={user.avatar ?? undefined}
            sx={{ width: 80, height: 80, mb: 2 }}
          />
        
          <Typography gutterBottom variant="h5" component="div">
            {user.name}

          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user.email}
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpen}
            disabled={user.isEmailVerified}
            sx={{ mt: 2 }}
          >
            {user.isEmailVerified ? "Email Verified" : "Verify Email"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Verify Your Email</DialogTitle>
        <DialogContent>
          <DialogContentText>
            An OTP has been sent to your email address. Please enter it below to
            verify your account.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="otp"
            label="OTP"
            type="text"
            fullWidth
            variant="standard"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleVerify} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Verify"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
