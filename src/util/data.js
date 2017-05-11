/**
 * Created by yuer on 2017/5/11.
 */
/**
 * 用于去获取如：'obj.a'这样的值
 * @type {RegExp}
 */
const bailRE = /[^\w.$]/
export function parsePath (path) {
    if (bailRE.test(path)) {
        return
    }
    const segments = path.split('.')
    return function (obj) {
        for (let i = 0; i < segments.length; i++) {
            if (!obj) return
            obj = obj[segments[i]]
        }
        return obj
    }
}