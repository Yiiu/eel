/**
 * Created by yuer on 2017/5/6.
 */
import * as parse from '../compiler/index'
export function compilerMixin (Eel) {
    Eel.prototype._parseHTML = parse.parseHTML
    Eel.prototype._compileDir = parse.compileDir
    Eel.prototype._compileNode = parse.compileNode
    Eel.prototype._compileDomNode = parse.compileDomNode
    Eel.prototype._compileTextNode = parse.compileTextNode
    Eel.prototype._compileComponentNode = parse.compileComponentNode
}