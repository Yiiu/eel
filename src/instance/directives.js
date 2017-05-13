/**
 * Created by yuer on 2017/5/12.
 */
import install from '../directives/intall'
import defaultInstallDirectives from '../directives/default/index'
export function initDirectives (vm) {
    vm.__proto__.directives = installDirectives
    vm.$directives = {}
    defaultInstallDirectives(vm)
}
function installDirectives (name, hook) {
    let dir = install(name, hook)
    if (this.$directives[name]) {
        console.error(`已经存在${name}指令`)
    } else {
        this.$directives[name] = dir
    }
    return this
}