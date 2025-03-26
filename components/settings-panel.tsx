"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { UserSettings } from "@/types"
import {
  countries,
  languages,
  currencies,
  getDefaultCurrencyForCountry,
  getDefaultLanguageForCountry,
} from "@/lib/data"

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userSettings: UserSettings
  onSettingsChange: (settings: UserSettings) => void
}

export default function SettingsPanel({ open, onOpenChange, userSettings, onSettingsChange }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(userSettings)

  // Reset local settings when panel opens
  useEffect(() => {
    if (open) {
      setLocalSettings(userSettings)
    }
  }, [open, userSettings])

  // Handle country change
  const handleCountryChange = (countryCode: string) => {
    const defaultLanguage = getDefaultLanguageForCountry(countryCode)
    const defaultCurrency = getDefaultCurrencyForCountry(countryCode)

    setLocalSettings({
      country: countryCode,
      language: defaultLanguage.code,
      currency: defaultCurrency.code,
    })
  }

  // Handle save
  const handleSave = () => {
    onSettingsChange(localSettings)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Configure your preferences for the Global Assistant Chatbot.</SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          <div className="grid gap-3">
            <Label htmlFor="country">Country</Label>
            <Select value={localSettings.country} onValueChange={handleCountryChange}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    <div className="flex items-center gap-2">
                      <span>{country.flag}</span>
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="language">Language</Label>
            <Select
              value={localSettings.language}
              onValueChange={(value) => setLocalSettings({ ...localSettings, language: value })}
            >
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    <div className="flex items-center gap-2">
                      <span>{language.name}</span>
                      <span className="text-muted-foreground text-xs">({language.nativeName})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="currency">Currency</Label>
            <Select
              value={localSettings.currency}
              onValueChange={(value) => setLocalSettings({ ...localSettings, currency: value })}
            >
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <span>{currency.symbol}</span>
                      <span>{currency.name}</span>
                      <span className="text-muted-foreground text-xs">({currency.code})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

