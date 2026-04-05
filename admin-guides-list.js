function initGuides(){
loadGuides();
}

async function loadGuides(){

const { data, error } = await supabaseClient
.from("guides")
.select("*")
.order("created_at",{ascending:false});

if(error){
console.log(error);
return;
}

let html = "";

data.forEach(g => {

html += `
<tr>
<td>
<img src="${g.photo || '../images/user.png'}"
style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
</td>

<td>${g.name || ""}</td>
<td>${g.phone || ""}</td>
<td>${g.email || ""}</td>
<td>${g.age || ""}</td>
<td>${g.gender || ""}</td>

<td>
${g.id_card ? `<a href="${g.id_card}" target="_blank">View</a>` : "-"}
</td>

<td>
<button onclick="editGuide('${g.id}')" 
style="background:#1c3faa;color:white;border:none;padding:5px 8px;margin-right:5px">
Edit
</button>

<button onclick="deleteGuide('${g.id}')"
style="background:red;color:white;border:none;padding:5px 8px">
Delete
</button>
</td>

</tr>
`;

});

document.getElementById("guidesTable").innerHTML = html;

}

/* EDIT */
function editGuide(id){
window.location.href = "guides.html?edit=" + id;
}

/* DELETE */
async function deleteGuide(id){

if(!confirm("Delete this guide?")) return;

const { error } = await supabaseClient
.from("guides")
.delete()
.eq("id", id);

if(error){
alert("Delete failed");
return;
}

loadGuides();
}