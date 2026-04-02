'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Mic, X, Image, Code, Lightbulb, Search, Zap, Download, Brain, Eye, ArrowUp } from 'lucide-react'
import { ModelSelector, VoiceIndicator } from '@/components/chat/model-selector'
import { cn } from '@/lib/utils'
import type { AIModel, Skill } from '@/lib/types'
import { SKILLS } from '@/lib/types'

interface ChatInputProps {
  selectedModel: AIModel
  onModelChange: (model: AIModel) => void
  onSend: (content: string, skill?: string) => void
  isLoading: boolean
  placeholder?: string
  variant?: 'default' | 'welcome'
}

const skillIcons: Record<string, React.ReactNode> = {
  'image-gen': <Image className="h-4 w-4" />,
  'app-factory': <Code className="h-4 w-4" />,
  'brainstorm': <Lightbulb className="h-4 w-4" />,
  'web-search': <Search className="h-4 w-4" />,
  'code-exec': <Zap className="h-4 w-4" />,
  'memory-export': <Download className="h-4 w-4" />,
  'memory-add': <Brain className="h-4 w-4" />,
  'analyze-image': <Eye className="h-4 w-4" />
}

export function ChatInput({
  selectedModel,
  onModelChange,
  onSend,
  isLoading,
  placeholder = 'Reply...',
  variant = 'default'
}: ChatInputProps) {
  const [value, setValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [extendedThinking, setExtendedThinking] = useState(false)
  const [showSkills, setShowSkills] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const skillsRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = Math.min(textarea.scrollHeight, 180)
      textarea.style.height = `${Math.max(scrollHeight, 52)}px`
    }
  }, [value])

  // Close skills on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (skillsRef.current && !skillsRef.current.contains(e.target as Node)) {
        setShowSkills(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = () => {
    if (!value.trim() || isLoading) return
    onSend(value.trim(), selectedSkill?.id)
    setValue('')
    setSelectedSkill(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported in your browser. Use Chrome or Edge.')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = false // Stop after one sentence like ChatGPT
    recognition.interimResults = true
    recognition.lang = 'en-US'

    let finalTranscript = ''

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript = transcript
        }
      }
      // Show live transcript in textarea
      setValue(finalTranscript + interimTranscript)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      // Auto-send when speech stops, like ChatGPT/Gemini
      if (finalTranscript.trim()) {
        setValue(finalTranscript.trim())
        // Small delay so the user sees the final text before it sends
        setTimeout(() => {
          onSend(finalTranscript.trim(), selectedSkill?.id)
          setValue('')
          setSelectedSkill(null)
        }, 300)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill)
    setShowSkills(false)
    textareaRef.current?.focus()
  }

  const isWelcome = variant === 'welcome'

  // Group skills by category
  const createSkills = SKILLS.filter(s => s.category === 'create')
  const toolSkills = SKILLS.filter(s => s.category === 'tools')
  const memorySkills = SKILLS.filter(s => s.category === 'memory')

  return (
    <div className={cn(
      'relative transition-colors',
      isWelcome 
        ? 'rounded-xl border-2 border-dashed border-border focus-within:border-zero-300/50' 
        : 'rounded-2xl border border-border bg-bg-2 focus-within:border-zero-300/50'
    )}>
      {/* Selected skill indicator */}
      {selectedSkill && (
        <div className="flex items-center gap-2 px-4 pt-3">
          <span className="flex items-center gap-1.5 rounded-full bg-zero-300/20 px-2.5 py-1 text-xs font-medium text-zero-300">
            {skillIcons[selectedSkill.id]}
            {selectedSkill.name}
            <button
              onClick={() => setSelectedSkill(null)}
              className="ml-1 rounded-full p-0.5 hover:bg-zero-300/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}

      {/* Textarea */}
      <div className={cn(
        'px-4',
        isWelcome ? 'pt-4' : selectedSkill ? 'pt-2' : 'pt-3'
      )}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedSkill ? `${selectedSkill.description}...` : placeholder}
          rows={1}
          className={cn(
            'w-full resize-none bg-transparent text-base text-text-1 placeholder:text-text-3 focus:outline-none pr-12 line-height-1.5',
            isWelcome && 'text-lg'
          )}
          style={{
            minHeight: '52px',
            lineHeight: '1.5',
          }}
          disabled={isLoading}
        />
      </div>

      {/* Bottom row */}
      <div className={cn(
        'flex items-center justify-between px-3 pb-3',
        isWelcome ? 'pt-4' : 'pt-2'
      )}>
        <div className="relative flex items-center gap-1" ref={skillsRef}>
          {/* Add skill button */}
          <button
            onClick={() => setShowSkills(!showSkills)}
            className={cn(
              'rounded-lg p-2 transition-colors',
              showSkills 
                ? 'bg-zero-300/20 text-zero-300' 
                : 'text-text-3 hover:bg-bg-3 hover:text-text-2'
            )}
            aria-label="Add skill"
          >
            <Plus className="h-5 w-5" />
          </button>

          {/* Skills dropdown */}
          {showSkills && (
            <div className="absolute bottom-full left-0 mb-2 w-64 overflow-hidden rounded-xl border border-border bg-bg-1 shadow-xl">
              <div className="p-2">
                <p className="px-2 py-1.5 text-xs font-medium text-text-3">Create</p>
                {createSkills.map((skill) => (
                  <SkillItem key={skill.id} skill={skill} icon={skillIcons[skill.id]} onSelect={handleSkillSelect} />
                ))}
                
                <div className="my-1 h-px bg-border" />
                <p className="px-2 py-1.5 text-xs font-medium text-text-3">Tools</p>
                {toolSkills.map((skill) => (
                  <SkillItem key={skill.id} skill={skill} icon={skillIcons[skill.id]} onSelect={handleSkillSelect} />
                ))}
                
                <div className="my-1 h-px bg-border" />
                <p className="px-2 py-1.5 text-xs font-medium text-text-3">Memory</p>
                {memorySkills.map((skill) => (
                  <SkillItem key={skill.id} skill={skill} icon={skillIcons[skill.id]} onSelect={handleSkillSelect} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Model selector */}
          <ModelSelector
            selected={selectedModel}
            onChange={onModelChange}
            extendedThinking={extendedThinking}
            onExtendedThinkingChange={setExtendedThinking}
          />

          {/* Voice input */}
          <button
            onClick={toggleVoiceInput}
            className={cn(
              'flex items-center justify-center rounded-lg p-2 transition-colors',
              isListening
                ? 'bg-red-500/10 text-red-500'
                : 'text-text-3 hover:bg-bg-3 hover:text-text-2'
            )}
            aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? (
              <VoiceIndicator isActive />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className={cn(
              'ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-all',
              !value.trim() || isLoading
                ? 'bg-bg-3 text-text-3 opacity-50 cursor-not-allowed'
                : 'bg-zero-300 text-white hover:bg-zero-400 shadow-lg hover:shadow-xl'
            )}
            aria-label="Send message"
            title="Send (Enter)"
          >
            <ArrowUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function SkillItem({ 
  skill, 
  icon, 
  onSelect 
}: { 
  skill: Skill
  icon: React.ReactNode
  onSelect: (skill: Skill) => void 
}) {
  return (
    <button
      onClick={() => onSelect(skill)}
      className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-bg-2"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-3 text-text-2">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-1">{skill.name}</p>
        <p className="text-xs text-text-3 truncate">{skill.description}</p>
      </div>
    </button>
  )
}
