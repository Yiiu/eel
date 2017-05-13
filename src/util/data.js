/**
 * Created by yuer on 2017/5/11.
 */
export function extend (to, form) {
    Object.keys(form).forEach(key => {
        to[key] = form[key]
    })
}

export function proxy (to, form) {
    Object.keys(form)
        .forEach(key => {
            Object.defineProperty(to, key, {
                configurable: true,
                enumerable: true,
                get: () => form[key],
                set: (val) => form[key] = val
            })
        })
}

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
export function setData (path, obj) {
    if (bailRE.test(path)) {
        return
    }
    const segments = path.split('.')
    return function (val) {
        for (let i = 0; i < segments.length - 1; i++) {
            if (!obj) return
            obj = obj[segments[i]]
        }
        obj[segments[segments.length - 1]] = val
    }
}