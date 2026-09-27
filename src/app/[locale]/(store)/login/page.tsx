"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { logIn } from "@/services/api";

import "./login.css";

const getLoginErrorMessage = (
  error: unknown,
  isArabic: boolean
) => {
  if (!isArabic) {
    return error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
  }

  const message =
    error instanceof Error
      ? error.message.trim()
      : "";

  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("invalid email or password") ||
    normalizedMessage.includes("invalid credentials") ||
    normalizedMessage.includes("invalid email") ||
    normalizedMessage.includes("invalid password") ||
    normalizedMessage.includes("incorrect email or password") ||
    normalizedMessage.includes("incorrect password") ||
    normalizedMessage.includes("wrong email or password") ||
    normalizedMessage.includes("wrong password") ||
    normalizedMessage.includes("wrong email") ||
    normalizedMessage.includes("authentication failed") ||
    normalizedMessage.includes("unauthorized") ||
    normalizedMessage.includes("401")
  ) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }

  if (
    normalizedMessage.includes("user not found") ||
    normalizedMessage.includes("account not found") ||
    normalizedMessage.includes("email not found")
  ) {
    return "لم يتم العثور على حساب بهذا البريد الإلكتروني.";
  }

  if (
    normalizedMessage.includes("email is required") ||
    normalizedMessage.includes("email required")
  ) {
    return "البريد الإلكتروني مطلوب.";
  }

  if (
    normalizedMessage.includes("password is required") ||
    normalizedMessage.includes("password required")
  ) {
    return "كلمة المرور مطلوبة.";
  }

  if (
    normalizedMessage.includes("too many requests") ||
    normalizedMessage.includes("too many attempts")
  ) {
    return "تم تجاوز عدد محاولات تسجيل الدخول المسموح بها. حاول مرة أخرى لاحقًا.";
  }

  if (
    normalizedMessage.includes("network error") ||
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("fetch failed") ||
    normalizedMessage.includes("network request failed")
  ) {
    return "تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت وحاول مرة أخرى.";
  }

  if (
    normalizedMessage.includes("server error") ||
    normalizedMessage.includes("internal server error") ||
    normalizedMessage.includes("500")
  ) {
    return "حدث خطأ في الخادم. حاول مرة أخرى لاحقًا.";
  }

  if (
    normalizedMessage.includes("not found") ||
    normalizedMessage.includes("404")
  ) {
    return "تعذر العثور على الخدمة المطلوبة. حاول مرة أخرى.";
  }

  if (
    normalizedMessage.includes("validation") ||
    normalizedMessage.includes("invalid")
  ) {
    return "يرجى التأكد من صحة البيانات المدخلة.";
  }

  if (/[a-zA-Z]/.test(message)) {
    return "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.";
  }

  if (message) {
    return message;
  }

  return "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.";
};

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();

  const locale =
    params?.locale === "en" ? "en" : "ar";

  const isArabic = locale === "ar";

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
   const data = await logIn(
  {
    email: formData.email.trim(),
    password: formData.password,
  },
  locale
);

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      const isAdmin =
        data.user?.role === "admin";

      router.replace(
        isAdmin
          ? `/${locale}/admin`
          : `/${locale}/account`
      );
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setErrorMessage(
        getLoginErrorMessage(
          error,
          isArabic
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`login-page ${
        isArabic
          ? "login-ar"
          : "login-en"
      }`}
      dir={
        isArabic
          ? "rtl"
          : "ltr"
      }
    >
      <div className="login-background">
        <div className="login-glow login-glow-one" />
        <div className="login-glow login-glow-two" />

        <div className="login-brand-watermark">
          <Image
            src="/logo/logo.jpeg"
            alt=""
            fill
            priority
            sizes="700px"
          />
        </div>

        <div className="login-pattern" />
      </div>

      <section className="login-content">
        <div className="login-card">
          <div className="login-card-glow" />

          <div className="login-card-content">
            <div className="login-logo-wrapper">
              <div className="login-logo-circle">
                <Image
                  src="/logo/logo.jpeg"
                  alt="Touchwood"
                  width={115}
                  height={44}
                  priority
                />
              </div>
            </div>

            <div className="login-heading">
              <span className="login-eyebrow">
                {isArabic
                  ? "مرحبًا بعودتك"
                  : "WELCOME BACK"}
              </span>

              <h1>
                {isArabic
                  ? "سجّل دخولك إلى حسابك"
                  : "Sign in to your account"}
              </h1>

              <p>
                {isArabic
                  ? "أدخل بياناتك للمتابعة والاستمتاع بتجربة Touchwood."
                  : "Enter your details to continue your Touchwood experience."}
              </p>
            </div>

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >
              <div className="login-field">
                <label htmlFor="email">
                  {isArabic
                    ? "البريد الإلكتروني"
                    : "Email Address"}
                </label>

                <div className="login-input-wrapper">
                  <Mail
                    className="login-input-icon"
                    size={19}
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={
                      isArabic
                        ? "أدخل بريدك الإلكتروني"
                        : "Enter your email address"
                    }
                    autoComplete="email"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="password">
                  {isArabic
                    ? "كلمة المرور"
                    : "Password"}
                </label>

                <div className="login-input-wrapper">
                  <Lock
                    className="login-input-icon"
                    size={19}
                  />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      isArabic
                        ? "أدخل كلمة المرور"
                        : "Enter your password"
                    }
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? isArabic
                          ? "إخفاء كلمة المرور"
                          : "Hide password"
                        : isArabic
                        ? "إظهار كلمة المرور"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div
                  className="login-message login-error"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                className="login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="login-spinner"
                      aria-hidden="true"
                    />

                    <span>
                      {isArabic
                        ? "جارٍ تسجيل الدخول..."
                        : "Signing in..."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {isArabic
                        ? "تسجيل الدخول"
                        : "Sign In"}
                    </span>

                    {isArabic ? (
                      <ArrowLeft size={19} />
                    ) : (
                      <ArrowRight size={19} />
                    )}
                  </>
                )}
              </button>
            </form>

            <div className="login-register">
              <span>
                {isArabic
                  ? "ليس لديك حساب؟"
                  : "Don't have an account?"}
              </span>

              <Link
                href={`/${locale}/register`}
              >
                {isArabic
                  ? "إنشاء حساب جديد"
                  : "Create an account"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}