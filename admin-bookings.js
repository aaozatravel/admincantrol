let guides = []
let currentBookingId = null

/* LOAD GUIDES */
async function loadGuides(){
const { data, error } = await supabaseClient
.from("guides")
.select("*")

if(error){
console.log("Guides error", error)
}

guides = data || []
}

function guideOptions(){
let html = "<option value=''>Select Guide</option>"
guides.forEach(g=>{
html += `<option value="${g.email}">
${g.name} (${g.phone})
</option>`
})
return html
}

/* ACCEPT */
async function acceptBooking(id){

const select = document.getElementById("guide_"+id)
const guideEmail = select.value

if(!guideEmail){
alert("Select guide first")
return
}

const guide = guides.find(g=>g.email===guideEmail)

await supabaseClient
.from("bookings")
.update({
status:"assigned",
guide_name: guide?.name || "",
guide_phone: guide?.phone || "",
guide_email: guide?.email || "",
guide_photo: guide?.photo || null,
guide_id_card: guide?.id_card || null
})
.eq("id", id)

loadBookings()
}

/* REJECT */
async function rejectBooking(id){
await supabaseClient
.from("bookings")
.update({ status:"rejected" })
.eq("id", id)

loadBookings()
}

/* WAITING */
async function waitingBooking(id){
await supabaseClient
.from("bookings")
.update({ status:"waiting" })
.eq("id", id)

loadBookings()
}

/* DELETE */
async function deleteBooking(id){
if(!confirm("Delete this booking?")) return

await supabaseClient
.from("bookings")
.delete()
.eq("id", id)

loadBookings()
}

/* VIEW BOOKING */
async function viewBooking(id){

currentBookingId = id

const { data, error } = await supabaseClient
.from("bookings")
.select("*")
.eq("id", id)
.single()

if(error || !data){
alert("Booking not found")
return
}

let parsed = {}
try{
parsed = JSON.parse(data.traveller_details || "{}")
}catch(e){}

let travellers = parsed.travellers || []
let places = parsed.places || []

let html = "<h3>Traveller Details</h3>"

travellers.forEach(p=>{
html += `
<div class="detail-row">
${p.name} | ${p.gender} | Age: ${p.age} | ${p.phone}
</div>
`
})

/* places html */
let placesHtml = "-"
if(Array.isArray(places) && places.length){
placesHtml=""
places.forEach(p=>{

let name = p.name || p.place || "-"
let price = Number(p.price || p.cost || 0)
let travellersCount = Number(p.travellers || 1)
let total = p.total || (price * travellersCount)

placesHtml += `
<div>${name} ₹${price} x ${travellersCount} = ₹${total}</div>
`
})
}

html += `
<hr>

<div class="detail-row"><b>Email:</b> ${data.user_email}</div>
<div class="detail-row"><b>Tour:</b> ${data.tour_name}</div>
<div class="detail-row"><b>Month:</b> ${data.travel_month}</div>
<div class="detail-row"><b>Departure:</b> ${parsed.departure || "-"}</div>

<div class="detail-row">
<b>Activities:</b> ${(parsed.activities || []).map(a => a.name).join(", ") || "-"}
</div>

<div class="detail-row">
<b>Gondola:</b> ${(parsed.gondola || []).join(", ") || "-"}
</div>

<div class="detail-row">
<b>Gondola Price:</b> ₹${parsed.gondola_price || 0}
</div>

<div class="detail-row">
<b>Places:</b><br>${placesHtml}
</div>

<div class="detail-row">
<b>Places Price:</b> ₹${parsed.places_total || 0}
</div>

<div class="detail-row">
<b>Total:</b> ₹${parsed.total || 0}
</div>

<hr>

<h3>Cab Details</h3>

<div class="detail-row">
Cab Number:
<input type="text" id="cab_number" value="${data.cab_number || ''}">
</div>

<div class="detail-row">
Driver Name:
<input type="text" id="driver_name" value="${data.driver_name || ''}">
</div>

<div class="detail-row">
Cab Photo URL:
<input type="text" id="cab_photo" value="${data.cab_photo || ''}">
</div>

<div class="detail-row">
Driver Photo URL:
<input type="text" id="driver_photo" value="${data.driver_photo || ''}">
</div>

<button onclick="saveCabDetails()">Save Cab</button>

<h3>Assign Hotel (4N / 5D)</h3>

<table style="width:100%;border-collapse:collapse">

<tr style="background:#f5f5f5">
<th style="padding:8px;border:1px solid #ddd">Day</th>
<th style="padding:8px;border:1px solid #ddd">Hotel Name</th>
<th style="padding:8px;border:1px solid #ddd">Room Number</th>
<th style="padding:8px;border:1px solid #ddd">Contact Number</th>
</tr>

<tr>
<td>Day 1 / Night 1</td>
<td><input type="text" id="hotel1"></td>
<td><input type="text" id="room1"></td>
<td><input type="text" id="contact1"></td>
</tr>

<tr>
<td>Day 2 / Night 2</td>
<td><input type="text" id="hotel2"></td>
<td><input type="text" id="room2"></td>
<td><input type="text" id="contact2"></td>
</tr>

<tr>
<td>Day 3 / Night 3</td>
<td><input type="text" id="hotel3"></td>
<td><input type="text" id="room3"></td>
<td><input type="text" id="contact3"></td>
</tr>

<tr>
<td>Day 4 / Night 4</td>
<td><input type="text" id="hotel4"></td>
<td><input type="text" id="room4"></td>
<td><input type="text" id="contact4"></td>
</tr>

<tr>
<td>Day 5 Checkout</td>
<td><input type="text" id="hotel5"></td>
<td><input type="text" id="room5"></td>
<td><input type="text" id="contact5"></td>
</tr>

</table>

<br>
<button onclick="saveHotelDays()">Save Hotel</button>
`

document.getElementById("viewContent").innerHTML = html
document.getElementById("viewModal").style.display = "flex"
}

/* SAVE HOTEL */
async function saveHotelDays(){

let hotelDays = [
{day:"Day 1 / Night 1",hotel:document.getElementById("hotel1").value,room:document.getElementById("room1").value,contact:document.getElementById("contact1").value},

{day:"Day 2 / Night 2",hotel:document.getElementById("hotel2").value,room:document.getElementById("room2").value,contact:document.getElementById("contact2").value},

{day:"Day 3 / Night 3",hotel:document.getElementById("hotel3").value,room:document.getElementById("room3").value,contact:document.getElementById("contact3").value},

{day:"Day 4 / Night 4",hotel:document.getElementById("hotel4").value,room:document.getElementById("room4").value,contact:document.getElementById("contact4").value},

{day:"Day 5 Checkout",hotel:document.getElementById("hotel5").value,room:document.getElementById("room5").value,contact:document.getElementById("contact5").value}
]

// remove empty rows
hotelDays = hotelDays.filter(h => h.hotel || h.room || h.contact)

const { error } = await supabaseClient
.from("bookings")
.update({ hotel_days: hotelDays })
.eq("id", currentBookingId)

if(error){
alert("Error saving hotel")
console.log(error)
return
}

alert("Hotel Assigned Successfully")
loadBookings()
}


async function saveCabDetails(){

const cab_number = document.getElementById("cab_number").value
const driver_name = document.getElementById("driver_name").value
const cab_photo = document.getElementById("cab_photo").value
const driver_photo = document.getElementById("driver_photo").value

const { error } = await supabaseClient
.from("bookings")
.update({
cab_number,
driver_name,
cab_photo,
driver_photo
})
.eq("id", currentBookingId)

if(error){
alert("Error saving cab details")
console.log(error)
return
}

alert("Cab Assigned Successfully")
closeModal()
loadBookings()

}
/* CLOSE */
function closeModal(){
document.getElementById("viewModal").style.display = "none"
}

/* LOAD BOOKINGS */
async function loadBookings(){

await loadGuides()

/* URL FILTER */
const urlParams = new URLSearchParams(window.location.search)
const statusFilter = urlParams.get("status")

let query = supabaseClient
.from("bookings")
.select("*")
.order("created_at",{ascending:false})

if(statusFilter){
query = query.eq("status", statusFilter)

const filterBox = document.getElementById("filterInfo")
if(filterBox){
filterBox.style.display="block"
filterBox.innerHTML =
"Showing: <b>"+statusFilter+"</b> bookings <button class='clear-filter' onclick='clearFilter()'>Clear</button>"
}
}

const { data, error } = await query

if(error){
console.log("Booking load error", error)
return
}

let html = ""

data.forEach(b=>{

html += `
<tr>
<td>${b.tour_name || "-"}</td>
<td>${b.user_email || "-"}</td>
<td>${b.travel_month || "-"}</td>
<td>${b.status || "pending"}</td>

<td>
<select id="guide_${b.id}">
${guideOptions()}
</select>
</td>

<td>
<button onclick="acceptBooking('${b.id}')">Accept</button>
<button onclick="waitingBooking('${b.id}')">Waiting</button>
<button onclick="rejectBooking('${b.id}')">Reject</button>
<button onclick="deleteBooking('${b.id}')">Delete</button>
</td>

<td>
<button onclick="viewBooking('${b.id}')">View</button>
</td>
</tr>
`
})

document.getElementById("bookingTable").innerHTML = html
}

function clearFilter(){
window.location.href="bookings.html"
}
