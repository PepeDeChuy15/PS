function openInvitation(){

const seal = document.querySelector(".seal")
const envelope = document.querySelector(".envelope")
const intro = document.getElementById("intro")
const note = document.getElementById("note")
const content = document.getElementById("invitation-content")

/* romper sello */

seal.classList.add("break")

/* mover sobre */

setTimeout(()=>{
envelope.classList.add("open")
},300)

setTimeout(()=>{
intro.style.display="none"

/* mostrar nota */

note.classList.add("show")

},700)

/* quitar pantalla del sobre */

setTimeout(()=>{

intro.style.opacity="0"

},900)

/* despues de mostrar la nota */

setTimeout(()=>{

note.style.opacity="0"

setTimeout(()=>{

note.style.display="none"



/* desaparecer carta */

setTimeout(()=>{

card.classList.add("hide")

},5000)

/* ocultar intro */

setTimeout(()=>{

intro.style.opacity="0"

},5600)

/* mostrar invitacion */

content.style.display="block"

setTimeout(()=>{
content.style.opacity="1"
},50)

},800)

},6000)

}
