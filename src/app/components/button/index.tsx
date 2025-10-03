import React, { ReactNode } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

const Button = ({ children, disabled, ...props }: ButtonProps) => {
  return (
    <button
      disabled={disabled}
      className={`button m-4 w-32 h-10 ${
        disabled ? 'bg-gray-400' : 'bg-primary-700 '
      }  cursor-pointer select-none rounded-full`}
      {...props}
    >
      <span className="flex flex-col justify-center items-center h-full text-white font-medium text-lg ">
        {children}
      </span>
    </button>
  )
}

export default Button
