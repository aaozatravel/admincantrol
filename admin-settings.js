async function loadSettings(){

const { data, error } = await supabase
.from("settings")
.select("*")
.single()

if(data){
document.getElementById("siteName").value = data.site_name || ""
document.getElementById("logo").value = data.logo || ""
document.getElementById("banner").value = data.banner || ""
}

}



async function saveSettings(){

const site_name = document.getElementById("siteName").value
const logo = document.getElementById("logo").value
const banner = document.getElementById("banner").value

const { error } = await supabase
.from("settings")
.upsert({
id: 1,
site_name,
logo,
banner
})

if(error){
alert("❌ Settings not saved")
console.log(error)
return
}

alert("✅ Settings Saved")

}



async function sendNotification(){

const title = document.getElementById("notiTitle").value.trim()
const message = document.getElementById("notiMessage").value.trim()

if(!title || !message){
alert("⚠️ Fill all fields")
return
}

try{

const { data, error } = await supabase
.from("notifications")
.insert([
{
title: title,
message: message,
is_active: true
}
])

if(error){
alert("❌ Notification NOT sent")
console.log(error)
return
}

alert("✅ Notification Sent Successfully")

document.getElementById("notiTitle").value=""
document.getElementById("notiMessage").value=""

}catch(err){
alert("❌ Something went wrong")
console.log(err)
}

}