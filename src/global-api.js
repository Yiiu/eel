/**
 * Created by yuer on 2017/5/14.
 */
let cid = 0
export default function (Eel) {
    Eel.options = {
        components: {}
    }
    Eel.version = '0.1'
    Eel.extend = function (options) {
        let Super = this
        let Sub = creatClass()
        Sub.prototype = Object.create(Super.prototype)
        Sub.prototype.constructor = Sub
        Sub.options = options
        return Sub
    }
    function creatClass () {
        return new Function(
            'return function EelComponent (options) {this._init(options);}'
        )()
    }
    Eel.component = function (name, options) {
        options = options || {}
        let Sub
        options.name = name
        options._isComponent = true
        options = Eel.extend(options)
        Eel.options['components'][name] = options
        return options
    }
}