/**
 * Created by yuer on 2017/5/12.
 */
import { parsePath, extend, setData } from '../util/data'
export default class Directives {
    /**
     *
     * @param name {String} 指令名称
     * @param el {Element} 指令对应的dom
     * @param vm {Eel} 指令对应的实例
     * @param descriptor {Object} 指令参数
     */
    constructor (name, el, vm, text) {
        this.name = name        // 指令名称
        this.el = el            // 绑定的dom
        this.vm = vm            //
        this.arg = ''           // 参数
        this.val = text.val
        this._name = text.name
        this.modifiers = {}     // 修饰符
        this.compile(text)
        extend(this, this.vm.$directives[name])
        this._init()
    }

    /**
     * 处理参数
     * @param text
     */
    compile (text) {
        let tag = text.tag
        if (!text || !text.tag) {
            return
        }
        let argRE = /:(\w+)/
        if (argRE.exec(tag)) {
            let tags = argRE.exec(tag)
            this.arg = tags[1]
            tag = tag.slice(tags.index + this.arg.length + 1, tag.length)
        }
        tag.split('.').forEach(t => {
            if (t === '') return
            this.modifiers[t] = true
        })
    }

    /**
     * 用户初始时获取数据值
     */
    getter () {
        let get = parsePath(this.val)
        return get(this.vm)
    }
    setter (val) {
        let set = setData(this.val)
        return set(this.vm, val)
    }
    _init () {
        this._name && this.el.removeAttribute(this._name)
        // this.el.removeAttribute(this._name)
        this.bind && this.bind()
        if (this.literal) {
            this.update && this.update()
        } else {
            this.vm.$watch(this.val, (val, newVal) => {
                this.update && this.update(val, newVal)
            })
        }
    }
}