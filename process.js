const { bridge, logger } = require("siyuan-backend-plugin");
const fs = require('fs');

let number;
let server;
const httpport = 3001;

// write file to local system
const tmp = require('os').tmpdir();
const path = require('path');
const http = require("http");
const logFile = path.join(tmp, 'process.log');
const writeLog = (message) => {
    fs.appendFile(logFile, `[${new Date().toLocaleString()}] ${message}\n`, (err) => {
        err && console.error(err);
    });
}

// 监听connect事件，即插件系统与后端模块首次连接或恢复连接
bridge.on("connect", () => {
  logger.info("connected");
  writeLog("connected")
  bridge.send("hello, I am connected");

  // 使用nodejs的http模块创建http服务器
  if (!server) {
    server = http.createServer((req, res) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/plain;charset=utf-8");
        const log = `你好世界
PID:${process.pid} PPID: ${process.ppid}
number: ${number}
LogFile: ${logFile}
        `
        res.end(log);
        logger.info(log)
      });
    server.listen(httpport, () => {
        logger.info(`服务器运行在 http://:${httpport}/`);
    });
    }
});
// 监听message事件，即收到从插件发送过来的消息
bridge.on("message", (data) => {
  logger.info("message:", data);
  writeLog(`message: ${data}`);
  number = data;
  if (data === "hello") {
    // 向后端模块所属插件发送消息
    bridge.send("hello, too");
  } else {
    bridge.send("Recieved: " + data);
  }
});
// 监听disconnect事件，即后端模块与插件系统失去了连接
bridge.on("disconnect", () => {
  logger.info("disconnect");
});

