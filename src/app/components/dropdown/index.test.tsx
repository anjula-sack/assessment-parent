import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Dropdown from './index'

describe('Dropdown component', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ]
  let onSelect: jest.Mock

  beforeEach(() => {
    onSelect = jest.fn()
  })

  it('renders the current option label', () => {
    render(
      <Dropdown
        options={options}
        onSelect={onSelect}
        currentOption={options[0]}
      />,
    )
    expect(screen.getByRole('button')).toHaveTextContent('Option 1')
  })

  it('toggles the menu when button is clicked', () => {
    render(
      <Dropdown
        options={options}
        onSelect={onSelect}
        currentOption={options[0]}
      />,
    )
    const toggle = screen.getByRole('button')
    // Open menu
    fireEvent.click(toggle)
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    // Close menu
    fireEvent.click(toggle)
    expect(screen.queryByText('Option 2')).toBeNull()
  })

  it('calls onSelect and updates label when an option is clicked', () => {
    render(
      <Dropdown
        options={options}
        onSelect={onSelect}
        currentOption={options[0]}
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    const optionBtn = screen.getByText('Option 2')
    fireEvent.click(optionBtn)
    expect(onSelect).toHaveBeenCalledWith(options[1])
    // After selection, menu should be closed and button label updated
    expect(screen.queryByText('Option 1')).toBeNull()
    expect(screen.getByRole('button')).toHaveTextContent('Option 2')
  })

  it('closes the menu when clicking outside', () => {
    render(
      <Dropdown
        options={options}
        onSelect={onSelect}
        currentOption={options[0]}
      />,
    )
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText('Option 2')).toBeInTheDocument()
    fireEvent.mouseDown(document)
    expect(screen.queryByText('Option 2')).toBeNull()
  })

  it('uses default color when no color prop is provided', () => {
    const { container } = render(
      <Dropdown
        options={options}
        onSelect={onSelect}
        currentOption={options[0]}
      />,
    )
    const path = container.querySelector('path')
    expect(path).toHaveAttribute('fill', '#DD3B96')
  })

  it('uses provided color prop for the SVG path', () => {
    const { container } = render(
      <Dropdown
        options={options}
        onSelect={onSelect}
        currentOption={options[0]}
        color="#123456"
      />,
    )
    const path = container.querySelector('path')
    expect(path).toHaveAttribute('fill', '#123456')
  })
})
