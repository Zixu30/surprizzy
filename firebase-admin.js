
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const cfg = window.SURPRIZZY_FIREBASE_CONFIG || {};
const placeholders = Object.values(cfg).some(v => String(v).startsWith("PASTE_"));

let auth, db;
if (!placeholders) {
  const app = initializeApp(cfg);
  auth = getAuth(app);
  db = getFirestore(app);

  onAuthStateChanged(auth, user => {
    if (user && user.email === "8369860594@surprizzy-admin.local") {
      window.firebaseAdminReady = true;
    }
  });
}

window.adminLogin = async function () {
  const number = document.getElementById("adminNumber").value.trim();
  const password = document.getElementById("adminPassword").value;
  const error = document.getElementById("adminError");
  error.textContent = "";

  if (placeholders) {
    error.textContent = "Firebase setup pending. Add your Firebase config first.";
    return;
  }
  if (number !== "8369860594") {
    error.textContent = "Invalid admin number.";
    return;
  }
  if (!password) {
    error.textContent = "Enter your password.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, "8369860594@surprizzy-admin.local", password);
    showSecureAdminPanel();
    await loadProducts();
    await loadOrders();
  } catch (e) {
    error.textContent = "Login failed. Check the number/password.";
  }
};

window.firebaseAdminSignOut = async function () {
  if (auth) await signOut(auth);
};

async function loadProducts() {
  if (!db) return;
  try {
    const snap = await getDocs(collection(db, "products"));
    if (!snap.empty) {
      window.products = snap.docs.map(d => ({id:d.id, ...d.data()}));
      if (window.renderProducts) window.renderProducts();
      renderAdminProducts();
    }
  } catch(e) { console.error(e); }
}

async function loadOrders() {
  if (!db) return;
  try {
    const snap = await getDocs(collection(db, "orders"));
    window.adminOrders = snap.docs.map(d => ({id:d.id, ...d.data()}));
    renderAdminOrders();
  } catch(e) { console.error(e); }
}

window.renderAdminProducts = function() {
  const box=document.getElementById("adminProductList"); if(!box) return;
  const ps=window.products || [];
  box.innerHTML=ps.map(p=>`<div class="admin-product-row">
    <div class="thumb">${p.emoji||"🎁"}</div>
    <div><strong>${p.name}</strong><br><small>${p.cat} · ₹${Number(p.price||0).toLocaleString("en-IN")}</small></div>
    <button class="delete-btn" onclick="deleteSecureProduct('${p.id}')">Delete</button>
  </div>`).join("") || '<div class="empty">No products in Firestore yet.</div>';
};

window.adminAddProduct = async function() {
  if (!db) return alert("Firebase setup pending.");
  const name=document.getElementById("pName").value.trim();
  const price=Number(document.getElementById("pPrice").value);
  const cat=document.getElementById("pCat").value;
  const emoji=document.getElementById("pEmoji").value.trim()||"🎁";
  const desc=document.getElementById("pDesc").value.trim()||"A special gift from Surprizzy.";
  if(!name || !price) return alert("Enter product name and price.");
  try {
    await addDoc(collection(db,"products"),{name,price,cat,emoji,desc,createdAt:serverTimestamp()});
    ["pName","pPrice","pEmoji","pDesc"].forEach(id=>document.getElementById(id).value="");
    await loadProducts();
  } catch(e) { alert("Could not add product."); }
};

window.deleteSecureProduct = async function(id) {
  if(!db || !confirm("Delete this product?")) return;
  try { await deleteDoc(doc(db,"products",id)); await loadProducts(); }
  catch(e) { alert("Could not delete product."); }
};

window.renderAdminOrders = function() {
  const box=document.getElementById("adminOrderList"); if(!box) return;
  const os=window.adminOrders || [];
  if(!os.length){box.innerHTML='<div class="empty">No orders yet.</div>';return;}
  box.innerHTML=os.map(o=>`<div class="order-row">
    <strong>${o.orderId||o.id}</strong> · ${o.date||""}<br>
    <small>${(o.items||[]).map(i=>`${i.name} ×${i.qty}`).join(", ")} · Total ₹${Number(o.total||0).toLocaleString("en-IN")}</small><br>
    <select class="status-select" onchange="updateSecureOrder('${o.id}',this.value)">
      ${["Pending","Confirmed","Shipped","Delivered","Cancelled"].map(s=>`<option ${o.status===s?"selected":""}>${s}</option>`).join("")}
    </select>
  </div>`).join("");
};

window.updateSecureOrder = async function(id,status) {
  if(!db) return;
  try { await updateDoc(doc(db,"orders",id),{status}); await loadOrders(); }
  catch(e) { alert("Could not update order."); }
};

window.checkout = async function() {
  if(!window.cart || !window.cart.length) return alert("Your cart is empty.");
  if(!db) return alert("Firebase setup pending.");
  const items=window.cart.map(i=>{
    const p=(window.products||[]).find(p=>p.id===i.id);
    return {name:p?.name||"Gift",qty:i.qty,price:p?.price||0};
  });
  const total=items.reduce((s,i)=>s+i.price*i.qty,0);
  try {
    await addDoc(collection(db,"orders"),{
      orderId:"SZ"+Date.now().toString().slice(-7),
      items,total,status:"Pending",date:new Date().toLocaleString("en-IN"),createdAt:serverTimestamp()
    });
    alert("Order created successfully.");
    window.cart=[]; if(window.saveCart) window.saveCart();
    if(window.closeCart) window.closeCart();
  } catch(e) { alert("Could not create order."); }
};

if (!placeholders) {
  onAuthStateChanged(auth, user => {
    if (user && user.email === "8369860594@surprizzy-admin.local") loadProducts();
  });
}
