import { useEffect, useState } from "react";

type ErrorMessageProps = {
  message?: string | null;
  duration?: number;
  className?: string;
};

export default function ErrorMessage({
  message,
  duration =5000,
  className = "",
}: ErrorMessageProps) {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    if(!message) return;

    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false)
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration]);

  if(!message || !visible) return null;

  return (
    <div
      role="alert"
      className={`absolute top-10 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 ${className}`}
    >
      {message}
    </div>
  );
}
