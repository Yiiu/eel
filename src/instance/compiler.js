/**
 * Created by yuer on 2017/5/6.
 */
import { parseHTML } from '../compiler/index'
export function initCompiler (vm) {
    vm.$root = {}
    vm.$el = document.querySelector(vm.$option.el)
    vm.$root.$el = document.querySelector(vm.$option.el)
    let t = document.querySelector(vm.$option.template)
    vm.$root.$template = t.innerHTML
    parseHTML(vm.$root.$template)
}