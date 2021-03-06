//这里放置action创建函数
import * as types from '../constants/ActionTypes'

function receiveAllClients(list) {
  return {
    type: types.CLIENTLIST_SUCCESS,
    list
  }
}
function receiveDumpLog(log) {
  return {
    type: types.DUMPLOG_SUCCESS,
    log
  }
}

function requestGameList() {
  return {
    type: types.GETGAMELIST_REQUEST,
  }
}

function requestGameListFailure() {
  return {
    type: types.GETGAMELIST_FAILURE,
  }
}

//判断是否应该发送请求
function shouldFetchPosts(state) {
  return state.gameList.isFetching?false:true
}

//当 action creator 返回函数时，这个函数会被 Redux Thunk middleware 执行。这个函数并不需要保持纯净；它还可以带有副作用，包括执行异步 API 请求。
//异步获取gamelist
export function getGameListIfNeeded() {
  return (dispatch, getState) => {

    if (shouldFetchPosts(getState())) {
      // 在 thunk 里 dispatch 另一个 thunk！

      return dispatch(getGameList())
    } else {
      // 告诉调用代码不需要再等待。
      return Promise.resolve()
    }
  }
}

export function startWscClient() {
  return (dispatch, getState) => {
    var ws = new WebSocket('ws://pm2b.com:4096/wsclient')
    ws.onopen = () => {
      console.log(`CLIENT connected`)

      let clientId = "controller--" + new Date().toUTCString()
      let req = {
        header: "clientInfo",
        clientId: clientId
      }
      ws.send(JSON.stringify(req))

      ws.onmessage = (msg) => {
        console.log(msg.data);
        let data = JSON.parse(msg.data)
        switch(data.header){
          case 'allClient':
            dispatch(receiveAllClients(data.clients))
            break
          case 'dumpLog':
            dispatch(receiveDumpLog(data.log))
            break
          default:
            break
        }
      }

      ws.send(JSON.stringify({header:'allClient'}));
    }
  }
}

export function getAllClient() {


  return (dispatch, getState) => {

    // 首次 dispatch：更新
    // 应用的 state 来通知请求发起。
    const filter = getState().catalogFilter
    dispatch(requestGameList()) //注意：因为dispatch接受的参数是action creater的返回对象，所以参数中的函数需要加（），如果不加，在引入thunk中间件后，thunk会错误理解这是一个函数型的返回值，导致既不会报错，也不会正确执行

    //fetch是用来代替XMLHttpRequest的新API
    return fetch(`http://localhost:3000/getGameList?id=${filter}`) //这里的url写在这里是错误的，应该定义在配置文件中，待统一处理 **你可以随意更改此条URL以体验各种错误情况**
      .then(response => {
        console.log(response)
        if (response.ok) {
          return response.json()
        } else {
          throw new Error(response.status)
        }
      })
      .then(json =>
        dispatch(receiveGameList(json))
      )
      .catch(e => {
        console.log('fetch error:', e)
        dispatch(requestGameListFailure())
      }) //关于promise的坑：http://efe.baidu.com/blog/promises-anti-pattern/?utm_source=tuicool&utm_medium=referral
  }
}
//同步获取数据
export function getGameCatalog(catalog) {
  return {
    type: types.INIT_CATALOG,
    catalog
  }
}


export function SelectClient(id) {
  return {
    type: types.SET_CURRENT_CLIENT,
    id
  }
}
export function SelectRegion(region) {
  return {
    type: types.SET_CURRENT_REGION,
    region
  }
}
//点击一个联赛筛选  真实环境这里应该是传入联赛id
export function activeALeagueFilter(name) {
  return {
    type: types.ACTIVE_A_FILTERS,
    name
  }
}

