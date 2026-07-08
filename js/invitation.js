let _noteSkipped = false

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

  setTimeout(()=>{
    intro.classList.add("leaving")
    intro.style.opacity = "0"
  }, 1000)

  setTimeout(()=>{
    note.style.transition = "none"
    note.classList.add("show")
    setTimeout(()=>{ note.style.transition = "" }, 50)
    intro.style.display = "none"
  }, 1450)

  setTimeout(()=>{
    if(_noteSkipped) return
    skipNote()
  }, 8000)
}
