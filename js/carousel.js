let index = 0;

const images = document.querySelectorAll(".carousel-img");

function showImage(){

images.forEach(img => img.classList.remove("active"));

index++;

if(index >= images.length){
index = 0;
}

images[index].classList.add("active");

}

setInterval(showImage,4000);