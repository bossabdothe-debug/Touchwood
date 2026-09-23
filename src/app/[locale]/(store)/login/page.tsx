
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

export default function LoginPage() {
  const params = useParams();
  const router = useRouter();

  const locale = params?.locale === "en" ? "en" : "ar";
  const isArabic = locale === "ar";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const data = await logIn({
        email: formData.email.trim(),
        password: formData.password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

const isAdmin = data.user?.role === "admin";

router.replace(
  isAdmin ? `/${locale}/admin` : `/${locale}/shop`
);    } catch (error) {
      console.error("Login error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : isArabic
          ? "حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`login-page ${isArabic ? "login-ar" : "login-en"}`}
      dir={isArabic ? "rtl" : "ltr"}
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
                {isArabic ? "مرحبًا بعودتك" : "WELCOME BACK"}
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

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="email">
                  {isArabic ? "البريد الإلكتروني" : "Email Address"}
                </label>

                <div className="login-input-wrapper">
                  <Mail className="login-input-icon" size={19} />

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
                  {isArabic ? "كلمة المرور" : "Password"}
                </label>

                <div className="login-input-wrapper">
                  <Lock className="login-input-icon" size={19} />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
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
                      setShowPassword((prev) => !prev)
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
                <div className="login-message login-error" role="alert">
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
                      {isArabic ? "تسجيل الدخول" : "Sign In"}
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

              <Link href={`/${locale}/register`}>
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

