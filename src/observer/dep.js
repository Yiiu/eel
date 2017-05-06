/**
 * Created by yuer on 2017/5/5.
 */
export default class Dep {
    constructor () {
        this.subs = []  // 订阅数组
    }

    /**
     * 添加订阅
     */
    addSub (sub) {
        this.subs.push(sub)
    }
    notify () {
        for (let i = 0;i < this.subs.length; i++) {
            this.subs[i].update()
        }
    }
    depend () {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    }
}
Dep.target = null