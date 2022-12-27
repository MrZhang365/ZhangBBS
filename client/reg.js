class connection extends WebSocket{
    constructor(){
        super('ws://'+document.domain+':8848')    //创建连接
        this.onmessage = this.recv
        this.onclose = this.disconnect
        this.onopen = this.connected
        this.logined = false
    }
    recv(message){
        var data = JSON.parse(message.data)
        if (typeof functions[data.cmd] === 'function'){
            functions[data.cmd](data)
        }
    }
    disconnect(){
        this.logined = false
        pushWarn('与服务器的连接已断开，正在重新连接……')
        setTimeout(() => {
            ws = new connection()
        })
    }
    connected(){
        pushInfo('已连接到服务器')
    }
    sendJSON(data){
        this.send(JSON.stringify(data))
    }
}

function pushWarn(text){
    var divEl = document.createElement('div')
    divEl.classList.add('warn')
    var newEl = document.createElement('p')
    newEl.textContent = text
    divEl.appendChild(newEl)
    var header = document.getElementById('header')
    header.appendChild(divEl)
    setTimeout(() => {
        header.removeChild(divEl)
    },2000)
}

function pushInfo(text){
    var divEl = document.createElement('div')
    divEl.classList.add('info')
    var newEl = document.createElement('p')
    newEl.textContent = text
    divEl.appendChild(newEl)
    var header = document.getElementById('header')
    header.appendChild(divEl)
    setTimeout(() => {
        header.removeChild(divEl)
    },2000)
}

document.getElementById('commit-reg').onclick = function(e){
    const name = document.getElementById('reg-name').value
    const password = document.getElementById('reg-password').value
    if (ws.readyState !== 1){
        return pushWarn('抱歉，目前无法与服务器取得联系，请稍后再试')
    }
    if (!name || !password){
        return pushWarn('用户名和密码不能为空')
    }
    if (!document.getElementById('check').checked){
        return pushWarn('您好像漏了什么（不喜欢小张软件的可以自愿离开）')
    }
    ws.sendJSON({
        cmd:'reg',
        name:name,
        password:password
    })
}

var functions = {
    info: function(args){
        pushInfo(args.text)
    },
    warn: function(args){
        pushWarn(args.text)
    },
}

var ws = new connection()