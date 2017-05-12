/**
 * Created by yuer on 2017/5/6.
 */
import { initState, initWatch } from './state'
import { initCompiler } from './compiler'
import { initDirectives } from './directives'
export function initMixin (Eel) {
    Eel.prototype._init = function (options) {
        this.$option = options
        initState(this)
        initWatch(this)
        initCompiler(this)
        initDirectives(this)
    }
}