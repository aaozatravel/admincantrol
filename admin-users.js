function initUsers(){
loadUsers();
}

async function loadUsers(){

const { data, error } = await supabaseClient
.from("users")
.select("*")
.order("created_at",{ascending:false});

if(error){
console.log("Users error:", error);
return;
}

let html = "";

data.forEach(u => {
html += `

<tr>
<td>${u.name || ""}</td>
<td>${u.email || ""}</td>
<td>${u.phone || ""}</td>
</tr>
`;
});document.getElementById("usersTable").innerHTML = html;

}