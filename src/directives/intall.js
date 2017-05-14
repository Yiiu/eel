/**
 * Created by yuer on 2017/5/12.
 */

// 指令构造函数
class Directive {
    constructor (name) {
        this.name = name
    }
}

export default function install (name, hook) {
    let dir = {
        name: name
    }
    Object.keys(hook).forEach(type => {
        dir[type] = hook[type]
    })
    return dir
}