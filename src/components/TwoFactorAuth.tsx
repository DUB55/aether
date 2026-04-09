"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert,
  QrCode,
  Key,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { twoFactorAuthService, TwoFactorSetup } from '@/lib/two-factor-auth'

interface TwoFactorAuthProps {
  userId: string
  email: string
  className?: string
}

export function TwoFactorAuth({ userId, email, className }: TwoFactorAuthProps) {
  const [isEnabled, setIsEnabled] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [backupCodeCopied, setBackupCodeCopied] = useState<number | null>(null)

  useEffect(() => {
    checkTwoFactorStatus()
  }, [userId])

  const checkTwoFactorStatus = () => {
    const enabled = twoFactorAuthService.isTwoFactorEnabled(userId)
    setIsEnabled(enabled)
  }

  const handleEnableTwoFactor = () => {
    const setup = twoFactorAuthService.setupTwoFactor(userId, email)
    setSetupData(setup)
    setShowSetup(true)
  }

  const handleVerifyCode = () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code')
      return
    }

    setIsVerifying(true)
    const result = twoFactorAuthService.verifyCode(userId, verificationCode)
    
    if (result.success) {
      const enabled = twoFactorAuthService.enableTwoFactor(userId)
      if (enabled) {
        setIsEnabled(true)
        setShowSetup(false)
        setSetupData(null)
        setVerificationCode('')
        toast.success('Two-factor authentication enabled!')
      } else {
        toast.error('Failed to enable 2FA')
      }
    } else {
      toast.error(result.message)
    }
    
    setIsVerifying(false)
  }

  const handleDisableTwoFactor = () => {
    if (confirm('Are you sure you want to disable two-factor authentication? Your account will be less secure.')) {
      const disabled = twoFactorAuthService.disableTwoFactor(userId)
      if (disabled) {
        setIsEnabled(false)
        toast.success('Two-factor authentication disabled')
      } else {
        toast.error('Failed to disable 2FA')
      }
    }
  }

  const handleCopyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setBackupCodeCopied(index)
    setTimeout(() => setBackupCodeCopied(null), 2000)
    toast.success('Backup code copied')
  }

  if (isEnabled) {
    const status = twoFactorAuthService.getTwoFactorStatus(userId)
    
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            Two-Factor Authentication
            <Badge className="bg-green-100 text-green-800">Enabled</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">2FA is enabled</div>
                <div className="text-sm text-green-700 mt-1">
                  Your account is protected with two-factor authentication. You'll need to enter a code from your authenticator app when signing in.
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <Key className="w-4 h-4" />
              <span className="font-medium">Backup Codes Remaining: {status.backupCodesRemaining}</span>
            </div>
            <p className="text-sm text-blue-700 mt-2">
              Save these backup codes in a secure location. You can use them if you lose access to your authenticator app.
            </p>
          </div>

          <Button
            onClick={handleDisableTwoFactor}
            variant="outline"
            className="w-full"
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            Disable Two-Factor Authentication
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (showSetup && setupData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Set Up Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Before you continue:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>Scan the QR code below with the app</li>
                  <li>Enter the 6-digit code to verify</li>
                  <li>Save your backup codes in a secure location</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg border">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-32 h-32 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Or enter this code manually:</p>
              <code className="text-lg font-mono bg-gray-100 px-3 py-1 rounded">
                {setupData.secret}
              </code>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Enter verification code</label>
              <Input
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest mt-2"
              />
            </div>
            <Button
              onClick={handleVerifyCode}
              disabled={isVerifying || verificationCode.length !== 6}
              className="w-full"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Enable Two-Factor Authentication'
              )}
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Backup Codes</h4>
            <div className="grid grid-cols-2 gap-2">
              {setupData.backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <code className="text-sm font-mono">{code}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyBackupCode(code, index)}
                  >
                    {backupCodeCopied === index ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Save these codes in a secure location. Each code can only be used once.
            </p>
          </div>

          <Button
            onClick={() => {
              setShowSetup(false)
              setSetupData(null)
              setVerificationCode('')
            }}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Two-Factor Authentication
          <Badge variant="outline">Disabled</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Enhance your account security</p>
              <p>
                Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app when signing in.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleEnableTwoFactor} className="w-full">
          <Shield className="w-4 h-4 mr-2" />
          Enable Two-Factor Authentication
        </Button>
      </CardContent>
    </Card>
  )
}
