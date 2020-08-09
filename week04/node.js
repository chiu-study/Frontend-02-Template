const http = require('http')

const hostname = '127.0.0.1'
const port = 8088

const server = http.createServer((req, res) => {
  let body = []
  req.on('error', err => {
    console.error(err)
  }).on('data', chunk => {
    body.push(chunk)  // Buffer.concat()的参数是List of Buffer or Uint8Array
  }).on('end', () => {
    body = Buffer.concat(body).toString()
    console.log('body', body)
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('hello word');
  })
})

server.listen(port, hostname, () => {
  console.log(`服务器运行在 http://${hostname}:${port}/`)
})