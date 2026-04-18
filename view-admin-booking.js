const urlParams = new URLSearchParams(window.location.search)
const bookingId = urlParams.get("id")

let currentBooking = null

// 🔹 LOAD BOOKING
async function loadBooking(){

const { data, error } = await supabaseClient
.from("bookings")
.select("*")
.eq("id", bookingId)
.single()

if(error){
console.log(error)
return
}

currentBooking = data

let parsed = {}
try{
parsed = JSON.parse(data.traveller_details || "{}")
}catch(e){}

let travellers = parsed.travellers || []
let details = parsed.package_details || {}

let perPrice = parsed.package_price || data.package_price || 0

// 🏨 ROOM FIX
let singleRoom = parsed.single_room || 0
let doubleRoom = parsed.double_room || 0

let html = `

<h3>${data.package_name}</h3>
<p>Status: ${data.status}</p>

<h4>📍 Places</h4>
${(details.places || []).map(p=>`<div>✔ ${p}</div>`).join("")}

<h4>🎯 Activities</h4>
${(details.activities || []).map(a=>`<div>✔ ${a}</div>`).join("")}

<h4>🚗 Services</h4>
${(details.services || []).map(s=>`<div>✔ ${s}</div>`).join("")}

<h4>📸 Media</h4>
${(details.media || []).map(m=>`<div>✔ ${m}</div>`).join("")}

<h4>👥 Travellers</h4>
${travellers.map(t=>`
<div class="traveller">
${t.name} | ${t.gender} | Age: ${t.age} | ${t.phone || "-"} 
<br> ₹${perPrice}
</div>
`).join("")}

<h4>🏨 Rooms</h4>
<div>Single Room: ${singleRoom}</div>
<div>Double Room: ${doubleRoom}</div>

<h3>Total ₹${data.total_price}</h3>

`

document.getElementById("bookingBox").innerHTML = html

loadGuides()

// load saved extra
if(data.extra_details){
let ex = JSON.parse(data.extra_details)

guideSelect.value = ex.guideId || ""

cabName.value = ex.cabName || ""
cabNumber.value = ex.cabNumber || ""
cabPhoto.value = ex.cabPhoto || ""

driverName.value = ex.driverName || ""
driverPhone.value = ex.driverPhone || ""
driverPhoto.value = ex.driverPhoto || ""

if(ex.hotels){
ex.hotels.forEach(h=>addHotel(h))
}

}

}

// 🔹 LOAD GUIDES
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

// 🔹 ADD HOTEL ROW
function addHotel(data={}){

let container = document.getElementById("hotelContainer")

container.innerHTML += `
<div class="hotel-row">

<input placeholder="Day" value="${data.day || ""}">
<input placeholder="Hotel Name" value="${data.name || ""}">
<input placeholder="Address" value="${data.address || ""}">
<input placeholder="Room No" value="${data.room || ""}">
<input placeholder="Contact" value="${data.phone || ""}">
<input placeholder="Photo URL" value="${data.photo || ""}">

<button onclick="this.parentElement.remove()">❌</button>

</div>
`
}

// 🔹 SAVE
async function saveExtraDetails(){

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

// 🔥 SELECTED GUIDE KA EMAIL BHI NIKALO
let selectedGuideEmail = ""

if(guideSelect.value){
const { data: guide } = await supabaseClient
.from("guides")
.select("email")
.eq("id", guideSelect.value)
.single()

if(guide){
selectedGuideEmail = guide.email
}
}

// ✅ FINAL EXTRA
let extra = {
guideId: guideSelect.value,
guideEmail: selectedGuideEmail,   // 🔥 YE ADD KARO

cabName: cabName.value,
cabNumber: cabNumber.value,
cabPhoto: cabPhoto.value,

driverName: driverName.value,
driverPhone: driverPhone.value,
driverPhoto: driverPhoto.value,

hotels
}

const { error } = await supabaseClient
.from("bookings")
.update({
extra_details: JSON.stringify(extra)
})
.eq("id", bookingId)

if(error){
alert("Error saving")
return
}

alert("Saved Successfully ✅")
}

loadBooking()
