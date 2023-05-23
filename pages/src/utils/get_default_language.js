import cookie from 'react-cookies'


export default function getDefaultLanguage(){
    let language = 'English'
    if(cookie.load('language')){
        language = cookie.load('language')
    }else{
        if(navigator.language == 'zh-CN'){
            language = '中文'
        }else{
            language = 'English'
        }
    }
    return language
}