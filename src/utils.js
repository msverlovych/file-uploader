export function formatBytes(bytes, decimals) {
    if(bytes== 0) return "0 Byte"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
}

export const createNodeElement = (tag, textContent, classes = [], id) => {
    const node = document.createElement(tag)

    if (id) {
        node.setAttribute("id", id)
    }

    if (classes.length) {
        node.classList.add(...classes)
    }

    if (textContent) {
        node.textContent = textContent
    }

    return node
}

export const removeNodeElement = (element) => {
    element.classList.add('is-removing')
    setTimeout(() => element.remove(), 200)
}

export const noop = () => {}