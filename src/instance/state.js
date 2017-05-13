/**
 * Created by yuer on 2017/5/6.
 */
import { proxy, setData, parsePath } from '../util/data'
import Watcher from '../observer/watcher'
import Observer from '../observer/index'
export function stateMixin (Eel) {
    Eel.prototype.$watch = function (expOrFn, cb) {
        let watcher = new Watcher(this, expOrFn, cb)
        this._watcher.push(watcher)
        return this
    }
    Eel.prototype.$set = function (expOrFn, val) {
        let set = setData(expOrFn, this)
        set(val)
        return this
    }
    Eel.prototype.$get = function (expOrFn, val) {
        let set = parsePath(expOrFn)
        return set(this)
    }
}
export function initState (Eel) {
    initData(Eel)
    Eel._watcher = []
}
export function initWatch (Eel) {
    if (Eel.$option.watch) {
        Object.keys(Eel.$option.watch).forEach(key => {
            Eel.$watch(key, Eel.$option.watch[key])
        })
    }
}

function _proxy (vm, key) {
    Object.defineProperty(vm, key, {
        configurable: true,
        enumerable: true,
        get: () => vm._data[key],
        set: (val) => vm._data[key] = val
    })
}
function initData (vm) {
    let data = vm._data = vm.$option.data
    vm._ob = new Observer(data)
    proxy(vm, data)
    initMethods(vm)
}

function initMethods (vm) {
    let method = vm.$option.methods
    proxy(vm, method)
}
