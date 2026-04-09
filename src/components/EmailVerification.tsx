"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { emailVerificationService } from '@/lib/email-verification'

interface EmailVerificationProps {
  userId: string
  email: string
  onVerified?: () => void
  className?: string
}

export function EmailVerification({ userId, email, onVerified, className }: EmailVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showDevCode, setShowDevCode] = useState(false)
  const [devCode, setDevCode] = useState<string>('')

  useEffect(() => {
    // Check if already verified
    const verified = emailVerificationService.isEmailVerified(userId)
    setIsVerified(verified)
  }, [userId])

  const handleSendVerification = async () => {
    setIsSending(true)
    try {
      const result = await emailVerificationService.sendVerificationEmail(email, userId)
      if (result.success) {
        toast.success('Verification email sent!')
        // In development, show the code for testing
        if (result.verificationCode) {
          setDevCode(result.verificationCode)
          setShowDevCode(true)
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to send verification email')
    } finally {
      setIsSending(false)
    }
  }

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code')
      return
    }

    setIsVerifying(true)
    try {
      const result = await emailVerificationService.verifyEmail(userId, verificationCode)
      if (result.success) {
        setIsVerified(true)
        toast.success('Email verified successfully!')
        setShowDevCode(false)
        if (onVerified) onVerified()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to verify email')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsSending(true)
    try {
      const result = await emailVerificationService.resendVerificationEmail(userId)
      if (result.success) {
        toast.success('Verification email resent!')
        if (result.verificationCode) {
          setDevCode(result.verificationCode)
          setShowDevCode(true)
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to resend verification email')
    } finally {
      setIsSending(false)
    }
  }

  if (isVerified) {
    return (
      <Card className={className}>
        <CardContent className="py-6">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <div className="font-medium">Email Verified</div>
              <div className="text-sm text-muted-foreground">{email}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Verify your email address</p>
              <p>We'll send a verification code to {email}. Enter the code below to verify your account.</p>
            </div>
          </div>
        </div>

        {!showDevCode && (
          <Button
            onClick={handleSendVerification}
            disabled={isSending}
            className="w-full"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Verification Code
              </>
            )}
          </Button>
        )}

        {showDevCode && (
          <div className="space-y-3">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-2">Development Mode</p>
                <p className="mb-2">Your verification code is:</p>
                <div className="text-2xl font-mono font-bold text-center py-2 bg-white rounded border">
                  {devCode}
                </div>
                <p className="mt-2 text-xs">(In production, this would be sent via email)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest"
              />
              <Button
                onClick={handleVerify}
                disabled={isVerifying || verificationCode.length !== 6}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </div>

            <Button
              onClick={handleResend}
              disabled={isSending}
              variant="outline"
              className="w-full"
              size="sm"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Resend Code
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
