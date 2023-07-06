// index.ts
import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import cookie from 'react-cookies'
import get_default_language from './utils/get_default_language.js'
import {BASE_URL} from './utils/axios.js'

const LanguageMap = {
    'English': 'en-us',
    '中文': 'zh-cn',
}

type Result = {
  code: number;
  msg: string;
  data: any;
};
class Request {
  // axios 实例
  instance: AxiosInstance;
  // 基础配置，url和超时时间
  baseConfig: AxiosRequestConfig = { baseURL: "/api", timeout: 600000 };
  
  constructor(config: AxiosRequestConfig) {
    // 使用axios.create创建axios实例
    this.instance = axios.create(Object.assign(this.baseConfig, config));
    
    this.instance.interceptors.request.use(
      (config) => {
        // 一般会请求拦截里面加token
        let token = cookie.load('token')
        // config.withCredentials = true
        const language = get_default_language()
        console.log('language=', language)
        if(config.headers){
            config.headers["Authorization"] = token;
            config.headers["Accept-Language"] = LanguageMap[language] || 'zh-cn';
            // config.headers["token"] = token;
            // config.headers["Access-Control-Allow-Origin"]="http://192.168.0.103:8000"
        }
        // if(token){
        //   config.withCredentials = true
        //   config.headers["token"] = token;
        // }

        return config;
      },
      (err: any) => {
        return Promise.reject(err);
      }
    );

    this.instance.interceptors.response.use(
      (res: AxiosResponse) => {
        // 直接返回res，当然你也可以只返回res.data
        return res.data;
      },
      (err: any) => {
        // 这里用来处理http常见错误，进行全局提示
        let message = "";

        // 这里错误消息可以使用全局弹框展示出来
        // 比如element plus 可以使用 ElMessage
        // 这里是AxiosError类型，所以一般我们只reject我们需要的响应即可
        return Promise.reject(err.response);
      }
    );
  }

  // 定义请求方法
  public request(config: AxiosRequestConfig): any {
    return this.instance.request(config);
  }

  public async get(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<any> {
    let response = await this.instance.get(BASE_URL+url, config);
    if(response['code'] === 401){
      cookie.remove("token")
      cookie.remove("userName")
      cookie.remove("userId")
      window.location.href = '/'
    }
    return response
  }
  public async post(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<any> {
    let response = await this.instance.post(BASE_URL + url, data, config);

    if(response['code'] === 401){
      cookie.remove("token")
      cookie.remove("userName")
      cookie.remove("userId")
    }
    return response
  }
  public put(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): any {
    return this.instance.put(BASE_URL+url, data, config);
  }

  public delete(
    url: string,
    config?: AxiosRequestConfig
  ): any {
    return this.instance.delete(BASE_URL+url, config);
  }
}

export default Request;