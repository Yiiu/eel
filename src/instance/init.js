/**
 * Created by yuer on 2017/5/6.
 */
import { initState, initWatch } from './state'
import defaultInstallDirectives from '../directives/default/index'
let uid = 0
export function initMixin (Eel) {
    Eel.prototype._init = function (options) {
        this.$option = options
        this._watcher = []
        this._uid = uid++
        this.$directives = {}
        this.$root = {}
        this.$parent = options.parent
        this.$el = document.querySelector(this.$option.el)
        this.$root = this.$parent ? this.$parent.$root : this
        this.$template = document.querySelector(this.$option.template || vm.$option.el)

        // --初始化数据处理
        this._initState()
        this._initWatch()
        this._initMethods()
        // 安装自带指令
        defaultInstallDirectives(this)
        // --
        // initDirectives(this)
        this._parseHTML()
    }
}