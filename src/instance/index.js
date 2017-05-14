/**
 * Created by yuer on 2017/5/6.
 */
import { initMixin } from './init'
import { stateMixin } from './state'
import { directivesMixin } from './directives'
import { compilerMixin } from './compiler'

import dataApi from './api/data'

function Eel (options) {
    if (!this instanceof Eel) {
        console.error('error new')
    }
    this._init(options)
}
Eel.component = function (name) {
    console.log(name)
}
// Mixin
initMixin(Eel)
stateMixin(Eel)
directivesMixin(Eel)
compilerMixin(Eel)
// api
dataApi(Eel)

export default Eel