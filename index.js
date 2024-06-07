const { Plugin } = require('siyuan');

// wait-finish module
const g = typeof window === 'undefined' ? global : window;

const newPromiseWithResolve = () => {
    let re;
    const promise = new Promise((resolve) => {
        re = resolve;
    });
    return { resolve: re, promise };
}

const wait = (event, callback) => {
    if (!g._waitList) {
        g._waitList = {};
    }
    if (!g._waitList[event]) {
        const { resolve, promise } = newPromiseWithResolve();
        g._waitList[event] =  { promise, resolve };
        callback && promise.then(callback);
        return promise;
    } else {
        const { promise } = g._waitList[event];
        callback && promise.then(callback);
        return promise;
    }
}

const finish = (event, result) => {
    if (!g._waitList) {
        g._waitList = {};
    }
    if (!g._waitList[event]) {
        const { resolve, promise } = newPromiseWithResolve();
        g._waitList[event] =  { promise, resolve };
        resolve(result);
    } else {
        const { resolve } = g._waitList[event];
        resolve(result);
    }
}

module.exports = class DemoPlugin extends Plugin {
    onload() {
      let handler;
      // 等待后端插件模块完成handler创建并提供给当前插件
      wait('backend-handler_'+this.name, (h) => {
          handler = h;
          handler.send("hello world"); // 发送消息给本插件的后端模块
          handler.listen(console.log) // 接收数据返回
          setInterval(() => handler.send(Math.random()), 1000);
          // **注意**：数据交换是跨进程之间的通信，所以你必须手动进行数据的序列化和反序列化
          // 例如： JSON.stringfy和JSON.parse
          // 目前仅支持使用字符串形式传递接收数据，不支持unit8Array等序列化形式
      }); 
      // 也可以通过事件总线监听数据返回
      // this.eventBus.on('backend-plugin', log); // 数据接收
      // this.eventBus.on('backend-plugin-log', log); // 日志接收
    }
}