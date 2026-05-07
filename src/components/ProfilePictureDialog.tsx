"use client"

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Camera, Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useFirebase } from './FirebaseProvider'

interface ProfilePictureDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ProfilePictureDialog({ isOpen, onClose }: ProfilePictureDialogProps) {
  const { user, uploadProfilePicture, updateProfilePicture } = useFirebase()
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      toast.error('Please select an image first')
      return
    }

    setIsUploading(true)
    try {
      const file = fileInputRef.current.files[0]
      const photoURL = await uploadProfilePicture(file)
      toast.success('Profile picture updated successfully!')
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      onClose()
    } catch (error) {
      console.error('Failed to upload profile picture:', error)
      toast.error('Failed to update profile picture. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePicture = async () => {
    if (!user) return
    
    setIsUploading(true)
    try {
      // Use a default avatar URL or null
      await updateProfilePicture('')
      toast.success('Profile picture removed')
      setPreview(null)
      onClose()
    } catch (error) {
      console.error('Failed to remove profile picture:', error)
      toast.error('Failed to remove profile picture. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-background/95 backdrop-blur-sm absolute inset-0" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-background border rounded-lg shadow-xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Change Profile Picture</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Current/Preview Image */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-muted">
                  {preview ? (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Current profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <Camera className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {preview ? 'Preview' : 'Current profile picture'}
                </p>
              </div>

              {/* Upload Button */}
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Image
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Supports: JPG, PNG, GIF, WebP
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={!preview || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent border-t-primary" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                {user?.photoURL && (
                  <Button
                    onClick={handleRemovePicture}
                    disabled={isUploading}
                    variant="outline"
                  >
                    Remove
                  </Button>
                )}
              </div>

              {/* Info */}
              <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  Your profile picture is stored securely in your account and will persist across all devices.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
