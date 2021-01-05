jdenticon.configure({ replaceMode: 'observe' })
const getRoute = () => new URL(location.href).hash.slice(2).split('/')
let [realm, room, role, slug, pass] = getRoute()
Spruce.store('meta', {
  route: { realm, room, role, slug, pass },
  page: 'index',
  modal: false,
  connection: false,
  name: undefined,
  input: ''
})
const updateRoute = () => {
  let [realm, room, role, slug, pass] = getRoute()
  if (realm != 'realm')
    Spruce.store('meta').page = 'index'
  else {
    if (!room)
      Spruce.store('meta').page = 'create'
    else {
      if (!role)
        Spruce.store('meta').page = 'join'
      else {
        if (role == 'master' || role == 'player' && slug && pass)
          Spruce.store('meta').page = role
        else
          Spruce.store('meta').page = 'index'
      }
    }
  }
}
updateRoute()
window.addEventListener('hashchange', updateRoute, false)
Spruce.watch('meta.page', page => {
  let newURL = new URL(location.href)
  let route = Spruce.store('meta').route
  let { realm, room, role, slug, pass } = getRoute()
  switch (page) {
    case 'index':
      route = {};               newURL.hash = `/`;              break
    case 'create':
      route = { realm };        newURL.hash = `/realm`;         break
    case 'join':
      route = { realm, room };  newURL.hash = `/realm/${room}`; break
    case 'master':
    case 'player':
      newURL.hash = `/realm/${room}/${role}/${slug}/${pass}`;   break
    default: break
  }
  window.history.pushState(null, document.title, newURL.toString())
})
Spruce.store('game', { characters: {}, events: [] })
const socket = io('localhost:8081');
socket.on('connect', () => { Spruce.store('meta').connection = true })
socket.on('sync', game => {
  Spruce.store('game').characters = game.characters
  Spruce.store('game').events = game.events
})
window.boardPage = () => {
  return {
    cols: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
    rows: ['1', '2', '3', '4', '5', '6', '7'],
    moveAvatar(to) { if (Spruce.store('meta').name) socket.emit('move', Spruce.store('meta').name, to) },
    selectAvatar(name) { Spruce.store('meta').name = name },
    addCharacter() { socket.emit('join', Spruce.store('meta').input) },
    rollDice() { socket.emit('roll', '', Spruce.store('meta').input) },
    deleteCharacter() { socket.emit('move', Spruce.store('meta').name, 'delete') },
  }
}
window.modalPage = () => {
  return {
    mask: {
      ['x-show']() { return Spruce.store('meta').modal },
      ['x-transition:enter']() { return 'ease-out duration-300' },
      ['x-transition:enter-start']() { return 'opacity-0' },
      ['x-transition:enter-end']() { return 'opacity-100' },
      ['x-transition:leave']() { return 'ease-in duration-200' },
      ['x-transition:leave-start']() { return 'opacity-100' },
      ['x-transition:leave-end']() { return 'opacity-0' }
    },
    dialog: {
      ['x-show']() { return Spruce.store('meta').modal },
      ['x-transition:enter']() { return 'ease-out duration-300' },
      ['x-transition:enter-start']() { return 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95' },
      ['x-transition:enter-end']() { return 'opacity-100 translate-y-0 sm:scale-100' },
      ['x-transition:leave']() { return 'ease-in duration-200' },
      ['x-transition:leave-start']() { return 'opacity-100 translate-y-0 sm:scale-100' },
      ['x-transition:leave-end']() { return 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95' }
    }
  }
}
