
"use client";
import React, { useState } from "react";
import { TextField, Button, Container, Box, Typography } from "@mui/material";
import { useAppDispatch } from "@/app/redux/hooks";
import { setUser, toggleEmailVerification } from "@/app/redux/slices/userSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { FormInterface, userSchema } from "@/app/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster, toast } from 'sonner';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInterface>({
    resolver: zodResolver(userSchema)
  });

  const submitData = async (formData: FormInterface) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:3000/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: 'include', 
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || 'Invalid email or password');
        return;
      }

      // Dispatch user data to Redux store
      dispatch(setUser({
        email: data.user.email,
        displayName: data.user.displayName,
        photoURL: data.user.photoUrl || data.user.photoURL, 
        isEmailVerified: data.user.isEmailVerified
      }));
      
      toast.success('Login successful!');
      reset(); // Clear form
      router.push("/home");
      
    } catch (error) {
      console.error("Login error:", error);
      toast.error('Email or password is incorrect. Please try again.');
    } finally {
      setIsLoading(false);
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

        <Box component="form" onSubmit={handleSubmit(submitData)} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            autoComplete="email"
            autoFocus
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isLoading}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isLoading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
          <Link href="/signup" passHref>
            <Typography variant="body2" color="text.secondary" align="center">
              Don't have an account? Sign Up
            </Typography>
          </Link>
        </Box>
        <Toaster position="top-right" /> 
      </Box>
    </Container>
  );  
}