/**
 * Created by yuer on 2017/5/5.
 */
import Dep from './dep'
import { parsePath } from '../util/data'
// 订阅者
export default class Watcher {
    constructor (vm, expOrFn, cb) {
        this.vm = vm            // 实例
        this.expOrFn = expOrFn  // 被订阅的数据
        this.cb = cb            // 回调
        this.getter = parsePath(expOrFn)
        this.val = this.get()   // 更新前的数
    }
    /**
     * 来通知管理员(Dep)调用
     */
    get () {
        Dep.target = this
        let val = this.getter ? this.getter(this.vm) : this.vm[this.expOrFn]
        Dep.target = null
        return val
    }
    addDep (dep) {
        dep.addSub(this)
    }
    update () {
        const val = this.getter ? this.getter(this.vm) : this.vm[this.expOrFn]
        if (val !== this.val) {
            const oldVal = this.val
            this.val = val
            this.cb.call(this.vm, oldVal, this.val)
        }
    }
}