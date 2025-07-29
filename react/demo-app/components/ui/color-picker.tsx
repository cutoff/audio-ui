"use client"

import React from "react"
import { Label } from "./label"
import { Input } from "./input"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  label?: string
  id?: string
}

export function ColorPicker({
  value,
  onChange,
  label = "Color",
  id = "colorPicker"
}: ColorPickerProps) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>{label}</Label>
        <div 
          className="w-6 h-6 rounded-full border border-gray-300" 
          style={{ backgroundColor: value }}
        />
      </div>
      <div className="flex gap-2">
        <Input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-8 p-0 cursor-pointer"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}
