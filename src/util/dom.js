/**
 * Created by yuer on 2017/5/11.
 */


export function parseDom (arg) {
    let dom = []
    let objE = document.createElement("div")

    objE.innerHTML = arg
    for (let i = 0;i < objE.childNodes.length; i++) {
        if (objE.childNodes[i].textContent !== '\n') {
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