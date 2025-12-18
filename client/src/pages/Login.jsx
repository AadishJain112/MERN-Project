import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const roleRedirect = {
  student: "/student",
  teacher: "/teacher",
  admin: "/admin",
};

const Login = () => {
  const navigate = useNavigate();
  const { login, register, loading, logout } = useAuthContext();
  const [mode, setMode] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
    department: "",
    batch: "",
    phone: "",
    registrationNumber: "",
    semester: "",
    employeeId: "",
    designation: "",
  });
  const [error, setError] = useState("");

  // Clear authentication when visiting login page - force fresh login every time
  useEffect(() => {
    logout();
  }, [logout]);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const user = await login(loginForm);
      if (!user || !user.role) {
        setError("Login succeeded but user role is missing");
        return;
      }

      navigate(roleRedirect[user.role] || "/");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Password validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "password",
      "department",
      "batch",
      "phone",
    ];
    if (registerForm.role === "student") {
      requiredFields.push("registrationNumber", "semester");
    } else if (registerForm.role === "teacher") {
      requiredFields.push("employeeId", "designation");
    }

    for (const field of requiredFields) {
      if (!registerForm[field] || !registerForm[field].trim()) {
        const fieldName =
          field === "confirmPassword"
            ? "Password confirmation"
            : field.charAt(0).toUpperCase() +
              field.slice(1).replace(/([A-Z])/g, " $1");
        setError(`${fieldName} is required`);
        return;
      }
    }

    try {
      // Prepare registration data
      const registrationData = {
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.role,
        department: registerForm.department,
        batch: registerForm.batch,
        phone: registerForm.phone,
      };

      if (registerForm.role === "student") {
        registrationData.registrationNumber = registerForm.registrationNumber;
        registrationData.semester = registerForm.semester;
      } else if (registerForm.role === "teacher") {
        registrationData.employeeId = registerForm.employeeId;
        registrationData.designation = registerForm.designation;
      }

      const user = await register(registrationData);
      navigate(roleRedirect[user.role] || "/");
    } catch (err) {
      setError(err.message);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    if (newMode === "register") {
      setRegisterForm((prev) => ({
        ...prev,
        role: "student",
        registrationNumber: "",
        semester: "",
        employeeId: "",
        designation: "",
      }));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-16">
      <div className="hero-spark" />
      <div className="glass-panel grid w-full max-w-5xl grid-cols-1 overflow-hidden border border-white/10 md:grid-cols-[1.05fr,0.95fr]">
        <div className="relative bg-gradient-to-br from-indigo-600/90 via-indigo-500 to-violet-500 px-10 py-12 text-white">
          <p className="text-xs uppercase tracking-[0.5em] text-white/70">
            CD-STAR
          </p>
          <h2 className="mt-6 text-3xl font-semibold leading-tight text-white">
            Centralized Student Activity Records
          </h2>
          <p className="mt-3 text-sm text-white/80">
            Upload achievements, monitor approvals, and publish transcripts from
            one immersive canvas.
          </p>
          <div className="mt-10 space-y-4">
            {[
              "Realtime validation",
              "Role-aware dashboards",
              "Progressive audit trails",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm text-white/90"
              >
                <span className="status-dot bg-emerald-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/95 px-10 py-12 text-slate-900">
          {/* Tab Navigation */}
          <div className="mb-6 flex gap-2 border-b border-slate-200">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`px-4 py-2 text-sm font-semibold transition ${
                mode === "login"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`px-4 py-2 text-sm font-semibold transition ${
                mode === "register"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Register
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit}>
              <div>
                <p className="accent-pill bg-slate-100 text-indigo-500">
                  Authenticate
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                  Welcome back
                </h3>
                <p className="text-sm text-slate-500">
                  Enter your institutional credentials.
                </p>
              </div>
              <div className="mt-8 space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="you@institution.edu"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              {error && (
                <p className="mt-4 text-sm font-semibold text-rose-500">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-indigo-400"
              >
                {loading ? "Signing in..." : "Access dashboard"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleRegisterSubmit}
              className="max-h-[70vh] overflow-y-auto"
            >
              <div>
                <p className="accent-pill bg-slate-100 text-indigo-500">
                  Create Account
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-slate-900">
                  Join CD-STAR
                </h3>
                <p className="text-sm text-slate-500">
                  Register as a student or teacher.
                </p>
              </div>

              {/* Role Selection */}
              <div className="mt-6">
                <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Role
                </label>
                <div className="mt-2 flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="registerRole"
                      value="student"
                      checked={registerForm.role === "student"}
                      onChange={() => {
                        setRegisterForm((prev) => ({
                          ...prev,
                          role: "student",
                          employeeId: "",
                          designation: "",
                        }));
                      }}
                      className="text-indigo-600"
                    />
                    <span className="text-sm">Student</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="registerRole"
                      value="teacher"
                      checked={registerForm.role === "teacher"}
                      onChange={() => {
                        setRegisterForm((prev) => ({
                          ...prev,
                          role: "teacher",
                          registrationNumber: "",
                          semester: "",
                        }));
                      }}
                      className="text-indigo-600"
                    />
                    <span className="text-sm">Teacher</span>
                  </label>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {/* Common Fields */}
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="you@institution.edu"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={registerForm.department}
                      onChange={handleRegisterChange}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Computer Science"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      Batch
                    </label>
                    <input
                      type="text"
                      name="batch"
                      value={registerForm.batch}
                      onChange={handleRegisterChange}
                      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="2024"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={registerForm.phone}
                    onChange={handleRegisterChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="+1234567890"
                    required
                  />
                </div>

                {/* Student-only Fields */}
                {registerForm.role === "student" && (
                  <>
                    <div>
                      <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        name="registrationNumber"
                        value={registerForm.registrationNumber}
                        onChange={handleRegisterChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="REG123456"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        Semester
                      </label>
                      <input
                        type="text"
                        name="semester"
                        value={registerForm.semester}
                        onChange={handleRegisterChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="1, 2, 3, etc."
                        required
                      />
                    </div>
                  </>
                )}

                {/* Teacher-only Fields */}
                {registerForm.role === "teacher" && (
                  <>
                    <div>
                      <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        name="employeeId"
                        value={registerForm.employeeId}
                        onChange={handleRegisterChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="EMP123456"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
                        Designation
                      </label>
                      <input
                        type="text"
                        name="designation"
                        value={registerForm.designation}
                        onChange={handleRegisterChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="Assistant Professor"
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              {error && (
                <p className="mt-4 text-sm font-semibold text-rose-500">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-indigo-400"
              >
                {loading
                  ? "Creating account..."
                  : `Register as ${registerForm.role}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
