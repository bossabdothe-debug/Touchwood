"use client";

import styles from "./WhatsAppFloatingButton.module.css";

type WhatsAppFloatingButtonProps = {
  locale: string;
};

export default function WhatsAppFloatingButton({
  locale,
}: WhatsAppFloatingButtonProps) {
  const isArabic = locale === "ar";

  return (
    <a
      href="https://wa.me/201142447767"
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.button} ${
        isArabic ? styles.ltr : styles.rtl
      }`}
      aria-label={
        isArabic
          ? "تواصل معنا عبر واتساب"
          : "Contact us on WhatsApp"
      }
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={styles.icon}
      >
        <path d="M20.52 3.48A11.82 11.82 0 0 0 12.09 0C5.55 0 .22 5.33.22 11.87c0 2.09.55 4.13 1.6 5.93L.12 24l6.34-1.66a11.85 11.85 0 0 0 5.63 1.43h.01c6.54 0 11.87-5.33 11.87-11.87 0-3.17-1.23-6.15-3.45-8.42ZM12.1 21.77h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.76.99 1-3.66-.23-.38a9.86 9.86 0 0 1-1.51-5.26C2.2 6.44 6.64 2 12.1 2c2.65 0 5.14 1.03 7.01 2.9a9.83 9.83 0 0 1 2.91 7c0 5.45-4.44 9.87-9.92 9.87Zm5.42-7.4c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.5 1.7.64.71.23 1.35.2 1.86.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>
    </a>
  );
}