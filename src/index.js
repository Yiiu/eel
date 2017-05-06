/**
 * Created by yuer on 2017/5/5.
 */
import Observer from './observer/index'
import Watcher from './observer/watcher'
export default class Eel {
    constructor (options) {
        let data = this._data = options.data
        this._ob = new Observer(data)
        this._watcher = []
        Object.keys(data)
            .forEach(key => {
                this._proxy(key)
            })
    }
    _proxy (key) {
        Object.defineProperty(this, key, {
            configurable: true,
            enumerable: true,
            get: () => this._data[key],
            set: (val) => this._data[key] = val
        })
    }
    $watch (vm, expOrFn, cb) {
        this._watcher.push(new Watcher(vm, expOrFn, cb))
    }
}