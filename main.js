let packages = JSON.parse(localStorage.getItem("packages")) || [];

if(packages.length === 0){
packages = [
{
title:"Srinagar Tour",
desc:"3 Days Houseboat Stay",
price:"₹9,999",
image:"images/kashmir1.jpg"
},
{
title:"Gulmarg Package",
desc:"Snow Adventure Tour",
price:"₹12,999",
image:"images/kashmir2.jpg"
}
];

localStorage.setItem("packages", JSON.stringify(packages));
}

let container = document.getElementById("packagesContainer");

if(container){
container.innerHTML = packages.map(p => `
<div class="card">
<img src="${p.image}">
<div class="card-body">
<h3>${p.title}</h3>
<p>${p.desc}</p>
<div class="price">${p.price}</div>
</div>
</div>
`).join("");
}
