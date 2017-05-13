/**
 * Created by yuer on 2017/5/12.
 */
export default function (Eel) {
    Eel.directives('text', {
        bind: function () {
            this.el.textContent = this.getter()
        },
        update: function (val, newVal) {
            this.el.textContent = newVal
        }
    })
}