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
        console.log(data)
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
        if (typeof window.userInfo === 'object' && window.userInfo.logined){
            this.sendJSON({
                cmd:'login',
                name: window.userInfo.name,
                password: window.userInfo.password
            })
        }
        if (!loaded && page === 'home'){
            this.sendJSON({
                cmd:'get',
                path:'/'
            })
            loaded = true
        }
    }
    sendJSON(data){
        this.send(JSON.stringify(data))
    }
}

var markdownOptions = {
	html: false,
	xhtmlOut: false,
	breaks: true,
	langPrefix: '',
	linkify: true,
	linkTarget: '_blank" rel="noreferrer',
	typographer:  true,
	quotes: `""''`,

	doHighlight: true,
	highlight: function (str, lang) {
		if (!markdownOptions.doHighlight || !window.hljs) { return ''; }

		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (__) {}
		}

		try {
			return hljs.highlightAuto(str).value;
		} catch (__) {}

		return '';
	}
};

var md = new Remarkable('full', markdownOptions);

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

function clearContent(){
    var content = document.getElementById('content')
    content.innerHTML = ''
}

function appendContent(code){
    var content = document.getElementById('content')
    content.innerHTML += code
}

function goHome(){
    page = 'home'
    clearContent()
    /* 
    appendContent(`<h1>欢迎来到小张论坛！</h1>
    <p>您好，欢迎来到小张论坛。</p>
    <p>这是一个简易的论坛，没有过多的样式，请您见谅。</p>
    <p>本论坛由<a href = "https://www.zhangsoft.cf/">小张软件</a>编写，全部自创，因为没有关于这方面的经验，所以可能会出现一些不尽人意的事情，敬请谅解。</p>
    <del>话说这东西怎么这么像上世纪八九十年代的产物……</del>`)
    */
    getWork('/')
}

function about(){
    page = 'about'
    clearContent()
    appendContent(`<h1>关于小张论坛</h1>
    <p>感谢您使用小张论坛！</p>
    <p>关于这个论坛的诞生，还要追溯到2022年12月22日。</p>
    <p>那几天，小张注册了WinterBBS，但是几天后小张却被封禁了，而且他什么违规事情都没有做，后续究其原因还是因为几个聊天室之间的摩擦导致的（WinterBBS站长想要以封禁账号来“威胁”小张）。</p>
    <p>那天晚上，spr（WinterBBS站长的简称）来到小张所管辖的XChat进行谈判，且口气很大，引起小张等管理员不满，随后被小张封禁</p>
    <p>spr被封禁几分钟后后，小张的账号被解封，疑似在“讨好”</p>
    <p>但是小张可不是他想象的那种人，小张趁着被解封的那段时间里，在WinterBBS发表了《再见，论坛》，宣布从第二天开始他要自己写论坛，随后扬长而去</p>
    <p>第二天，本论坛诞生</p>`)
}

function getMe(){
    page = 'me'
    if (typeof window.userInfo !== 'object' || !window.userInfo.logined){
        clearContent()
        var content = document.getElementById('content')
        var h1El = document.createElement('h1')
        h1El.innerText = '登录到小张论坛'
        content.appendChild(h1El)
        var nameLable = document.createElement('label')
        nameLable.textContent = '用户名：'
        var nameInput = document.createElement('input')
        nameInput.id = 'login-name-input'
        nameInput.type = 'text'
        var passwordLable = document.createElement('label')
        passwordLable.textContent = '密码：'
        var passwordInput = document.createElement('input')
        passwordInput.id = 'login-password-input'
        passwordInput.type = 'password'
        var loginButton = document.createElement('button')
        loginButton.textContent = '登录'
        var regLink = document.createElement('a')
        regLink.href = '/reg.html'
        regLink.textContent = '没有账号？注册一个！'
        loginButton.onclick = function (e){
            if (!ws || ws.readyState !== 1){
                return pushWarn('抱歉，目前无法和服务器取得联系，请稍后再试')
            }
            if (!nameInput.value || !passwordInput.value){
                return pushWarn('用户名和密码不能为空，请重试')
            }
            if (typeof window.userInfo === 'object'){
                return pushWarn('您已经登录了')
            }
            window.localStorage.password = passwordInput.value
            ws.sendJSON({
                cmd:'login',
                name: nameInput.value,
                password: passwordInput.value
            })
            //document.getElementById('go-home').click()
        }
        content.appendChild(nameLable)
        content.appendChild(nameInput)
        content.appendChild(document.createElement('br'))
        content.appendChild(document.createElement('br'))
        content.appendChild(passwordLable)
        content.appendChild(passwordInput)
        content.appendChild(document.createElement('br'))
        content.appendChild(document.createElement('br'))
        content.appendChild(loginButton)
        content.appendChild(document.createElement('br'))
        content.appendChild(document.createElement('br'))
        content.appendChild(regLink)
    }else{
        clearContent()
        var content = document.getElementById('content')
        var h1El = document.createElement('h1')
        h1El.textContent = '您好，'+window.userInfo.name
        content.appendChild(h1El)
    }
}

function writePage(){
    if (!window.userInfo || !window.userInfo.logined || !ws.logined){
        return pushWarn('登录后才能发帖哦')
    }
    page = 'write'
    clearContent()
    var h1El = document.createElement('h1')
    h1El.textContent = '发帖'
    var titleLabel = document.createElement('label')
    titleLabel.textContent = '题目：'
    var titleInput = document.createElement('input')
    titleInput.id = 'title-input'
    titleInput.type = 'text'
    var contentLabel = document.createElement('label')
    contentLabel.textContent = '内容：'
    var userInput = document.createElement('textarea')
    userInput.id = 'write-input'
    var sendButton = document.createElement('button')
    sendButton.textContent = '发布'
    sendButton.id = 'publish'
    var content = document.getElementById('content')
    content.appendChild(h1El)
    content.appendChild(titleLabel)
    content.appendChild(titleInput)
    content.appendChild(document.createElement('br'))
    content.appendChild(document.createElement('br'))
    content.appendChild(contentLabel)
    content.appendChild(userInput)
    content.appendChild(document.createElement('br'))
    content.appendChild(document.createElement('br'))
    content.appendChild(sendButton)
    sendButton.onclick = function(e){
        if (!window.userInfo || !window.userInfo.logined || !ws.logined){
            return pushWarn('登录后才能发帖哦')
        }
        if (!titleInput.value){
            return pushWarn('这个帖子的题目是？')
        }
        if (!userInput.value){
            return pushWarn('这个帖子的内容是？')
        }
        if (ws.readyState !== 1){
            return pushWarn('抱歉，目前无法和服务器取得联系')
        }
        ws.sendJSON({
            cmd:'publish',
            title: titleInput.value,
            content: userInput.value
        })
    }
}

function getWork(id){
    if (ws.readyState !== 1){
        return pushWarn('抱歉，目前无法从服务器上获取文章')
    }
    ws.sendJSON({
        cmd:'get',
        path:id
    })
}

var functions = {
    info: function(args){
        pushInfo(args.text)
    },
    warn: function(args){
        pushWarn(args.text)
    },
    setUser: function(args){
        ws.logined = true
        window.userInfo = {
            name: args.name,
            password: window.localStorage.password,
            logined: true
        }
        if (page === 'me'){
            document.getElementById('me').click()
        }
    },
    setWorks: function(args){
        if (page !== 'home'){
            return
        }
        clearContent()
        var i = 0
        for (i in args.result){
            let h2El = document.createElement('h2')
            let titleLink = document.createElement('a')
            titleLink.textContent = args.result[i].title
            titleLink.id = args.result[i].id
            titleLink.onclick = function(e){
                //console.log(e)
                getWork(e.target.id)
            }
            h2El.appendChild(titleLink)
            let writerEl = document.createElement('p')
            writerEl.textContent = 'By @' + args.result[i].writer
            let timeEl = document.createElement('p')
            timeEl.textContent = '写于 ' + args.result[i].time
            let contentEl = document.getElementById('content')
            contentEl.appendChild(h2El)
            contentEl.appendChild(writerEl)
            contentEl.appendChild(timeEl)
            contentEl.appendChild(document.createElement('hr'))
        }
    },
    setWork: function(args){
        if (page !== 'home'){
            return
        }
        clearContent()
        var title = document.createElement('h1')
        title.textContent = args.result.title
        var writer = document.createElement('h6')
        writer.textContent = 'By @' + args.result.writer
        var content = document.createElement('div')
        content.innerHTML = md.render(args.result.content)
        var timeEl = document.createElement('h6')
        timeEl.textContent = '写于 ' + args.result.time
        var contentEl = document.getElementById('content')
        contentEl.appendChild(title)
        contentEl.appendChild(writer)
        contentEl.appendChild(content)
        contentEl.appendChild(document.createElement('br'))
        contentEl.appendChild(timeEl)
    }
}

var page = 'home'

document.getElementById('go-home').onclick = function(e) {
    goHome()
}

document.getElementById('me').onclick = function(e) {
    getMe()
}

document.getElementById('write').onclick = function(e) {
    writePage()
}

document.getElementById('about').onclick = function(e) {
    about()
}

var ws = new connection()

var loaded = false