export const runtime = 'edge'

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute'

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python: { language: 'python', version: '3.10' },
  javascript: { language: 'javascript', version: '18.15' },
  typescript: { language: 'typescript', version: '5.0' },
  go: { language: 'go', version: '1.16' },
  rust: { language: 'rust', version: '1.68' },
  'c++': { language: 'c++', version: '10.2' },
  cpp: { language: 'c++', version: '10.2' },
  c: { language: 'c', version: '10.2' },
  java: { language: 'java', version: '15' },
  ruby: { language: 'ruby', version: '3.0' },
  php: { language: 'php', version: '8.2' },
}

export async function POST(req: Request) {
  try {
    const { language, code } = await req.json()

    if (!language || !code) {
      return Response.json(
        { error: 'Language and code are required' },
        { status: 400 }
      )
    }

    const langConfig = LANGUAGE_MAP[language.toLowerCase()]
    if (!langConfig) {
      return Response.json(
        { error: `Unsupported language: ${language}` },
        { status: 400 }
      )
    }

    const response = await fetch(PISTON_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [
          {
            name: `main.${getExtension(language)}`,
            content: code,
          },
        ],
        stdin: '',
        args: [],
        compile_timeout: 10000,
        run_timeout: 10000,
      }),
    })

    if (!response.ok) {
      return Response.json(
        { error: 'Code execution service unavailable' },
        { status: 503 }
      )
    }

    const result = await response.json()

    // Combine compile and run output
    let output = ''
    if (result.compile?.output) {
      output += result.compile.output
    }
    if (result.run?.output) {
      output += result.run.output
    }
    if (result.run?.stderr) {
      output += '\n' + result.run.stderr
    }

    return Response.json({
      output: output.trim() || 'No output',
      exitCode: result.run?.code ?? 0,
    })
  } catch (error) {
    console.error('Execute API error:', error)
    return Response.json(
      { error: 'Failed to execute code' },
      { status: 500 }
    )
  }
}

function getExtension(language: string): string {
  const extensions: Record<string, string> = {
    python: 'py',
    javascript: 'js',
    typescript: 'ts',
    go: 'go',
    rust: 'rs',
    'c++': 'cpp',
    cpp: 'cpp',
    c: 'c',
    java: 'java',
    ruby: 'rb',
    php: 'php',
  }
  return extensions[language.toLowerCase()] || 'txt'
}
