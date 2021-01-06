/* /////////////////////// jdenticon \\\\\\\\\\\\\\\\\\\\\\\ */
jdenticon.configure({ replaceMode: 'observe' })
/* \\\\\\\\\\\\\\\\\\\\\\\ jdenticon /////////////////////// */

/* /////////////////////// Game event \\\\\\\\\\\\\\\\\\\\\\\ */
Spruce.store('game', { characters: {}, events: [] })
const socket = io('localhost:8081');
socket.on('connect', () => { Spruce.store('meta').connection = true })
socket.on('sync', game => {
  Spruce.store('game').characters = game.characters
  Spruce.store('game').events = game.events
})
/* \\\\\\\\\\\\\\\\\\\\\\\ Game event /////////////////////// */

/* /////////////////////// Route event \\\\\\\\\\\\\\\\\\\\\\\ */
Spruce.store('meta', { route: {}, page: '', modal: false, connection: false, input: '' })

Spruce.watch('meta.route', () => {
  let { realm, room, role, slug, pass } = Spruce.store('meta').route
  syncRoute(realm, room, role, slug, pass)
})

hash2store()

function hash2store() {
  syncRoute(...new URL(location.href).hash.slice(2).split('/'))
}

window.addEventListener('hashchange', hash2store, false)

function syncRoute(realm, room, role, slug, pass) {
  let route = {}, page = 'index'
  if (realm === 'realm')
    if      (!room) route = { realm },        page = 'create'
    else if (!role) route = { realm, room },  page = 'join'
    else if (role == 'master' || role == 'player' && slug && pass) route = { realm, room, role, slug, pass }, page = role
  let newURI = new URL(location.href)
  newURI.hash = '';
  (() => {
    let { realm, room, role, slug, pass } = route;
    return [realm, room, role, slug, pass]
  })().forEach(partial => { if (partial) newURI.hash += `/${partial}` })
  if (newURI.hash === '') newURI.hash = '/'
  window.history.pushState(null, document.title, newURI.toString())
  Spruce.store('meta').route = { ...route, __watchers: Spruce.store('meta').route.__watchers }
  Spruce.store('meta').page = page
}
/* \\\\\\\\\\\\\\\\\\\\\\\ Route event /////////////////////// */

/* /////////////////////// Board page \\\\\\\\\\\\\\\\\\\\\\\ */
window.boardPage = () => {
  return {
    cols: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'],
    rows: ['1', '2', '3', '4', '5', '6', '7'],
    moveAvatar     (to)   { if (Spruce.store('meta').name) socket.emit('move', Spruce.store('meta').name, to) },
    selectAvatar   (name) { Spruce.store('meta').name = name },
    addCharacter   ()     { socket.emit('join', Spruce.store('meta').input) },
    rollDice       ()     { socket.emit('roll', '', Spruce.store('meta').input) },
    deleteCharacter()     { socket.emit('move', Spruce.store('meta').name, 'delete'); delete Spruce.store('meta').name },
  }
}
/* \\\\\\\\\\\\\\\\\\\\\\\ Board page /////////////////////// */

/* /////////////////////// Modal component \\\\\\\\\\\\\\\\\\\\\\\ */
window.modalPage = () => {
  return {
    mask: {
      ['x-show']                  () { return Spruce.store('meta').modal },
      ['x-transition:enter']      () { return 'ease-out duration-300' },
      ['x-transition:enter-start']() { return 'opacity-0' },
      ['x-transition:enter-end']  () { return 'opacity-100' },
      ['x-transition:leave']      () { return 'ease-in duration-200' },
      ['x-transition:leave-start']() { return 'opacity-100' },
      ['x-transition:leave-end']  () { return 'opacity-0' }
    },
    dialog: {
      ['x-show']                  () { return Spruce.store('meta').modal },
      ['x-transition:enter']      () { return 'ease-out duration-300' },
      ['x-transition:enter-start']() { return 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95' },
      ['x-transition:enter-end']  () { return 'opacity-100 translate-y-0 sm:scale-100' },
      ['x-transition:leave']      () { return 'ease-in duration-200' },
      ['x-transition:leave-start']() { return 'opacity-100 translate-y-0 sm:scale-100' },
      ['x-transition:leave-end']  () { return 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95' }
    }
  }
}
/* \\\\\\\\\\\\\\\\\\\\\\\ Modal component /////////////////////// */
