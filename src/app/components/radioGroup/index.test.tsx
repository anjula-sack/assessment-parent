import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RadioGroup from './index'

describe('RadioGroup component', () => {
  const options = [
    { label: 'Option A', value: 'a', audio: 'audioA.mp3' },
    { label: 'Option B', value: 'b' },
  ]

  it('renders options and highlights selected', () => {
    const onChange = jest.fn()
    render(<RadioGroup options={options} selected="b" onChange={onChange} />)
    const radioA = screen.getByRole('radio', { name: 'Option A' })
    const radioB = screen.getByRole('radio', { name: 'Option B' })
    expect(radioB).toBeChecked()
    expect(radioA).not.toBeChecked()
  })

  it('calls onChange when an option is selected', async () => {
    const onChange = jest.fn()
    render(<RadioGroup options={options} selected="b" onChange={onChange} />)
    const radioA = screen.getByRole('radio', { name: 'Option A' })
    fireEvent.click(radioA)
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('plays audio when clicking on an option with audio', async () => {
    const playMock = jest.fn()
    // @ts-ignore
    global.Audio = jest.fn().mockImplementation(() => ({ play: playMock }))
    const onChange = jest.fn()
    render(<RadioGroup options={options} selected="b" onChange={onChange} />)

    // Click on the option with audio
    const optionA = screen.getByText('Option A').closest('label')
    fireEvent.click(optionA!)

    expect(global.Audio).toHaveBeenCalledWith('audioA.mp3')
    expect(playMock).toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('does not play audio when clicking on an option without audio', async () => {
    const playMock = jest.fn()
    // @ts-ignore
    global.Audio = jest.fn().mockImplementation(() => ({ play: playMock }))
    const onChange = jest.fn()
    render(<RadioGroup options={options} selected="a" onChange={onChange} />)

    // Click on the option without audio
    const optionB = screen.getByText('Option B').closest('label')
    fireEvent.click(optionB!)

    expect(global.Audio).not.toHaveBeenCalled()
    expect(playMock).not.toHaveBeenCalled()
    expect(onChange).toHaveBeenCalledWith('b')
  })
})
