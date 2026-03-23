"use client"

import { useMessageBox } from '@/components/message-box'
import { Button } from '@/components/ui/button'

export default function TestComponentsPage() {
  const { showSuccess, showError, showWarning, showInfo, showConfirm, MessageBox } = useMessageBox()

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Component Test Page
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Test all the new components to verify they're working
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Message Box Tests
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Button
              onClick={() => showSuccess('Success!', 'This is a success message')}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Test Success
            </Button>

            <Button
              onClick={() => showError('Error!', 'This is an error message')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Test Error
            </Button>

            <Button
              onClick={() => showWarning('Warning!', 'This is a warning message')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Test Warning
            </Button>

            <Button
              onClick={() => showInfo('Info', 'This is an info message')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Test Info
            </Button>

            <Button
              onClick={() => showConfirm(
                'Confirm Action',
                'Are you sure you want to do this?',
                () => alert('Confirmed!'),
                'Yes, do it',
                'Cancel'
              )}
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900"
            >
              Test Confirm
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Status
          </h2>
          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ✅ If you can see this page, the components are loaded correctly!
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              ✅ Click the buttons above to test the message boxes
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              ✅ Check browser console for any errors
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Files Created
          </h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>src/components/message-box.tsx</li>
            <li>src/components/ui/dialog.tsx</li>
            <li>src/components/preview-frame-improved.tsx</li>
            <li>src/components/terminal-panel.tsx (updated)</li>
            <li>src/lib/deployment/manager.ts (updated with OAuth)</li>
          </ul>
        </div>
      </div>

      <MessageBox />
    </div>
  )
}
