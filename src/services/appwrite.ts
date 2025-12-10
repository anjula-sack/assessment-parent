import { Databases, ID, Query } from 'appwrite'

import client from '../../client'

const databases = new Databases(client)

export const createParentAssessment = async (data: Record<string, any>) => {
  return await databases.createDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    process.env.NEXT_PUBLIC_APPWRITE_PARENTS_COLLECTION_ID!,
    ID.unique(),
    data,
  )
}

const getLevel = (value) => {
  if (value < 1) return 'beginner'
  if (value < 2.4) return 'learner'
  return 'expert'
}

const incrementDistribution = (dist, level) => {
  const updated = { ...dist }
  updated[level] = (updated[level] || 0) + 1
  return updated
}

const incrementCategoryDistributions = (existing, categoryLevels) => {
  const updated = { ...existing }
  for (const [category, level] of Object.entries(categoryLevels)) {
    if (!updated[category])
      updated[category] = { beginner: 0, learner: 0, expert: 0 }

    updated[category][level as keyof typeof category] =
      (updated[category][level as keyof typeof category] || 0) + 1
  }
  return updated
}

export const updateScores = async ({
  skillScores,
  school,
  grade,
  section,
  zone,
  assessment,
  overallScore,
  testType,
}: Record<string, any>) => {
  const categoryLevels = {}
  for (const [category, score] of Object.entries(skillScores)) {
    categoryLevels[category] = getLevel(score)
  }

  const agg = await databases.listDocuments(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    process.env.NEXT_PUBLIC_APPWRITE_SCORES_COLLECTION_ID,
    [
      Query.equal('school', school),
      Query.equal('grade', grade),
      Query.equal('section', section),
      Query.equal('zone', zone),
      Query.equal('assessment', assessment),
      Query.equal('testType', testType),
    ],
  )

  if (agg.documents.length === 0) {
    const overallDist = { beginner: 0, learner: 0, expert: 0 }
    overallDist[getLevel(overallScore)] = 1

    const categoryDist = {}
    for (const [category, lvl] of Object.entries(categoryLevels)) {
      categoryDist[category] = { beginner: 0, learner: 0, expert: 0 }
      categoryDist[category][lvl] = 1
    }

    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_SCORES_COLLECTION_ID,
      'unique()',
      {
        school,
        grade,
        assessment,
        section,
        zone,
        testType,
        total_students: 1,
        overall_level_distribution: JSON.stringify(overallDist),
        category_level_distributions: JSON.stringify(categoryDist),
      },
    )

    return
  }

  const doc = agg.documents[0]

  if (!doc) {
    return
  }

  const newTotal = (doc.total_students || 0) + 1

  const newOverall = incrementDistribution(
    JSON.parse(doc.overall_level_distribution || '{}'),
    getLevel(overallScore),
  )

  const newCategoryDist = incrementCategoryDistributions(
    JSON.parse(doc.category_level_distributions || '{}'),
    categoryLevels,
  )

  await databases.updateDocument(
    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    process.env.NEXT_PUBLIC_APPWRITE_SCORES_COLLECTION_ID,
    doc.$id,
    {
      total_students: newTotal,
      overall_level_distribution: JSON.stringify(newOverall),
      category_level_distributions: JSON.stringify(newCategoryDist),
    },
  )
}
