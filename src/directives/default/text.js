/**
 * Created by yuer on 2017/5/12.
 */
export default function (Eel) {
    Eel.directives('text', {
        bind: function () {
            console.log(1)
        }
    })
}