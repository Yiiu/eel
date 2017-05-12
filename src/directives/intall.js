/**
 * Created by yuer on 2017/5/12.
 */

// 指令构造函数
class Directive {
    constructor (name) {
        this.name = name
    }
}

export default function install (name, hook, vm) {
    let dir = new Directive(name)
    Object.keys(hook).forEach(type => {
        dir.__proto__[type] = hook[type]
    })
    return dir
}