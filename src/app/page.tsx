'use client'
import Link from 'next/link'
import arData from '@/i18n/locales/ar.json'
import enData from '@/i18n/locales/en.json'
import React, { useState, Suspense, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { createParentAssessment, updateScores } from '@/services/appwrite'
import LanguageDropdown from './components/languageDropdown'
import parentVideo from '@/assets/videos/ar/parent.mp4'

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParentQuestionnaire />
    </Suspense>
  )
}

type VideoIntroProps = {
  videoSrc: string
  onSkip: () => void
  onEnded: () => void
}

const understandingQuestions = [
  {
    key: 'question_1',
  },
  {
    key: 'question_2',
  },
  {
    key: 'question_3',
  },
  {
    key: 'question_4',
  },
  {
    key: 'question_5',
  },
  {
    key: 'question_6',
  },
  {
    key: 'question_7',
  },
  {
    key: 'question_8',
  },
  {
    key: 'question_9',
  },
  {
    key: 'question_10',
  },
  {
    key: 'question_11',
  },
  {
    key: 'question_12',
  },
  {
    key: 'question_13',
  },
  {
    key: 'question_14',
  },
  {
    key: 'question_15',
  },
  {
    key: 'question_16',
  },
  {
    key: 'question_17',
  },
]

const skillQuestionMap = {
  self_awareness: ['question_3'],
  social_management: [
    'question_5',
    'question_7',
    'question_8',
    'question_9',
    'question_14',
  ],
  social_awareness: ['question_6', 'question_11', 'question_10', 'question_17'],
  relationship_skills: [
    'question_12',
    'question_13',
    'question_3',
    'question_4',
    'question_16',
  ],
  responsible_decision_making: [
    'question_4',
    'question_8',
    'question_14',
    'question_15',
  ],
  metacognition: ['question_5', 'question_9'],
  empathy: [
    'question_6',
    'question_10',
    'question_11',
    'question_12',
    'question_13',
    'question_16',
  ],
  critical_thinking: ['question_15', 'question_17'],
}

function ParentQuestionnaire() {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const testType = searchParams.get('testType') || 'PRE'
  const langParam = searchParams.get('lang')
  const normalizedLang = langParam || i18n.language || 'en'
  const shouldShowVideo = normalizedLang === 'ar'
  const [hasWatchedVideo, setHasWatchedVideo] = useState(() => !shouldShowVideo)

  const [consentGiven, setConsentGiven] = useState(false)
  const [formData, setFormData] = useState({
    isNewSchool: false,
    school: '',
    grade: '',
    section: '',
    zone: '',
    // Section 1: Demographic details
    d1: '',
    d2: '',
    d3: '',
    d4: '',
    d5: '',
    d6: '',
    d7: '',
    d8: '',
    d9: [] as string[],
    d10: '',
    d11: [] as string[],
    d12: '',
    d13: '',
    d14: '',
    d15: '',
    // Section 2: Understanding your child
    question_1: '',
    question_2: '',
    question_3: '',
    question_4: '',
    question_5: '',
    question_6: '',
    question_7: '',
    question_8: '',
    question_9: '',
    question_10: '',
    question_11: '',
    question_12: '',
    question_13: '',
    question_14: '',
    question_15: '',
    question_16: '',
    question_17: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [scores, setScores] = useState({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const data: any = i18n.language === 'ar' ? arData : enData

  const schools = formData.zone ? data.zonesToSchools[formData.zone] : []
  const gradeOptions = ['grade1']
  const sectionOptions = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']

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

  const handleScoresChange = (question: string, score: number) => {
    if (question === 'question_1' || question === 'question_2') {
      return
    }
    setScores((prev) => ({ ...prev, [question]: score }))
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
      const score = scores[questionKey] || 0
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
    const questions = Object.keys(scores)
    const totalScore = questions.reduce((sum, key) => {
      const score = scores[key] || 0
      return sum + score
    }, 0)

    return questions.length > 0 ? totalScore / questions.length : 0
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
        section: formData.section,
        zone: formData.zone,
        overallScore: totalScore,
        skillScores: JSON.stringify(skillScores),
        demographics: JSON.stringify({
          d1: formData.d1,
          d2: formData.d2,
          d3: formData.d3,
          d4: formData.d4,
          d5: formData.d5,
          d6: formData.d6,
          d7: formData.d7,
          d8: formData.d8,
          d9: formData.d9,
          d10: formData.d10,
          d11: formData.d11,
          d12: formData.d12,
          d13: formData.d13,
          d14: formData.d14,
          d15: formData.d15,
        }),
        answers: JSON.stringify({
          question_1: formData.question_1,
          question_2: formData.question_2,
          question_3: formData.question_3,
          question_4: formData.question_4,
          question_5: formData.question_5,
          question_6: formData.question_6,
          question_7: formData.question_7,
          question_8: formData.question_8,
          question_9: formData.question_9,
          question_10: formData.question_10,
          question_11: formData.question_11,
          question_12: formData.question_12,
          question_13: formData.question_13,
          question_14: formData.question_14,
          question_15: formData.question_15,
          question_16: formData.question_16,
          question_17: formData.question_17,
        }),
        testType,
      }

      await createParentAssessment(data)
      await updateScores({
        section: formData.section,
        zone: formData.zone,
        skillScores,
        school: formData.school,
        grade: formData.grade,
        assessment: 'parent',
        testType,
        overallScore: totalScore,
      })
      setIsSubmitted(true)
    } catch (err) {
      console.error(err)
      setError(t('parentQuestionnaire.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const answerOptions = [
    {
      label: t('assessment.answers.never'),
      value: 'never',
      score: 1,
    },
    {
      label: t('assessment.answers.rarely'),
      value: 'rarely',
      score: 1,
    },
    {
      label: t('assessment.answers.sometimes'),
      value: 'sometimes',
      score: 2,
    },
    {
      label: t('assessment.answers.often'),
      value: 'often',
      score: 3,
    },
    {
      label: t('assessment.answers.always'),
      value: 'always',
      score: 3,
    },
  ]

  const handleConsent = () => {
    setConsentGiven(true)
  }

  const childAssessmentUrl = useMemo(() => {
    const params = new URLSearchParams({
      testType,
      lang: normalizedLang,
    })
    return `https://assessment-student.vercel.app/?${params.toString()}`
  }, [normalizedLang, testType])

  if (consentGiven && !hasWatchedVideo && shouldShowVideo) {
    return (
      <VideoIntro
        videoSrc={parentVideo}
        onSkip={() => setHasWatchedVideo(true)}
        onEnded={() => setHasWatchedVideo(true)}
      />
    )
  }

  function VideoIntro({ videoSrc, onSkip, onEnded }: VideoIntroProps) {
    const { t } = useTranslation()
    return (
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
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-white">
          <div className="w-full max-w-2xl">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20">
              <div className="w-full aspect-video">
                <video
                  src={videoSrc}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                  onEnded={onEnded}
                />
              </div>
              <button
                onClick={onSkip}
                className="absolute top-3 right-3 bg-white/90 text-gray-800 text-sm font-medium px-4 py-2 rounded-full shadow hover:bg-white"
              >
                {t('common.skip')}
              </button>
            </div>
            <p className="text-center text-md text-black mt-4">
              {t('videoIntro.description')}
            </p>
          </div>
        </div>
      </div>
    )
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

          <div
            className="mt-12 text-black"
            dangerouslySetInnerHTML={{ __html: t('consent.privacyPolicy') }}
          />

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
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mt-4 text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-700">
              {t('parentQuestionnaire.thankYou')}
            </h2>
            <p className="text-gray-600 text-lg">
              {t('parentQuestionnaire.submissionSuccess')}
            </p>
            <button
              onClick={() => router.push(childAssessmentUrl)}
              className="rounded-2xl bg-primary-700 px-8 py-3 font-medium text-white hover:bg-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-all duration-200"
            >
              {t('parentQuestionnaire.takeMeToTheAssessment')}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl p-4 w-full max-w-md md:max-w-lg mt-4 space-y-4 md:space-y-6"
          >
            <p className="text-center text-base font-semibold text-gray-700">
              {t('parentQuestionnaire.onlyParents')}
            </p>

            <div className="bg-white p-4 md:p-6 rounded-xl w-full mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                {t('login.enterDetails')}
              </h3>
              <div className="space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('login.zone')} *
                  </label>

                  <select
                    value={formData.zone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        zone: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-[#82A4DE] 
                     text-sm sm:text-base text-gray-900 bg-white"
                    required
                  >
                    <option value="">
                      {i18n.language === 'ar' ? 'اختر المنطقة' : 'Select Zone'}
                    </option>

                    {Object.entries(data.zones).map(([zoneId, zoneName]) => (
                      <option key={zoneId} value={zoneId}>
                        {zoneName as string}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('login.school')} *
                </label>

                <select
                  value={formData.school}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      school: e.target.value,
                      isNewSchool: false,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-[#82A4DE] 
                     text-sm sm:text-base text-gray-900 bg-white"
                  required={!formData.school}
                  disabled={!formData.zone}
                >
                  <option value="">{t('login.selectSchool')}</option>

                  {schools.map((schoolId: string) => (
                    <option key={schoolId} value={schoolId}>
                      {data.schools[schoolId]} {/* translated label */}
                    </option>
                  ))}
                </select>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.isNewSchool}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isNewSchool: e.target.checked,
                        school: '',
                      }))
                    }
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('login.schoolNotInList')}
                  </label>
                </div>

                <div>
                  {/* New School Input Field */}
                  {formData.isNewSchool && (
                    <input
                      type="text"
                      placeholder={t('login.enterNewSchool')}
                      className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 text-black focus:ring-[#82A4DE]"
                      value={formData.school}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          school: e.target.value,
                        }))
                      }
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('login.section')} *
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        section: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82A4DE] text-sm sm:text-base text-gray-900 bg-white"
                    required
                  >
                    <option value="">{t('login.selectSection')}</option>
                    {sectionOptions.map((section) => (
                      <option key={section} value={section}>
                        {t(`sections.${section}`)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('login.grade')} *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        grade: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#82A4DE] text-sm sm:text-base text-gray-900 bg-white"
                    required
                  >
                    <option value="">{t('login.selectGrade')}</option>
                    {gradeOptions.map((grade) => (
                      <option key={grade} value={grade}>
                        {t(`grades.${grade}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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

              <p className="text-gray-700 mb-3">
                {t('parentQuestionnaire.section1Instruction')}
              </p>

              {/* D1: Relation to child */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d1')}
                </label>
                <select
                  name="d1"
                  value={formData.d1}
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

              {/* D2: Child date of birth */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d2')}
                </label>
                <input
                  type="date"
                  name="d2"
                  value={formData.d2}
                  onChange={handleChange}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                  required
                />
              </div>

              {/* D3: Child gender */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d3')}
                </label>
                <select
                  name="d3"
                  value={formData.d3}
                  onChange={handleChange}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                  required
                >
                  <option value="">{t('parentQuestionnaire.choose')}</option>
                  <option value="male">
                    {t('parentQuestionnaire.demographicOptions.gender.male')}
                  </option>
                  <option value="female">
                    {t('parentQuestionnaire.demographicOptions.gender.female')}
                  </option>
                </select>
              </div>

              {/* D4: Education */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d4')}
                </label>
                <select
                  name="d4"
                  value={formData.d4}
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

              {/* D5: Occupation */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d5')}
                </label>
                <select
                  name="d5"
                  value={formData.d5}
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

              {/* D6: Income */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d6')}
                </label>
                <select
                  name="d6"
                  value={formData.d6}
                  onChange={handleChange}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                  required
                >
                  <option value="">{t('parentQuestionnaire.choose')}</option>
                  <option value="less2000">
                    {t(
                      'parentQuestionnaire.demographicOptions.income.less2000',
                    )}
                  </option>
                  <option value="2000to4999">
                    {t(
                      'parentQuestionnaire.demographicOptions.income.2000to4999',
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

              {/* D7: Children in household */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d7')}
                </label>
                <input
                  type="number"
                  name="d7"
                  value={formData.d7}
                  onChange={handleChange}
                  placeholder={t('parentQuestionnaire.yourAnswer')}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 placeholder-gray-400 font-medium"
                  min="0"
                  required
                />
              </div>

              {/* D8: Adults in household */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d8')}
                </label>
                <input
                  type="number"
                  name="d8"
                  value={formData.d8}
                  onChange={handleChange}
                  placeholder={t('parentQuestionnaire.yourAnswer')}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 placeholder-gray-400 font-medium"
                  min="1"
                  required
                />
              </div>

              {/* D9: Languages spoken at home (checkbox) */}
              <div className="bg-white rounded-2xl p-4">
                <p className="text-gray-700 font-semibold mb-3">
                  {t('parentQuestionnaire.demographic.d9')}
                </p>
                <div className="space-y-2">
                  {Object.entries(
                    t('parentQuestionnaire.demographicOptions.languages', {
                      returnObjects: true,
                    }) as Record<string, string>,
                  ).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        value={key}
                        checked={formData.d9.includes(key)}
                        onChange={(e) => handleCheckboxChange(e, 'd9')}
                        className="mr-2"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>

              {/* D10: Reading frequency */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d10')}
                </label>
                <select
                  name="d10"
                  value={formData.d10}
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

              {/* D11: Screen activities (checkbox) */}
              <div className="bg-white rounded-2xl p-4">
                <p className="text-gray-700 font-semibold mb-3">
                  {t('parentQuestionnaire.demographic.d11')}
                </p>
                <div className="space-y-2">
                  {Object.entries(
                    t(
                      'parentQuestionnaire.demographicOptions.screenActivities',
                      {
                        returnObjects: true,
                      },
                    ) as Record<string, string>,
                  ).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        value={key}
                        checked={formData.d11.includes(key)}
                        onChange={(e) => handleCheckboxChange(e, 'd11')}
                        className="mr-2"
                      />
                      {value}
                    </label>
                  ))}
                </div>
              </div>

              {/* D12: Child screen time */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d12')}
                </label>
                <select
                  name="d12"
                  value={formData.d12}
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

              {/* D13: Parent screen time */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d13')}
                </label>
                <select
                  name="d13"
                  value={formData.d13}
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

              {/* D14: Parent upset frequency */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d14')}
                </label>
                <select
                  name="d14"
                  value={formData.d14}
                  onChange={handleChange}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                  required
                >
                  <option value="">{t('parentQuestionnaire.choose')}</option>
                  <option value="never">
                    {t(
                      'parentQuestionnaire.demographicOptions.upsetFrequency.never',
                    )}
                  </option>
                  <option value="rarely">
                    {t(
                      'parentQuestionnaire.demographicOptions.upsetFrequency.rarely',
                    )}
                  </option>
                  <option value="sometimes">
                    {t(
                      'parentQuestionnaire.demographicOptions.upsetFrequency.sometimes',
                    )}
                  </option>
                  <option value="often">
                    {t(
                      'parentQuestionnaire.demographicOptions.upsetFrequency.often',
                    )}
                  </option>
                  <option value="daily">
                    {t(
                      'parentQuestionnaire.demographicOptions.upsetFrequency.daily',
                    )}
                  </option>
                </select>
              </div>

              {/* D15: Child upset frequency */}
              <div className="bg-white rounded-2xl p-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t('parentQuestionnaire.demographic.d15')}
                </label>
                <select
                  name="d15"
                  value={formData.d15}
                  onChange={handleChange}
                  className="block w-full rounded-full bg-gray-200 p-2 px-4 text-gray-700 font-medium"
                  required
                >
                  <option value="">{t('parentQuestionnaire.choose')}</option>
                  <option value="never">
                    {t(
                      'parentQuestionnaire.demographicOptions.upsetFrequency.never',
                    )}
                  </option>
                  <option value="rarely">
                    {t(
                      'parentQuestionnaire.demographicOptions.upsetFrequency.rarely',
                    )}
                  </option>
                  <option value="sometimes">
                    {t(
                      'parentQuestionnaire.demographicOptions.upsetFrequency.sometimes',
                    )}
                  </option>
                  <option value="often">
                    {t(
                      'parentQuestionnaire.demographicOptions.upsetFrequency.often',
                    )}
                  </option>
                  <option value="daily">
                    {t(
                      'parentQuestionnaire.demographicOptions.upsetFrequency.daily',
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

              <p
                className="text-gray-700 mb-3"
                dangerouslySetInnerHTML={{
                  __html: t('parentQuestionnaire.section2Instruction'),
                }}
              />

              {understandingQuestions.map(({ key }, index) => (
                <div className="bg-white rounded-2xl p-4" key={key}>
                  <p className="text-gray-700 font-semibold mb-1">
                    {index + 1}.{' '}
                    {t(`parentQuestionnaire.questions.${key}.question`)}
                  </p>
                  <p className="text-gray-500 mb-3">
                    ({t(`parentQuestionnaire.questions.${key}.example`)})
                  </p>
                  <div className="space-y-2">
                    {answerOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name={key}
                          value={option.value}
                          checked={
                            formData[key as keyof typeof formData] ===
                            option.value
                          }
                          onChange={(e) => {
                            handleChange(e)
                            handleScoresChange(key, option.score)
                          }}
                          className="mr-2"
                        />
                        {option.label}
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
                  : t('common.submit')}
              </button>
              {error && <p className="text-red-600 mt-2">{error}</p>}
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
