// Surprizzy storefront logic
const defaultProducts = [];

window.products = JSON.parse(localStorage.getItem("surprizzyProducts") || "null") || defaultProducts;
window.cart = JSON.parse(localStorage.getItem("surprizzyCart") || "[]");
let activeCategory = "All";

// GitHub Pages storefront: always try to load the latest products.json first.
(async function loadGitHubCatalog(){
  try{
    const r=await fetch(`products.json?ts=${Date.now()}`,{cache:"no-store"});
    if(!r.ok) throw new Error("products.json not found");
    const data=await r.json();
    if(Array.isArray(data)){ window.products=data; saveProducts(); window.renderProducts(); window.renderCart(); }
  }catch(e){ console.warn("GitHub catalog could not be loaded; using cached products.",e); }
})();

function money(n){ return "₹" + Number(n || 0).toLocaleString("en-IN"); }
function saveProducts(){ localStorage.setItem("surprizzyProducts", JSON.stringify(window.products)); }

window.renderProducts = function(){
  const grid = document.getElementById("productsGrid");
  if(!grid) return;
  const q = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();
  const wishlist = JSON.parse(localStorage.getItem("surprizzyWishlist") || "[]").map(String);
  const list = window.products.filter(p =>
    (activeCategory === "All" || p.cat === activeCategory) &&
    (String(p.name).toLowerCase().includes(q) || String(p.cat).toLowerCase().includes(q))
  );

  grid.innerHTML = list.length ? list.map(p => {
    const id = String(p.id);
    const wished = wishlist.includes(id);
    return `<article class="product">
      <div class="product-img">
        <button type="button" class="heart ${wished ? "active" : ""}"
          aria-label="${wished ? "Remove from wishlist" : "Add to wishlist"}"
          aria-pressed="${wished}" onclick="toggleWish('${id}', this)">${wished ? "♥" : "♡"}</button>
        ${p.imageUrl ? `<img class="product-photo" src="${p.imageUrl}" alt="${p.name.replace(/"/g,'&quot;')}" loading="lazy">` : `<div class="product-no-image">Product image</div>`}
      </div>
      <div class="product-info">
        <p>${p.cat || "Gift"}</p><h3>${p.name}</h3><p>${p.desc || "A special gift from Surprizzy."}</p>
        <div class="price">${money(p.price)}</div>
        <button class="add-btn" type="button" onclick="addToCart('${id}')">Add to cart</button>
      </div>
    </article>`;
  }).join("") : `<div class="empty">No gifts found. Try another search ✨</div>`;
};

window.filterCategory = function(cat){ activeCategory=cat; window.renderProducts(); document.getElementById("products")?.scrollIntoView({behavior:"smooth"}); };
window.addToCart = function(id){
  id=String(id);
  const item=window.cart.find(x=>String(x.id)===id);
  if(item) item.qty++; else window.cart.push({id,qty:1});
  window.saveCart(); window.openCart();
};
window.saveCart = function(){ localStorage.setItem("surprizzyCart",JSON.stringify(window.cart)); window.updateCount(); window.renderCart(); };
window.updateCount = function(){ const el=document.getElementById("cartCount"); if(el) el.textContent=window.cart.reduce((a,b)=>a+Number(b.qty||0),0); };
window.renderCart = function(){
  const box=document.getElementById("cartItems"), totalEl=document.getElementById("cartTotal");
  if(!box) return;
  if(!window.cart.length){ box.innerHTML='<div class="empty">Your cart is waiting for a little surprise 🎁</div>'; if(totalEl) totalEl.textContent="₹0"; return; }
  let total=0;
  box.innerHTML=window.cart.map(item=>{
    const p=window.products.find(x=>String(x.id)===String(item.id));
    if(!p) return "";
    total += Number(p.price||0)*Number(item.qty||0);
    return `<div class="cart-item"><div class="cart-emoji">${p.imageUrl?`<img src="${p.imageUrl}" alt="">`:'<span>Image</span>'}</div><div><strong>${p.name}</strong><span>${money(p.price)}</span>
      <div class="qty"><button type="button" onclick="changeQty('${p.id}',-1)">−</button><span>${item.qty}</span><button type="button" onclick="changeQty('${p.id}',1)">+</button>
      <button type="button" onclick="removeItem('${p.id}')" style="margin-left:8px;background:none;color:#d55">Remove</button></div></div></div>`;
  }).join("");
  if(totalEl) totalEl.textContent=money(total);
};
window.changeQty=function(id,n){ const x=window.cart.find(i=>String(i.id)===String(id)); if(!x)return; x.qty+=n; if(x.qty<=0)window.cart=window.cart.filter(i=>String(i.id)!==String(id)); window.saveCart(); };
window.removeItem=function(id){ window.cart=window.cart.filter(i=>String(i.id)!==String(id)); window.saveCart(); };
window.openCart=function(){ document.getElementById("cartOverlay")?.classList.add("open"); window.renderCart(); };
window.closeCart=function(e){ if(!e || e.target.id==="cartOverlay") document.getElementById("cartOverlay")?.classList.remove("open"); };
window.toggleSearch=function(){ const bar=document.getElementById("searchBar"); bar?.classList.toggle("show"); document.getElementById("searchInput")?.focus(); };
window.toggleWish=function(id,button){
  id=String(id); let wishlist=JSON.parse(localStorage.getItem("surprizzyWishlist")||"[]").map(String);
  wishlist=wishlist.includes(id) ? wishlist.filter(x=>x!==id) : [...wishlist,id];
  localStorage.setItem("surprizzyWishlist",JSON.stringify(wishlist));
  const wished=wishlist.includes(id);
  if(button){ button.textContent=wished?"♥":"♡"; button.classList.toggle("active",wished); button.setAttribute("aria-pressed",String(wished)); button.setAttribute("aria-label",wished?"Remove from wishlist":"Add to wishlist"); }
};

window.openAdminLogin=function(){ document.getElementById("adminLoginOverlay")?.classList.add("open"); document.getElementById("adminNumber").value=""; document.getElementById("adminPassword").value=""; document.getElementById("adminError").textContent=""; setTimeout(()=>document.getElementById("adminNumber")?.focus(),100); };
window.closeAdminLogin=function(e){ if(!e || e.target.id==="adminLoginOverlay") document.getElementById("adminLoginOverlay")?.classList.remove("open"); };
window.showSecureAdminPanel=function(){ document.getElementById("adminLoginOverlay")?.classList.remove("open"); document.getElementById("adminOverlay")?.classList.add("open"); window.renderAdminProducts?.(); window.renderAdminOrders?.(); };
window.closeAdmin=function(e){ if(!e || e.target.id==="adminOverlay") document.getElementById("adminOverlay")?.classList.remove("open"); };
window.adminLogout=function(){ window.firebaseAdminSignOut?.(); document.getElementById("adminOverlay")?.classList.remove("open"); };
window.showAdminTab=function(tab){ document.getElementById("adminProductsTab").style.display=tab==="products"?"block":"none"; document.getElementById("adminOrdersTab").style.display=tab==="orders"?"block":"none"; document.querySelectorAll(".admin-tabs button").forEach((b,i)=>b.classList.toggle("active",(tab==="products"&&i===0)||(tab==="orders"&&i===1))); };


const SURPRIZZY_UPI_ID = "9326567293@omni"; // Replace with your real UPI ID.
const SURPRIZZY_UPI_NAME = "Surprizzy";

function cartTotal(){
  return (window.cart||[]).reduce((sum,item)=>{
    const p=(window.products||[]).find(x=>String(x.id)===String(item.id));
    return sum + Number(p?.price||0)*Number(item.qty||0);
  },0);
}
window.checkout=function(){
  if(!window.cart?.length)return alert("Your cart is empty.");
  const total=cartTotal();
  const totalEl=document.getElementById("checkoutTotal"); if(totalEl) totalEl.textContent=money(total);
  const err=document.getElementById("checkoutError"); if(err)err.textContent="";
  const form=document.getElementById("checkoutForm"); if(form)form.reset();
  document.querySelector('input[name="paymentMethod"][value="COD"]').checked=true;
  window.togglePaymentMethod();
  document.getElementById("checkoutOverlay")?.classList.add("open");
};
window.closeCheckout=function(e){if(!e || e.target.id==="checkoutOverlay")document.getElementById("checkoutOverlay")?.classList.remove("open");};
window.togglePaymentMethod=function(){
  const method=document.querySelector('input[name="paymentMethod"]:checked')?.value||"COD";
  const box=document.getElementById("upiBox"),btn=document.getElementById("placeOrderBtn");
  if(box)box.style.display=method==="UPI"?"block":"none";
  if(btn)btn.textContent=method==="UPI"?"Place UPI Order →":"Place COD Order →";
  const id=document.getElementById("upiIdText"); if(id)id.textContent=SURPRIZZY_UPI_ID;
  const pay=document.getElementById("upiPayButton");
  if(pay)pay.href=`upi://pay?pa=${encodeURIComponent(SURPRIZZY_UPI_ID)}&pn=${encodeURIComponent(SURPRIZZY_UPI_NAME)}&am=${cartTotal()}&cu=INR`;
};
window.copyUpi=async function(){
  try{await navigator.clipboard.writeText(SURPRIZZY_UPI_ID);alert("UPI ID copied.");}
  catch(e){alert("UPI ID: "+SURPRIZZY_UPI_ID);}
};
window.startUpiPayment=function(){
  if(SURPRIZZY_UPI_ID.startsWith("YOUR_")){alert("Add your real UPI ID in script.js first.");return false;}
  return true;
};
const SURPRIZZY_WHATSAPP = "584267084400";
function whatsappUrl(message){return `https://wa.me/${SURPRIZZY_WHATSAPP}?text=${encodeURIComponent(message)}`;}
function whatsappItems(){
  return (window.cart||[]).map(i=>{const p=(window.products||[]).find(x=>String(x.id)===String(i.id));return p?`${p.name} x${i.qty} — ${money(Number(p.price||0)*Number(i.qty||0))}`:""}).filter(Boolean).join("\n");
}
window.whatsappOrder=function(){
  if(!window.cart?.length)return alert("Your cart is empty.");
  const msg=`Hello Surprizzy, I want to place an order.\n\n${whatsappItems()}\n\nTotal: ${money(cartTotal())}\nPayment: I will confirm on WhatsApp.`;
  window.open(whatsappUrl(msg),"_blank","noopener");
};
window.whatsappCheckoutOrder=function(){
  if(!window.cart?.length)return alert("Your cart is empty.");
  const name=document.getElementById("customerName")?.value.trim()||"Not provided";
  const phone=document.getElementById("customerPhone")?.value.trim()||"Not provided";
  const address=document.getElementById("customerAddress")?.value.trim()||"Not provided";
  const city=document.getElementById("customerCity")?.value.trim()||"Not provided";
  const pincode=document.getElementById("customerPincode")?.value.trim()||"Not provided";
  const method=document.querySelector('input[name="paymentMethod"]:checked')?.value||"COD";
  const msg=`Hello Surprizzy, I want to place an order.\n\nName: ${name}\nMobile: ${phone}\nAddress: ${address}\nCity: ${city}\nPincode: ${pincode}\n\n${whatsappItems()}\n\nTotal: ${money(cartTotal())}\nPayment method: ${method}`;
  window.open(whatsappUrl(msg),"_blank","noopener");
};

window.submitCheckout=async function(event){
  event.preventDefault();
  const err=document.getElementById("checkoutError"),btn=document.getElementById("placeOrderBtn");
  err.textContent="";
  if(!window.cart?.length){err.textContent="Your cart is empty.";return;}
  const method=document.querySelector('input[name="paymentMethod"]:checked')?.value||"COD";
  const name=document.getElementById("customerName").value.trim();
  const phone=document.getElementById("customerPhone").value.trim();
  const address=document.getElementById("customerAddress").value.trim();
  const city=document.getElementById("customerCity").value.trim();
  const pincode=document.getElementById("customerPincode").value.trim();
  if(!/^\d{10}$/.test(phone)){err.textContent="Enter a valid 10-digit mobile number.";return;}
  if(!/^\d{6}$/.test(pincode)){err.textContent="Enter a valid 6-digit pincode.";return;}
  if(method==="UPI" && SURPRIZZY_UPI_ID.startsWith("YOUR_")){err.textContent="Add your real UPI ID before accepting online payments.";return;}
  btn.disabled=true; btn.style.opacity=".6"; btn.textContent="Placing order…";
  try{
    const items=window.cart.map(i=>{const p=(window.products||[]).find(p=>String(p.id)===String(i.id));return{name:p?.name||"Gift",qty:Number(i.qty||1),price:Number(p?.price||0)};});
    const total=items.reduce((s,i)=>s+i.price*i.qty,0);
    const orderId="SZ"+Date.now().toString().slice(-8);
    const status=method==="COD"?"Confirmed":"Under Process";
    // GitHub Pages is static: send the complete order to WhatsApp instead of a database.
    const msg=`Hello Surprizzy, I want to place an order.\n\nOrder ID: ${orderId}\nName: ${name}\nMobile: ${phone}\nAddress: ${address}\nCity: ${city}\nPincode: ${pincode}\n\n${items.map(i=>`${i.name} x${i.qty} — ${money(i.price*i.qty)}`).join("\n")}\n\nTotal: ${money(total)}\nPayment method: ${method}${method==="UPI"?"\nPayment status: I have paid / will share payment proof on WhatsApp.":""}`;
    window.open(whatsappUrl(msg),"_blank","noopener");
    window.cart=[];window.saveCart();document.getElementById("checkoutOverlay")?.classList.remove("open");
    window.showOrderStatus({orderId,status,paymentMethod:method});
  }catch(e){
    console.error(e);err.textContent="Could not prepare the order. Please try WhatsApp ordering instead.";
  }finally{
    btn.disabled=false;btn.style.opacity="1";window.togglePaymentMethod();
  }
};
let customerOrderUnsub=null;
window.showOrderStatus=function(order){
  const title=document.getElementById("orderStatusTitle"),text=document.getElementById("orderStatusText"),icon=document.getElementById("orderStatusIcon");
  document.getElementById("orderStatusId").textContent=order.orderId||"—";
  if(order.status==="Confirmed"){
    icon.textContent="✓";title.textContent="Order Confirmed";text.textContent=order.paymentMethod==="COD"?"Your COD order has been confirmed. We’ll contact you before delivery.":"Your online payment order has been confirmed by admin.";
  }else{
    icon.textContent="⏳";title.textContent="Order is under process";text.textContent="We received your UPI order. It will be confirmed after admin accepts it.";
  }
  document.getElementById("orderStatusOverlay")?.classList.add("open");
  localStorage.setItem("surprizzyLastOrder",JSON.stringify({orderId:order.orderId,paymentMethod:order.paymentMethod,status:order.status}));
};
window.closeOrderStatus=function(e){if(!e || e.target.id==="orderStatusOverlay")document.getElementById("orderStatusOverlay")?.classList.remove("open");};


window.renderProducts(); window.updateCount(); window.renderCart();
