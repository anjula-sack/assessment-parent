export interface Option {
  label: string
  value: string
}

export type UnderstandingAnswer =
  | 'Never'
  | 'Sometimes'
  | 'Most of the time'
  | 'Almost always'

export interface UnderstandingQuestion {
  id: string
  question: string
  answer: UnderstandingAnswer | ''
}

export const UNDERSTANDING_QUESTIONS = [
  {
    id: 'q1',
    question:
      'Does your child tell you how they or others feel using words? (e.g., Says "I\'m scared," "I feel happy," or " you look angry")',
  },
  {
    id: 'q2',
    question:
      'Does your child say what they like or don\'t like in a clear way? (e.g., "I want to rest," "I don\'t like loud noise")',
  },
  {
    id: 'q3',
    question:
      "Does your child keep trying and finish tasks, even when they're hard? (e.g., Finishes a puzzle or keeps working after making a mistake)",
  },
  {
    id: 'q4',
    question:
      'Does your child ask an adult or friend for help when they are stuck or upset? (e.g., Says "Can you help me?" or "I need help")',
  },
  {
    id: 'q5',
    question:
      'Does your child notice when someone is upset and respond in a kind way? (e.g., Asks "Are you okay?" or gives a hug)',
  },
  {
    id: 'q6',
    question:
      'Does your child try to make someone feel better when they are sad or hurt? (e.g., Offers a hug, talks to them, or sits beside them)',
  },
  {
    id: 'q7',
    question:
      'Can your child fix problems with other children without needing an adult? (e.g., Takes turns, shares, or talks it out)',
  },
  {
    id: 'q8',
    question:
      'Does your child calm themselves down when they are upset or angry? (e.g., Takes deep breaths, walks away, or asks for help)',
  },
  {
    id: 'q9',
    question:
      'Does your child stop and think before acting when upset or excited? (e.g., Waits instead of yelling or grabbing something)',
  },
  {
    id: 'q10',
    question:
      'Does your child talk about things they\'re good at or want to improve? (e.g., "I\'m good at drawing," "I want to get better at reading")',
  },
  {
    id: 'q11',
    question:
      'Does your child talk about things they want to learn or get better at? (e.g., "I want to learn harder words")',
  },
] as const

export const UNDERSTANDING_ANSWERS: UnderstandingAnswer[] = [
  'Never',
  'Sometimes',
  'Most of the time',
  'Almost always',
]
