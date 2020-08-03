const net = require('net');

class Request {
    constructor(options) {
        this.method = options.method || 'GET';
        this.host = options.host
        this.port = options.post || 8088
        this.path = options.path || '/'
        this.body = options.body || {}
        this.headers = options.headers || {}
        if (!this.headers['Content-Type']) {
            this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }

        if (this.headers['Content-type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body)
        } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key} = ${encodeURIComponent(this.body[key])}`).join('&')
        }

        this.headers['Content-length'] = this.bodyText.length
    }

    // 异步
    // 第三·步发送请求
    // 设计支持已有的connection或者自己新建connection
    // 收到数据传给parser
    // 根据parser的状态resolve Promise
    send(connection) {
        return new Promise((resolve, reject) => {
            if (connection) {
                connection.write(this.toString())
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString())
                })
            }

            connection.on('data', (data) => {
                const parser = new ResponseParser()
                parser.receive(data.toString())
                if (parser.isFinished) {
                    resolve(parser.response)
                    connection.end()
                }
            })

            connection.on('error', err => {
                reject(err)
                connection.end()
            })
        })
    }

    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r\nHOST: ${this.host}\r\n${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\n\r\n${this.bodyText}\r\n`
    }
}

// 第四步
// Response必须分段构造，所以用一个parser来装配
// ResponseParser分段处理ResponseText，用状态机来分析文本的结构
class ResponseParser {
    constructor() {
        this.WAITING_STATUS_LINE = 0
        this.WAITING_STATUS_LINE_END = 1
        this.WAITING_HEADER_NAME = 2
        this.WAITING_HEADER_SPACE = 3
        this.WAITING_HEADER_VALUE = 4
        this.WAITING_HEADER_LINE_END = 5
        this.WAITING_HEADER_BLOCK_END = 6
        this.WAITING_BODY = 7

        this.current = this.WAITING_STATUS_LINE
        this.statusLine = '' // 字符串
        this.headers = {}
        this.headerName = ''
        this.headerValue = ''
        this.bodyParser = null
    }
    receive(string) {
        console.log('s2222tring', string)
        for (let i = 0; i < string.length; i++) {
            this.receiveChar(string.charAt(i))
        }
    }

    receiveChar(char) {
        if (this.current === this.WAITING_STATUS_LINE) {
            if (char === '\r') {
              this.current = this.WAITING_STATUS_LINE_END
            } else {
              this.statusLine += char
            }
          } else if (this.current === this.WAITING_STATUS_LINE_END) {
            if (char === '\n') {
              this.current = this.WAITING_HEADER_NAME
            }
          } else if (this.current === this.WAITING_HEADER_NAME) {
            if (char === ':') {
              this.current = this.WAITING_HEADER_SPACE
            } else if (char === '\r') {
              this.current = this.WAITING_HEADER_BLOCK_END
              if (this.headers['Transfer-Encoding'] === 'chunked')
                this.bodyParse = new TrunkedBodyParser()
            } else {
              this.headerName += char
            }
          } else if (this.current === this.WAITING_HEADER_SPACE) {
            if (char === ' ') {
              this.current = this.WAITING_HEADER_VALUE
            }
          } else if (this.current === this.WAITING_HEADER_VALUE) {
            if (char === '\r') {
                this.current = this.WAITING_HEADER_LINE_END
                this.header[this.headerName] = this.headerValue
                this.headerName = ''
                this.headerValue = ''
            } else {
                this.headerValue += char
            }
        } else if (this.current === this.WAITING_HEADER_LINE_END) {
            if (char === '\n') {
                this.current = this.WAITING_HEADER_NAME
            }
        } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
            if (char === '\n') {
                this, current = this.WAITING_BODY
            }
        } else if (this.current === this.WAITING_BODY) {
            console.log(char)
        }
    }
}

void async function () {
    let request = new Request({
        method: 'POST',
        host: '127.0.0.1',
        port: '8088',
        path: '/',
        headers: {
            ["X-Foo2"]: 'customed'
        },
        body: {
            name: 'rachel'
        }
    })

    let response = await request.send()

    console.log(response)
}()