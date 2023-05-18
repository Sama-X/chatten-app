import en from './en-US.js'
import zh from './zh-CN.js'


export default function getLocales(language) {
    if(language=='English'){
        return en
    }else if(language=='中文'){
        return zh
    }
}