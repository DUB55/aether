"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Download, Wand2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

interface GeneratedImage {
  url: string
  prompt: string
  timestamp: number
}

interface ImageGeneratorProps {
  onImageSelect?: (imageUrl: string) => void
  className?: string
}

export function ImageGenerator({ onImageSelect, className }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt for image generation')
      return
    }

    setLoading(true)
    try {
      // Using a mock image generation service for now
      // In production, this would integrate with services like DALL-E, Midjourney, or Stable Diffusion
      const response = await fetch('https://picsum.photos/512/512', {
        method: 'GET',
      })
      
      if (response.ok) {
        const imageUrl = response.url
        const newImage: GeneratedImage = {
          url: imageUrl,
          prompt: prompt,
          timestamp: Date.now()
        }
        
        setGeneratedImages(prev => [newImage, ...prev])
        toast.success('Image generated successfully!')
      } else {
        throw new Error('Failed to generate image')
      }
    } catch (error) {
      console.error('Image generation error:', error)
      toast.error('Failed to generate image. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    if (onImageSelect) {
      onImageSelect(imageUrl)
      toast.success('Image selected for use in your project!')
    }
  }

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `aether-generated-${prompt.slice(0, 20).replace(/\s+/g, '-')}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Image downloaded successfully!')
    } catch (error) {
      toast.error('Failed to download image')
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Image Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !loading && generateImage()}
            className="flex-1"
          />
          <Button 
            onClick={generateImage} 
            disabled={loading || !prompt.trim()}
            size="sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            Generate
          </Button>
        </div>

        {generatedImages.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Generated Images</h4>
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
              {generatedImages.map((image, index) => (
                <div
                  key={image.timestamp}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === image.url ? 'border-blue-500' : 'border-gray-200'
                  }`}
                  onClick={() => handleImageSelect(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadImage(image.url, image.prompt)
                      }}
                      className="mr-2"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleImageSelect(image.url)
                      }}
                    >
                      Select
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-xs text-white truncate">{image.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedImage && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              ✓ Image selected and ready to use in your project
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
