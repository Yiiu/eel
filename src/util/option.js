/**
 * Created by yuer on 2017/5/16.
 */
let hook = ['mounted', 'created']
export function mergeOptions (o, e, vm) {
    let arr = {
        components: {},
        directives: {}
    }
    Object.keys(o)
        .forEach(type => {
            if (type === 'components' && o[type]) {
                Object.keys(e[type])
                    .forEach(name => {
                        arr.components[name] = e[type][name]
                    })
            } else {
                arr[type] = o[type]
            }
        })
    Object.keys(e)
        .forEach(type => {
            if (type === 'components' && e[type]) {
                Object.keys(e[type])
                    .forEach(name => {
                        arr.components[name] = e[type][name]
                    })
            } else if (type === 'name') {
                vm.name = e[type]
            } else if (type === '_isComponent') {
                vm._isComponent = e[type]
            } else {
                arr[type] = e[type]
            }
        })
    return arr
}