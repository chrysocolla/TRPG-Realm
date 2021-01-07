const cols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l']
const rows = ['1', '2', '3', '4', '5', '6', '7']

const trpg = require('trpg-dice')

const game = {
  characters: {},
  events: []
}

const io = require('socket.io')(8081, {
  wsEngine: 'eiows',
  parser: require('socket.io-msgpack-parser'),
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
})

io.on('connection', socket => {
  socket.emit('sync', game)
  socket.on('join', name => {
    if (Object.keys(game.characters).length >= (rows.length - 1) * (cols.length - 1)) return
    for (const key in game.characters) {
      if (Object.hasOwnProperty.call(game.characters, key) && game.characters[key] === name) {
        return
      }
    }
    let mapKey = ''
    while (game.characters[mapKey = `${rows[Math.floor(Math.random() * rows.length)]}-${cols[Math.floor(Math.random() * cols.length)]}`]) {}
    console.log(mapKey)
    console.log(name)
    game.characters[mapKey] = name
    socket.emit('sync', game)
    socket.broadcast.emit('sync', game)
  })
  socket.on('move', (name, to) => {
    if (to === 'delete' && game.characters[to]) return
    for (const key in game.characters) {
      if (Object.hasOwnProperty.call(game.characters, key) && game.characters[key] === name) {
        delete game.characters[key];
      }
    }
    if (to !== 'delete') {
      game.characters[to] = name
    }
    socket.emit('sync', game)
    socket.broadcast.emit('sync', game)
  })
  socket.on('roll', (character, dice) => {
    try {
      trpg.roll(dice, (error, result) => {
        if (error) {
          return
        } else {
          game.events.unshift({ character, dice, result })
          socket.emit('sync', game)
          socket.broadcast.emit('sync', game)
        }
      })
    } catch (error) {() => {}}
  })
})
