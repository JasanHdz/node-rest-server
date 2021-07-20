const express = require('express')
const { config } = require('../config')
const { join } = require('path')
const cors = require('cors')
const { dbConnection } = require('../db/config')
const fileUpload = require('express-fileupload')
const { socketController } = require('../sockets/socket-controller')

class Server {
  constructor() {
    this.app = express()
    this.port = config.port
    this.server = require('http').createServer(this.app)
    this.io = require('socket.io')(this.server)
    this.paths = {
      users: '/api/users',
      categories: '/api/categories',
      products: '/api/products',
      auth: '/api/auth',
      search: '/api/search',
      uploads: '/api/uploads'
    }
    this.dbConnect()
    this.middlewares()
    this.routes()
    this.sockets()
  }

  middlewares() {
    // reading and parsing of body
    this.app.use(express.json())
    this.app.use(cors())
    this.app.use(express.static(join(__dirname, '../../public')))
    this.app.use(fileUpload({
      useTempFiles : true,
      tempFileDir : '/tmp/',
      createParentPath: true
    }))
  }

  routes() {
    this.app.use(this.paths.users, require('../routes/user'))
    this.app.use(this.paths.categories, require('../routes/category'))
    this.app.use(this.paths.products, require('../routes/products'))
    this.app.use(this.paths.auth, require('../routes/auth'))
    this.app.use(this.paths.search, require('../routes/search'))
    this.app.use(this.paths.uploads, require('../routes/uploads'))
  }

  async dbConnect() {
    await dbConnection()
  }

  sockets() {
    this.io.on('connection', (socket) => socketController(socket, this.io))
  }

  listen() {
    this.server.listen(this.port, () => {
      console.log(`Escuchando en el puerto http://localhost:${this.port}`)
    })
  }
}

module.exports = Server