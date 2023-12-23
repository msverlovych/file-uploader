import { initializeApp } from 'firebase/app'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { firebaseConfig } from './src/firebase-config.js'
import { Upload } from './src/upload.js'

initializeApp(firebaseConfig)

const selector = '#file'

const options = {
    multi: true,
    accept: ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG', '.webp'],
    onUpload(files, preview) {
        const storage = getStorage()
        let uploadPromises = []

        files.forEach((file, index) => {
            const metadata = {
                contentType: file.mimetype 
            }
    
            const fileRef = ref(storage, `images/${file.name}`)
            const uploadTask = uploadBytesResumable(fileRef, file, metadata)
    
            const uplaodPromise = new Promise((resolve, reject) => {
                uploadTask.on('state_changed', snapshot => {
                    const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0)
                    const blocks = preview[index].querySelector('.preview-info__progress')
                    const blocksInfo = blocks.querySelector('.progress-content')
        
                    blocksInfo.textContent = progress + '%';
                    blocks.style.width = progress + '%'
                }, error => {
                    reject(error)
                    console.log(error)
                }, () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => resolve(downloadURL))
                })
            })

            uploadPromises.push(uplaodPromise)
        })

        return Promise.all(uploadPromises)
    }
}

new Upload(selector, options)