let guides = []
let currentBookingId = null

/* LOAD GUIDES */
async function loadGuides(){
const { data } = await supabaseClient
.from("guides")
.select("*")

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

const guideEmail =
document.getElementById("guide_"+id).value

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

alert("Guide Assigned ✅")
loadBookings()
}

/* SAVE CAB */
async function saveCab(id){

const cab = document.getElementById("cab_"+id).value
const driver = document.getElementById("driver_"+id).value

await supabaseClient
.from("bookings")
.update({
cab_number:cab,
driver_name:driver
})
.eq("id", id)

alert("Cab saved")
}

/* SAVE HOTEL */
async function saveHotel(id){

let hotelDays = [
{
day:"Day1",
hotel:document.getElementById("hotel1_"+id).value,
room:document.getElementById("room1_"+id).value,
contact:document.getElementById("contact1_"+id).value
},
{
day:"Day2",
hotel:document.getElementById("hotel2_"+id).value,
room:document.getElementById("room2_"+id).value,
contact:document.getElementById("contact2_"+id).value
},
{
day:"Day3",
hotel:document.getElementById("hotel3_"+id).value,
room:document.getElementById("room3_"+id).value,
contact:document.getElementById("contact3_"+id).value
},
{
day:"Day4",
hotel:document.getElementById("hotel4_"+id).value,
room:document.getElementById("room4_"+id).value,
contact:document.getElementById("contact4_"+id).value
},
{
day:"Day5",
hotel:document.getElementById("hotel5_"+id).value,
room:document.getElementById("room5_"+id).value,
contact:document.getElementById("contact5_"+id).value
}
]

await supabaseClient
.from("bookings")
.update({ hotel_days:hotelDays })
.eq("id", id)

alert("Hotel Saved")
}

/* REJECT */
async function rejectBooking(id){
await supabaseClient
.from("bookings")
.update({status:"rejected"})
.eq("id", id)

loadBookings()
}

/* DELETE */
async function deleteBooking(id){

if(!confirm("Delete?")) return

await supabaseClient
.from("bookings")
.delete()
.eq("id", id)

loadBookings()
}

/* DOWNLOAD INVOICE */
function downloadInvoice(id){

localStorage.setItem("invoiceBookingId", id)
window.open("invoice.html?id="+id,"_blank")

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

<td>${b.tour_name || "-"}</td>
<td>${b.user_email || "-"}</td>
<td>${b.status || "pending"}</td>

<td>

<select id="guide_${b.id}">
${guideOptions()}
</select>

<button onclick="acceptBooking('${b.id}')">
Guide
</button>

<hr>

<b>Cab</b><br>

<input placeholder="Cab No"
id="cab_${b.id}" value="${b.cab_number || ''}">

<input placeholder="Driver"
id="driver_${b.id}" value="${b.driver_name || ''}">

<button onclick="saveCab('${b.id}')">
Save Cab
</button>

<hr>

<b>Hotel Day Wise</b>

<table>

<tr>
<td>D1</td>
<td><input id="hotel1_${b.id}"></td>
<td><input id="room1_${b.id}"></td>
<td><input id="contact1_${b.id}"></td>
</tr>

<tr>
<td>D2</td>
<td><input id="hotel2_${b.id}"></td>
<td><input id="room2_${b.id}"></td>
<td><input id="contact2_${b.id}"></td>
</tr>

<tr>
<td>D3</td>
<td><input id="hotel3_${b.id}"></td>
<td><input id="room3_${b.id}"></td>
<td><input id="contact3_${b.id}"></td>
</tr>

<tr>
<td>D4</td>
<td><input id="hotel4_${b.id}"></td>
<td><input id="room4_${b.id}"></td>
<td><input id="contact4_${b.id}"></td>
</tr>

<tr>
<td>D5</td>
<td><input id="hotel5_${b.id}"></td>
<td><input id="room5_${b.id}"></td>
<td><input id="contact5_${b.id}"></td>
</tr>

</table>

<button onclick="saveHotel('${b.id}')">
Save Hotel
</button>

</td>

<td>
<button onclick="downloadInvoice('${b.id}')">
Invoice
</button>

<button onclick="rejectBooking('${b.id}')">
Reject
</button>

<button onclick="deleteBooking('${b.id}')">
Delete
</button>
</td>

</tr>
`
})

document.getElementById("bookingTable").innerHTML = html

}

loadBookings()
