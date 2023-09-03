import ms from 'ms'
import admin from '../../Authentication/FirebaseAdmin/admin'
import { uuidv4 } from '@firebase/util'
const bucket = admin.storage().bucket()
export const generateSignedUrl = async (
  directory: string,
  filename: string,
) => {
  const path = `${directory}/${filename}_${uuidv4()}`
  const file = bucket.file(path)
  const [url] = await file.getSignedUrl({
    action: 'write',
    expires: Date.now() + ms('1h'), // 1 hour
    contentType: 'application/octet-stream',
  })
  return url
}
