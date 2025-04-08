"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2, AlertCircle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Message as MessageType, UserSettings } from "@/types"
import Message from "@/components/message"
import FileUpload from "@/components/file-upload"
import { translateText, replaceCurrencyValues } from "@/lib/data"

interface ChatInterfaceProps {
  userSettings: UserSettings
  onSendMessage: (content: string, file?: { url: string; type: string; name: string }) => Promise<string>
  apiKeyError?: string | null
  isDemoMode?: boolean
}

interface MessageProps {
  message: MessageType
  isLast?: boolean
}

export default function ChatInterface({
  userSettings,
  onSendMessage,
  apiKeyError,
  isDemoMode = false,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "1",
      content: isDemoMode
        ? "Hello! I'm your Global Assistant running in demo mode. The API key has expired, but you can still try out the interface with simulated responses."
        : "Hello! I'm your Global Assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [isProcessing, setIsProcessing] = useState(false)
  const [textareaError, setTextareaError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Update welcome message if demo mode changes
  useEffect(() => {
    if (messages.length === 1) {
      setMessages([
        {
          id: "1",
          content: isDemoMode
            ? "Hello! I'm your Global Assistant running in demo mode. The API key has expired, but you can still try out the interface with simulated responses."
            : "Hello! I'm your Global Assistant. How can I help you today?",
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    }
  }, [isDemoMode, messages.length]) // Add messages.length to the dependency array

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check for API key error if not in demo mode
    if (apiKeyError && !isDemoMode) {
      setTextareaError("Cannot send message: " + apiKeyError)
      return
    }

    if (!message.trim() || isProcessing) return

    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsProcessing(true)
    setTextareaError(null)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    try {
      // Add thinking message
      const thinkingMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: "Thinking...",
        sender: "bot",
        timestamp: new Date(),
        isThinking: true,
      }

      setMessages((prev) => [...prev, thinkingMessage])

      // Call the onSendMessage prop
      const botResponseText = await onSendMessage(message)

      // Translate the response if needed
      const translatedContent =
        userSettings.language !== "en" ? await translateText(botResponseText, userSettings.language) : undefined

      // Replace currency values if any
      const processedContent = replaceCurrencyValues(botResponseText, userSettings.currency)

      // Update the thinking message with the actual response
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingMessage.id
            ? {
                ...msg,
                content: processedContent,
                translatedContent,
                isThinking: false,
              }
            : msg,
        ),
      )
    } catch (error) {
      console.error("Error sending message:", error)

      // Remove thinking message and add error message
      setMessages((prev) =>
        prev
          .filter((msg) => !msg.isThinking)
          .concat({
            id: Date.now().toString(),
            content: "Sorry, I encountered an error. Please try again.",
            sender: "bot",
            timestamp: new Date(),
          }),
      )
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle textarea height
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)

    // Clear any textarea errors when user types
    if (textareaError) {
      setTextareaError(null)
    }

    // Auto resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File): Promise<string> => {
    // Check for API key error if not in demo mode
    if (apiKeyError && !isDemoMode) {
      throw new Error(apiKeyError)
    }

    setIsUploading(true)

    try {
      // In a real app, you would upload the file to a server
      // For this demo, we'll just simulate a delay and return a data URL
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const fileUrl = URL.createObjectURL(file)

      // Add a message with the file
      const fileMessage: MessageType = {
        id: Date.now().toString(),
        content: "I've uploaded a file for you to analyze.",
        sender: "user",
        timestamp: new Date(),
        fileUrl,
        fileType: file.type,
        fileName: file.name,
      }

      setMessages((prev) => [...prev, fileMessage])

      // Simulate bot response to the file
      const thinkingMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: "Analyzing your file...",
        sender: "bot",
        timestamp: new Date(),
        isThinking: true,
      }

      setMessages((prev) => [...prev, thinkingMessage])

      // Get response from the parent component
      const botResponse = await onSendMessage("", {
        url: fileUrl,
        type: file.type,
        name: file.name,
      })

      // Translate if needed
      const translatedContent =
        userSettings.language !== "en" ? await translateText(botResponse, userSettings.language) : undefined

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === thinkingMessage.id
            ? {
                ...msg,
                content: botResponse,
                translatedContent,
                isThinking: false,
              }
            : msg,
        ),
      )

      return fileUrl
    } catch (error) {
      console.error("Error uploading file:", error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col h-full" ref={chatContainerRef}>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isDemoMode && (
          <Alert className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Demo mode active. Responses are simulated and not from the actual AI model.
            </AlertDescription>
          </Alert>
        )}

        {apiKeyError && !isDemoMode && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiKeyError}</AlertDescription>
          </Alert>
        )}

        {messages.map((msg, index) => (
          <Message key={msg.id} message={msg} isLast={index === messages.length - 1} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t bg-card/80 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          {textareaError && (
            <Alert variant="destructive" className="py-2 mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{textareaError}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 items-end">
            {isUploading ? (
              <div className="flex-1 flex items-center justify-center h-10">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Uploading file...</span>
              </div>
            ) : (
              <>
                <FileUpload onFileUpload={handleFileUpload} onCancel={() => setIsUploading(false)} />

                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder={isDemoMode ? "Type a message (demo mode)" : "Type a message..."}
                    className=" min-h-10  max-h-[150px] resize-none pr-96 pl-96 mr-96 focus-visible:ring-1"
                    disabled={isProcessing || isUploading}
                    rows={1}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!message.trim() || isProcessing || isUploading || (!!apiKeyError && !isDemoMode)}
                    className="h-8 w-8 absolute right-2 bottom-1 rounded-full"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Press Enter to send, Shift+Enter for new line
            {isDemoMode && " • Demo mode active"}
          </p>
        </form>
      </div>
    </div>
  )
}

