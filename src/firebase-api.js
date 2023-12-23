import { initializeApp } from "firebase/app"
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { firebaseConfig } from './firebase-config.js'

initializeApp(firebaseConfig)

const storage = getStorage()

export const uploadFiles = (files, preview) => {
    files.forEach((file, index) => {
        const metadata = {
            contentType: file.mimetype 
        }

        const fileRef = ref(storage, `images/${file.name}`)
        const uploadTask = uploadBytesResumable(fileRef, file, metadata)

        uploadTask.on('state_changed', snapshot => {
            const progress = ((snapshot.bytesTransferred / snapshot.totalBytes) * 100).toFixed(0)
            const blocks = preview[index].querySelector('.preview-info__progress')
            const blocksInfo = blocks.querySelector('.progress-content')

            blocksInfo.textContent = progress + '%';
            blocks.style.width = progress + '%'
        }, error => {
            console.log(error)
        }, () => {
            getDownloadURL(uploadTask.snapshot.ref).then(downloadURL => downloadURL)
        })
    })
}