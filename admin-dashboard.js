async function initDashboard(){
await loadDashboard();
}

async function loadDashboard(){

/* TOTAL USERS */
const { data: users } = await supabaseClient
.from("users")
.select("*");

document.getElementById("totalUsers").innerText =
users ? users.length : 0;


/* TOTAL BOOKINGS */
const { data: bookings } = await supabaseClient
.from("bookings")
.select("*");

document.getElementById("totalBookings").innerText =
bookings ? bookings.length : 0;


/* TOTAL PROFIT */
let totalProfit = 0

if(bookings){
bookings.forEach(b=>{

let parsed = {}

try{
parsed = JSON.parse(b.traveller_details || "{}")
}catch(e){}

totalProfit += parsed.total || 0

})
}

document.getElementById("totalProfit").innerText =
"₹ " + totalProfit

}