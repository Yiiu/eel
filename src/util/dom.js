/**
 * Created by yuer on 2017/5/11.
 */

export function replace (el, tar) {
    if (el.nextSibling) {
        el.parentNode.insertBefore(tar, el)
    } else {
        el.parentNode.appendChild(tar)
    }
    el.parentNode.removeChild(el)
}

export function parseDom (arg) {
    let dom = []
    let objE = document.createElement("div")

    objE.innerHTML = arg
    for (let i = 0;i < objE.childNodes.length; i++) {
        if (objE.childNodes[i].textContent.trim() !== '\n' && objE.childNodes[i].textContent.trim() !== '') {
            dom.push(objE.childNodes[i])
        }
    }
    return dom.length ? dom[0] : dom

}

export function before (el, target) {
    target.parentNode.insertBefore(el, target);
}
export function remove (el) {
    el.parentNode.removeChild(el);
}