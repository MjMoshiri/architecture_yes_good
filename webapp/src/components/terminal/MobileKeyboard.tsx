'use client'

import { useState } from 'react'

interface MobileKeyboardProps {
  onInsertText: (text: string) => void
  onExecuteCommand: () => void
  isVisible: boolean
}

export default function MobileKeyboard({ 
  onInsertText, 
  onExecuteCommand, 
  isVisible 
}: MobileKeyboardProps) {
  const [activeTab, setActiveTab] = useState<'commands' | 'symbols'>('commands')

  const commonCommands = [
    'help', 'list', 'status', 'version', 'config',
    'init', 'add', 'remove', 'update', 'search'
  ]

  const commonSymbols = [
    '-', '--', '/', '\\', '|', '&', '>', '<',
    '(', ')', '[', ']', '{', '}', '"', "'"
  ]

  if (!isVisible) return null

  return (
    <div className="bg-gray-800 border-t border-gray-700">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-600">
        <button
          onClick={() => setActiveTab('commands')}
          className={`flex-1 py-2 text-xs font-medium ${
            activeTab === 'commands' 
              ? 'bg-gray-700 text-green-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Commands
        </button>
        <button
          onClick={() => setActiveTab('symbols')}
          className={`flex-1 py-2 text-xs font-medium ${
            activeTab === 'symbols' 
              ? 'bg-gray-700 text-green-400' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Symbols
        </button>
      </div>

      {/* Content */}
      <div className="p-2">
        {activeTab === 'commands' && (
          <div className="grid grid-cols-3 gap-2">
            {commonCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => onInsertText(cmd)}
                className="px-3 py-2 bg-gray-700 text-green-400 rounded text-xs hover:bg-gray-600 touch-target"
              >
                {cmd}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'symbols' && (
          <div className="grid grid-cols-4 gap-2">
            {commonSymbols.map((symbol) => (
              <button
                key={symbol}
                onClick={() => onInsertText(symbol)}
                className="px-3 py-2 bg-gray-700 text-green-400 rounded text-xs hover:bg-gray-600 touch-target text-center"
              >
                {symbol}
              </button>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-3 pt-2 border-t border-gray-600">
          <button
            onClick={() => onInsertText(' ')}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded text-xs hover:bg-gray-600 touch-target"
          >
            Space
          </button>
          <button
            onClick={onExecuteCommand}
            className="px-6 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 touch-target font-medium"
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  )
}