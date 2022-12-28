const websocket = require('ws')
const sqlite = require('./sqlite')
const crypto = require('crypto');
const moment = require('moment')
const rateLimiter = require('./RateLimiter')

var police = new rateLimiter()    //《警察》
const passwordSalt = 'put your salt here!'

class WebSocketServer extends websocket.Server{
    constructor(serverPort,commands){
        super({
            port: serverPort
        })
        this.commands = commands
        this.on('connection',(socket,request) => {
            this.newConnection(socket,request)
        })
    }
    newConnection(socket, request){
        socket.address = request.headers['x-forwarded-for'] || request.connection.remoteAddress
        socket.on('message',(data) => {
            this.onMessage(socket,data)
        })
    }
    onMessage(socket,data){
        if (police.frisk(socket.address,0)){
            return server.reply({
                cmd:'warn',
                text:'您的操作过于频繁或被封禁'
            },socket)
        }
        const message = data.toString()
        try{
            var payload = JSON.parse(message)
        }catch(err){
            socket.terminate()
        }
        if (!payload.cmd){
            return
        }
        if (typeof this.commands[payload.cmd] !== 'function'){
            return this.reply({
                cmd:'warn',
                text:'无效的操作'
            },socket)
        }
        try{
            this.commands[payload.cmd](this,socket,payload)
        }catch(err){
            this.reply({
                cmd:'warn',
                text:'服务器错误：'+err
            },socket)
        }
    }
    reply(payload,socket){
        const outgoingPayload = JSON.stringify(payload)
        socket.send(outgoingPayload)
    }
}

function sha256(text,salt){
    return crypto.createHash('SHA256').update(text + salt).digest('hex');
}

const db = new sqlite.SqliteDB('bbs.db')

var functions = {
    login: async function(server,socket,args){
        if (police.frisk(socket.address,5)){
            return server.reply({
                cmd:'warn',
                text:'您登录的速度过快，请稍后重试'
            },socket)
        }
        if (!args.name || !args.password || typeof args.name !== 'string' || typeof args.password !== 'string'){
            return server.reply({
                cmd:'warn',
                text:'您提供的数据无效'
            },socket)
        }
        if (!/^[\u4e00-\u9fa5_a-zA-Z0-9]{1,24}$/.test(args.name)){
            return server.reply({
                cmd:'warn',
                text:'用户名只能是由汉字、英文字母、数字和下划线组成，并且总长度不能超过24位'
            },socket)
        }
        const encoded = sha256(args.password,passwordSalt)
        const sql = `select * from users where name = '${args.name.toLowerCase()}' and password = '${encoded}';`
        await db.awaitQueryData(sql).then(ret => {
            if (ret.length === 0){
                return server.reply({
                    cmd:'warn',
                    text:'您输入的用户名可能不存在，或者密码不匹配'
                },socket)
            }
            if (ret[0].banned){
                return server.reply({
                    cmd:'warn',
                    text:`抱歉，您（${args.name.toLowerCase()}）已被站长封禁，目前无法登录。如需解封，请联系站长。`
                },socket)
            }
            socket.userInfo = {
                name: args.name.toLowerCase(),
                utype: ret[0].utype,
            }
            server.reply({
                cmd:'info',
                text:'登录成功，其他功能将会在未来完成，敬请期待哦'
            },socket)
            server.reply({
                cmd:'setUser',
                name: args.name.toLowerCase()
            },socket)
        })
    },
    reg: async function(server,socket,args){
        if (police.frisk(socket.address,7)){
            console.log(police.search(socket.address).score)
            return server.reply({
                cmd:'warn',
                text:'您注册账号过于频繁，请稍后再试'
            },socket)
        }
        if (!args.name || !args.password || typeof args.name !== 'string' || typeof args.password !== 'string'){
            return server.reply({
                cmd:'warn',
                text:'您提供的数据无效'
            },socket)
        }
        if (!/^[\u4e00-\u9fa5_a-zA-Z0-9]{1,24}$/.test(args.name)){
            return server.reply({
                cmd:'warn',
                text:'用户名只能是由汉字、英文字母、数字和下划线组成，并且总长度不能超过24位'
            },socket)
        }
        const encoded = sha256(args.password,passwordSalt)
        const sql = `select * from users where name = '${args.name.toLowerCase()}';`
        await db.awaitQueryData(sql).then(ret => {
            if (ret.length !== 0){
                return server.reply({
                    cmd:'warn',
                    text:'已经有人使用了此用户名，请更换一个再试'
                },socket)
            }
            //utype的值可以是user或admin，user代表普通用户，admin代表站长，站长发的帖子会被标记为站长帖
            var tileData = [[args.name.toLowerCase(),encoded,0,socket.address,moment().format('YYYY-MM-DD HH:mm:ss'),'user']]
            var insertTileSql = "insert into users(name,password,banned,ip,time,utype) values(?,?,?,?,?,?)"
            db.insertData(insertTileSql, tileData);
            server.reply({
                cmd:'info',
                text:'注册成功，感谢您使用小张论坛'
            },socket)
        })
    },
    get: async function(server,socket,args){
        if (police.frisk(socket.address,1)){
            return server.reply({
                cmd:'warn',
                text:'您请求文章过于频繁，请稍后再试'
            },socket)
        }
        if (!args.path || typeof args.path !== 'string'){
            return server.reply({
                cmd:'warn',
                text:'参数无效'
            },socket)
        }
        if (args.path === '/'){
            var sql = `select * from works;`
        }else if (/^[a-zA-Z0-9]{1,10}$/.test(args.path)){    //10位大小写字母+数字，这是不可能注入的
            var sql = `select * from works where id = '${args.path}';`
        }else{
            return server.reply({
                cmd:'warn',
                text:'参数不符合规范'
            },socket)
        }
        await db.awaitQueryData(sql).then(ret => {
            if (ret.length === 0){
                return server.reply({
                    cmd:'info',
                    text:'这里空空如也'
                },socket)
            }
            if (args.path === '/'){
                var works = []
                var i = 0
                for (i in ret){
                    works.push({
                        id: ret[i].id,
                        title: ret[i].title,
                        writer: ret[i].writer,
                        time: ret[i].time,
                        admin: Boolean(ret[i].admin),
                    })
                }
                server.reply({
                    cmd:'setWorks',
                    result: works.reverse()
                },socket)
            }else{
                server.reply({
                    cmd:'setWork',
                    result: {
                        id: ret[0].id,
                        title: ret[0].title,
                        writer: ret[0].writer,
                        time: ret[0].time,
                        content: ret[0].content,
                        admin: Boolean(ret[0].admin),
                    }
                },socket)
            }
        })
    },
    publish: async function(server,socket,args){
        if (police.frisk(socket.address,10)){
            return server.reply({
                cmd:'warn',
                text:'您发帖过于频繁，请稍后再试'
            },socket)
        }
        if (!socket.userInfo){
            return server.reply({
                cmd:'warn',
                text:'我不知道你是谁，但是我知道你应该登录'
            },socket)
        }
        if (typeof args.title !== 'string' || typeof args.content !== 'string' || !args.title || !args.content){
            return server.reply({
                cmd:'warn',
                text:'您提供的数据无效'
            },socket)
        }
        const sql = `select * from users where name = '${socket.userInfo.name.toLowerCase()}';`
        await db.awaitQueryData(sql).then(ret => {
            if (ret.length === 0){
                return server.reply({
                    cmd:'warn',
                    text:'哎呀，服务器内部出现身份验证错误，我们暂时无法在数据库中找到你的个人档案，请联系站长来报告此问题。'
                },socket)
            }
            if (ret[0].banned){
                return server.reply({
                    cmd:'warn',
                    text:`抱歉，您（${socket.userInfo.name.toLowerCase()}）已被站长封禁，目前无法发帖。如需解封，请联系站长。`
                },socket)
            }
            const id = Math.random().toString(36).substr(2, 8);
            var admin = 0
            if (socket.userInfo.utype === 'owner'){
                admin = 1
            }
            var tileData = [[id,args.title,socket.userInfo.name,args.content,moment().format('YYYY-MM-DD HH:mm:ss'),0,socket.address,admin]]
            var insertTileSql = "insert into works(id,title,writer,content,time,banned,ip,admin) values(?,?,?,?,?,?,?,?);"
            db.insertData(insertTileSql, tileData);
            server.reply({
                cmd:'info',
                text:'恭喜，发帖成功，请再接再厉！'
            },socket)
            server.reply({
                cmd:'goto',
                target: 'home'
            },socket)
        })
    }
}

var server = new WebSocketServer(8848,functions)    //8848钛金端口，可以自己改，不过改了以后就不是钛金端口了
console.log(`ZhangBBS server started, current time: ${moment().format('YYYY-MM-DD HH:mm:ss')}`)