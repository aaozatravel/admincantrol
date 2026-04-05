async function addTour(){

const title = document.getElementById("title").value;
const location = document.getElementById("location").value;
const price = document.getElementById("price").value;
const image = document.getElementById("image").value;
const description = document.getElementById("description").value;

await supabaseClient.from("tours").insert([
{ title, location, price, image, description }
]);

alert("Tour added");
loadTours();
}

async function loadTours(){

const { data } = await supabaseClient.from("tours").select("*");

let html = "";

data.forEach(t => {
html += `
<div>
${t.title} - ₹${t.price}
<button onclick="deleteTour('${t.id}')">Delete</button>
</div>
`;
});

document.getElementById("tourList").innerHTML = html;

}

async function deleteTour(id){

await supabaseClient.from("tours").delete().eq("id", id);
loadTours();

}