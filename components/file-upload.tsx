"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Paperclip, X, FileText, Image, File, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FileUpload as FileUploadType } from "@/types"

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<string>
  onCancel: () => void
}

export default function FileUpload({ onFileUpload, onCancel }: FileUploadProps) {
  const [fileUpload, setFileUpload] = useState<FileUploadType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset any previous errors
    setError(null)

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    // Create preview
    const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : ""

    // Initialize upload state
    setFileUpload({
      file,
      preview,
      progress: 0,
      uploaded: false,
    })

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFileUpload((prev) => {
          if (!prev) return null
          const newProgress = Math.min(prev.progress + 10, 95)
          return { ...prev, progress: newProgress }
        })
      }, 300)

      // Upload file
      const fileUrl = await onFileUpload(file)

      // Clear interval and set as uploaded
      clearInterval(progressInterval)
      setFileUpload((prev) => (prev ? { ...prev, progress: 100, uploaded: true } : null))

      // Reset after 1 second
      setTimeout(() => {
        setFileUpload(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }, 1000)
    } catch (error) {
      console.error("File upload error:", error)
      setError(error.message || "Upload failed. Please try again.")
      setFileUpload((prev) =>
        prev
          ? {
              ...prev,
              error: "Upload failed. Please try again.",
            }
          : null,
      )
    }
  }

  const handleCancel = () => {
    if (fileUpload?.preview) {
      URL.revokeObjectURL(fileUpload.preview)
    }
    setFileUpload(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onCancel()
  }

  const getFileIcon = () => {
    if (!fileUpload?.file) return <File className="h-5 w-5" />

    const fileType = fileUpload.file.type
    if (fileType.startsWith("image/")) {
      return <Image className="h-5 w-5" />
    } else {
      return <FileText className="h-5 w-5" />
    }
  }

  return (
    <div className="w-full">
      {error && (
        <Alert variant="destructive" className="mb-2 py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {fileUpload ? (
        <div className="bg-card rounded-md p-3 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm">
              {getFileIcon()}
              <span className="truncate max-w-[200px]">{fileUpload.file.name}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCancel}>
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>

          {fileUpload.preview && (
            <div className="mb-2 rounded overflow-hidden">
              <img
                src={fileUpload.preview || "/placeholder.svg"}
                alt="Preview"
                className="max-h-40 max-w-full object-contain"
              />
            </div>
          )}

          <Progress value={fileUpload.progress} className="h-1.5" />

          {fileUpload.error && <p className="text-destructive text-xs mt-1">{fileUpload.error}</p>}
        </div>
      ) : (
        <div className="flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
            <span className="sr-only">Attach file</span>
          </Button>
        </div>
      )}
    </div>
  )
}

