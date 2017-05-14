/**
 * Created by yuer on 2017/5/6.
 */
import { initMixin } from './init'
import { stateMixin } from './state'
import { eventMixin } from './event'
import { directivesMixin } from './directives'
import { compilerMixin } from './compiler'

import dataApi from './api/data'
import domApi from './api/dom'

function Eel (options) {
    if (!this instanceof Eel) {
        console.error('error new')
    }
    this._init(options)
}
// Mixin
initMixin(Eel)
stateMixin(Eel)
eventMixin(Eel)
directivesMixin(Eel)
compilerMixin(Eel)
// api
dataApi(Eel)
domApi(Eel)
export default Eel