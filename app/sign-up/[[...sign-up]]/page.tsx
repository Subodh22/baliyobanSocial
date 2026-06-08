import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-20">
      <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
    </div>
  );
}
