const urlParams = new URLSearchParams(window.location.search)
const bookingId = urlParams.get("id")

// ===============================
// LOAD BOOKING
// ===============================
async function loadBooking(){

const { data } = await supabaseClient
.from("bookings")
.select("*")
.eq("id", bookingId)
.single()

document.getElementById("bookingInfo").innerHTML = `
<h3>${data.package_name}</h3>
<p>Total ₹${data.total_price}</p>
`

let extra = {}

try{
extra = JSON.parse(data.extra_details || "{}")
}catch(e){}

// LOAD TIMETABLE
if(extra.timetable){
extra.timetable.forEach(d=>addDay(d))
}

// LOAD OTHER DATA
guideSelect.value = extra.guideId || ""
cabName.value = extra.cabName || ""
cabNumber.value = extra.cabNumber || ""
cabPhoto.value = extra.cabPhoto || ""

driverName.value = extra.driverName || ""
driverPhone.value = extra.driverPhone || ""
driverPhoto.value = extra.driverPhoto || ""

if(extra.hotels){
extra.hotels.forEach(h=>addHotel(h))
}

// LOAD MULTI SELECT
setMultiSelect("placesSelect", extra.places)
setMultiSelect("activitiesSelect", extra.activities)
setMultiSelect("servicesSelect", extra.services)
setMultiSelect("mediaSelect", extra.media)

loadGuides()

}

// ===============================
// MULTI SELECT HELPER
// ===============================
function getMultiValues(id){
return Array.from(document.getElementById(id).selectedOptions)
.map(o=>o.value)
}

function setMultiSelect(id, values=[]){
const select = document.getElementById(id)
Array.from(select.options).forEach(opt=>{
opt.selected = values.includes(opt.value)
})
}

// ===============================
// LOAD GUIDES
// ===============================
async function loadGuides(){

const { data } = await supabaseClient
.from("guides")
.select("*")

let html = `<option value="">Select Guide</option>`

data.forEach(g=>{
html += `<option value="${g.id}">${g.name} (${g.phone})</option>`
})

guideSelect.innerHTML = html
}

// ===============================
// ADD DAY
// ===============================
function addDay(data={}){

let container = document.getElementById("daysContainer")

container.innerHTML += `
<div class="day-box">

<input placeholder="Day (1,2...)" value="${data.day || ""}">
<input placeholder="Title" value="${data.title || ""}">
<input placeholder="Time" value="${data.time || ""}">

<textarea placeholder="Tasks (comma separated)">
${(data.tasks || []).join(",")}
</textarea>

<button onclick="this.parentElement.remove()">❌</button>

</div>
`
}

// ===============================
// ADD HOTEL
// ===============================
function addHotel(data={}){

let container = document.getElementById("hotelContainer")

container.innerHTML += `
<div class="hotel-row">

<input placeholder="Day" value="${data.day || ""}">
<input placeholder="Hotel Name" value="${data.name || ""}">
<input placeholder="Address" value="${data.address || ""}">
<input placeholder="Room" value="${data.room || ""}">
<input placeholder="Phone" value="${data.phone || ""}">
<input placeholder="Photo URL" value="${data.photo || ""}">

<button onclick="this.parentElement.remove()">❌</button>

</div>
`
}

// ===============================
// SAVE ALL DATA
// ===============================
async function saveAll(){

// 🔹 TIMETABLE
let days = []

document.querySelectorAll(".day-box").forEach(box=>{

let inputs = box.querySelectorAll("input,textarea")

days.push({
day: inputs[0].value,
title: inputs[1].value,
time: inputs[2].value,
tasks: inputs[3].value
.split(",")
.map(t=>t.trim())
.filter(t=>t !== "")
})

})

// 🔹 HOTELS
let hotels = []

document.querySelectorAll(".hotel-row").forEach(row=>{
let inputs = row.querySelectorAll("input")

hotels.push({
day: inputs[0].value,
name: inputs[1].value,
address: inputs[2].value,
room: inputs[3].value,
phone: inputs[4].value,
photo: inputs[5].value
})
})

// 🔹 FINAL EXTRA OBJECT
let extra = {

guideId: guideSelect.value,

cabName: cabName.value,
cabNumber: cabNumber.value,
cabPhoto: cabPhoto.value,

driverName: driverName.value,
driverPhone: driverPhone.value,
driverPhoto: driverPhoto.value,

hotels,

// NEW 🔥
places: getMultiValues("placesSelect"),
activities: getMultiValues("activitiesSelect"),
services: getMultiValues("servicesSelect"),
media: getMultiValues("mediaSelect"),

timetable: days
}

// SAVE
await supabaseClient
.from("bookings")
.update({
extra_details: JSON.stringify(extra)
})
.eq("id", bookingId)

alert("Saved Successfully ✅")
}

// INIT
loadBooking()