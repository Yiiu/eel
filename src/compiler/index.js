/**
 * Created by yuer on 2017/5/6.
 */
import { parseDom, before, remove, replace } from '../util/dom'
import Directives from '../directives/index'
const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g    // tag
const directivesRE = /^v-(\w+)/                 // 匹配指令名称
const dirREM = /v-(.*)/                         // 匹配指令名称后面的值
const componentRE = /<([\w:-]+)+/
export function parseHTML (el) {
    let tpl = parseTemplate(this.$option.template)
    if (typeof(tpl) === 'string') {
        tpl = parseDom(tpl)
    }
    if (tpl instanceof Array) {
        console.error('需要根节点')
    }
    this._compileNode(tpl)
    el.appendChild(tpl)
    return tpl
}
/**
 * 处理options的template
 * @param template
 */
export function parseTemplate (template) {
    if (!template) return null
    if (typeof(template) === 'string') {
        if (template[0] === '#') {
            return document.querySelector(template).innerHTML
        } else {
            return template
        }
    } else {
        return template.innerHTML
    }
}
/**
 * 处理模板节点
 */
export function compileNode (html) {
    if (html.nodeType === 1) {
        let components = this.$option.components
        let tag = html.tagName.toLowerCase()
        if (components[tag]) {
            this._compileComponentNode(html, tag)
        } else {
            this._compileDomNode(html)
        }
    } else if (html.nodeType === 3) {
        if (html.data === '\n') {
            return
        }
        this._compileTextNode(html)
    }
}
export function compileComponentNode (html, tag) {
    new Directives('component', html, this, {
        literal: true,
        name: tag
    })
}
export function compileDir (attr, dom) {
    let name = directivesRE.exec(attr.name)[1]
    let tag = dirREM.exec(attr.name)[1]
    new Directives(name, dom, this, {
        name: attr.name,
        tag: tag,
        val: attr.nodeValue
    })
}

export function compileDomNode (dom) {
    Array.prototype
        .slice
        .call(dom.attributes)
        .forEach(attr => {
            if (directivesRE.test(attr.name)) {
                this._compileDir(attr, dom)
            }
        })
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
            new Directives('text', el, this, {
                val: value
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
