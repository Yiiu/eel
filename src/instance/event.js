/**
 * Created by yuer on 2017/5/14.
 */
export function eventMixin (Eel) {
    Eel.prototype._callHook = function (hook) {
        let handle = this.$option[hook]
        if (handle) {
            handle.call(this)
        }
    }
}