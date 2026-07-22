let _noteSkipped = false
let _musicFade = null

function startBackgroundMusic(){
  const music = document.getElementById("background-music")
  if(!music || !music.paused) return

  const targetVolume = 0.07
  music.volume = 0

  const playback = music.play()
  if(!playback) return

  playback.then(()=>{
    window.clearInterval(_musicFade)
    _musicFade = window.setInterval(()=>{
      music.volume = Math.min(targetVolume, music.volume + 0.005)
      if(music.volume >= targetVolume){
        window.clearInterval(_musicFade)
        _musicFade = null
      }
    }, 150)
  }).catch(()=>{
    // Algunos navegadores pueden bloquear el audio aun después del toque.
  })
}

function skipNote(){
  if(_noteSkipped) return
  _noteSkipped = true

  const note = document.getElementById("note")
  const content = document.getElementById("invitation-content")

  note.style.opacity = "0"

  setTimeout(()=>{
    note.style.display = "none"
    document.body.classList.remove("locked")
    content.style.display = "block"
    setTimeout(()=>{ content.style.opacity = "1" }, 50)
  }, 650)
}

function openInvitation(){
  const seal = document.querySelector(".seal")
  const envelope = document.querySelector(".envelope")
  const intro = document.getElementById("intro")
  const note = document.getElementById("note")

  if(envelope.classList.contains("opening")) return

  envelope.classList.add("opening")
  seal.classList.add("break")
  startBackgroundMusic()

  setTimeout(()=>{
    intro.classList.add("leaving")
    intro.style.opacity = "0"
  }, 400)

  setTimeout(()=>{
    note.style.transition = "none"
    note.classList.add("show")
    setTimeout(()=>{ note.style.transition = "" }, 50)
    intro.style.display = "none"
  }, 700)

  setTimeout(()=>{
    if(_noteSkipped) return
    skipNote()
  }, 10000)
}
