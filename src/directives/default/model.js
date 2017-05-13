/**
 * Created by yuer on 2017/5/13.
 */
export default function (Eel) {
    Eel.directives('model', {
        bind: function () {
            let val = this.getter()
            this.el.value = val
            this.el.addEventListener('input', e => {
                this.vm.$set(this.val, e.target.value)
            })
            // this.el.textContent = this.getter()
        },
        update: function (val, newVal) {
            this.el.value = newVal
        }
    })
}