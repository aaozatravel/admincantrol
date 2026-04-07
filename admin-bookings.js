async function loadBookings(){

const { data } = await supabaseClient
.from("bookings")
.select("*")
.order("created_at",{ascending:false})

let html = ""

data.forEach(b=>{

let total = b.grand_total || 0

html += `
<tr>
<td>${b.tour_name || "-"}</td>
<td>${b.user_email || "-"}</td>
<td>₹${total}</td>
<td>${b.status || "pending"}</td>

<td>
<button onclick="viewBooking('${b.id}')">View</button>
<button onclick="acceptBooking('${b.id}')">Accept</button>
<button onclick="rejectBooking('${b.id}')">Reject</button>
<button onclick="waitingBooking('${b.id}')">Waiting</button>
<button onclick="deleteBooking('${b.id}')">Delete</button>
</td>

</tr>
`
})

document.getElementById("bookingTable").innerHTML = html
}

function viewBooking(id){
window.location.href = "view-admin-booking.html?id="+id
}

async function acceptBooking(id){
await supabaseClient.from("bookings").update({status:"assigned"}).eq("id",id)
loadBookings()
}

async function rejectBooking(id){
await supabaseClient.from("bookings").update({status:"rejected"}).eq("id",id)
loadBookings()
}

async function waitingBooking(id){
await supabaseClient.from("bookings").update({status:"waiting"}).eq("id",id)
loadBookings()
}

async function deleteBooking(id){
await supabaseClient.from("bookings").delete().eq("id",id)
loadBookings()
}

loadBookings()
