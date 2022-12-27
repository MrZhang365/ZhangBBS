# 小张论坛  
## 介绍 
这是一个简易的论坛，所有代码都是从头开始写的，没有使用任何论坛模板。  
客户端使用WebSocket协议来和服务端通信，服务端使用SQLite数据库来存储数据，用户密码被使用加盐的SHA256来加密存储。  
因为这是一个简易的论坛，所以网页的CSS没有设置太多的样式，样式的问题将会在后续的更新里解决。  

## 论坛的不为人知的小故事  
>关于这个论坛的诞生，还要追溯到2022年12月22日。  
>那几天，小张注册了WinterBBS，但是几天后小张却被封禁了，而且他什么违规事情都没有做，后续究其原因还是因为几个聊天室之间的摩擦导致的（WinterBBS站长想要以封禁账号来“威胁”小张）。  
>那天晚上，spr（WinterBBS站长的简称）来到小张所管辖的XChat进行谈判，且口气很大，引起小张等管理员不满，随后被小张封禁。  
>spr被封禁几分钟后后，小张的账号被解封，疑似在“讨好”。  
>但是小张可不是他想象的那种人，小张趁着被解封的那段时间里，在WinterBBS发表了《再见，论坛》，宣布从第二天开始他要自己写论坛，随后扬长而去。  
>第二天，本论坛诞生。  

## 部署
### 运行环境  
- NodeJS 18.12.1

### 安装与运行  
1. 克隆此仓库
2. 切换到仓库目录下，执行 `npm install`
3. 修改 `main.js` 里面的第6行代码，把 `passwordSalt` 改成其他的盐值
4. 执行 `npm start` 来启动论坛服务器，执行 `npm stop` 可以关闭论坛服务器，`npm restart` 可以重启论坛服务器
5. 论坛的WebSocket端口号默认为8848钛金端口，HTTP端口号为81

## 其他  
- 请不要做出违反许可证的行为
- ~~请不要把精力放在本仓库上，不要给本仓库点star，不要fork本仓库，不要克隆本仓库，不要使用小张论坛。为什么？因为这是个垃圾代码，不值得一试。~~
- 如果你真的对这~~一大堆垃圾~~仓库感兴趣，您可以尝试点个star，然后follow MrZhang365
- 部分编程习惯借鉴自 [HackChat](https://github.com/hack-chat/main)