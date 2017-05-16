/**
 * Created by yuer on 2017/5/13.
 */
import { replace } from '../../util/dom'
export default function (Eel) {
    Eel.directives('if', {
        bind () {
            if (this.vm._isComponent) {
                this.vm = this.vm.$parent
            }
            let val = this.getter()
            let Pla = this._Pla = document.createComment('(●ˇ∀ˇ●)')
            this._el = this.el
            if (!val) {
                this.hide()
            }
        },
        update (val, newVal) {
            if (newVal) {
                this.show()
            } else {
                this.hide()
            }
        },
        show () {
            replace(this._Pla, this._el)
        },
        hide () {
            replace(this.el, this._Pla)
        }
    })
}