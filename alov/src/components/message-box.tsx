"use client"

import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export type MessageBoxType = 'success' | 'error' | 'warning' | 'info' | 'confirm'

interface MessageBoxProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
  type: MessageBoxType
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

export function MessageBox({
  open,
  onClose,
  onConfirm,
  type,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: MessageBoxProps) {
  const icons = {
    success: <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />,
    error: <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    info: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    confirm: <AlertTriangle className="w-6 h-6 text-slate-600 dark:text-slate-400" />
  }

  const handleConfirm = () => {
    onConfirm?.()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {icons[type]}
            <DialogTitle className="text-slate-900 dark:text-white">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-left">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end gap-2">
          {type === 'confirm' ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-slate-200 dark:border-slate-800"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900"
              >
                {confirmText}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={onClose}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
              {confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook for easy usage
export function useMessageBox() {
  const [messageBox, setMessageBox] = React.useState<{
    open: boolean
    type: MessageBoxType
    title: string
    message: string
    onConfirm?: () => void
    confirmText?: string
    cancelText?: string
  }>({
    open: false,
    type: 'info',
    title: '',
    message: ''
  })

  const showMessage = (
    type: MessageBoxType,
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setMessageBox({
      open: true,
      type,
      title,
      message,
      onConfirm,
      confirmText,
      cancelText
    })
  }

  const closeMessage = () => {
    setMessageBox(prev => ({ ...prev, open: false }))
  }

  const MessageBoxComponent = () => (
    <MessageBox
      {...messageBox}
      onClose={closeMessage}
    />
  )

  return {
    showMessage,
    showSuccess: (title: string, message: string) => showMessage('success', title, message),
    showError: (title: string, message: string) => showMessage('error', title, message),
    showWarning: (title: string, message: string) => showMessage('warning', title, message),
    showInfo: (title: string, message: string) => showMessage('info', title, message),
    showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string, cancelText?: string) => 
      showMessage('confirm', title, message, onConfirm, confirmText, cancelText),
    MessageBox: MessageBoxComponent
  }
}

import * as React from "react"
