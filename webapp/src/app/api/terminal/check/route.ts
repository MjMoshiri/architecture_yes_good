import { NextResponse } from 'next/server'
import { spawn } from 'child_process'

export async function GET() {
  try {
    const ttydAvailable = await checkTtydAvailable()
    
    return NextResponse.json({
      ttydAvailable,
      installInstructions: ttydAvailable ? null : {
        macOS: 'brew install ttyd',
        ubuntu: 'sudo apt-get install ttyd',
        arch: 'sudo pacman -S ttyd',
        manual: 'Visit https://github.com/tsl0922/ttyd for manual installation'
      }
    })
  } catch {
    return NextResponse.json(
      { 
        error: 'Failed to check ttyd availability',
        ttydAvailable: false
      },
      { status: 500 }
    )
  }
}

function checkTtydAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    const which = spawn('which', ['ttyd'])
    
    which.on('close', (code) => {
      resolve(code === 0)
    })
    
    which.on('error', () => {
      resolve(false)
    })
  })
}