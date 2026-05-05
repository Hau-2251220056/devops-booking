import { useCallback, useState } from "react";
import Toast from "./Toast";
import "./toast.css";
import ToastContext from "./toastContext";

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, ...toast }]);
    if (toast.duration !== 0) {
      const duration = toast.duration || 4000;
      setTimeout(() => {
        setToasts((current) => current.filter((x) => x.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const api = {
    show: addToast,
    success: (msg, opts = {}) =>
      addToast({ type: "success", message: msg, ...opts }),
    error: (msg, opts = {}) =>
      addToast({ type: "error", message: msg, ...opts }),
    info: (msg, opts = {}) => addToast({ type: "info", message: msg, ...opts }),
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-portal" aria-live="polite">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
