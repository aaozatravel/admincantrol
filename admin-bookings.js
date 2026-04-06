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

const { error } = await supabaseClient
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

if(error){
alert("Error assigning")
return
}

alert("Accept successful ✅")
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

/* DOWNLOAD INVOICE */
function downloadInvoice(id){
localStorage.setItem("invoiceBookingId", id)
window.open("invoice.html","_blank")
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
let activities = parsed.activities || []
let gondola = parsed.gondola || []
let places = parsed.places || []

let singleRoom = parsed.single_room || 0
let doubleRoom = parsed.double_room || 0

let singleTotal = singleRoom * 6999
let doubleTotal = doubleRoom * 8999

let departurePrice =
Number(String(parsed.selectedPrice || parsed.departure_price || 0)
.replace(/[₹,]/g,""))

let gondolaPrice = Number(parsed.gondola_price || 0)

let activitiesTotal = (activities || [])
.reduce((t,a)=> t + Number(a.price || 0),0)

let html = "<h3>Traveller Details</h3>"

travellers.forEach(p=>{
html += `
<div>
${p.name} | ${p.gender} | Age: ${p.age} | ${p.phone}
</div>
`
})

let placesHtml = "-"
let placesTotal = 0

if(Array.isArray(places) && places.length){
placesHtml=""
places.forEach(p=>{
let name = p.name || "-"
let price = Number(p.price || 0)
let total = Number(p.total || price)
placesTotal += total

placesHtml += `<div>${name} ₹${price} = ₹${total}</div>`
})
}

let baseTotal =
Number(gondolaPrice) +
Number(placesTotal) +
Number(departurePrice) +
Number(activitiesTotal)

let travellersCount =
(parsed.adults || 0) + (parsed.child || 0)

let grandTotal =
(baseTotal * travellersCount) +
singleTotal +
doubleTotal

html += `

<hr>

<h3>Trip Details</h3>

<div><b>Email:</b> ${data.user_email}</div>
<div><b>Tour:</b> ${data.tour_name}</div>

<div><b>Activities:</b>
${activities.map(a=>`${a.name} ₹${a.price}`).join(", ")}
<br>Total: ₹${activitiesTotal}
</div>

<div><b>Gondola:</b>
${gondola.join(", ")} - ₹${gondolaPrice}
</div>

<div><b>Places:</b><br>${placesHtml}
<br>Total: ₹${placesTotal}
</div>

<div><b>Departure:</b>
${parsed.departure || "-"} - ₹${departurePrice}
</div>

<div><b>Subtotal per traveller:</b> ₹${baseTotal}</div>

<h3>Rooms</h3>
<div>
Single Room x ${singleRoom} = ₹${singleTotal}<br>
Double Room x ${doubleRoom} = ₹${doubleTotal}
</div>

<h2>Grand Total: ₹${grandTotal}</h2>

<button onclick="downloadInvoice('${data.id}')">
Download User Invoice
</button>

<hr>

<h3>Cab Details</h3>

<div>
Cab Number:
<input type="text" id="cab_number" value="${data.cab_number || ''}">
</div>

<div>
Driver Name:
<input type="text" id="driver_name" value="${data.driver_name || ''}">
</div>

<div>
Cab Photo URL:
<input type="text" id="cab_photo" value="${data.cab_photo || ''}">
</div>

<div>
Driver Photo URL:
<input type="text" id="driver_photo" value="${data.driver_photo || ''}">
</div>

<button onclick="saveCabDetails()">Save Cab</button>

<hr>

<h3>Assign Hotel Day Wise</h3>

<table style="width:100%">
<tr>
<th>Day</th>
<th>Hotel</th>
<th>Room</th>
<th>Contact</th>
</tr>

<tr><td>Day1</td><td><input id="hotel1"></td><td><input id="room1"></td><td><input id="contact1"></td></tr>
<tr><td>Day2</td><td><input id="hotel2"></td><td><input id="room2"></td><td><input id="contact2"></td></tr>
<tr><td>Day3</td><td><input id="hotel3"></td><td><input id="room3"></td><td><input id="contact3"></td></tr>
<tr><td>Day4</td><td><input id="hotel4"></td><td><input id="room4"></td><td><input id="contact4"></td></tr>
<tr><td>Day5</td><td><input id="hotel5"></td><td><input id="room5"></td><td><input id="contact5"></td></tr>

</table>

<br>
<button onclick="saveHotelDays()">Save Hotel</button>
`

document.getElementById("viewContent").innerHTML = html
document.getElementById("viewModal").style.display = "flex"
}

/* SAVE CAB */
async function saveCabDetails(){

const cab_number = document.getElementById("cab_number").value
const driver_name = document.getElementById("driver_name").value
const cab_photo = document.getElementById("cab_photo").value
const driver_photo = document.getElementById("driver_photo").value

await supabaseClient
.from("bookings")
.update({
cab_number,
driver_name,
cab_photo,
driver_photo
})
.eq("id", currentBookingId)

alert("Cab Assigned Successfully")
loadBookings()
closeModal()
}

/* SAVE HOTEL */
async function saveHotelDays(){

let hotelDays = [
{day:"Day1",hotel:hotel1.value,room:room1.value,contact:contact1.value},
{day:"Day2",hotel:hotel2.value,room:room2.value,contact:contact2.value},
{day:"Day3",hotel:hotel3.value,room:room3.value,contact:contact3.value},
{day:"Day4",hotel:hotel4.value,room:room4.value,contact:contact4.value},
{day:"Day5",hotel:hotel5.value,room:room5.value,contact:contact5.value}
]

await supabaseClient
.from("bookings")
.update({ hotel_days: hotelDays })
.eq("id", currentBookingId)

alert("Hotel Assigned Successfully")
}

/* CLOSE */
function closeModal(){
document.getElementById("viewModal").style.display = "none"
}

/* LOAD BOOKINGS */
async function loadBookings(){

await loadGuides()

const { data } = await supabaseClient
.from("bookings")
.select("*")
.order("created_at",{ascending:false})

let html = ""

data.forEach(b=>{
html += `
<tr>
<td>${b.tour_name}</td>
<td>${b.user_email}</td>
<td>${b.travel_month}</td>
<td>${b.status || "pending"}</td>

<td>
<select id="guide_${b.id}">
${guideOptions()}
</select>
<button onclick="acceptBooking('${b.id}')">Accept</button>
</td>

<td>
<button onclick="viewBooking('${b.id}')">View</button>
<button onclick="downloadInvoice('${b.id}')">Invoice</button>
</td>

<td>
<button onclick="waitingBooking('${b.id}')">Waiting</button>
<button onclick="rejectBooking('${b.id}')">Reject</button>
<button onclick="deleteBooking('${b.id}')">Delete</button>
</td>
</tr>
`
})

document.getElementById("bookingTable").innerHTML = html
}

loadBookings()
