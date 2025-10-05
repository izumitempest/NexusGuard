"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadProps {
  onUploadComplete: () => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("source_ip", "192.168.1.100")

      const response = await fetch("/api/detect", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Threat Detected",
          description: `${result.data.detection.threat_type.toUpperCase()} - ${result.data.detection.severity} severity (${result.data.detection.confidence}% confidence)`,
        })
        onUploadComplete()
      } else {
        toast({
          title: "Detection Failed",
          description: result.error || "Failed to analyze file",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Upload Error",
        description: "Failed to upload file for analysis",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      e.target.value = ""
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan File</CardTitle>
        <CardDescription>Upload a file for threat detection analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 p-12 transition-colors hover:border-primary/50 hover:bg-muted">
          <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-sm font-medium text-foreground">Upload file to scan</p>
          <p className="mb-4 text-xs text-muted-foreground">Supports executables, scripts, and binary files</p>
          <label htmlFor="file-upload">
            <Button disabled={isUploading} asChild>
              <span>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Select File
                  </>
                )}
              </span>
            </Button>
          </label>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
        </div>
      </CardContent>
    </Card>
  )
}
