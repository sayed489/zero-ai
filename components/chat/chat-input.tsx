'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Mic, MicOff, X, Image, Code, Lightbulb, Search, Zap, Download, Brain, Eye, ArrowUp, Flame, FileText, Paperclip } from 'lucide-react'
import { ModelSelector, VoiceIndicator } from '@/components/chat/model-selector'
import { useVoice } from '@/hooks/useVoice'
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
  'analyze-image': <Eye className="h-4 w-4" />,
  'analyze-file': <FileText className="h-4 w-4" />,
  'roast': <Flame className="h-4 w-4 text-orange-500" />,
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
  const [extendedThinking, setExtendedThinking] = useState(false)
  const [showSkills, setShowSkills] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [attachedFile, setAttachedFile] = useState<{name: string, content: string} | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)
  const voice = useVoice()

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const scrollHeight = Math.min(textarea.scrollHeight, 180)
      textarea.style.height = `${Math.max(scrollHeight, 52)}px`
    }
  }, [value])

  // Fill textarea with voice transcript
  useEffect(() => {
    if (voice.transcript) {
      setValue(voice.transcript)
    }
  }, [voice.transcript])

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
    if ((!value.trim() && !attachedFile) || isLoading) return
    
    let finalContent = value.trim()
    if (attachedFile) {
       finalContent = `[Attached File: ${attachedFile.name}]\n\n\`\`\`\n${attachedFile.content}\n\`\`\`\n\nUser Question/Instruction: ${finalContent}`
    }
    
    onSend(finalContent, selectedSkill?.id)
    setValue('')
    setSelectedSkill(null)
    setAttachedFile(null)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0]
     if (!file) return
     
     const reader = new FileReader()
     reader.onload = async (e) => {
        const text = e.target?.result as string
        setAttachedFile({ name: file.name, content: text })
     }
     reader.readAsText(file)
     
     // Reset file input so the same file can be selected again later
     if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const toggleVoice = () => {
    if (voice.isListening) {
      voice.stopListening()
    } else {
      voice.startListening()
    }
  }

  const handleSkillSelect = (skill: Skill) => {
    setSelectedSkill(skill)
    setShowSkills(false)
    textareaRef.current?.focus()
  }

  const isWelcome = variant === 'welcome'
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
      {/* Top Indicators Row */}
      <div className="flex flex-wrap gap-2 px-4 pt-3 empty:hidden">
        {selectedSkill && (
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
        )}
        
        {attachedFile && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-500 border border-emerald-500/20">
            <FileText className="h-3.5 w-3.5" />
            <span className="max-w-[120px] truncate">{attachedFile.name}</span>
            <button
              onClick={() => setAttachedFile(null)}
              className="ml-1 rounded-full p-0.5 hover:bg-emerald-500/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        )}
      </div>

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
            'w-full resize-none bg-transparent text-base text-text-1 placeholder:text-text-3 focus:outline-none pr-12',
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
          {/* Hidden File Input */}
          <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleFileChange} 
             className="hidden" 
             accept=".txt,.md,.js,.ts,.jsx,.tsx,.py,.csv,.json,.html,.css"
          />

          {/* Add file button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg p-2 transition-colors text-text-3 hover:bg-bg-3 hover:text-text-2 group relative"
            aria-label="Upload file"
          >
            <Paperclip className="h-5 w-5" />
          </button>

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
            <div className="absolute bottom-full left-0 mb-2 w-64 overflow-hidden rounded-xl border border-border bg-bg-1 shadow-xl z-50">
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
          {voice.voiceSupported && (
            <button
              onClick={toggleVoice}
              className={cn(
                'flex items-center justify-center rounded-lg p-2 transition-colors',
                voice.isListening
                  ? 'bg-red-500/10 text-red-500'
                  : 'text-text-3 hover:bg-bg-3 hover:text-text-2'
              )}
              aria-label={voice.isListening ? 'Stop listening' : 'Start voice input'}
            >
              {voice.isListening ? (
                <VoiceIndicator isActive />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          )}

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={(!value.trim() && !attachedFile) || isLoading}
            className={cn(
              'ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-all',
              (!value.trim() && !attachedFile) || isLoading
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
