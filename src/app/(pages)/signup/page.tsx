"use client";
import React, { useState } from "react";
import { TextField, Button, Container, Box, Typography } from "@mui/material";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInterface, userSchema } from "@/app/utils";
import { Toaster, toast } from 'sonner';



export default function SignupPage() {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const {register,handleSubmit,formState: { errors },reset,} = useForm<FormInterface>({
    resolver: zodResolver(userSchema),
  });

  const submitData = async (data: FormInterface) => {
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
        // credentials: "include", 
      });
      if (!response.ok) {
        const err = await response.json();
        toast.error(err.message || "Signup failed");
        setError(err.message || "Signup failed");
        return;
      }
      const responseData = await response.json();
      toast.success("Signup successful!");
      setUserData(responseData);
      reset(); 
      console.log("SignUp response:", responseData);
    } catch (error: any) {
      setError(error.message || "SignUp error");
      console.error("SignUp error:", error);
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
          Sign Up
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
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign Up
          </Button>
          <Link href="/login" passHref>
            <Typography variant="body2" color="text.secondary" align="center">
              Already have an account? Login
            </Typography>
          </Link>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </Box>

      </Box>
      <Toaster position="top-center" richColors />
    </Container>
  );
}