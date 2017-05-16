/**
 * Created by yuer on 2017/5/14.
 */
export function eventMixin (Eel) {
    Eel.prototype._callHook = function (hook) {
        let handle
        if (this.$option[hook] instanceof Array) {
            for (let i in this.$option[hook]) {
                handle = this.$option[hook][i]
                handle.call(this)
            }
        } else {
            handle = this.$option[hook]
            if (handle) {
                handle.call(this)
            }

        }
    }
}