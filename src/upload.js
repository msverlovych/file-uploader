import { formatBytes, createNodeElement, removeNodeElement, noop } from './utils.js'

export class Upload {
    #input
    #card
    #cardBlock
    #preview
    #cardActions

    constructor(selector, options = {}) {
        this.selector = selector
        this.options = options

        this.files = []
        this.onUpload = this.options.onUpload ?? noop
        this.promoBlock = document.querySelector('.promo-block')
        this.openTemplateBtn = document.querySelector('#open-btn')
        this.updateBtn = createNodeElement('button', 'update', ['btn-primary', '#updateFile'])
        this.uploadBtn = createNodeElement('button', 'upload', ['btn-secondary'], '#upload')
        this.closeBtn = createNodeElement('button', 'close', ['btn-primary'])
        this.uploadBtn.insertAdjacentHTML('beforeend', '<i class="icon-send"></i>')

        this.createUploadTemplate = this.createUploadTemplate.bind(this)
        this.triggerInputHandle = this.triggerInputHandle.bind(this)
        this.toHtml = this.toHtml.bind(this)
        this.clearPreview = this.clearPreview.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.removeFileHandle = this.removeFileHandle.bind(this)
        this.uploadFilesHandle = this.uploadFilesHandle.bind(this)
        this.closeUploadTemplate = this.closeUploadTemplate.bind(this)

        this.openTemplateBtn.addEventListener('click', this.createUploadTemplate)
        this.updateBtn.addEventListener('click', this.triggerInputHandle)
        this.closeBtn.addEventListener('click', this.closeUploadTemplate)
    }

    createUploadTemplate() {
        this.promoBlock.insertAdjacentHTML('afterend', `
            <div class="card">
                <div class="card-block">
                    <input type="file" id="file">
                    <div class="preview"></div>
                    <div class="actions"></div>
                </div>
            </div>
        `)

        this.#card = document.querySelector('.card')
        this.#cardBlock = this.#card.querySelector('.card-block')
        this.#input = this.#cardBlock.querySelector(this.selector)
        this.#preview = this.#cardBlock.querySelector('.preview')
        this.#cardActions = this.#cardBlock.querySelector('.actions')

        if (this.options.multi) {
            this.#input.setAttribute('multiple', true)
        }
    
        if (this.options.accept && Array.isArray(this.options.accept)) {
            this.#input.setAttribute('accept', this.options.accept.join(', '))
        }

        this.triggerInputHandle()

        this.#input.addEventListener('change', this.handleInputChange)
    }

    triggerInputHandle() {
        this.#input.click()
    }

    toHtml(item, event) {
        return `
            <div class="preview-image">
                <i class="preview-image__remove icon-close" data-name="${item.name}"></i>
                <img src="${event.target.result}" alt="${item.name}" />
                <div class="preview-info">
                    <span class="preview-info__name">${item.name[0]}...${item.type.slice(6)}</span>
                    <span class="preview-info__size">${formatBytes(item.size)}</span>
                </div>
            </div>
        `
    }

    clearPreview(element) {
        element.style.display = 'block'
        element.innerHTML = `
            <div class="preview-info__progress flex-center-row">
                <span class="progress-content"></span>
            </div>
        `
    }

    handleInputChange(event) {
        if (!event.target.files.length) {
            this.#cardBlock.classList.remove('gap-3')
            return
        }

        this.#card.style.display = 'block'
        this.#preview.innerHTML = ''
        this.#cardBlock.classList.add('gap-3')

        this.files = Array.from(event.target.files)
        
        this.openTemplateBtn.style.display = 'none'
        this.#cardActions.appendChild(this.uploadBtn)
        this.#cardActions.appendChild(this.updateBtn)

        this.files.forEach(file => {
            if (!file.type.match('image')) {
                return
            }

            const reader = new FileReader()
            reader.onload = event => this.#preview.insertAdjacentHTML('afterbegin', this.toHtml(file, event))
            reader.readAsDataURL(file)
        })

        this.uploadBtn.addEventListener('click', this.uploadFilesHandle)
        this.#preview.addEventListener('click', this.removeFileHandle)
    }

    removeFileHandle(event) {
        const { name } = event.target.dataset
        if (!name) return

        this.files = this.files.filter(file => file.name !== name)

        const closestElement = this.#preview.querySelector(`[data-name="${name}"]`).closest('.preview-image')
        removeNodeElement(closestElement)

        if (!this.files.length) {
            removeNodeElement(this.#card)
        }
    }

    closeUploadTemplate() {
        removeNodeElement(this.#card)
        this.openTemplateBtn.style.display = 'flex'
    }

    uploadFilesHandle() {
        this.uploadBtn.remove()
        this.updateBtn.remove()
        this.#cardActions.appendChild(this.closeBtn)
        this.closeBtn.disabled = true
        this.#preview.querySelectorAll('.preview-image__remove').forEach(el => el.remove())
        const previewInfo = this.#preview.querySelectorAll('.preview-info')
        previewInfo.forEach(this.clearPreview)

        this.onUpload(this.files, previewInfo)
            .then(() => this.closeBtn.disabled = false)
            .catch(error => console.log(error))
    }
}