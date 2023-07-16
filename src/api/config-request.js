import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import qs from 'qs'

// create an axios instance
const service = axios.create({
  baseURL: 'http://127.0.0.1:8080', 
  // baseURL: process.env.VUE_APP_BASE_API, 
  // baseURL: 'https://csubigdata.com/fut_trading_api/' , 
  timeout: 0, 
})

// request interceptor
service.interceptors.request.use(
    config => {
      // do something before request is sent
      // config.headers['Access-Control-Allow-Origin'] = "*"
      // config.headers['Access-Control-Allow-Methods'] = "*"

      // console.log(config,'config')
      return config
    },
  error => {
    // do something with request error
    // console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    // console.log(response, 'response')
    // var response = JSON.parse(response)
    const res = response.data
    // 状态码不是200，报错
    // console.log(res)
    if (res.code !== 200) {
      Message({
        message: res.msg || '操作错误',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.message || '操作错误'))
    } else {
      return res
    }
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

const httpRequest = {
  // post请求提交
  post(url, params) {
    return service.post(url, params, {
      transformRequest : [(params) => {
        return JSON.stringify(params)
      }],
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  // put请求提交
  put(url, params) {
    return service.put(url, params, {
      transformRequest : [(params) => {
        return JSON.stringify(params)
      }],
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },

  putParams(url, params) {
    return service.put(url, params, {
      params,
      paramsSerializer: (params) => {
        return qs.stringify(params)
      },  
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  },
 

  // putParams(url, params) {
  //   return service.put(url,  {
  //     params,
  //     paramsSerializer : (params) => {
  //       return qs.stringify(params)
  //     },
  //   })
  // },

  //get请求
  get(url, params) {
    return service.get(url, {
      params,
      paramsSerializer: (params) => {
        return qs.stringify(params)
      }
    })
  },
  // RESTful的get请求
  getRestApi(url, params) {
    let _params
    if (Object.is(params, undefined || null)) {
      _params = ''
    } else {
      _params = '/'
      for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== '') {
          _params += `${params[key]}/`
        }
      }
      _params = _params.substr(0, _params.length - 1)
    }
    if (_params) {
      return service.get(`${url}${_params}`)
    } else {
      return service.get(url)
    }
  },

  //删除请求
  delete(url, params) {
    let _params
    if (Object.is(params, undefined || null)) {
      _params = ''
    } else {
      _params = '/'
      for (const key in params) {
        if (params.hasOwnProperty(key) && params[key] !== null && params[key] !== '') {
          _params += `${params[key]}/`
        }
      }
      _params = _params.substr(0, _params.length - 1)
    }
    if (_params) {
      return service.delete(`${url}${_params}`).catch(e => {
        message.error(e.msg)
        return Promise.reject(e)
      })
    } else {
      return service.delete(url).catch(e => {
        message.error(e.msg)
        return Promise.reject(e)
      })
    }
  },
  // 文件上传请求
  upload(url, params) {
    return service.post(url, params, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  //登录请求
  login(url, params) {
    return service.post(url, params, {
      transformRequest: [(params) => {
        return qs.stringify(params)
      }],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }
}
export default httpRequest