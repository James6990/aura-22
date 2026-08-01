'use client';

import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-1 lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <AuthForm mode="sign-up" />
      </div>
    </div>
  );
}
