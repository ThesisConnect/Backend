import admin from '../../Authentication/FirebaseAdmin/admin'
// ... Initialization code ...
const bucket = admin.storage().bucket()
async function deleteFile(directory: string, filename: string) {
  const filePath = `${directory}/${filename}`
  try {
    await bucket.file(filePath).delete()
    console.log(`gs://${bucket.name}/${filePath} deleted.`)
    return true
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error("Error deleting file")
  }
}
export default deleteFile
