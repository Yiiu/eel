/**
 * Created by yuer on 2017/5/6.
 */
import { initState, initWatch } from './state'
import defaultInstallDirectives from '../directives/default/index'
let uid = 0
export function initMixin (Eel) {
    Eel.prototype._init = function (options) {
        options = options || {}
        this.$option = options
        this._watcher = []
        this._uid = uid++
        this.$directives = {}
        this.$root = {}
        this.$parent = options.parent
        this.$children = []
        this.$el = null
        this._isComponent = false
        this.$root = this.$parent ? this.$parent.$root : this
        // this.$template = document.querySelector(this.$option.template || this.$option.el)
        // 在实例初始化之后,数据还未初始化
        this._callHook('beforeCreate')
        // --初始化数据处理
        this._initState()
        this._initWatch()
        this._initMethods()
        // 安装自带指令
        defaultInstallDirectives(this)

        // 实例已经创建完成之后被调用，el还没有挂载的状态
        this._callHook('created')
        // 在挂载开始之前被调用
        this._callHook('beforeMount')
        let el = document.querySelector(this.$option.el) || null
        if (el) {
            this.$mount(el)
            this._callHook('mounted')
        }
        // 挂载完成后调用
    }
}