const urlParams = new URLSearchParams(window.location.search)
const bookingId = urlParams.get("id")

loadBooking()

async function loadBooking(){

const { data } = await supabaseClient
.from("bookings")
.select("*")
.eq("id", bookingId)
.single()

let parsed = JSON.parse(data.traveller_details || "{}")

let places = parsed.places || []
let activities = parsed.activities || []
let travellers = parsed.travellers || []

let gondolaPrice = Number(parsed.gondola_price || 0)
let gondolaName = parsed.gondola_name || "Gondola Ticket"

let placesTotal = places.reduce((t,p)=> t + Number(p.price || p.total || 0),0)
let activitiesTotal = activities.reduce((t,a)=> t + Number(a.price || 0),0)

let departurePrice = Number(parsed.departure_price || 0)

// add gondola
activitiesTotal = activitiesTotal + gondolaPrice

let subtotal = placesTotal + activitiesTotal + departurePrice

let travellerCount = travellers.length

let singleRoom = Number(parsed.single_room || 0)
let doubleRoom = Number(parsed.double_room || 0)

let roomTotal = (singleRoom * 6999) + (doubleRoom * 8999)

// GRAND TOTAL
let grandTotal = (subtotal * travellerCount) + roomTotal

let html = `

<div class="box">
<b>Activities</b><br>
${activities.map(a=>`${a.name} - ₹${a.price}`).join("<br>")}
${gondolaPrice ? `<br>${gondolaName} - ₹${gondolaPrice}` : ""}
<br><b>Total: ₹${activitiesTotal}</b>
</div>

<div class="box">
<b>Places</b><br>
${places.map(p=>`${p.name} - ₹${p.price || p.total}`).join("<br>")}
<br><b>Total: ₹${placesTotal}</b>
</div>

<div class="box">
<b>Departure</b><br>
₹${departurePrice}<br>
Start: ${parsed.start_date || "-"}<br>
End: ${parsed.end_date || "-"}
</div>

<div class="box">
<b>Subtotal (Per Traveller)</b><br>
₹${subtotal}
</div>

<div class="box">
<b>Travellers</b><br>
${travellers.map(t=>`
${t.name} | ${t.age} | ${t.gender} | ${t.phone}
= ₹${subtotal}
`).join("<br><br>")}
</div>

<div class="box">
<b>Rooms</b><br>
Single (${singleRoom}) = ₹${singleRoom * 6999}<br>
Double (${doubleRoom}) = ₹${doubleRoom * 8999}<br>
Room Total = ₹${roomTotal}
</div>

<div class="box">
<b>Grand Total</b><br>
₹${grandTotal}
</div>

<div class="box">
<h3>Cab Detail</h3>

Cab Name<br>
<input id="cab_name" placeholder="Cab Name"><br>

Cab Number<br>
<input id="cab_number" placeholder="Cab Number"><br>

Cab Photo URL<br>
<input id="cab_photo" placeholder="Cab Photo URL"><br>
<img id="cab_preview" style="width:200px;display:none;margin-top:5px"><br>

Driver Name<br>
<input id="driver_name" placeholder="Driver Name"><br>

Driver Phone<br>
<input id="driver_phone" placeholder="Driver Phone"><br>

Driver Photo URL<br>
<input id="driver_photo" placeholder="Driver Photo URL"><br>
<img id="driver_preview" style="width:200px;display:none;margin-top:5px">

</div>

<div class="box">
<h3>Guide</h3>
<select id="guideSelect"></select>
</div>

<div class="box">
<h3>Hotel Day Wise</h3>

<b>Day 1</b><br>
Hotel Photo<br>
<input id="hotel1_photo" placeholder="Photo URL"><br>
<img id="hotel1_preview" style="width:200px;display:none"><br>
Hotel Name<br>
<input id="hotel1" placeholder="Hotel Name"><br>
Hotel Address<br>
<input id="hotel1_address" placeholder="Hotel Address"><br>
Hotel Contact<br>
<input id="hotel1_contact" placeholder="Hotel Contact"><br>
Room Number<br>
<input id="hotel1_room" placeholder="Room Number"><br><br>

<b>Day 2</b><br>
Hotel Photo<br>
<input id="hotel2_photo" placeholder="Photo URL"><br>
<img id="hotel2_preview" style="width:200px;display:none"><br>
Hotel Name<br>
<input id="hotel2" placeholder="Hotel Name"><br>
Hotel Address<br>
<input id="hotel2_address" placeholder="Hotel Address"><br>
Hotel Contact<br>
<input id="hotel2_contact" placeholder="Hotel Contact"><br>
Room Number<br>
<input id="hotel2_room" placeholder="Room Number"><br><br>

<b>Day 3</b><br>
Hotel Photo<br>
<input id="hotel3_photo" placeholder="Photo URL"><br>
<img id="hotel3_preview" style="width:200px;display:none"><br>
Hotel Name<br>
<input id="hotel3" placeholder="Hotel Name"><br>
Hotel Address<br>
<input id="hotel3_address" placeholder="Hotel Address"><br>
Hotel Contact<br>
<input id="hotel3_contact" placeholder="Hotel Contact"><br>
Room Number<br>
<input id="hotel3_room" placeholder="Room Number"><br><br>

<b>Day 4</b><br>
Hotel Photo<br>
<input id="hotel4_photo" placeholder="Photo URL"><br>
<img id="hotel4_preview" style="width:200px;display:none"><br>
Hotel Name<br>
<input id="hotel4" placeholder="Hotel Name"><br>
Hotel Address<br>
<input id="hotel4_address" placeholder="Hotel Address"><br>
Hotel Contact<br>
<input id="hotel4_contact" placeholder="Hotel Contact"><br>
Room Number<br>
<input id="hotel4_room" placeholder="Room Number"><br><br>

<b>Day 5</b><br>
Hotel Photo<br>
<input id="hotel5_photo" placeholder="Photo URL"><br>
<img id="hotel5_preview" style="width:200px;display:none"><br>
Hotel Name<br>
<input id="hotel5" placeholder="Hotel Name"><br>
Hotel Address<br>
<input id="hotel5_address" placeholder="Hotel Address"><br>
Hotel Contact<br>
<input id="hotel5_contact" placeholder="Hotel Contact"><br>
Room Number<br>
<input id="hotel5_room" placeholder="Room Number"><br>

</div>
<div class="box">
<button id="confirmBtn" onclick="confirmBooking()" 
style="background:green;color:white;padding:12px;border:none;width:100%">
Confirm Booking
</button>
</div>

`

document.getElementById("bookingDetail").innerHTML = html

loadGuides()
setupImagePreview()
}

async function loadGuides(){

const { data } = await supabaseClient
.from("guides")
.select("*")

let html = "<option value=''>Select Guide</option>"

data.forEach(g=>{
html += `<option value="${g.email}">
${g.name} (${g.phone})
</option>`
})

document.getElementById("guideSelect").innerHTML = html
}

function setupImagePreview(){

document.addEventListener("input", function(e){

if(e.target.id === "cab_photo"){
document.getElementById("cab_preview").src = e.target.value
document.getElementById("cab_preview").style.display="block"
}

if(e.target.id === "driver_photo"){
document.getElementById("driver_preview").src = e.target.value
document.getElementById("driver_preview").style.display="block"
}

})

// HOTEL IMAGE PREVIEW
for(let i=1;i<=5;i++){

let photo = document.getElementById(`hotel${i}_photo`)
if(photo){
photo.addEventListener("input", function(){
let img = document.getElementById(`hotel${i}_preview`)
img.src = this.value
img.style.display="block"
})
}

}

}

async function confirmBooking(){

if(!confirm("Confirm this booking?")) return

document.getElementById("confirmBtn").innerText = "Saving..."
document.getElementById("confirmBtn").disabled = true

let updateData = {

admin_details: {

cab_name: document.getElementById("cab_name").value,
cab_number: document.getElementById("cab_number").value,
cab_photo: document.getElementById("cab_photo").value,

driver_name: document.getElementById("driver_name").value,
driver_phone: document.getElementById("driver_phone").value,
driver_photo: document.getElementById("driver_photo").value,

guide: document.getElementById("guideSelect").value,

hotel1: document.getElementById("hotel1").value,
hotel1_photo: document.getElementById("hotel1_photo").value,
hotel1_address: document.getElementById("hotel1_address").value,
hotel1_contact: document.getElementById("hotel1_contact").value,
hotel1_room: document.getElementById("hotel1_room").value,

hotel2: document.getElementById("hotel2").value,
hotel2_photo: document.getElementById("hotel2_photo").value,
hotel2_address: document.getElementById("hotel2_address").value,
hotel2_contact: document.getElementById("hotel2_contact").value,
hotel2_room: document.getElementById("hotel2_room").value,

hotel3: document.getElementById("hotel3").value,
hotel3_photo: document.getElementById("hotel3_photo").value,
hotel3_address: document.getElementById("hotel3_address").value,
hotel3_contact: document.getElementById("hotel3_contact").value,
hotel3_room: document.getElementById("hotel3_room").value,

hotel4: document.getElementById("hotel4").value,
hotel4_photo: document.getElementById("hotel4_photo").value,
hotel4_address: document.getElementById("hotel4_address").value,
hotel4_contact: document.getElementById("hotel4_contact").value,
hotel4_room: document.getElementById("hotel4_room").value,

hotel5: document.getElementById("hotel5").value,
hotel5_photo: document.getElementById("hotel5_photo").value,
hotel5_address: document.getElementById("hotel5_address").value,
hotel5_contact: document.getElementById("hotel5_contact").value,
hotel5_room: document.getElementById("hotel5_room").value

},

status: "accepted"

}

const { error } = await supabaseClient
.from("bookings")
.update(updateData)
.eq("id", bookingId)

if(error){
alert("Error saving booking")
document.getElementById("confirmBtn").disabled = false
document.getElementById("confirmBtn").innerText = "Confirm Booking"
return
}

alert("Booking Accepted Successfully")
window.location.href = "admin-bookings.html"

                                     }
