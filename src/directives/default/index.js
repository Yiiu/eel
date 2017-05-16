/**
 * Created by yuer on 2017/5/12.
 */
import Vtext from './text'
import Vif from './if'
import Von from './on'
import Vmodel from './model'
import Vcomponent from './component'

export default function install (Eel) {
    Vtext(Eel)
    Vif(Eel)
    Von(Eel)
    Vmodel(Eel)
    Vcomponent(Eel)
}