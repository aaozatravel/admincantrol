async function loginAdmin(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const { data, error } = await supabaseClient
.from("admins")
.select("*")
.eq("email", email)
.eq("password", password)
.single();

if(error || !data){
alert("Invalid login");
return;
}

localStorage.setItem("admin","true");
window.location.href="dashboard.html";
}


async function loadLoginSettings(){

const { data, error } = await supabaseClient
.from("settings")
.select("*")
.single()

if(data){

document.getElementById("loginName").innerText = data.site_name || "AAOZA Travels"

if(data.logo){
document.getElementById("loginLogo").src = data.logo
}

}
}