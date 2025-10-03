import { Databases, ID } from 'appwrite'

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
