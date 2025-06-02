"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Send, Volume2, Bot, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

export function ChatInterface() {
  const [aiProvider, setAiProvider] = useState("auto")
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: {
      provider: aiProvider,
    },
  })

  const [isListening, setIsListening] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      recognitionInstance.continuous = false
      recognitionInstance.interimResults = false
      recognitionInstance.lang = "en-US"

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        handleInputChange({ target: { value: transcript } } as any)
      }

      recognitionInstance.onerror = () => {
        setIsListening(false)
        toast({
          title: "Voice recognition error",
          description: "Please try again or type your message.",
          variant: "destructive",
        })
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [handleInputChange, toast])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (error) {
      toast({
        title: "Chat Error",
        description: error.message || "Something went wrong with the AI chat.",
        variant: "destructive",
      })
    }
  }, [error, toast])

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      recognition.stop()
      setIsListening(false)
    } else {
      recognition.start()
      setIsListening(true)
    }
  }

  const speakMessage = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      speechSynthesis.speak(utterance)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "grok":
        return <Zap className="h-3 w-3" />
      case "openai":
        return <Bot className="h-3 w-3" />
      default:
        return <Bot className="h-3 w-3" />
    }
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">AI Assistant</h3>
          <Badge variant="outline" className="flex items-center gap-1">
            {getProviderIcon(aiProvider)}
            {aiProvider === "auto" ? "Auto" : aiProvider === "grok" ? "Grok" : "OpenAI"}
          </Badge>
        </div>
        <Select value={aiProvider} onValueChange={setAiProvider}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="grok">Grok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <p className="text-lg mb-2">👋 Hi! I'm MindMate, your personal AI assistant.</p>
            <p>Ask me anything about tasks, goals, coding, or just chat!</p>
            <div className="mt-4 text-sm text-gray-400">
              <p>Try asking: "Help me plan my day" or "Create a task for tomorrow"</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card
              className={`max-w-[80%] ${
                message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.role === "assistant" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakMessage(message.content)}
                      className="ml-2 h-6 w-6 p-0"
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-gray-100 dark:bg-gray-800">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500">MindMate is thinking...</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask MindMate anything..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleListening}
            className={isListening ? "bg-red-100 text-red-600" : ""}
            disabled={isLoading}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
