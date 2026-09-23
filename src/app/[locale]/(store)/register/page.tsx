
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
  User,
  Phone,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

import { register } from "@/services/api";
import "./register.css";

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();

  const locale = params?.locale === "en" ? "en" : "ar";
  const isArabic = locale === "ar";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // إزالة الرسائل بمجرد بدء التعديل
    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  const getErrorMessage = (message: string) => {
    if (isArabic) {
      switch (message) {
        case "All fields are required":
          return "جميع الحقول مطلوبة";
case "Phone Number must be 11 numbers":
          return "رقم الهاتف يجب ان يكون مكوننا من 11 رقم";
        case "Please enter a valid name":
          return "يرجى إدخال اسم صحيح";
          case "Email and password match":
          return "يجب ان تكون كلمة المرور مختلفة عن البريد المستخدم";

        case "Please enter a valid email address":
          return "يرجى إدخال بريد إلكتروني صحيح";

        case "Password must be at least 8 characters and contain uppercase, lowercase, number and special character":
          return "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، وحرف كبير وحرف صغير ورقم ورمز خاص";

        case "Please enter a valid phone number":
          return "يرجى إدخال رقم هاتف صحيح";

        case "An account already exists with this email or phone number":
          return "يوجد حساب بالفعل بهذا البريد الإلكتروني أو رقم الهاتف";

        case "Internal Server Error":
          return "حدث خطأ في الخادم، يرجى المحاولة مرة أخرى";

        default:
          return "حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى";
      }
    }

    return message || "Registration failed";
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // التحقق من تطابق كلمات المرور
    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        isArabic
          ? "كلمتا المرور غير متطابقتين"
          : "Passwords do not match"
      );

      return;
    }

    // التحقق من كلمة المرور قبل إرسال الطلب
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])\S{8,}$/;

    if (!passwordRegex.test(formData.password)) {
      setError(
        isArabic
          ? "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، وحرف كبير وحرف صغير ورقم ورمز خاص"
          : "Password must be at least 8 characters and contain uppercase, lowercase, number and special character"
      );

      return;
    }

    setLoading(true);

    try {
      const data = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      console.log("Registration successful:", data);

      setSuccess(
        isArabic
          ? "تم إنشاء حسابك بنجاح! سيتم تحويلك إلى تسجيل الدخول..."
          : "Your account has been created successfully! Redirecting to login..."
      );

      // الانتقال إلى Login بعد نجاح التسجيل
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 1200);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "";

      setError(getErrorMessage(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className={`register-page ${
        isArabic ? "register-ar" : "register-en"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="register-background">
        <div className="register-glow register-glow-one" />
        <div className="register-glow register-glow-two" />

        <div className="register-brand-watermark">
          <Image
            src="/logo/logo.jpeg"
            alt=""
            fill
            priority
            sizes="700px"
          />
        </div>

        <div className="register-pattern" />
      </div>

      <section className="register-content">
        <div className="register-card">
          <div className="register-card-glow" />

          <div className="register-card-content">
            <div className="register-logo-wrapper">
              <div className="register-logo-circle">
                <Image
                  src="/logo/logo.jpeg"
                  alt="Touchwood"
                  width={115}
                  height={44}
                  priority
                />
              </div>
            </div>

            <div className="register-heading">
              <span className="register-eyebrow">
                {isArabic
                  ? "انضم إلينا"
                  : "JOIN TOUCHWOOD"}
              </span>

              <h1>
                {isArabic
                  ? "أنشئ حسابك الجديد"
                  : "Create your account"}
              </h1>

              <p>
                {isArabic
                  ? "أنشئ حسابك واستمتع بتجربة Touchwood."
                  : "Create your account and enjoy your Touchwood experience."}
              </p>
            </div>

            {error && (
              <div
                className="register-message register-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                className="register-message register-success"
                role="status"
              >
                {success}
              </div>
            )}

            <form
              className="register-form"
              onSubmit={handleSubmit}
            >
              {/* Name */}
              <div className="register-field">
                <label htmlFor="name">
                  {isArabic
                    ? "الاسم بالكامل"
                    : "Full Name"}
                </label>

                <div className="register-input-wrapper">
                  <User
                    className="register-input-icon"
                    size={19}
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={
                      isArabic
                        ? "أدخل اسمك بالكامل"
                        : "Enter your full name"
                    }
                    autoComplete="name"
                    minLength={2}
                    maxLength={50}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="register-field">
                <label htmlFor="email">
                  {isArabic
                    ? "البريد الإلكتروني"
                    : "Email Address"}
                </label>

                <div className="register-input-wrapper">
                  <Mail
                    className="register-input-icon"
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
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="register-field">
                <label htmlFor="phone">
                  {isArabic
                    ? "رقم الهاتف"
                    : "Phone Number"}
                </label>

                <div className="register-input-wrapper">
                  <Phone
                    className="register-input-icon"
                    size={19}
                  />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={
                      isArabic
                        ? "أدخل رقم هاتفك"
                        : "Enter your phone number"
                    }
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="register-field">
                <label htmlFor="password">
                  {isArabic
                    ? "كلمة المرور"
                    : "Password"}
                </label>

                <div className="register-input-wrapper">
                  <Lock
                    className="register-input-icon"
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
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev
                      )
                    }
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

              {/* Confirm Password */}
              <div className="register-field">
                <label htmlFor="confirmPassword">
                  {isArabic
                    ? "تأكيد كلمة المرور"
                    : "Confirm Password"}
                </label>

                <div className="register-input-wrapper">
                  <Lock
                    className="register-input-icon"
                    size={19}
                  />

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    placeholder={
                      isArabic
                        ? "أعد إدخال كلمة المرور"
                        : "Re-enter your password"
                    }
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? isArabic
                          ? "إخفاء كلمة المرور"
                          : "Hide password"
                        : isArabic
                        ? "إظهار كلمة المرور"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? isArabic
                      ? "جارٍ إنشاء الحساب..."
                      : "Creating account..."
                    : isArabic
                    ? "إنشاء الحساب"
                    : "Create Account"}
                </span>

                {!loading &&
                  (isArabic ? (
                    <ArrowLeft size={19} />
                  ) : (
                    <ArrowRight size={19} />
                  ))}
              </button>
            </form>

            <div className="register-login">
              <span>
                {isArabic
                  ? "لديك حساب بالفعل؟"
                  : "Already have an account?"}
              </span>

              <Link href={`/${locale}/login`}>
                {isArabic
                  ? "تسجيل الدخول"
                  : "Sign in"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

