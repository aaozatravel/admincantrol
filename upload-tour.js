let editId = null
let oldHeroImage = ""

/* ADD FIELDS */

function addActivity(){
activities.innerHTML += `
<div class="box">
<input class="act-name" placeholder="Activity name">
<input class="act-price" placeholder="Price">
<button onclick="this.parentElement.remove()">Delete</button>
</div>`
}

function addPlace(){
places.innerHTML += `
<div class="box">
<input class="place-name" placeholder="Place name">
<input class="place-price" placeholder="Price">
<input type="file" class="place-img">
<button onclick="this.parentElement.remove()">Delete</button>
</div>`
}

function addGondola(){
gondola.innerHTML += `
<div class="box">
<input class="gon-name" placeholder="Gondola name">
<input class="gon-price" placeholder="Price">
<button onclick="this.parentElement.remove()">Delete</button>
</div>`
}

function addDeparture(){
departures.innerHTML += `
<div class="box">
<input class="dep-month" placeholder="Month">
<input class="dep-start" placeholder="Start">
<input class="dep-end" placeholder="End">
<input class="dep-price" placeholder="Price">
<button onclick="this.parentElement.remove()">Delete</button>
</div>`
}


/* SAVE TOUR */

async function saveTour(){

const title = document.getElementById("title").value
const days = document.getElementById("days").value
const price = document.getElementById("price").value

let heroUrl = oldHeroImage

const file = document.getElementById("heroImage").files[0]

if(file){
const name = Date.now()+file.name
await supabaseClient.storage.from("tours").upload(name,file)
const {data} = supabaseClient.storage.from("tours").getPublicUrl(name)
heroUrl = data.publicUrl
}

/* activities */
let activitiesData=[]
document.querySelectorAll(".act-name").forEach((el,i)=>{
activitiesData.push({
name: el.value,
price: document.querySelectorAll(".act-price")[i].value
})
})

/* places */
let placesData=[]
const placeNames=document.querySelectorAll(".place-name")
const placePrices=document.querySelectorAll(".place-price")
const placeImgs=document.querySelectorAll(".place-img")

for(let i=0;i<placeNames.length;i++){

let imgUrl=""

if(placeImgs[i].files[0]){
const name=Date.now()+placeImgs[i].files[0].name
await supabaseClient.storage.from("tours").upload(name,placeImgs[i].files[0])
const {data}=supabaseClient.storage.from("tours").getPublicUrl(name)
imgUrl=data.publicUrl
}

placesData.push({
name:placeNames[i].value,
price:placePrices[i].value,
image:imgUrl
})
}

/* gondola */
let gondolaData=[]
document.querySelectorAll(".gon-name").forEach((el,i)=>{
gondolaData.push({
name:el.value,
price:document.querySelectorAll(".gon-price")[i].value
})
})

/* departure */
let depData=[]
document.querySelectorAll(".dep-month").forEach((el,i)=>{
depData.push({
month:el.value,
start:document.querySelectorAll(".dep-start")[i].value,
end:document.querySelectorAll(".dep-end")[i].value,
price:document.querySelectorAll(".dep-price")[i].value
})
})

const payload={
title,
days,
price,
image:heroUrl,
activities:activitiesData,
places:placesData,
gondola:gondolaData,
departures:depData
}

if(editId){
await supabaseClient.from("tours").update(payload).eq("id",editId)
editId=null
}else{
await supabaseClient.from("tours").insert([payload])
}

clearForm()
loadTours()
}


/* LOAD TOURS */

async function loadTours(){

const {data} = await supabaseClient
.from("tours")
.select("*")
.order("created_at",{ascending:false})

let html=""

data.forEach(t=>{
html += `
<div class="box">
<img src="${t.image}" width="150">
<h3>${t.title}</h3>
<button onclick="editTour('${t.id}')">Edit</button>
<button onclick="deleteTour('${t.id}')">Delete</button>
</div>`
})

document.getElementById("tourList").innerHTML = html
}


/* EDIT TOUR */

async function editTour(id){

const {data} = await supabaseClient
.from("tours")
.select("*")
.eq("id",id)
.single()

editId = id
oldHeroImage = data.image

document.getElementById("title").value = data.title
document.getElementById("days").value = data.days
document.getElementById("price").value = data.price

/* activities */
activities.innerHTML=""
data.activities?.forEach(a=>{
activities.innerHTML+=`
<div class="box">
<input class="act-name" value="${a.name}">
<input class="act-price" value="${a.price}">
<button onclick="this.parentElement.remove()">Delete</button>
</div>`
})

/* places */
places.innerHTML=""
data.places?.forEach(p=>{
places.innerHTML+=`
<div class="box">
<input class="place-name" value="${p.name}">
<input class="place-price" value="${p.price}">
<input type="file" class="place-img">
<img src="${p.image}" style="width:80px;margin-top:5px">
<button onclick="this.parentElement.remove()">Delete</button>
</div>`
})

/* gondola */
gondola.innerHTML=""
data.gondola?.forEach(g=>{
gondola.innerHTML+=`
<div class="box">
<input class="gon-name" value="${g.name}">
<input class="gon-price" value="${g.price}">
<button onclick="this.parentElement.remove()">Delete</button>
</div>`
})

/* departure */
departures.innerHTML=""
data.departures?.forEach(d=>{
departures.innerHTML+=`
<div class="box">
<input class="dep-month" value="${d.month}">
<input class="dep-start" value="${d.start}">
<input class="dep-end" value="${d.end}">
<input class="dep-price" value="${d.price}">
<button onclick="this.parentElement.remove()">Delete</button>
</div>`
})

window.scrollTo({top:0,behavior:"smooth"})
}


/* DELETE */

async function deleteTour(id){
await supabaseClient.from("tours").delete().eq("id",id)
loadTours()
}


/* CLEAR FORM */

function clearForm(){
document.getElementById("title").value=""
document.getElementById("days").value=""
document.getElementById("price").value=""
document.getElementById("heroImage").value=""

activities.innerHTML=""
places.innerHTML=""
gondola.innerHTML=""
departures.innerHTML=""
}

loadTours()