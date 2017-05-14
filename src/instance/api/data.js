/**
 * Created by yuer on 2017/5/13.
 */
import { proxy, setData, parsePath } from '../../util/data'
import Watcher from '../../observer/watcher'
export default function (Eel) {
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