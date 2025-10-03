import React from 'react'

interface RadioGroupProps {
  options: { label: string; value: string; audio?: string }[]
  selected: string
  onChange: (value: string) => void
}

export default function RadioGroup({
  options,
  selected,
  onChange,
}: RadioGroupProps) {
  const handleOptionClick = (option: {
    label: string
    value: string
    audio?: string
  }) => {
    // Play audio if available
    if (option.audio) {
      new Audio(option.audio).play()
    }
    // Select the option
    onChange(option.value)
  }

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center space-x-2 cursor-pointer p-2 rounded ${
            selected === option.value
              ? 'font-semibold text-blue-700 bg-blue-50'
              : ''
          }`}
          onClick={() => handleOptionClick(option)}
        >
          <input
            type="radio"
            name="mcq"
            value={option.value}
            checked={selected === option.value}
            className="accent-blue-600"
          />
          <span className="flex-1">{option.label}</span>
        </label>
      ))}
    </div>
  )
}
