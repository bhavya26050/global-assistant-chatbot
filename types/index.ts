export interface Message {
  id: string
  content: string
  translatedContent?: string
  sender: "user" | "bot"
  timestamp: Date
  isThinking?: boolean
  fileUrl?: string
  fileType?: string
  fileName?: string
}

export interface UserSettings {
  country: string
  language: string
  currency: string
}

export interface Country {
  code: string
  name: string
  flag: string
}

export interface Language {
  code: string
  name: string
  nativeName: string
}

export interface Currency {
  code: string
  name: string
  symbol: string
}

export interface FileUpload {
  file: File
  preview: string
  progress: number
  uploaded: boolean
  error?: string
}

