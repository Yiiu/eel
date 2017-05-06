/**
 * Created by yuer on 2017/5/6.
 */
import Watcher from '../observer/watcher'
import Observer from '../observer/index'
export function stateMixin (Eel) {
    Eel.prototype.$watch = function (expOrFn, cb) {
        let watcher = new Watcher(this, expOrFn, cb)
        this._watcher.push(watcher)
    }
}
export function initState (Eel) {
    initData(Eel)
    Eel._watcher = []
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
    Object.keys(data)
        .forEach(key => {
            _proxy(vm, key)
        })
}