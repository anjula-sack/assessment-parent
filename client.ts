import { Client } from 'appwrite'

const client = new Client()
client
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)

export default client
