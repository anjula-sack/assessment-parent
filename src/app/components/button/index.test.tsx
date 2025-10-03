import React from 'react'
import { render } from '@testing-library/react'
import Button from './index'

describe('Button component', () => {
  it('should show the correct text on the button', () => {
    const { getByText } = render(
      <Button>
        <>Click me</>
      </Button>,
    )
    expect(getByText('Click me')).toBeInTheDocument()
  })
})
