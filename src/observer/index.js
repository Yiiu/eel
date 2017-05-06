/**
 * Created by yuer on 2017/5/5.
 */
import Dep from './dep'
export default class Observer {
    constructor (value) {
        this.value = value
        this.walk(value)
        this.dep = new Dep()
    }
    walk (value) {
        for (let val in value) {
            defineReactive(this.value, this.value[val], val)
        }
    }
}
/**
 *
 * @param value
 * @returns {any}
 */
function observe (value) {
    if (typeof(value) !== 'object') {
        return
    }
    let ob = new Observer(value)
    return ob
}
function defineReactive (obj, val, type) {
    const dep = new Dep()
    let o = Object.getOwnPropertyDescriptor(obj, type)
    let childOb = observe(val)
    Object.defineProperty(obj, type, {
        get: function getter () {
            if (Dep.target) {
                dep.depend()
                if (childOb) {
                    childOb.dep.depend()
                }
            }
            return val
        },
        set: function setter (newVal) {
            if (newVal === val) {
                return
            }
            if (childOb) {
                childOb.dep.notify()
            }
            childOb = observe(newVal)
            val = newVal
            dep.notify()
        }
    })
}