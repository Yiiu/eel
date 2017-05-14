/**
 * Created by yuer on 2017/5/6.
 */
import { proxy, setData, parsePath } from '../util/data'
import Observer from '../observer/index'
export function stateMixin (Eel) {
    Eel._watcher = []
    Eel.prototype._initState = initState
    Eel.prototype._initWatch = initWatch
    Eel.prototype._initMethods = initMethods

}
export function initState () {
    let data = this._data = this.$option.data
    this._ob = new Observer(data)
    proxy(this, data)
}
export function initWatch () {
    if (this.$option.watch) {
        Object.keys(this.$option.watch).forEach(key => {
            this.$watch(key, this.$option.watch[key])
        })
    }
}

function initMethods () {
    let method = this.$option.methods
    proxy(this, method)
}
