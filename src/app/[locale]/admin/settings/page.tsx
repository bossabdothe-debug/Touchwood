"use client";

import {
  useEffect,
  useState,
} from "react";
import { useParams } from "next/navigation";
import {
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Save,
  UserRound,
} from "lucide-react";
import {
  getAdminSettings,
  updateAdminSettings,
} from "@/services/api";
import "./settings.css";

type Locale = "ar" | "en";

type User = {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
};

const text = (
  locale: Locale,
  ar: string,
  en: string
) => (locale === "ar" ? ar : en);

export default function AdminSettingsPage() {
  const params = useParams<{
    locale?: string;
  }>();

  const locale: Locale =
    params.locale === "en"
      ? "en"
      : "ar";

  const isArabic = locale === "ar";

  const [user, setUser] =
    useState<User | null>(null);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token") || ""
      : "";

  useEffect(() => {
    const loadSettings = async () => {
      if (!token) {
        setError(
          text(
            locale,
            "انتهت جلسة تسجيل الدخول",
            "Your session has expired"
          )
        );
        setLoading(false);
        return;
      }

      try {
        const response =
          await getAdminSettings(token);

        const currentUser =
          response?.user;

        if (!currentUser) {
          throw new Error(
            text(
              locale,
              "تعذر تحميل بيانات الحساب",
              "Unable to load account data"
            )
          );
        }

        setUser(currentUser);
        setName(
          currentUser.name || ""
        );
        setEmail(
          currentUser.email || ""
        );
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : text(
                locale,
                "تعذر تحميل بيانات الحساب",
                "Unable to load account data"
              )
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!name.trim()) {
      setError(
        text(
          locale,
          "الاسم مطلوب",
          "Name is required"
        )
      );
      return;
    }

    if (!email.trim()) {
      setError(
        text(
          locale,
          "البريد الإلكتروني مطلوب",
          "Email is required"
        )
      );
      return;
    }

    if (
      newPassword &&
      newPassword !== confirmPassword
    ) {
      setError(
        text(
          locale,
          "كلمتا السر غير متطابقتين",
          "Passwords do not match"
        )
      );
      return;
    }

    if (
      newPassword &&
      !currentPassword
    ) {
      setError(
        text(
          locale,
          "أدخل كلمة السر الحالية أولًا",
          "Enter your current password first"
        )
      );
      return;
    }

    if (
      newPassword &&
      newPassword.length < 8
    ) {
      setError(
        text(
          locale,
          "كلمة السر الجديدة يجب أن تكون 8 أحرف على الأقل",
          "New password must be at least 8 characters"
        )
      );
      return;
    }

    setSaving(true);

    try {
      const response =
        await updateAdminSettings(
          token,
          {
            name: name.trim(),
            email: email.trim(),
            currentPassword:
              currentPassword || undefined,
            newPassword:
              newPassword || undefined,
          }
        );

      const updatedUser =
        response?.user;

      if (updatedUser) {
        setUser(updatedUser);
        setName(
          updatedUser.name || ""
        );
        setEmail(
          updatedUser.email || ""
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage(
        text(
          locale,
          "تم حفظ التغييرات بنجاح",
          "Changes saved successfully"
        )
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : text(
              locale,
              "تعذر حفظ التغييرات",
              "Unable to save changes"
            )
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main
        className="settings-page"
        dir={
          isArabic
            ? "rtl"
            : "ltr"
        }
      >
        <div className="settings-loading">
          {text(
            locale,
            "جاري تحميل الإعدادات...",
            "Loading settings..."
          )}
        </div>
      </main>
    );
  }

  return (
    <main
      className="settings-page"
      dir={
        isArabic
          ? "rtl"
          : "ltr"
      }
    >
      <div className="settings-container">
        <header className="settings-header">
          <div>
            <span className="settings-eyebrow">
              TOUCHWOOD
            </span>

            <h1>
              {text(
                locale,
                "الإعدادات",
                "Settings"
              )}
            </h1>

            <p>
              {text(
                locale,
                "إدارة بيانات حسابك وكلمة السر",
                "Manage your account information and password"
              )}
            </p>
          </div>
        </header>

        <form
          className="settings-form"
          onSubmit={handleSubmit}
        >
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <UserRound size={21} />
              </div>

              <div>
                <h2>
                  {text(
                    locale,
                    "بيانات الحساب",
                    "Account information"
                  )}
                </h2>

                <p>
                  {text(
                    locale,
                    "تعديل الاسم والبريد الإلكتروني",
                    "Update your name and email address"
                  )}
                </p>
              </div>
            </div>

            <div className="settings-fields">
              <label className="settings-field">
                <span>
                  {text(
                    locale,
                    "الاسم",
                    "Name"
                  )}
                </span>

                <div className="settings-input">
                  <UserRound size={18} />

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    maxLength={50}
                    autoComplete="name"
                  />
                </div>
              </label>

              <label className="settings-field">
                <span>
                  {text(
                    locale,
                    "البريد الإلكتروني",
                    "Email"
                  )}
                </span>

                <div className="settings-input">
                  <Mail size={18} />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    maxLength={150}
                    autoComplete="email"
                  />
                </div>
              </label>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <LockKeyhole size={21} />
              </div>

              <div>
                <h2>
                  {text(
                    locale,
                    "تغيير كلمة السر",
                    "Change password"
                  )}
                </h2>

                <p>
                  {text(
                    locale,
                    "اترك الحقول فارغة إذا كنت لا تريد تغيير كلمة السر",
                    "Leave these fields empty if you do not want to change your password"
                  )}
                </p>
              </div>
            </div>

            <div className="settings-fields">
              <label className="settings-field">
                <span>
                  {text(
                    locale,
                    "كلمة السر الحالية",
                    "Current password"
                  )}
                </span>

                <div className="settings-input">
                  <LockKeyhole size={18} />

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="settings-password-toggle"
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) => !value
                      )
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              <label className="settings-field">
                <span>
                  {text(
                    locale,
                    "كلمة السر الجديدة",
                    "New password"
                  )}
                </span>

                <div className="settings-input">
                  <LockKeyhole size={18} />

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    minLength={8}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="settings-password-toggle"
                    onClick={() =>
                      setShowNewPassword(
                        (value) => !value
                      )
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              <label className="settings-field">
                <span>
                  {text(
                    locale,
                    "تأكيد كلمة السر الجديدة",
                    "Confirm new password"
                  )}
                </span>

                <div className="settings-input">
                  <LockKeyhole size={18} />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    minLength={8}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="settings-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>
            </div>
          </section>

          {error && (
            <div className="settings-message settings-message-error">
              {error}
            </div>
          )}

          {message && (
            <div className="settings-message settings-message-success">
              <Check size={18} />
              {message}
            </div>
          )}

          <div className="settings-actions">
            <button
              type="submit"
              className="settings-save"
              disabled={saving}
            >
              <Save size={18} />

              {saving
                ? text(
                    locale,
                    "جاري الحفظ...",
                    "Saving..."
                  )
                : text(
                    locale,
                    "حفظ التغييرات",
                    "Save changes"
                  )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}