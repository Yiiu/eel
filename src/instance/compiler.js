/**
 * Created by yuer on 2017/5/6.
 */
import * as parse from '../compiler/index'
export function initCompiler (vm) {
    vm.$root = {}
    vm.$el = document.querySelector(vm.$option.el)
    vm.$root.$el = document.querySelector(vm.$option.el)
    let t = document.querySelector(vm.$option.template)
    vm.$root.$template = t.innerHTML
    vm.__proto__._parseHTML = parse.parseHTML
    vm.__proto__._compileDir = parse.compileDir
    vm.__proto__._compileNode = parse.compileNode
    vm.__proto__._compileDomNode = parse.compileDomNode
    vm.__proto__._compileTextNode = parse.compileTextNode
    vm._parseHTML(vm.$el)
}