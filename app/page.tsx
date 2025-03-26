"use client"

import { useState, useEffect } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import Header from "@/components/header"
import SettingsPanel from "@/components/settings-panel"
import ChatInterface from "@/components/chat-interface"
import BackgroundScene from "@/components/background-scene"
import ProfileModal from "@/components/profile-modal"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserSettings } from "@/types"

export default function Home() {
  // State
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [userSettings, setUserSettings] = useState<UserSettings>({
    country: "US",
    language: "en",
    currency: "USD",
  })
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  // API Key from .env.local
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  // Check API key on mount
  useEffect(() => {
    if (!API_KEY) {
      setApiKeyError("Gemini API key is missing. Please add it to your environment variables.")
      return
    }

    // Clear any previous errors
    setApiKeyError(null)

    // Test the API key with a simple request
    const testApiKey = async () => {
      try {
        const genAI = new GoogleGenerativeAI(API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        // Simple test prompt
        await model.generateContent({
          contents: [{ role: "user", parts: [{ text: "Hello" }] }],
        })

        // If we get here, the API key is working
        setApiKeyError(null)
        setIsDemoMode(false)
      } catch (error) {
        console.error("API Key validation error:", error)

        // Check if it's an expired key error
        if (error.message?.includes("API key expired")) {
          setApiKeyError("Your Gemini API key has expired. Please renew it at https://aistudio.google.com/app/apikey")
        } else if (error.message?.includes("API_KEY_INVALID")) {
          setApiKeyError("Invalid Gemini API key. Please check your key and try again.")
        } else {
          setApiKeyError("Error connecting to Gemini API. Please check your internet connection and try again.")
        }
      }
    }

    testApiKey()
  }, [API_KEY])

  // Function to enable demo mode
  const enableDemoMode = () => {
    setIsDemoMode(true)
  }

  // Function to send message to Gemini API or use demo mode
  const sendMessage = async (content: string, file?: { url: string; type: string; name: string }) => {
    // If in demo mode, return a mock response
    if (isDemoMode) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate a mock response based on the message content
      if (content.toLowerCase().includes("hello") || content.toLowerCase().includes("hi")) {
        return "Hello! I'm running in demo mode because your API key has expired. How can I assist you today?"
      } else if (content.toLowerCase().includes("weather")) {
        return "I'm in demo mode, so I can't check the actual weather. In a fully functional mode, I would provide real-time weather information."
      } else if (content.toLowerCase().includes("help")) {
        return "I'm currently running in demo mode due to an expired API key. To get full functionality, please renew your Gemini API key at https://aistudio.google.com/app/apikey"
      } else if (file) {
        return `I'm in demo mode, so I can't actually analyze your file "${file.name}". In full mode, I would process and analyze the contents of your file.`
      } else {
        return `I'm currently in demo mode due to an expired API key. Your message was: "${content}". To get full functionality with real AI responses, please renew your API key.`
      }
    }

    // If not in demo mode, use the actual API
    if (!API_KEY) {
      throw new Error("Gemini API key is missing")
    }

    try {
      const genAI = new GoogleGenerativeAI(API_KEY)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      // Include information about user settings in the prompt
      const contextPrompt = `
        User settings:
        - Country: ${userSettings.country}
        - Language: ${userSettings.language}
        - Currency: ${userSettings.currency}
        
        Please respond appropriately based on these settings. If the user asks about changing these settings, acknowledge the request.
        
        User message: ${content}
      `

      // Generate response
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: contextPrompt }] }],
      })

      const response = await result.response
      return response.text()
    } catch (error) {
      console.error("Gemini API Error:", error)

      // Check if it's an expired key error during runtime
      if (error.message?.includes("API key expired")) {
        setApiKeyError("Your Gemini API key has expired. Please renew it at https://aistudio.google.com/app/apikey")
        // Automatically switch to demo mode
        setIsDemoMode(true)
        return "I've detected that your API key has expired. I've switched to demo mode so you can continue using the app. Please renew your API key for full functionality."
      }

      throw error
    }
  }

  return (
    <div className="flex flex-col h-screen dark-3d-gradient">
      {/* 3D Background */}
      <BackgroundScene />

      {/* Header */}
      <Header
        userSettings={userSettings}
        onSettingsClick={() => setSettingsOpen(true)}
        onProfileClick={() => setProfileOpen(true)}
        isDemoMode={isDemoMode}
      />

      {/* Settings Panel */}
      <SettingsPanel
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        userSettings={userSettings}
        onSettingsChange={setUserSettings}
      />

      {/* Profile Modal */}
      <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} />

      {/* Main Content */}
      <main className="flex-1 container py-4 overflow-hidden">
        {apiKeyError && !isDemoMode && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>API Key Error</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>{apiKeyError}</p>
              <Button variant="outline" size="sm" className="self-start mt-2" onClick={enableDemoMode}>
                Continue in Demo Mode
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isDemoMode && (
          <Alert className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/20">
            <Info className="h-4 w-4" />
            <AlertTitle>Demo Mode Active</AlertTitle>
            <AlertDescription>
              You're using the app in demo mode with simulated AI responses. To get full functionality, please renew
              your Gemini API key at{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Google AI Studio
              </a>
              .
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-card/40 backdrop-blur-md rounded-lg border shadow-lg h-full overflow-hidden">
          <ChatInterface
            userSettings={userSettings}
            onSendMessage={sendMessage}
            apiKeyError={isDemoMode ? null : apiKeyError}
            isDemoMode={isDemoMode}
          />
        </div>
      </main>
    </div>
  )
}

