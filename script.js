let products = JSON.parse(localStorage.getItem('surprizzyProducts') || 'null') || [
  {id:1,name:"Teddy Love Box",cat:"Soft Toys",price:799,emoji:"🧸",desc:"Cute teddy with a little surprise box."},
  {id:2,name:"Birthday Surprise Hamper",cat:"Birthday",price:999,emoji:"🎂",desc:"A cheerful hamper for their special day."},
  {id:3,name:"Love Letter Gift Box",cat:"Love",price:699,emoji:"💌",desc:"A sweet box made for someone special."},
  {id:4,name:"Personalized Mug",cat:"Personalized",price:449,emoji:"☕",desc:"Add a name and make it truly yours."},
  {id:5,name:"Forever Rose Box",cat:"Premium",price:1299,emoji:"🌹",desc:"Elegant rose gift for unforgettable moments."},
  {id:6,name:"Cute Gift Hamper",cat:"Birthday",price:849,emoji:"🎁",desc:"A colorful collection of little joys."},
  {id:7,name:"Couple Memory Frame",cat:"Love",price:899,emoji:"💗",desc:"Keep your favorite memory forever."},
  {id:8,name:"Surprise Soft Toy",cat:"Soft Toys",price:599,emoji:"🐻",desc:"Soft, cuddly and impossible not to love."}
];

let activeCategory="All";
let cart=JSON.parse(localStorage.getItem("surprizzyCart")||"[]");

function money(n){return "₹"+n.toLocaleString("en-IN")}
function renderProducts(){
  const q=(document.getElementById("searchInput")?.value||"").toLowerCase();
  const list=products.filter(p=>(activeCategory==="All"||p.cat===activeCategory)&&
    (p.name.toLowerCase().includes(q)||p.cat.toLowerCase().includes(q)));
  document.getElementById("productsGrid").innerHTML=list.length?list.map(p=>`
    <article class="product">
      <div class="product-img"><button class="heart" onclick="toggleWish(${p.id})">♡</button>${p.emoji}</div>
      <div class="product-info">
        <p>${p.cat}</p><h3>${p.name}</h3><p>${p.desc}</p>
        <div class="price">${money(p.price)}</div>
        <button class="add-btn" onclick="addToCart(${p.id})">Add to cart</button>
      </div>
    </article>`).join(""):`<div class="empty">No gifts found. Try another search ✨</div>`;
}
function filterCategory(cat){activeCategory=cat;renderProducts();document.getElementById("products").scrollIntoView({behavior:"smooth"})}
function addToCart(id){const item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({id,qty:1});saveCart();openCart()}
function saveCart(){localStorage.setItem("surprizzyCart",JSON.stringify(cart));updateCount();renderCart()}
function updateCount(){document.getElementById("cartCount").textContent=cart.reduce((a,b)=>a+b.qty,0)}
function renderCart(){
  const box=document.getElementById("cartItems");
  if(!cart.length){box.innerHTML='<div class="empty">Your cart is waiting for a little surprise 🎁</div>';document.getElementById("cartTotal").textContent="₹0";return}
  let total=0;
  box.innerHTML=cart.map(item=>{const p=products.find(x=>x.id===item.id);total+=p.price*item.qty;return`
    <div class="cart-item"><div class="cart-emoji">${p.emoji}</div><div><strong>${p.name}</strong><span>${money(p.price)}</span>
    <div class="qty"><button onclick="changeQty(${p.id},-1)">−</button><span>${item.qty}</span><button onclick="changeQty(${p.id},1)">+</button>
    <button onclick="removeItem(${p.id})" style="margin-left:8px;background:none;color:#d55">Remove</button></div></div></div>`}).join("");
  document.getElementById("cartTotal").textContent=money(total);
}
function changeQty(id,n){const x=cart.find(i=>i.id===id);if(!x)return;x.qty+=n;if(x.qty<=0)cart=cart.filter(i=>i.id!==id);saveCart()}
function removeItem(id){cart=cart.filter(i=>i.id!==id);saveCart()}
function openCart(){document.getElementById("cartOverlay").classList.add("open");renderCart()}
function closeCart(e){if(!e||e.target.id==="cartOverlay")document.getElementById("cartOverlay").classList.remove("open")}
function toggleSearch(){document.getElementById("searchBar").classList.toggle("show");document.getElementById("searchInput").focus()}
function toggleWish(id){const b=event.currentTarget;b.textContent=b.textContent==="♡"?"♥":"♡";b.style.color=b.textContent==="♥"?"#e74d71":""}
function whatsappOrder(){
  if(!cart.length)return alert("Your cart is empty.");
  const lines=cart.map(i=>{const p=products.find(x=>x.id===i.id);return `${p.name} x${i.qty} - ${money(p.price*i.qty)}`});
  const total=cart.reduce((s,i)=>s+products.find(p=>p.id===i.id).price*i.qty,0);
  const text=encodeURIComponent(`Hi Surprizzy! 🎁 I want to order:\n${lines.join("\n")}\nTotal: ${money(total)}`);
  // Replace 919999999999 with your WhatsApp business number.
  window.open(`https://wa.me/919999999999?text=${text}`,"_blank");
}
renderProducts();updateCount();


function openAdminLogin(){
  document.getElementById("adminLoginOverlay").classList.add("open");
  document.getElementById("adminNumber").value="";
  document.getElementById("adminPassword").value="";
  document.getElementById("adminError").textContent="";
  setTimeout(()=>document.getElementById("adminNumber").focus(),100);
}
function closeAdminLogin(e){
  if(!e || e.target.id==="adminLoginOverlay") document.getElementById("adminLoginOverlay").classList.remove("open");
}
function showSecureAdminPanel(){
  document.getElementById("adminLoginOverlay").classList.remove("open");
  document.getElementById("adminOverlay").classList.add("open");
  if(window.renderAdminProducts) window.renderAdminProducts();
  if(window.renderAdminOrders) window.renderAdminOrders();
}
function closeAdmin(e){if(!e || e.target.id==="adminOverlay")document.getElementById("adminOverlay").classList.remove("open")}
function adminLogout(){
  if(window.firebaseAdminSignOut) window.firebaseAdminSignOut();
  document.getElementById("adminOverlay").classList.remove("open");
}
function showAdminTab(tab){
  document.getElementById("adminProductsTab").style.display=tab==="products"?"block":"none";
  document.getElementById("adminOrdersTab").style.display=tab==="orders"?"block":"none";
  document.querySelectorAll(".admin-tabs button").forEach((b,i)=>b.classList.toggle("active",(tab==="products"&&i===0)||(tab==="orders"&&i===1)));
}
