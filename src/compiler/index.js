/**
 * Created by yuer on 2017/5/6.
 */

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g

export function parseHTML (text) {
    console.log(defaultTagRE.exec(text))
}