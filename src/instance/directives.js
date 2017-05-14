/**
 * Created by yuer on 2017/5/12.
 */
import install from '../directives/intall'

// 初始化指令的一些设置
export  function directivesMixin (Eel) {
    Eel.prototype.directives = installDirectives
}
// install 指令
function installDirectives (name, hook) {
    let dir = install(name, hook)
    if (this.$directives[name]) {
        console.error(`已经存在${name}指令`)
    } else {
        this.$directives[name] = dir
    }
    return this
}