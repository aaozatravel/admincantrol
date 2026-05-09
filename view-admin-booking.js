const urlParams = new URLSearchParams(window.location.search)
const bookingId = urlParams.get("id")

let currentBooking = null

// ===============================
// 🔥 LOAD BOOKING (FULL FIX)
// ===============================
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

// ===============================
// 🔐 SAFE PARSE
// ===============================
let parsed = {}
let extra = {}

try{
parsed = JSON.parse(data.traveller_details || "{}")
}catch(e){}

try{
extra = JSON.parse(data.extra_details || "{}")
}catch(e){}

// ===============================
// 📦 BASIC DATA
// ===============================
let travellers = parsed.travellers || []
let details = parsed.package_details || {}
let rooms = parsed.rooms || []

// ===============================
// 💰 PRICE FIX
// ===============================
let packagePrice = data.package_price || 0
let originalPrice = data.original_price || 0
let finalPrice = data.total_price || 0
let discount = data.coupon_discount || 0

// ===============================
// 🏨 ROOMS (FIXED)
// ===============================
let roomsHtml = ""

if(Array.isArray(rooms) && rooms.length){

roomsHtml = rooms
.filter(r => r.selected)
.map(r => {

let type = r.type || "room"

let base = r.price || 0
let extraPrice = r.extra_price || 0
let extra = r.extra || 0

let total = base + (extra * extraPrice)

return `
<div class="box">

<h4>🏨 ${type.toUpperCase()}</h4>

<div>Room Price: ₹${base}</div>

${extra > 0 ? `
<div>Extra: ${extra} × ₹${extraPrice}</div>
` : ""}

<div><b>Total: ₹${total}</b></div>

</div>
`
}).join("")

}else{
roomsHtml = "<div>No rooms selected</div>"
}
// ===============================
// 📄 MAIN HTML
// ===============================
let html = `

<h3>${data.package_name}</h3>
<p>Status: ${data.status}</p>

<!-- 💰 PAYMENT -->
<h3>💰 Payment Summary</h3>

<div class="box">
<div>Package Price: ₹${packagePrice}</div>
<div>Original Total: ₹${originalPrice}</div>
<div><b>Final Paid: ₹${finalPrice}</b></div>

${data.coupon_code ? `
<hr>
<div style="color:orange">
🎟 Coupon: <b>${data.coupon_code}</b>
</div>
<div>Discount: ${data.coupon_percent || 0}%</div>
<div>Saved: ₹${discount}</div>
` : ""}

</div>

<!-- 📍 PLACES -->
<h4>📍 Places</h4>
${(details.places || []).map(p=>`<div>✔ ${p}</div>`).join("")}

<!-- 🎯 ACTIVITIES -->
<h4>🎯 Activities</h4>
${(details.activities || []).map(a=>`<div>✔ ${a}</div>`).join("")}

<!-- 🚗 SERVICES -->
<h4>🚗 Services</h4>
${(details.services || []).map(s=>`<div>✔ ${s}</div>`).join("")}

<!-- 📸 MEDIA -->
<h4>📸 Media</h4>
${(details.media || []).map(m=>`<div>✔ ${m}</div>`).join("")}

<!-- 👥 TRAVELLERS -->
<h4>👥 Travellers</h4>
${travellers.map(t=>`
<div class="traveller">
${t.name} | ${t.gender} | Age: ${t.age} | ${t.phone || "-"}
<br> ₹${packagePrice}
</div>
`).join("")}

<!-- 🏨 ROOMS -->
<h4>🏨 Rooms</h4>
${roomsHtml}

<h3>🏁 Grand Total ₹${finalPrice}</h3>
`

document.getElementById("bookingBox").innerHTML = html

loadGuides()

// ===============================
// 🔄 EXTRA DETAILS LOAD
// ===============================
if(extra && Object.keys(extra).length){

guideSelect.value = extra.guideId || ""

cabName.value = extra.cabName || ""
cabNumber.value = extra.cabNumber || ""
cabPhoto.value = extra.cabPhoto || ""

driverName.value = extra.driverName || ""
driverPhone.value = extra.driverPhone || ""
driverPhoto.value = extra.driverPhoto || ""

if(extra.hotels){
document.getElementById("hotelContainer").innerHTML = ""
extra.hotels.forEach(h=>addHotel(h))
}

}
}

// ===============================
// 🔹 LOAD GUIDES
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
// 🔹 ADD HOTEL
// ===============================
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

// ===============================
// 🔹 SAVE EXTRA DETAILS
// ===============================
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

let extra = {
guideId: guideSelect.value,
guideEmail: selectedGuideEmail,

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
