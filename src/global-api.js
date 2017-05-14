/**
 * Created by yuer on 2017/5/14.
 */
let cid = 0
export default function (Eel) {
    Eel.extend = function (options) {
        let that = this
        let Sub = function (options) {
            this._init()
        }
        Sub.prototype = Object.create(Eel.prototype)
        Sub.prototype.constructor = Sub
        this.options = {
            components: {}
        }
        Sub.extend = that.extend
        return Sub
    }
    Eel.component = function (name, options) {
        options = options || {}
        options.name = name
        options._isComponent = true
        options = Eel.extend(options)
        Eel.options['components'][name] = options
        return options
    }
}