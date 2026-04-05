const SUPABASE_URL = "https://yejnsszmvlnmkfqhyfdc.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllam5zc3ptdmxubWtmcWh5ZmRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzI2MTYsImV4cCI6MjA4OTkwODYxNn0.0hOShgfmb6NIITSzulKvIePerRa-ofLZ55TU-v3k6s8";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabaseClient = supabaseClient;


// ================= USER SIGNUP =================
async function signupUser() {

const name = document.getElementById("name").value;
const phone = document.getElementById("phone").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

if(!name || !phone || !email || !password){
alert("Please fill all fields");
return;
}

// signup
const { data, error } = await supabaseClient.auth.signUp({
email: email,
password: password
});

if (error) {
alert(error.message);
return;
}

// insert user profile
await supabaseClient.from("users").insert([{
id: data.user.id,
name: name,
phone: phone,
email: email
}]);

// auto login
const { error: loginError } = await supabaseClient.auth.signInWithPassword({
email: email,
password: password
});

if(loginError){
alert(loginError.message);
return;
}

alert("Signup successful");
location.reload();
}


// ================= USER LOGIN =================
async function loginUser(){

const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

if(!email || !password){
alert("Enter email & password");
return;
}

const { data, error } = await supabaseClient.auth.signInWithPassword({
email: email,
password: password
});

if(error){
alert("Invalid login credentials");
return;
}

alert("Login successful");
location.reload();
}


// ================= LOAD USER =================
async function loadUser(){

const { data: { user } } = await supabaseClient.auth.getUser();

if(!user) return;

const { data } = await supabaseClient
.from("users")
.select("*")
.eq("email", user.email)
.single();

if(!data) return;

document.getElementById("userName").innerText = data.name;
document.getElementById("userPhone").innerText = "Phone: " + data.phone;
document.getElementById("userEmail").innerText = "Email: " + data.email;

document.getElementById("userAuth").innerHTML = `
<button onclick="logoutUser()" class="logout-btn">Logout</button>
`;

}


// ================= USER LOGOUT =================
async function logoutUser(){
await supabaseClient.auth.signOut();
location.reload();
}


// AUTO LOAD
loadUser();

// ================= ADMIN CHECK =================
function checkAdmin(){
const admin = localStorage.getItem("admin");

if(admin !== "true"){
window.location.href = "login.html";
}
}


// ================= ADMIN LOGIN =================
function loginAdminSuccess(){
localStorage.setItem("admin","true");
window.location.href = "dashboard.html";
}


// ================= ADMIN LOGOUT =================
function logoutAdmin(){
localStorage.removeItem("admin");
window.location.href = "login.html";
}

// ================= FORGOT PASSWORD =================
async function forgotPassword(){

const email = document.getElementById("email").value;

if(!email){
alert("Enter your email first");
return;
}

const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
redirectTo: window.location.origin + "/reset-password.html"
});

if(error){
alert(error.message);
return;
}

alert("Password reset link sent to your email");

}

// ================= GUIDE LOGIN =================
async function loginGuide(){

const email = document.getElementById("guideEmail").value;
const password = document.getElementById("guidePassword").value;

if(!email || !password){
alert("Enter guide email & password");
return;
}

const { data, error } = await supabaseClient
.from("guides")
.select("*")
.eq("email", email)
.eq("password", password)
.single();

if(error || !data){
alert("Invalid guide login");
return;
}

localStorage.setItem("guide", JSON.stringify(data));

alert("Guide login successful");
window.location.href="guide-dashboard.html";

}