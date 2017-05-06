/**
 * Created by yuer on 2017/5/6.
 */
import { initMixin } from './init'
import { stateMixin } from './state'

function Eel (options) {
    if (!this instanceof Eel) {
        console.error('error new')
    }
    this._init(options)
}
initMixin(Eel)
stateMixin(Eel)
export default Eel