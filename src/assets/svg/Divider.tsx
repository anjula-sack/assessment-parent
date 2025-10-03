import React from 'react'

const Divider = ({ rotate }: { rotate?: boolean }) => {
  return (
    <>
      {rotate ? (
        <svg
          width="2"
          height="100%"
          viewBox="0 0 2 100%"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 692L1.00003 0"
            stroke="#96B2E2"
            strokeWidth="2"
            strokeDasharray="10, 10"
          />
        </svg>
      ) : (
        <svg
          width="100%"
          height="2"
          viewBox="0 0 100% 2"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1900 1L-1.5974e-05 1"
            stroke="#96B2E2"
            strokeWidth="2"
            strokeDasharray="10, 10"
          />
        </svg>
      )}
    </>
  )
}

export default Divider
