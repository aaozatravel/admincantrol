function addTour(){
let title = document.getElementById("title").value;
let desc = document.getElementById("desc").value;
let price = document.getElementById("price").value;
let image = document.getElementById("image").value;

let packages = JSON.parse(localStorage.getItem("packages")) || [];

packages.push({title,desc,price,image});

localStorage.setItem("packages", JSON.stringify(packages));

alert("Tour Added");
}

let messages = JSON.parse(localStorage.getItem("messages")) || [];

document.getElementById("messages").innerHTML = messages.map(m => `
<div class="card">
<div class="card-body">
<h3>${m.name}</h3>
<p>${m.email}</p>
<p>${m.phone}</p>
<p>${m.message}</p>
</div>
</div>
`).join("");