import { CheckCircle, XCircle } from "lucide-react";

const Toast = ({ type = "info", message, onClose }) => {
  const getIcon = () => {
    if (type === "success") return <CheckCircle size={20} />;
    if (type === "error") return <XCircle size={20} />;
    return <CheckCircle size={20} />;
  };

  return (
    <div className={`toast toast-${type}`} role="status">
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose} aria-label="Close">
        ×
      </button>
    </div>
  );
};

export default Toast;
