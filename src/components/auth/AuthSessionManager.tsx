"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import styles from "./AuthSessionManager.module.css";

type SessionExpiredEventDetail = {
  reason?: "expired" | "unauthorized";
};

function getTokenExpiration(
  token: string
): number | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(
      atob(
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    if (
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    return payload.exp * 1000;
  } catch {
    return null;
  }
}

export default function AuthSessionManager() {
  const router = useRouter();
  const pathname = usePathname();

  const [showExpiredPopup, setShowExpiredPopup] =
    useState(false);

  const [reason, setReason] =
    useState<
      "expired" | "unauthorized"
    >("expired");

  const locale =
    pathname?.split("/").filter(Boolean)[0] ===
    "en"
      ? "en"
      : "ar";

  const isArabic = locale === "ar";

  const showSessionExpiredPopup =
    useCallback(
      (
        nextReason:
          | "expired"
          | "unauthorized" = "expired"
      ) => {
        setReason(nextReason);
        setShowExpiredPopup(true);

        /*
         * The old token is no longer usable.
         * Remove it immediately so all account
         * buttons become login buttons.
         */
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        /*
         * Inform Navbar / other components.
         */
        window.dispatchEvent(
          new Event(
            "touchwood-auth-change"
          )
        );
      },
      []
    );

  /*
   * Listen for API 401 events.
   */
  useEffect(() => {
    const handleSessionExpired = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<SessionExpiredEventDetail>;

      showSessionExpiredPopup(
        customEvent.detail?.reason ||
          "unauthorized"
      );
    };

    window.addEventListener(
      "touchwood-session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "touchwood-session-expired",
        handleSessionExpired
      );
    };
  }, [showSessionExpiredPopup]);

  /*
   * Monitor JWT expiration locally.
   */
  useEffect(() => {
    const checkToken = () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        return;
      }

      const expiration =
        getTokenExpiration(token);

      if (!expiration) {
        return;
      }

      const remaining =
        expiration - Date.now();

      if (remaining <= 0) {
        showSessionExpiredPopup(
          "expired"
        );

        return;
      }

      /*
       * Check exactly when the token expires.
       */
      const timeoutId =
        window.setTimeout(() => {
          const currentToken =
            localStorage.getItem(
              "token"
            );

          /*
           * Make sure this is still the
           * same session before showing popup.
           */
          if (
            currentToken === token
          ) {
            showSessionExpiredPopup(
              "expired"
            );
          }
        }, remaining);

      return timeoutId;
    };

    const timeoutId =
      checkToken();

    return () => {
      if (timeoutId) {
        window.clearTimeout(
          timeoutId
        );
      }
    };
  }, [
    pathname,
    showSessionExpiredPopup,
  ]);

  /*
   * Also monitor localStorage changes
   * from another browser tab.
   */
  useEffect(() => {
    const handleStorage = (
      event: StorageEvent
    ) => {
      if (
        event.key === "token"
      ) {
        /*
         * Trigger the effect again by
         * changing a harmless state through
         * a custom auth event.
         */
        window.dispatchEvent(
          new Event(
            "touchwood-auth-change"
          )
        );
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  const closePopup = () => {
    setShowExpiredPopup(false);
  };

  const goToLogin = () => {
    setShowExpiredPopup(false);

    router.push(
      `/${locale}/login`
    );
  };

  if (!showExpiredPopup) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      role="presentation"
    >
      <section
        className={styles.popup}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-expired-title"
        aria-describedby="session-expired-description"
        dir={
          isArabic
            ? "rtl"
            : "ltr"
        }
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={closePopup}
          aria-label={
            isArabic
              ? "إغلاق"
              : "Close"
          }
        >
          ×
        </button>

        <div
          className={styles.icon}
          aria-hidden="true"
        >
          !
        </div>

        <span
          className={styles.eyebrow}
        >
          TOUCHWOOD
        </span>

        <h2
          id="session-expired-title"
        >
          {isArabic
            ? "انتهت جلسة تسجيل الدخول"
            : "Your session has expired"}
        </h2>

        <p
          id="session-expired-description"
        >
          {reason ===
          "unauthorized"
            ? isArabic
              ? "انتهت صلاحية جلسة تسجيل الدخول الخاصة بك. يرجى تسجيل الدخول مرة أخرى للمتابعة."
              : "Your login session is no longer valid. Please sign in again to continue."
            : isArabic
            ? "انتهت صلاحية تسجيل الدخول الخاصة بك. يرجى تسجيل الدخول مرة أخرى للمتابعة."
            : "Your login session has expired. Please sign in again to continue."}
        </p>

        <div
          className={styles.actions}
        >
          <button
            type="button"
            className={styles.loginButton}
            onClick={goToLogin}
          >
            {isArabic
              ? "تسجيل الدخول مرة أخرى"
              : "Sign In Again"}
          </button>

          <button
            type="button"
            className={styles.laterButton}
            onClick={closePopup}
          >
            {isArabic
              ? "لاحقًا"
              : "Later"}
          </button>
        </div>
      </section>
    </div>
  );
}