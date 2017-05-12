/**
 * Created by yuer on 2017/5/12.
 */
export default class Directives {
    /**
     *
     * @param name {String} 指令名称
     * @param el {Element} 指令对应的dom
     * @param vm {Eel} 指令对应的实例
     * @param descriptor {Object} 指令参数
     */
    constructor (name, el, vm, descriptor) {
        this.name = name
        this.el = el
        this.vm = vm
        this.descriptor = descriptor
        this.init()
    }
    init () {
        console.log(this.vm.$directives)
    }
}