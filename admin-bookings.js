async function loadBookings(){

const { data, error } = await supabaseClient
.from("bookings")
.select("*")
.order("created_at",{ascending:false})

if(error){
console.log(error)
return
}

let html = ""

data.forEach((b,index)=>{

html += `
<tr>

<td>${index+1}</td>

<td>${b.user_email || "-"}</td>

<td>${b.package_name || "-"}</td>

<td>₹${b.total_price || 0}</td>

<td>
<span class="status ${b.status}">
${b.status || "pending"}
</span>
</td>

<td>

<button class="view" onclick="viewBooking('${b.id}')">
View
</button>

<button class="timetable" onclick="openTimetable('${b.id}')">
Timetable
</button>

<button class="accept" onclick="acceptBooking('${b.id}')">
Accept
</button>

<button class="waiting" onclick="waitingBooking('${b.id}')">
Waiting
</button>

<button class="delete" onclick="deleteBooking('${b.id}')">
Delete
</button>

</td>

</tr>
`
})

document.getElementById("bookingTable").innerHTML = html
}

// 🔍 VIEW
function viewBooking(id){
window.location.href = "view-admin-booking.html?id="+id
}

// ✅ ACCEPT
async function acceptBooking(id){
await supabaseClient
.from("bookings")
.update({status:"assigned"})
.eq("id",id)

loadBookings()
}

// ⏳ WAITING
async function waitingBooking(id){
await supabaseClient
.from("bookings")
.update({status:"waiting"})
.eq("id",id)

loadBookings()
}

// ❌ DELETE
async function deleteBooking(id){
await supabaseClient
.from("bookings")
.delete()
.eq("id",id)

loadBookings()
}

loadBookings()
function openTimetable(id){
window.location.href = "timetable.html?id=" + id
}
