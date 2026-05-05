import React from "react"
import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"

interface AlertProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  onClose?: () => void
}

export function Alert({ type, message, onClose }: AlertProps) {
  const icons = {
    success: <CheckCircle size={20} />,
    error: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  }

  const colors = {
    success: "bg-success/10 border-success/30 text-success",
    error: "bg-danger/10 border-danger/30 text-danger",
    warning: "bg-warning/10 border-warning/30 text-warning",
    info: "bg-primary/10 border-primary/30 text-primary",
  }

  return (
    <div className={`border rounded-lg p-4 flex items-start gap-3 ${colors[type]}`}>
      {icons[type]}
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-lg hover:opacity-70">
          ×
        </button>
      )}
    </div>
  )
}
