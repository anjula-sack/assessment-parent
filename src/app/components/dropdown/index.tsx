import React, { useEffect, useRef, useState } from 'react'
import { Option } from '@/types'

const Dropdown = ({
  options,
  onSelect,
  currentOption,
  color,
}: {
  options: Option[]
  onSelect: (option: Option) => void
  currentOption: Option
  color?: string
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<Option | null>(
    currentOption,
  )
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (option: Option) => {
    setSelectedOption(option)
    onSelect(option)
    setIsOpen(false)
  }

  return (
    <div
      className="relative inline-block rounded-2xl w-full z-10"
      ref={dropdownRef}
    >
      <div>
        <button
          type="button"
          className="inline-flex items-center justify-between w-full px-4 py-2 font-medium text-primary-900 bg-primary-100 border-2 border-primary-900 rounded-2xl shadow-sm hover:bg-primary-100 focus:outline-none focus:ring focus:border-blue-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedOption ? selectedOption.label : 'Select an option'}
          <svg
            width="20"
            height="17"
            viewBox="0 0 20 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5981 15.5C11.4434 17.5 8.55662 17.5 7.40192 15.5L1.33975 5C0.185044 3 1.62842 0.500002 3.93782 0.500002L16.0622 0.500001C18.3716 0.5 19.815 3 18.6603 5L12.5981 15.5Z"
              fill={`${color ?? '#DD3B96'}`}
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute mt-2 rounded-2xl shadow-lg bg-primary-100 w-full">
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                className="block px-4 py-2 text-primary-900 font-medium hover:bg-gray-100 w-full text-left rounded-2xl"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dropdown
