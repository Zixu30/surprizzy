/* Surprizzy GitHub-only admin/product manager.
   No Firebase. Product data is stored in products.json in your GitHub repo.
   The admin enters a GitHub fine-grained PAT locally; it is never written to the repo. */
const GH_KEY='surprizzyGitHubSettings';
const GH_DEFAULT={owner:'',repo:'',branch:'main',token:''};
let gh={...GH_DEFAULT,...JSON.parse(localStorage.getItem(GH_KEY)||'{}')};
let ghProducts=[];

function ghHeaders(){return {Authorization:`Bearer ${gh.token}`,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}}
function ghReady(){return !!(gh.owner&&gh.repo&&gh.branch&&gh.token)}
function ghApi(path,opts={}){return fetch(`https://api.github.com${path}`,{...opts,headers:{...ghHeaders(),...(opts.headers||{})}})}
function b64utf8(text){return btoa(unescape(encodeURIComponent(text)))}
function cleanBase64(dataUrl){return dataUrl.split(',')[1]}
function slug(s){return String(s||'product').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)||'product'}

async function ghGetFile(path){
  const r=await ghApi(`/repos/${encodeURIComponent(gh.owner)}/${encodeURIComponent(gh.repo)}/contents/${path}?ref=${encodeURIComponent(gh.branch)}`);
  if(r.status===404)return null;
  if(!r.ok)throw new Error(await r.text());
  return r.json();
}
async function ghPutFile(path,content,message,sha){
  const body={message,content:content,branch:gh.branch}; if(sha)body.sha=sha;
  const r=await ghApi(`/repos/${encodeURIComponent(gh.owner)}/${encodeURIComponent(gh.repo)}/contents/${path}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  if(!r.ok)throw new Error(await r.text()); return r.json();
}
async function saveProductsToGitHub(){
  const existing=await ghGetFile('products.json');
  await ghPutFile('products.json',b64utf8(JSON.stringify(ghProducts,null,2)+'\n'),'Update Surprizzy products',existing?.sha);
  localStorage.setItem('surprizzyProducts',JSON.stringify(ghProducts));
  window.products=ghProducts; window.renderProducts?.(); window.renderAdminProducts?.();
}
async function loadProductsFromGitHub(){
  const file=await ghGetFile('products.json');
  if(!file)throw new Error('products.json not found. Upload/create it in your repo first.');
  const text=decodeURIComponent(escape(atob(file.content.replace(/\n/g,''))));
  ghProducts=JSON.parse(text);
  localStorage.setItem('surprizzyProducts',JSON.stringify(ghProducts)); window.products=ghProducts; window.renderProducts?.(); window.renderAdminProducts?.();
  return ghProducts;
}
async function uploadImage(file){
  const dataUrl=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');
  const path=`products/${Date.now()}-${slug(file.name.replace(/\.[^.]+$/,''))}.${ext||'jpg'}`;
  const existing=await ghGetFile(path);
  await ghPutFile(path,cleanBase64(dataUrl),`Add product image ${file.name}`,existing?.sha);
  return `https://raw.githubusercontent.com/${gh.owner}/${gh.repo}/${encodeURIComponent(gh.branch)}/${path}`;
}

window.openAdminLogin=function(){
  document.getElementById('adminLoginOverlay')?.classList.add('open');
  document.getElementById('adminNumber').value=localStorage.getItem('surprizzyAdminNumber')||'';
  document.getElementById('adminPassword').value=''; document.getElementById('adminError').textContent='';
  setTimeout(()=>document.getElementById('adminNumber')?.focus(),100);
};
window.closeAdminLogin=function(e){if(!e||e.target.id==='adminLoginOverlay')document.getElementById('adminLoginOverlay')?.classList.remove('open')};
window.adminLogin=async function(){
  const number=document.getElementById('adminNumber').value.trim(), password=document.getElementById('adminPassword').value, error=document.getElementById('adminError'); error.textContent='';
  if(number!=='8369860594'){error.textContent='Invalid admin number.';return;}
  if(!password){error.textContent='Enter your admin password.';return;}

  // GitHub settings are intentionally inside the admin panel, so do NOT require
  // the token before opening the panel. The old version created a circular flow:
  // login required the token, but the token fields were hidden behind login.
  localStorage.setItem('surprizzyAdminNumber',number);
  localStorage.setItem('surprizzyAdminLoggedIn','1');
  document.getElementById('adminLoginOverlay')?.classList.remove('open');
  document.getElementById('adminOverlay')?.classList.add('open');
  window.renderAdminProducts?.();

  // If this device already has valid GitHub settings, refresh automatically.
  if(ghReady()){
    try{
      const r=await ghApi(`/repos/${encodeURIComponent(gh.owner)}/${encodeURIComponent(gh.repo)}`);
      if(!r.ok)throw new Error('GitHub access failed');
      await loadProductsFromGitHub();
    }catch(e){
      console.warn('Saved GitHub settings could not be loaded:',e);
      const msg=document.getElementById('ghSettingsMsg');
      if(msg)msg.textContent='GitHub settings are saved, but connection failed. Check the details below.';
    }
  } else {
    const msg=document.getElementById('ghSettingsMsg');
    if(msg)msg.textContent='Step 1: Enter GitHub Owner, Repository, Branch and Token below, then tap Connect & refresh.';
  }
};
window.firebaseAdminSignOut=function(){};
window.adminLogout=function(){localStorage.removeItem('surprizzyAdminLoggedIn');document.getElementById('adminOverlay')?.classList.remove('open')};
window.showSecureAdminPanel=function(){document.getElementById('adminLoginOverlay')?.classList.remove('open');document.getElementById('adminOverlay')?.classList.add('open');window.renderAdminProducts?.()};
window.closeAdmin=function(e){if(!e||e.target.id==='adminOverlay')document.getElementById('adminOverlay')?.classList.remove('open')};
window.showAdminTab=function(tab){document.getElementById('adminProductsTab').style.display=tab==='products'?'block':'none';document.getElementById('adminOrdersTab').style.display=tab==='orders'?'block':'none';document.querySelectorAll('.admin-tabs button').forEach((b,i)=>b.classList.toggle('active',(tab==='products'&&i===0)||(tab==='orders'&&i===1)))};

window.saveGitHubSettings=function(){
  gh.owner=document.getElementById('ghOwner').value.trim(); gh.repo=document.getElementById('ghRepo').value.trim(); gh.branch=document.getElementById('ghBranch').value.trim()||'main'; gh.token=document.getElementById('ghToken').value.trim();
  localStorage.setItem(GH_KEY,JSON.stringify(gh)); document.getElementById('ghSettingsMsg').textContent='GitHub settings saved on this device.';
};
window.testGitHubConnection=async function(){
  window.saveGitHubSettings(); const msg=document.getElementById('ghSettingsMsg'); msg.textContent='Testing…';
  try{const r=await ghApi(`/repos/${encodeURIComponent(gh.owner)}/${encodeURIComponent(gh.repo)}`); if(!r.ok)throw new Error(); msg.textContent='✓ Connected to GitHub repo.'; await loadProductsFromGitHub();}
  catch(e){msg.textContent='✕ Could not connect. Check Owner/Repo/Branch/Token.'}
};
window.loadGitHubProducts=async function(){try{await loadProductsFromGitHub();alert('Products refreshed from GitHub.')}catch(e){alert('Could not load products: '+e.message)}};

window.previewProductImage=function(event){const f=event.target.files?.[0],p=document.getElementById('pImagePreview');if(!f||!p)return;if(f.size>4*1024*1024){alert('Keep image under 4 MB.');event.target.value='';p.style.display='none';return}p.src=URL.createObjectURL(f);p.style.display='block'};
window.renderAdminProducts=function(){
  const box=document.getElementById('adminProductList'); if(!box)return; const ps=window.products||[];
  box.innerHTML=ps.map(p=>`<div class="admin-product-row"><div class="thumb">${p.image?`<img src="${p.image}" alt="">`:'<span>No image</span>'}</div><div><strong>${escapeHtml(p.name)}</strong><br><small>${escapeHtml(p.cat||'Gift')} · ₹${Number(p.price||0).toLocaleString('en-IN')}</small></div><div class="admin-row-actions"><button class="edit-btn" onclick="editGitHubProduct('${p.id}')">Edit</button><button class="delete-btn" onclick="deleteGitHubProduct('${p.id}')">Delete</button></div></div>`).join('')||'<div class="empty">No products yet.</div>';
};
function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
window.editGitHubProduct=function(id){const p=(window.products||[]).find(x=>String(x.id)===String(id));if(!p)return;document.getElementById('pEditId').value=p.id;document.getElementById('pName').value=p.name||'';document.getElementById('pPrice').value=p.price||'';document.getElementById('pCat').value=p.cat||'Soft Toys';document.getElementById('pDesc').value=p.desc||'';document.getElementById('pImage').value='';document.getElementById('pImagePreview').src=p.image||'';document.getElementById('pImagePreview').style.display=p.image?'block':'none';document.getElementById('pSaveBtn').textContent='Update product on GitHub';document.getElementById('pName').scrollIntoView({behavior:'smooth',block:'center'})};
window.cancelEditProduct=function(){document.getElementById('pEditId').value='';document.getElementById('pName').value='';document.getElementById('pPrice').value='';document.getElementById('pDesc').value='';document.getElementById('pImage').value='';document.getElementById('pImagePreview').style.display='none';document.getElementById('pSaveBtn').textContent='Upload image & add product'};
window.adminAddProduct=async function(){
  if(!ghReady())return alert('Set GitHub settings first.');
  const id=document.getElementById('pEditId').value.trim(),name=document.getElementById('pName').value.trim(),price=Number(document.getElementById('pPrice').value),cat=document.getElementById('pCat').value,file=document.getElementById('pImage').files?.[0],desc=document.getElementById('pDesc').value.trim()||'A special gift from Surprizzy.';
  if(!name||!price||price<1)return alert('Enter product name and valid price.'); if(file&&(file.size>4*1024*1024))return alert('Keep image under 4 MB.'); if(file&&!/^image\/(jpeg|png|webp)$/.test(file.type))return alert('Only JPG, PNG or WebP images are allowed.');
  const btn=document.getElementById('pSaveBtn');btn.disabled=true;btn.textContent='Saving to GitHub…';
  try{let image=(window.products||[]).find(p=>String(p.id)===String(id))?.image||'';if(file)image=await uploadImage(file);if(id){ghProducts=(window.products||[]).map(p=>String(p.id)===String(id)?{...p,name,price,cat,desc,image}:p)}else{ghProducts=[...(window.products||[]),{id:String(Date.now()),name,price,cat,desc,image}]};await saveProductsToGitHub();window.cancelEditProduct();alert(id?'Product updated on GitHub.':'Product added on GitHub.')}catch(e){console.error(e);alert('Could not save. '+e.message)}finally{btn.disabled=false;if(document.getElementById('pEditId').value)btn.textContent='Update product on GitHub';else btn.textContent='Upload image & add product'}
};
window.deleteGitHubProduct=async function(id){if(!ghReady())return alert('Set GitHub settings first.');const p=(window.products||[]).find(x=>String(x.id)===String(id));if(!p||!confirm(`Delete ${p.name}?`))return;try{ghProducts=(window.products||[]).filter(x=>String(x.id)!==String(id));await saveProductsToGitHub();alert('Product deleted from GitHub.')}catch(e){alert('Could not delete product. '+e.message)}};

(function hydrate(){document.addEventListener('DOMContentLoaded',()=>{for(const [id,val] of [['ghOwner',gh.owner],['ghRepo',gh.repo],['ghBranch',gh.branch]]){const el=document.getElementById(id);if(el)el.value=val}if(gh.token)document.getElementById('ghToken').value=gh.token; if(ghReady())loadProductsFromGitHub().catch(()=>{});})})();
