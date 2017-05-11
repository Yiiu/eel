/**
 * Created by yuer on 2017/5/6.
 */
import { parseDom, before, remove } from '../util/dom'

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g

export function parseHTML (el) {
    let fragment = document.createDocumentFragment()
    let options = this.$option
    let tpl = document.querySelector(options.template).innerHTML
    if (typeof(tpl) === 'string') {
        tpl = parseDom(tpl)
    }
    if (tpl instanceof Array) {
        console.error('需要根节点')
    }
    this._compileNode(tpl)
    this.$el.appendChild(tpl)
}
/**
 * 处理模板节点
 */
export function compileNode (html) {
    if (html.nodeType === 1) {
        this._compileDomNode(html)
    } else if (html.nodeType === 3) {
        if (html.data === '\n') {
            return
        }
        this._compileTextNode(html)
    }
}

export function compileDomNode (dom) {
    Array.from(dom.childNodes).forEach(t => {
        this._compileNode(t)
    })
}
export function compileTextNode (text) {
    let tag = parse(text.data)
    if (!tag) {
        return
    }
    tag.forEach(tags => {
        if (tags.tag) {
            let value = tags.value
            let el = document.createTextNode('')
            el.textContent = this[value]
            this.$watch(value, function (val, newVal) {
                el.textContent = newVal
            })
            before(el, text)
        } else {
            let el = document.createTextNode(tags.value)
            before(el, text)
        }
    })
    remove(text)
}
export function parse (text) {
    if (text === '' && defaultTagRE.test(text)) return
    let tag = [], match, index, value, lastindex = 0
    while (match = defaultTagRE.exec(text)) {
        index = match.index
        if (index > lastindex) {
            let last = text.slice(lastindex, index)
            if (last.trim() !== '\n' && last.trim() !== '') {
                tag.push({
                    value: text.slice(lastindex, index)
                })
            }
        }
        value = match[1]
        tag.push({
            tag: true,
            value: value.trim()
        })
        lastindex = index + match[0].length
    }
    if (lastindex < text.length - 1) {
        let last = text.slice(lastindex)
        if (last.trim() !== '\n' && last.trim() !== '') {
            tag.push({
                value: last
            })
        }
    }
    return tag
}
