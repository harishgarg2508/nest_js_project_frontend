"use client";
import * as React from "react";
import { Card, CardContent, Typography, Box, Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Stack, CircularProgress, IconButton, Badge, } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { useAppDispatch } from "@/app/redux/hooks";
import { useAppSelector } from "@/app/redux/hooks";
import { toggleEmailVerification, setUser } from "@/app/redux/slices/userSlice";

export default function HomePage() {
  const [open, setOpen] = React.useState(false);
  const [otp, setOtp] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sentOtp, setSentOtp] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [showImageUpload, setShowImageUpload] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploadError, setUploadError] = React.useState("");
  const dispatch = useAppDispatch();

  const name = useAppSelector((state) => state.user.displayName);
  const email = useAppSelector((state) => state.user.email);
  const avatar = useAppSelector((state) => state.user.photoURL);
  const isEmailVerified = useAppSelector((state) => state.user.isEmailVerified);

  const [user, setUserState] = React.useState({
    name, email, avatar, isEmailVerified
  });

  React.useEffect(() => {
    setUserState({ name, email, avatar, isEmailVerified });
  }, [name, email, avatar, isEmailVerified]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      setUploadError("");
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      setUploadError("Please select a file first");
      return;
    }

    setUploading(true);

    const uploadFormData = new FormData();
    uploadFormData.append("file", selectedFile);
    uploadFormData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );
    uploadFormData.append(
      "cloud_name",
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ""
    );

    try {
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error("Upload to Cloudinary failed");
      }

      const cloudinaryData = await cloudinaryResponse.json();
      const imageUrl = cloudinaryData.secure_url;

      const updateResponse = await fetch('http://localhost:3000/user/update-avatar', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          photoUrl: imageUrl
        }),
        credentials: 'include',
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile');
      }

      dispatch(setUser({
        displayName: user.name,
        email: user.email,
        photoURL: imageUrl,
        isEmailVerified: user.isEmailVerified
      }));

      setShowImageUpload(false);
      setSelectedFile(null);
      console.log('Image uploaded successfully:', imageUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const sendOtp = async () => {
    try {
      const response = await fetch("http://localhost:3000/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
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
      try {
        const response = await fetch("http://localhost:3000/auth/otp", {
          method: "POST",
          body: JSON.stringify({ otp }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (response.ok) {
          dispatch(toggleEmailVerification());
        } else {
          setError(data.message || "Verification failed");
        }
      } catch (err) {
        setError("Verification failed. Please try again.");
      } finally {
        setLoading(false);
        handleClose();
      }
    } else {
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
          <Box position="relative">
            <Avatar
              src={user.avatar ?? undefined}
              sx={{ width: 80, height: 80 }}
            />
            <IconButton
              color="primary"
              aria-label="upload picture"
              sx={{
                position: 'absolute',
                bottom: -8,
                right: -8,
                bgcolor: "primary.main",
                color: "white",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                width: 32,
                height: 32,
              }}
              onClick={() => setShowImageUpload(true)}
            >
              <PhotoCamera fontSize="small" />
            </IconButton>
          </Box>

          {showImageUpload && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Stack spacing={2}>
                <TextField
                  type="file"
                  inputProps={{
                    accept: "image/*",
                  }}
                  onChange={handleFileChange}
                  helperText={uploadError || "Select an image file (max 5MB)"}
                  error={!!uploadError}
                  fullWidth
                  size="small"
                />

                {selectedFile && (
                  <Typography variant="body2" color="text.secondary">
                    Selected: {selectedFile.name}
                  </Typography>
                )}

                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={handleImageUpload}
                    disabled={!selectedFile || uploading}
                    size="small"
                  >
                    {uploading ? <CircularProgress size={20} /> : "Upload"}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowImageUpload(false);
                      setSelectedFile(null);
                      setUploadError("");
                    }}
                    size="small"
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Box>
          )}

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