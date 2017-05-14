/**
 * Created by yuer on 2017/5/14.
 */
export default function (Eel) {
    Eel.prototype.$mount = function (el, parent) {
        this.$el = this._parseHTML(el)
        if (this._isComponent) {
            this.$parent = parent
            this.$parent.$children.push(this)
        }
        return this
    }
}