/**
 * Created by yuer on 2017/5/13.
 */
export default function (Eel) {
    Eel.directives('model', {
        bind: function () {
            let val = this.getter()
            let cn = false
            this.el.value = val
            this.el.addEventListener('compositionstart', () => {
                cn = true
            })
            this.el.addEventListener('compositionend', e => {
                cn = false
                this.vm.$set(this.val, e.target.value)
            })
            this.el.addEventListener('input', e => {
                if (cn) return
                this.vm.$set(this.val, e.target.value)
            })
            // this.el.textContent = this.getter()
        },
        update: function (val, newVal) {
            this.el.value = newVal
        }
    })
}