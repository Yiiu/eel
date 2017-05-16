/**
 * Created by yuer on 2017/5/16.
 */

import { replace } from '../../util/dom'
const directivesRE = /^v-(\w+)/
export default function (Eel) {
    Eel.directives('component', {
        bind () {
            if (!this.el.__Y__) {
                let Pla = this._Pla = document.createComment('(●ˇ∀ˇ●)')
                // replace(this.el, this._Pla)
                this.insert()
            }
        },
        update (val, newVal) {

        },
        insert () {
            let dom = document.createElement('div')
            let options = {
                el: dom,
                parent: this.vm
            }
            let com = this.component = new this.vm.$option.components[this._name](options)
            com.$replace(this.el)
            this.dir(com.$el, this.el.attributes)
        },
        dir (dom, attributes) {
            Array.prototype
                .slice
                .call(attributes)
                .forEach(attr => {
                    if (directivesRE.test(attr.name)) {
                        this.component._compileDir(attr, dom)
                    }
                })
        }
    })
}