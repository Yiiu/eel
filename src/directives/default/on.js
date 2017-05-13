/**
 * Created by yuer on 2017/5/13.
 */
export default function (Eel) {
    Eel.directives('on', {
        bind: function () {
            this.el.addEventListener(this.arg, e => this.vm[this.val].call(this.vm, e))
            // this.el.textContent = this.getter()
        },
        update: function (val, newVal) {
            // this.el.textContent = newVal
        }
    })
}