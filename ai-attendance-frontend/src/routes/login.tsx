import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Shield,
  ScanFace,
  KeyRound,
  Smartphone,
  ArrowRight,
  Loader2,
  UserPlus,
  LogIn,
  Mail,
  RotateCcw,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({ meta: [{ title: "Sign in — SmartAttend" }] }),
});

type PortalRole = "admin" | "student";
type AuthMode = "login" | "create" | "forgot";

function Login() {
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<PortalRole>("admin");

  const [email, setEmail] = useState("admin@attendaid.com");
  const [password, setPassword] = useState("Admin@12345");

  const [phone, setPhone] = useState("");

  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  //const [departmentId, setDepartmentId] = useState("");
  //const [classId, setClassId] = useState("");
  //const [sectionId, setSectionId] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const clearStatus = () => {
    setError("");
    setMessage("");
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    clearStatus();
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setNewPassword("");

    if (nextMode === "forgot") {
      setForgotEmail(email);
    }
  };

  const handleRoleChange = (selectedRole: PortalRole) => {
    setRole(selectedRole);
    clearStatus();

    if (selectedRole === "admin") {
      setEmail("admin@attendaid.com");
      setPassword("Admin@12345");
    } else {
      setEmail("bca-1005@student.attendaid.com");
      setPassword("Student@123");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    clearStatus();

    try {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const backendRole = data?.user?.role?.toLowerCase();

      if (backendRole !== role) {
        throw new Error(`This account is not a ${role} account`);
      }

      const token = data.access_token || data.accessToken || data.token;

      if (!token) {
        throw new Error("Login response missing token");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "ADMIN") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/student" });
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    clearStatus();

    try {
      if (role === "admin") {
        await apiRequest("/auth/register/admin", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            phone: phone || null,
          }),
        });
      } else {
        if (!studentName || !rollNo) {
          throw new Error("Please fill student name and roll number");
        }

        await apiRequest("/auth/register/student", {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            phone: phone || null,
            name: studentName,
            roll_no: rollNo,
          }),
        });
      }

      setMessage("Account created successfully. You can login now.");
      setMode("login");
    } catch (err: any) {
      setError(err.message || "Account creation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    clearStatus();

    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          email: forgotEmail,
        }),
      });

      setOtpSent(true);
      setMessage("OTP sent to your email.");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    clearStatus();

    try {
      await apiRequest("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({
          email: forgotEmail,
          otp,
        }),
      });

      setOtpVerified(true);
      setMessage("OTP verified. Enter your new password.");
    } catch (err: any) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    clearStatus();

    try {
      await apiRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email: forgotEmail,
          otp,
          new_password: newPassword,
        }),
      });

      setMessage("Password reset successfully. Please login.");
      setEmail(forgotEmail);
      setPassword("");
      setMode("login");
      setOtpSent(false);
      setOtpVerified(false);
      setOtp("");
      setNewPassword("");
    } catch (err: any) {
      setError(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "login"
      ? "Sign in to SmartAttend"
      : mode === "create"
        ? "Create SmartAttend account"
        : "Reset your password";

  const subtitle =
    mode === "login"
      ? "Choose your portal to continue"
      : mode === "create"
        ? "Create admin or student account"
        : "Get OTP on email and set new password";

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex relative bg-sidebar text-sidebar-foreground p-10 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute -top-32 -right-32 size-[480px] rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 -left-20 size-[380px] rounded-full bg-info/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-sidebar-primary grid place-items-center">
              <Sparkles className="size-5 text-sidebar-primary-foreground" />
            </div>
            <div className="text-lg font-semibold text-white tracking-tight">
              SmartAttend
            </div>
          </div>
        </div>

        <div className="relative space-y-6 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight text-white">
            AI-powered attendance with face recognition, liveness, and
            anti-spoofing.
          </h2>

          <p className="text-sm text-white/70">
            JWT-secured, privacy-first biometric attendance for universities and
            enterprises.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { i: ScanFace, t: "Face Recognition", s: "ArcFace R100" },
              { i: Shield, t: "Anti-Spoofing", s: "Liveness v3" },
              { i: KeyRound, t: "JWT Auth", s: "Secure login" },
              { i: Smartphone, t: "Multi-Device", s: "Web · Mobile" },
            ].map((f) => {
              const Icon = f.i;

              return (
                <div
                  key={f.t}
                  className="rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
                >
                  <Icon className="size-4 text-primary mb-2" />
                  <div className="font-medium text-white">{f.t}</div>
                  <div className="text-white/60 text-[11px]">{f.s}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative text-[11px] text-white/50">
          © 2026 SmartAttend
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>

          {mode !== "forgot" && (
            <div className="grid grid-cols-2 p-1 rounded-lg bg-secondary mb-6">
              <button
                type="button"
                onClick={() => handleRoleChange("admin")}
                className={`h-10 rounded-md text-sm font-medium transition-colors ${role === "admin" ? "bg-card shadow-sm" : "text-muted-foreground"
                  }`}
              >
                Admin
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("student")}
                className={`h-10 rounded-md text-sm font-medium transition-colors ${role === "student"
                    ? "bg-card shadow-sm"
                    : "text-muted-foreground"
                  }`}
              >
                Student
              </button>
            </div>
          )}

          {mode === "login" && (
            <form className="space-y-4" onSubmit={handleLogin}>
              <TextInput
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder={
                  role === "admin"
                    ? "admin@attendaid.com"
                    : "bca-1005@student.attendaid.com"
                }
                autoComplete="email"
              />

              <div>
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-xs text-primary"
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  type="password"
                  className="mt-1.5 w-full h-10 px-3 rounded-md border bg-card outline-none focus:ring-2 focus:ring-ring text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <StatusMessage error={error} message={message} />

              <PrimaryButton loading={loading}>
                <LogIn className="size-4" />
                Continue to {role === "admin" ? "Admin Portal" : "Student Portal"}
                <ArrowRight className="size-4" />
              </PrimaryButton>

              <SecondaryButton onClick={() => switchMode("create")}>
                <UserPlus className="size-4" />
                Create account
              </SecondaryButton>

              <div className="text-center text-[11px] text-muted-foreground pt-2">
                Admin: admin@attendaid.com / Admin@12345
                <br />
                Student: bca-1005@student.attendaid.com / Student@123
              </div>
            </form>
          )}

          {mode === "create" && (
            <form className="space-y-4" onSubmit={handleCreateAccount}>
              <TextInput
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="email@example.com"
                autoComplete="email"
              />

              <PasswordInput
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />

              <TextInput
                label="Phone optional"
                value={phone}
                onChange={setPhone}
                placeholder="Phone number"
              />

              {role === "student" && (
                <>
                  <TextInput
                    label="Student name"
                    value={studentName}
                    onChange={setStudentName}
                    placeholder="Student full name"
                  />

                  <TextInput
                    label="Roll number"
                    value={rollNo}
                    onChange={setRollNo}
                    placeholder="BCA-1006"
                  />

                  {/* <TextInput
                    label="Department ID"
                    value={departmentId}
                    onChange={setDepartmentId}
                    placeholder="Paste department id from DB"
                  /> */}

                  {/* <TextInput
                    label="Class ID"
                    value={classId}
                    onChange={setClassId}
                    placeholder="Paste class id from DB"
                  /> */}

                  {/* <TextInput
                    label="Section ID"
                    value={sectionId}
                    onChange={setSectionId}
                    placeholder="Paste section id from DB"
                  /> */}
                </>
              )}

              <StatusMessage error={error} message={message} />

              <PrimaryButton loading={loading}>
                <UserPlus className="size-4" />
                Create {role === "admin" ? "Admin" : "Student"} Account
              </PrimaryButton>

              <SecondaryButton onClick={() => switchMode("login")}>
                Back to login
              </SecondaryButton>
            </form>
          )}

          {mode === "forgot" && (
            <div className="space-y-4">
              {!otpSent && (
                <form className="space-y-4" onSubmit={handleSendOtp}>
                  <TextInput
                    label="Email"
                    value={forgotEmail}
                    onChange={setForgotEmail}
                    placeholder="Enter your email"
                    autoComplete="email"
                  />

                  <StatusMessage error={error} message={message} />

                  <PrimaryButton loading={loading}>
                    <Mail className="size-4" />
                    Send OTP
                  </PrimaryButton>
                </form>
              )}

              {otpSent && !otpVerified && (
                <form className="space-y-4" onSubmit={handleVerifyOtp}>
                  <TextInput
                    label="OTP"
                    value={otp}
                    onChange={setOtp}
                    placeholder="Enter 6 digit OTP"
                  />

                  <StatusMessage error={error} message={message} />

                  <PrimaryButton loading={loading}>
                    <KeyRound className="size-4" />
                    Verify OTP
                  </PrimaryButton>
                </form>
              )}

              {otpSent && otpVerified && (
                <form className="space-y-4" onSubmit={handleResetPassword}>
                  <PasswordInput
                    label="New password"
                    value={newPassword}
                    onChange={setNewPassword}
                    autoComplete="new-password"
                  />

                  <StatusMessage error={error} message={message} />

                  <PrimaryButton loading={loading}>
                    <RotateCcw className="size-4" />
                    Reset Password
                  </PrimaryButton>
                </form>
              )}

              <SecondaryButton onClick={() => switchMode("login")}>
                Back to login
              </SecondaryButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        className="mt-1.5 w-full h-10 px-3 rounded-md border bg-card outline-none focus:ring-2 focus:ring-ring text-sm"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
      />
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <input
        type="password"
        className="mt-1.5 w-full h-10 px-3 rounded-md border bg-card outline-none focus:ring-2 focus:ring-ring text-sm"
        placeholder="••••••••"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
      />
    </div>
  );
}

function StatusMessage({
  error,
  message,
}: {
  error: string;
  message: string;
}) {
  return (
    <>
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-600">
          {message}
        </div>
      )}
    </>
  );
}

function PrimaryButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          Please wait...
        </>
      ) : (
        children
      )}
    </button>
  );
}

function SecondaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full h-10 rounded-md border text-sm font-medium hover:bg-secondary flex items-center justify-center gap-2"
    >
      {children}
    </button>
  );
}
