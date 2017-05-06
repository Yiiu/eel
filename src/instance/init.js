/**
 * Created by yuer on 2017/5/6.
 */
import { initState } from './state'
import { initCompiler } from './compiler'
export function initMixin (Eel) {
    Eel.prototype._init = function (options) {
        this.$option = options
        initState(this)
        initCompiler(this)
    }
}