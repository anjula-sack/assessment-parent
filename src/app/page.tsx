'use client'
import Link from 'next/link'
import React, { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { createParentAssessment, updateScores } from '@/services/appwrite'
import LanguageDropdown from './components/languageDropdown'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParentQuestionnaire />
    </Suspense>
  )
}

const schools = ['School 1', 'School 2', 'School 3']

const grades = ['Grade 1']

const skillQuestionMap = {
  self_awareness: ['q1_feelings', 'q2_preferences'],
  social_management: ['q8_self_regulation', 'q9_impulse_control'],
  social_awareness: ['q5_empathy', 'q6_comforting'],
  relationship_skills: ['q7_problem_solving'],
  responsible_decision_making: ['q4_help_seeking', 'q9_impulse_control'],
  metacognition: [
    'q11_learning_goals',
    'q10_self_awareness',
    'q11_learning_goals',
  ],
  empathy: ['q6_comforting', 'q5_empathy', 'q7_problem_solving'],
  critical_thinking: [
    'q3_persistence',
    'q4_help_seeking',
    'q9_impulse_control',
  ],
}

function ParentQuestionnaire() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const testType = searchParams.get('testType') || 'PRE'
  const langParam = searchParams.get('lang')

  const [consentGiven, setConsentGiven] = useState(false)
  const [formData, setFormData] = useState({
    school: schools[0],
    grade: grades[0],
    // Section 1: Demographic details
    d1_relation: '',
    d2_age: '',
    d3_education: '',
    d4_occupation: '',
    d5_income: '',
    d6_childrenAtHome: '',
    d7_adultsAtHome: '',
    d8_languages: [],
    d9_readingFrequency: '',
    d10_screenActivities: [],
    d11_screenTime: '',
    // Section 2: Understanding your child
    q1_feelings: '',
    q2_preferences: '',
    q3_persistence: '',
    q4_help_seeking: '',
    q5_empathy: '',
    q6_comforting: '',
    q7_problem_solving: '',
    q8_self_regulation: '',
    q9_impulse_control: '',
    q10_self_awareness: '',
    q11_learning_goals: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Handle URL language parameter
  useEffect(() => {
    if (
      langParam &&
      ['en', 'ar'].includes(langParam) &&
      i18n.language !== langParam
    ) {
      i18n.changeLanguage(langParam)
    }
  }, [langParam, i18n])

  // Function to update URL with language parameter
  const updateUrlWithLanguage = (language: string) => {
    const currentParams = new URLSearchParams(searchParams.toString())
    currentParams.set('lang', language)
    const newUrl = `${window.location.pathname}?${currentParams.toString()}`
    router.replace(newUrl)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string,
  ) => {
    const { value, checked } = e.target
    setFormData((prev) => {
      const currentValues = prev[fieldName as keyof typeof prev] as string[]
      if (checked) {
        return {
          ...prev,
          [fieldName]: [...currentValues, value],
        }
      } else {
        return {
          ...prev,
          [fieldName]: currentValues.filter((item) => item !== value),
        }
      }
    })
  }

  const calculateSkillScore = (skill: string) => {
    const questionKeys =
      skillQuestionMap[skill as keyof typeof skillQuestionMap]
    if (!questionKeys) return 0

    const totalScore = questionKeys.reduce((sum, questionKey) => {
      const answer = formData[questionKey as keyof typeof formData] as string
      const score = parseInt(answer) || 0
      return sum + score
    }, 0)

    return questionKeys.length > 0 ? totalScore / questionKeys.length : 0
  }

  const calculateAllSkillScores = () => {
    const skillScores: Record<string, number> = {}

    Object.keys(skillQuestionMap).forEach((skill) => {
      skillScores[skill] = calculateSkillScore(skill)
    })

    return skillScores
  }

  const calculateTotalScore = () => {
    const questionKeys = Object.keys(formData).filter((key) =>
      key.startsWith('q'),
    )
    const totalScore = questionKeys.reduce((sum, key) => {
      const answer = formData[key as keyof typeof formData] as string
      const score = parseInt(answer) || 0
      return sum + score
    }, 0)

    return questionKeys.length > 0 ? totalScore / questionKeys.length : 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const skillScores = calculateAllSkillScores()
      const totalScore = calculateTotalScore()

      const data = {
        school: formData.school,
        grade: formData.grade,
        overallScore: totalScore / 8,
        skillScores: JSON.stringify(skillScores),
        demographics: JSON.stringify({
          d1_relation: formData.d1_relation,
          d2_age: formData.d2_age,
          d3_education: formData.d3_education,
          d4_occupation: formData.d4_occupation,
          d5_income: formData.d5_income,
          d6_childrenAtHome: formData.d6_childrenAtHome,
          d7_adultsAtHome: formData.d7_adultsAtHome,
          d8_languages: formData.d8_languages,
          d9_readingFrequency: formData.d9_readingFrequency,
          d10_screenActivities: formData.d10_screenActivities,
          d11_screenTime: formData.d11_screenTime,
        }),
        answers: JSON.stringify({
          q1_feelings: formData.q1_feelings,
          q2_preferences: formData.q2_preferences,
          q3_persistence: formData.q3_persistence,
          q4_help_seeking: formData.q4_help_seeking,
          q5_empathy: formData.q5_empathy,
          q6_comforting: formData.q6_comforting,
          q7_problem_solving: formData.q7_problem_solving,
          q8_self_regulation: formData.q8_self_regulation,
          q9_impulse_control: formData.q9_impulse_control,
          q10_self_awareness: formData.q10_self_awareness,
          q11_learning_goals: formData.q11_learning_goals,
        }),
        testType,
      }
      await createParentAssessment(data)
      await updateScores({
        skillScores,
        school: formData.school,
        grade: formData.grade,
        assessment: 'parent',
        testType,
        overallScore: totalScore / 8,
      })
      setIsSubmitted(true)
    } catch (err) {
      console.error(err)
      setError(t('parentQuestionnaire.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const understandingQuestions = [
    {
      key: 'q1_feelings',
      question: t('parentQuestionnaire.questions.q1'),
    },
    {
      key: 'q2_preferences',
      question: t('parentQuestionnaire.questions.q2'),
    },
    {
      key: 'q3_persistence',
      question: t('parentQuestionnaire.questions.q3'),
    },
    {
      key: 'q4_help_seeking',
      question: t('parentQuestionnaire.questions.q4'),
    },
    {
      key: 'q5_empathy',
      question: t('parentQuestionnaire.questions.q5'),
    },
    {
      key: 'q6_comforting',
      question: t('parentQuestionnaire.questions.q6'),
    },
    {
      key: 'q7_problem_solving',
      question: t('parentQuestionnaire.questions.q7'),
    },
    {
      key: 'q8_self_regulation',
      question: t('parentQuestionnaire.questions.q8'),
    },
    {
      key: 'q9_impulse_control',
      question: t('parentQuestionnaire.questions.q9'),
    },
    {
      key: 'q10_self_awareness',
      question: t('parentQuestionnaire.questions.q10'),
    },
    {
      key: 'q11_learning_goals',
      question: t('parentQuestionnaire.questions.q11'),
    },
  ]

  const answerOptions = {
    0: t('parentQuestionnaire.never'),
    1: t('parentQuestionnaire.sometimes'),
    2: t('parentQuestionnaire.mostOfTheTime'),
    3: t('parentQuestionnaire.almostAlways'),
  }

  const handleConsent = () => {
    setConsentGiven(true)
  }

  const ConsentScreen = () => (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-primary-400 w-full px-4">
        <div className="flex justify-between items-center w-full">
          <p className="text-md md:text-xl text-white font-semibold p-3">
            {t('consent.navbarTitle')}
          </p>
          <LanguageDropdown onLanguageChange={updateUrlWithLanguage} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-8">
        <div className="rounded-2xl p-6 md:p-8 w-full max-w-2xl ">
          {/* Greeting */}
          <h1 className="text-2xl md:text-3xl font-bold text-primary-700 text-center mb-6">
            {t('consent.greeting')}
          </h1>

          {/* Main Content */}
          <div className="space-y-4 text-gray-700 leading-relaxed">
            {/* Description */}
            <p
              className="text-base md:text-lg"
              dangerouslySetInnerHTML={{
                __html: t('consent.description').replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong>$1</strong>',
                ),
              }}
            />

            {/* Assessment Types */}
            <div className="ml-4 space-y-2">
              <p className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('consent.parentQuestionnaire').replace(
                      /\*\*(.*?)\*\*/g,
                      '<strong>$1</strong>',
                    ),
                  }}
                />
              </p>
              <p className="flex items-start">
                <span className="text-primary-600 mr-2">•</span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('consent.childQuestionnaire').replace(
                      /\*\*(.*?)\*\*/g,
                      '<strong>$1</strong>',
                    ),
                  }}
                />
              </p>
            </div>

            {/* Data Usage */}
            <div>
              <p className="font-semibold text-gray-800 mb-2">
                {t('consent.dataUsageTitle')}
              </p>
              <div className="ml-4 space-y-2">
                <p className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>{t('consent.dataUsage1')}</span>
                </p>
                <p className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>{t('consent.dataUsage2')}</span>
                </p>
              </div>
            </div>

            {/* Confidentiality */}
            <div>
              <p className="font-semibold text-gray-800 mb-2">
                {t('consent.confidentialityTitle')}
              </p>
              <div className="ml-4 space-y-2">
                <p className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t('consent.confidentiality1').replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong>$1</strong>',
                      ),
                    }}
                  />
                </p>
                <p className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>{t('consent.confidentiality2')}</span>
                </p>
              </div>
            </div>

            {/* Consent Instruction */}
            <p className="text-base md:text-lg pt-4 border-t border-gray-200">
              <span
                dangerouslySetInnerHTML={{
                  __html: t('consent.consentInstruction').replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong>$1</strong>',
                  ),
                }}
              />
            </p>
          </div>

          {/* Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleConsent}
              className="rounded-2xl bg-primary-700 px-8 py-3 font-medium text-white hover:from-primary-600 hover:to-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {t('consent.iUnderstand')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Show consent screen first, then questionnaire
  if (!consentGiven) {
    return <ConsentScreen />
  }

  return (
    <section>
      <title>{t('parentQuestionnaire.title')}</title>
      <div className="bg-primary-400 w-full px-4">
        <div className="flex justify-between items-center w-full">
          <p className="text-md md:text-xl text-white font-semibold p-3">
            {t('parentQuestionnaire.navbarTitle')}
          </p>
          <LanguageDropdown onLanguageChange={updateUrlWithLanguage} />
        </div>
      </div>
      <div className="mx-auto flex flex-col items-center justify-center px-4 md:px-6 py-4 md:py-8 text-gray-500 overflow-auto min-h-screen">
        {isSubmitted ? (
          <div className="bg-white rounded-2xl p-8 w-full max-w-md md:max-w-lg mt-4 text-center space-y-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-primary-700 mb-2">
              {t('parentQuestionnaire.thankYou')}
            </h2>
            <p className="text-gray-600 text-lg">
              {t('parentQuestionnaire.submissionSuccess')}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl p-4 w-full max-w-md md:max-w-lg mt-4 space-y-4 md:space-y-6"
          >
            <p className="text-center text-base font-semibold text-gray-700">
              {t('parentQuestionnaire.onlyParents')}
            </p>

            {/* School Dropdown */}
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-gray-700 font-semibold mb-2">
                {t('login.school')}
              </label>
              <select
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                required
              >
                <option value="" disabled>
                  {t('common.selectSchool')}
                </option>
                {schools.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>

            {/* Grade Dropdown */}
            <div className="bg-white rounded-2xl p-4">
              <label className="block text-gray-700 font-semibold mb-2">
                {t('login.grade')}
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                required
              >
                <option value="" disabled>
                  {t('common.selectGrade')}
                </option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Section 1: Demographic Details */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm flex items-center">
                {i18n.language === 'en' ? (
                  <div className="w-4 h-12 bg-primary-400 rounded-l-lg mr-2"></div>
                ) : (
                  <div className="w-4 h-12"></div>
                )}
                <h2 className="text-md font-semibold text-gray-700">
                  {t('parentQuestionnaire.section1')}
                </h2>
              </div>

              {/* Q1: Relation to child */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.q1')}
                </label>
                <select
                  name="d1_relation"
                  value={formData.d1_relation}
                  onChange={handleChange}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                  required
                >
                  <option value="">{t('parentQuestionnaire.choose')}</option>
                  <option value="father">
                    {t(
                      'parentQuestionnaire.demographicOptions.relation.father',
                    )}
                  </option>
                  <option value="mother">
                    {t(
                      'parentQuestionnaire.demographicOptions.relation.mother',
                    )}
                  </option>
                  <option value="grandparent">
                    {t(
                      'parentQuestionnaire.demographicOptions.relation.grandparent',
                    )}
                  </option>
                  <option value="other">
                    {t('parentQuestionnaire.demographicOptions.relation.other')}
                  </option>
                </select>
              </div>

              {/* Q2: Age */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.q2')}
                </label>
                <input
                  type="number"
                  name="d2_age"
                  value={formData.d2_age}
                  onChange={handleChange}
                  placeholder={t('parentQuestionnaire.yourAnswer')}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 placeholder-gray-400 font-medium"
                  max="100"
                  required
                />
              </div>

              {/* Q3: Education */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.q3')}
                </label>
                <select
                  name="d3_education"
                  value={formData.d3_education}
                  onChange={handleChange}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                  required
                >
                  <option value="">{t('parentQuestionnaire.choose')}</option>
                  <option value="none">
                    {t('parentQuestionnaire.demographicOptions.education.none')}
                  </option>
                  <option value="primary">
                    {t(
                      'parentQuestionnaire.demographicOptions.education.primary',
                    )}
                  </option>
                  <option value="middle">
                    {t(
                      'parentQuestionnaire.demographicOptions.education.middle',
                    )}
                  </option>
                  <option value="high">
                    {t('parentQuestionnaire.demographicOptions.education.high')}
                  </option>
                  <option value="bachelor">
                    {t(
                      'parentQuestionnaire.demographicOptions.education.bachelor',
                    )}
                  </option>
                  <option value="master">
                    {t(
                      'parentQuestionnaire.demographicOptions.education.master',
                    )}
                  </option>
                  <option value="doctorate">
                    {t(
                      'parentQuestionnaire.demographicOptions.education.doctorate',
                    )}
                  </option>
                </select>
              </div>

              {/* Q4: Occupation */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.q4')}
                </label>
                <select
                  name="d4_occupation"
                  value={formData.d4_occupation}
                  onChange={handleChange}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                  required
                >
                  <option value="">{t('parentQuestionnaire.choose')}</option>
                  <option value="professional">
                    {t(
                      'parentQuestionnaire.demographicOptions.occupation.professional',
                    )}
                  </option>
                  <option value="skilled">
                    {t(
                      'parentQuestionnaire.demographicOptions.occupation.skilled',
                    )}
                  </option>
                  <option value="unskilled">
                    {t(
                      'parentQuestionnaire.demographicOptions.occupation.unskilled',
                    )}
                  </option>
                  <option value="unemployed">
                    {t(
                      'parentQuestionnaire.demographicOptions.occupation.unemployed',
                    )}
                  </option>
                  <option value="other">
                    {t(
                      'parentQuestionnaire.demographicOptions.occupation.other',
                    )}
                  </option>
                </select>
              </div>

              {/* Q5: Income */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.q5')}
                </label>
                <select
                  name="d5_income"
                  value={formData.d5_income}
                  onChange={handleChange}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                  required
                >
                  <option value="">{t('parentQuestionnaire.choose')}</option>
                  <option value="less5000">
                    {t(
                      'parentQuestionnaire.demographicOptions.income.less5000',
                    )}
                  </option>
                  <option value="5000to9999">
                    {t(
                      'parentQuestionnaire.demographicOptions.income.5000to9999',
                    )}
                  </option>
                  <option value="10000to14999">
                    {t(
                      'parentQuestionnaire.demographicOptions.income.10000to14999',
                    )}
                  </option>
                  <option value="15000to19999">
                    {t(
                      'parentQuestionnaire.demographicOptions.income.15000to19999',
                    )}
                  </option>
                  <option value="20000to24999">
                    {t(
                      'parentQuestionnaire.demographicOptions.income.20000to24999',
                    )}
                  </option>
                  <option value="25000plus">
                    {t(
                      'parentQuestionnaire.demographicOptions.income.25000plus',
                    )}
                  </option>
                </select>
              </div>

              {/* Q6: Children at home */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.q6')}
                </label>
                <input
                  type="number"
                  name="d6_childrenAtHome"
                  value={formData.d6_childrenAtHome}
                  onChange={handleChange}
                  placeholder={t('parentQuestionnaire.yourAnswer')}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 placeholder-gray-400 font-medium"
                  min="0"
                  required
                />
              </div>

              {/* Q7: Adults at home */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.q7')}
                </label>
                <input
                  type="number"
                  name="d7_adultsAtHome"
                  value={formData.d7_adultsAtHome}
                  onChange={handleChange}
                  placeholder={t('parentQuestionnaire.yourAnswer')}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 placeholder-gray-400 font-medium"
                  min="1"
                  required
                />
              </div>

              {/* Q8: Languages spoken at home */}
              <div className="bg-white rounded-2xl p-4">
                <p className="text-gray-700 font-semibold mb-3">
                  {t('parentQuestionnaire.demographic.q8')}
                </p>
                <div className="space-y-2">
                  {Object.entries(
                    t('parentQuestionnaire.demographicOptions.languages', {
                      returnObjects: true,
                    }),
                  ).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        value={key}
                        checked={formData.d8_languages.includes(key)}
                        onChange={(e) =>
                          handleCheckboxChange(e, 'd8_languages')
                        }
                        className="mr-2"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>

              {/* Q9: Reading frequency */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.q9')}
                </label>
                <select
                  name="d9_readingFrequency"
                  value={formData.d9_readingFrequency}
                  onChange={handleChange}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                  required
                >
                  <option value="">{t('parentQuestionnaire.choose')}</option>
                  <option value="never">
                    {t(
                      'parentQuestionnaire.demographicOptions.readingFrequency.never',
                    )}
                  </option>
                  <option value="rarely">
                    {t(
                      'parentQuestionnaire.demographicOptions.readingFrequency.rarely',
                    )}
                  </option>
                  <option value="sometimes">
                    {t(
                      'parentQuestionnaire.demographicOptions.readingFrequency.sometimes',
                    )}
                  </option>
                  <option value="often">
                    {t(
                      'parentQuestionnaire.demographicOptions.readingFrequency.often',
                    )}
                  </option>
                  <option value="daily">
                    {t(
                      'parentQuestionnaire.demographicOptions.readingFrequency.daily',
                    )}
                  </option>
                </select>
              </div>

              {/* Q10: Screen activities */}
              <div className="bg-white rounded-2xl p-4">
                <p className="text-gray-700 font-semibold mb-3">
                  {t('parentQuestionnaire.demographic.q10')}
                </p>
                <div className="space-y-2">
                  {Object.entries(
                    t(
                      'parentQuestionnaire.demographicOptions.screenActivities',
                      {
                        returnObjects: true,
                      },
                    ),
                  ).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        value={key}
                        checked={formData.d10_screenActivities.includes(key)}
                        onChange={(e) =>
                          handleCheckboxChange(e, 'd10_screenActivities')
                        }
                        className="mr-2"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>

              {/* Q11: Screen time */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.q11')}
                </label>
                <select
                  name="d11_screenTime"
                  value={formData.d11_screenTime}
                  onChange={handleChange}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                  required
                >
                  <option value="">{t('parentQuestionnaire.choose')}</option>
                  <option value="none">
                    {t(
                      'parentQuestionnaire.demographicOptions.screenTime.none',
                    )}
                  </option>
                  <option value="less1hour">
                    {t(
                      'parentQuestionnaire.demographicOptions.screenTime.less1hour',
                    )}
                  </option>
                  <option value="1to2hours">
                    {t(
                      'parentQuestionnaire.demographicOptions.screenTime.1to2hours',
                    )}
                  </option>
                  <option value="2to3hours">
                    {t(
                      'parentQuestionnaire.demographicOptions.screenTime.2to3hours',
                    )}
                  </option>
                  <option value="more4hours">
                    {t(
                      'parentQuestionnaire.demographicOptions.screenTime.more4hours',
                    )}
                  </option>
                </select>
              </div>
            </div>

            {/* Section 2: Understanding your child */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm flex items-center">
                {i18n.language === 'en' ? (
                  <div className="w-4 h-12 bg-primary-400 rounded-l-lg mr-2"></div>
                ) : (
                  <div className="w-4 h-12"></div>
                )}
                <h2 className="text-md font-semibold text-gray-700">
                  {t('parentQuestionnaire.section2')}
                </h2>
              </div>

              {understandingQuestions.map(({ key, question }) => (
                <div className="bg-white rounded-2xl p-4" key={key}>
                  <p className="text-gray-700 font-semibold mb-3">{question}</p>
                  <div className="space-y-2">
                    {Object.keys(answerOptions).map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name={key}
                          value={option}
                          checked={
                            formData[key as keyof typeof formData] === option
                          }
                          onChange={handleChange}
                          className="mr-2"
                        />
                        {answerOptions[option]}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="text-center mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-2xl bg-primary-700 px-6 py-2 font-medium text-white hover:bg-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800"
              >
                {isLoading
                  ? t('parentQuestionnaire.submitting')
                  : t('parentQuestionnaire.submit')}
              </button>
              {error && <p className="text-red-600 mt-2">{error}</p>}
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
