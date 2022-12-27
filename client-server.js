const http = require('http')
const fs = require('fs')
const url = require('url')

var server = http.createServer((req,res) => {
    const parsed = url.parse(req.url)
    var path = parsed.path
    console.log(`客户端请求地址：${path}`)
    if (!path || path === '/'){
        path = '/index.html'
    }
    path = './client' + path
    console.log('读取地址：'+path)
    if (!fs.existsSync(path)){
        res.setHeader('Content-Type','text/plain')
        res.statusCode = 404
        res.write('404 Not Found')
        return res.end()
    }
    try{
        var text = fs.readFileSync(path)
    }catch(err){
        res.setHeader('Content-Type','text/plain')
        res.statusCode = 500
        res.write('500 Server Error')
        return res.end()
    }
    //res.statusCode = 200
    //res.setHeader('Content-Type','text/html')
    res.write(text)
    return res.end()
})

server.listen(81)    //别忘了。艹，还有端口