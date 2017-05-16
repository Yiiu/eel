/**
 * Created by yuer on 2017/5/14.
 */
import { before, replace } from '../../util/dom'
export default function (Eel) {
    Eel.prototype.$mount = function (el, parent) {
        this.$el = this._parseHTML(el)
        this.$el.__Y__ = this
        return this
    }
    Eel.prototype.$before = function (el) {
        before(this.$el, el)
    }
    Eel.prototype.$replace = function (el) {
        replace(el, this.$el)
    }
}