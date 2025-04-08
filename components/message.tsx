"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Bot, User, Copy, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Message as MessageType } from "@/types"

interface MessageProps {
  message: MessageType
}

export default function Message({ message }: MessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isUser = message.sender === "user"

  return (
    <div className={cn("flex w-full animate-fade-up", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("flex gap-3 max-w-[85%] md:max-w-[75%] group", isUser ? "flex-row-reverse" : "flex-row")}>
        <div
          className={cn(
            "flex items-center justify-center h-8 w-8 rounded-full shrink-0 mt-1",
            isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
          )}
        >
          {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </div>

        <div
          className={cn(
            "message-bubble p-4 shadow-sm relative",
            isUser ? "bg-primary text-primary-foreground user" : "bg-card text-card-foreground bot",
          )}
        >
          {!isUser && !message.isThinking && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy message</span>
            </Button>
          )}

          <div className="whitespace-pre-wrap break-words">
            {message.isThinking ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            ) : (
              message.content
            )}
          </div>

          {message.translatedContent && <div className="translated-text">{message.translatedContent}</div>}

          {message.fileUrl && (
            <div className="mt-3 file-preview">
              <div className="text-xs mb-1 text-muted-foreground">{message.fileName}</div>
              {message.fileType?.startsWith("image/") ? (
                <img
                  src={message.fileUrl || "/placeholder.svg"}
                  alt={message.fileName || "Uploaded file"}
                  className="max-w-full rounded-md max-h-60 object-contain"
                />
              ) : (
                <div className="bg-muted/30 rounded-md p-3 text-sm flex items-center justify-center">
                  <span>File: {message.fileName}</span>
                </div>
              )}
            </div>
          )}

          <div className={cn("text-xs mt-2", isUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {format(message.timestamp, "h:mm a")}
          </div>
        </div>
      </div>
    </div>
  )
}

