import { uploadFiles } from './src/firebase-api.js'
import { Upload } from './src/upload.js'

const selector = '#file'

const options = {
    multi: true,
    accept: ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG', '.webp'],
    onUpload(files, preview) {
        return uploadFiles(files, preview)
    }
}

new Upload(selector, options)