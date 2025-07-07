"use client";
import React, { useState } from "react";
import { TextField, Button, Container, Box, Typography } from "@mui/material";
import { useAppDispatch } from "@/app/redux/hooks";
import { setUser, toggleEmailVerification } from "@/app/redux/slices/userSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [Email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState("");
  const dispatch = useAppDispatch();
  const route = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: Email,
          password: password,
        }),
        credentials: 'include', // Enable this to receive cookies
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Dispatch the user data with correct structure
      dispatch(setUser({
        email: data.user.email,
        displayName: data.user.displayName,
        photoURL: data.user.photoUrl || data.user.photoURL, // Handle both cases
        isEmailVerified: data.user.isEmailVerified
      }));
      
      setUserData(data);
      route.push("/pages/home");
      console.log("Login response:", data);
    } catch (error) {
      console.error("Login error:", error);
      // Add user feedback here (e.g., show error message)
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="Email"
            label="Email"
            name="Email"
            autoComplete="email"
            autoFocus
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Link href="/pages/signup" passHref>
            <Typography variant="body2" color="text.secondary" align="center">
              Don't have an account? Sign Up
            </Typography>
          </Link>
        </Box>
      </Box>
    </Container>
  );  
}