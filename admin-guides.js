async function createGuide(){

const name = document.getElementById("gname").value;
const phone = document.getElementById("gphone").value;
const age = document.getElementById("gage").value;
const gender = document.getElementById("ggender").value;

const photoFile = document.getElementById("gphoto").files[0];
const idCardFile = document.getElementById("gidcard").files[0];

const email = document.getElementById("gemail").value;
const password = document.getElementById("gpassword").value;
const tag = document.getElementById("gtag").value;

let photoUrl = "";
let idCardUrl = "";

try{

/* upload guide photo */
if(photoFile){

const fileName = "photos/" + Date.now() + "-" + photoFile.name;

const { error: uploadError } = await supabaseClient.storage
.from("guides")
.upload(fileName, photoFile);

if(uploadError){
alert("Photo upload failed");
console.log(uploadError);
return;
}

const { data } = supabaseClient.storage
.from("guides")
.getPublicUrl(fileName);

photoUrl = data.publicUrl;
}

/* upload id card */
if(idCardFile){

const fileName = "idcards/" + Date.now() + "-" + idCardFile.name;

const { error: uploadError } = await supabaseClient.storage
.from("guides")
.upload(fileName, idCardFile);

if(uploadError){
alert("ID card upload failed");
console.log(uploadError);
return;
}

const { data } = supabaseClient.storage
.from("guides")
.getPublicUrl(fileName);

idCardUrl = data.publicUrl;
}

/* insert guide */
const { error } = await supabaseClient
.from("guides")
.insert([{
name,
phone,
age,
gender,
photo: photoUrl,
id_card: idCardUrl,
email,
password
tag
}]);

if(error){
alert(error.message);
return;
}

alert("Guide registered successfully");

/* clear form */
document.getElementById("gname").value="";
document.getElementById("gphone").value="";
document.getElementById("gage").value="";
document.getElementById("ggender").value="";
document.getElementById("gphoto").value="";
document.getElementById("gidcard").value="";
document.getElementById("gemail").value="";
document.getElementById("gpassword").value="";
document.getElementById("gtag").value="";

}catch(err){
console.log(err);
alert("Something went wrong");
}

}
