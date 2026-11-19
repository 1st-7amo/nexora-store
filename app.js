const $ = id => document.getElementById(id);
const cfg = window.NEXORA_CONFIG || {};
const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("YOUR-PROJECT") &&
  cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("YOUR_SUPABASE");
const db = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
const WHATSAPP_NUMBER = cfg.WHATSAPP_NUMBER || "201277445430";
let products = [], loggedIn = false, currentUser = null;

function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),3000);}
function money(value){return Number(value).toLocaleString(undefined,{maximumFractionDigits:2});}
function safeImageUrl(value){if(!value)return "";try{const u=new URL(value);return ["https:","http:"].includes(u.protocol)?u.href:"";}catch{return "";}}
function showConfigWarning(){if(!db)toast("Connect your Supabase project in config.js to activate the shared store.");}
async function loadProducts(){
  if(!db){products=[];renderStore();return;}
  const {data,error}=await db.from("products").select("id,name,price,gif_url,display_order").order("display_order",{ascending:true});
  if(error){console.error(error);toast("Could not load products. Check your Supabase setup.");products=[];}
  else products=data||[];
  renderStore();if(loggedIn)renderManage();
}
function renderStore(){
  const sorted=[...products].sort((a,b)=>Number(a.display_order)-Number(b.display_order)||a.name.localeCompare(b.name));
  $("productCount").textContent=`${sorted.length} SCRIPT${sorted.length===1?"":"S"}`;
  $("emptyState").hidden=sorted.length!==0;$("productGrid").replaceChildren();
  sorted.forEach(p=>{
    const card=document.createElement("article");card.className="product-card";
    const image=document.createElement("div");image.className="product-image";const src=safeImageUrl(p.gif_url);
    if(src){const img=document.createElement("img");img.src=src;img.alt=`${p.name} preview`;img.loading="lazy";img.onerror=()=>{image.replaceChildren(Object.assign(document.createElement("div"),{className:"image-placeholder",textContent:"✧"}));};image.append(img);}
    else image.innerHTML='<div class="image-placeholder">✧</div>';
    const info=document.createElement("div");info.className="product-info";const top=document.createElement("div");top.className="product-top";
    const wrap=document.createElement("div"),name=document.createElement("h3");name.textContent=p.name;
    const tag=document.createElement("div");tag.className="script-label";tag.textContent="NEXORA DIGITAL SCRIPT";wrap.append(name,tag);
    const price=document.createElement("div");price.className="price";price.textContent=money(p.price);top.append(wrap,price);
    const row=document.createElement("div");row.className="order-row";
    const wa=document.createElement("button");wa.className="order-btn wa";wa.textContent="ORDER VIA WHATSAPP ↗";wa.onclick=()=>order(p);
    const dc=document.createElement("a");dc.className="order-btn dc";dc.textContent="ASK ON DISCORD ↗";dc.href=cfg.DISCORD_INVITE||"https://discord.gg/HTvGpD3dX";dc.target="_blank";dc.rel="noopener noreferrer";
    row.append(wa,dc);info.append(top,row);card.append(image,info);$("productGrid").append(card);
  });
}
function orderMessage(p){return `Hello! I want to order this script.\nScript: ${p.name}\nPrice: ${money(p.price)}`;}
function order(p){
  const message=orderMessage(p);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,"_blank","noopener,noreferrer");
}

function openModal(){$("ownerModal").hidden=false;document.body.style.overflow="hidden";}
function closeModal(){$("ownerModal").hidden=true;document.body.style.overflow="";}
function showLogin(){loggedIn=false;currentUser=null;$("dashboardView").hidden=true;$("loginView").hidden=false;}
function showDashboard(){loggedIn=true;$("loginView").hidden=true;$("dashboardView").hidden=false;$("ownerPassword").value="";renderManage();}
$("openOwner").addEventListener("click",openModal);
$("closeOwner").addEventListener("click",closeModal);
$("ownerModal").addEventListener("click",e=>{if(e.target===$("ownerModal"))closeModal();});
$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();$("loginError").textContent="";
  if(!db){$("loginError").textContent="Supabase is not configured. Edit config.js first.";return;}
  const button=$("loginButton");button.disabled=true;button.textContent="SIGNING IN...";
  const {data,error}=await db.auth.signInWithPassword({email:$("ownerEmail").value.trim(),password:$("ownerPassword").value});
  button.disabled=false;button.textContent="OPEN DASHBOARD ↗";
  if(error){$("loginError").textContent=error.message;return;}
  currentUser=data.user;
  const {data:admin,error:adminError}=await db.from("admins").select("user_id").eq("user_id",currentUser.id).maybeSingle();
  if(adminError||!admin){await db.auth.signOut();$("loginError").textContent="This account is not registered as a NEXORA owner.";return;}
  showDashboard();await loadProducts();
});
$("logout").addEventListener("click",async()=>{if(db)await db.auth.signOut();showLogin();resetForm();});
async function renderManage(){
  if(!loggedIn)return;$("dashCount").textContent=products.length;const list=$("manageProducts");list.replaceChildren();
  if(!products.length){const p=document.createElement("p");p.className="muted";p.textContent="No products yet. Add your first script above.";list.append(p);return;}
  products.forEach(p=>{
    const item=document.createElement("div");item.className="manage-item";
    const img=document.createElement("img");img.className="manage-thumb";img.alt="";const src=safeImageUrl(p.gif_url);if(src)img.src=src;else img.hidden=true;
    const name=document.createElement("span");name.className="item-name";name.textContent=`${p.name} #${p.display_order}`;
    const price=document.createElement("span");price.className="item-price";price.textContent=money(p.price);
    const edit=document.createElement("button");edit.textContent="EDIT";edit.onclick=()=>fillForm(p);
    const del=document.createElement("button");del.className="delete";del.textContent="DELETE";del.onclick=()=>deleteProduct(p.id);
    item.append(img,name,price,edit,del);list.append(item);
  });
}
function fillForm(p){$("editId").value=p.id;$("scriptName").value=p.name;$("scriptPrice").value=p.price;$("scriptGif").value=p.gif_url||"";$("scriptOrder").value=p.display_order;$("formTitle").textContent="Edit product";$("saveProduct").textContent="UPDATE PRODUCT";$("cancelEdit").hidden=false;$("scriptName").focus();}
async function deleteProduct(id){
  if(!confirm("Delete this product?"))return;
  const {error}=await db.from("products").delete().eq("id",id);
  if(error){toast(error.message);return;}await loadProducts();resetForm();toast("Product deleted.");
}
function resetForm(){$("productForm").reset();$("editId").value="";$("scriptOrder").value=products.length+1;$("formTitle").textContent="Add a new script";$("saveProduct").textContent="SAVE SCRIPT +";$("cancelEdit").hidden=true;}
$("cancelEdit").addEventListener("click",resetForm);
$("productForm").addEventListener("submit",async e=>{
  e.preventDefault();if(!db){toast("Supabase is not configured.");return;}
  const id=$("editId").value,name=$("scriptName").value.trim(),price=Number($("scriptPrice").value),gif=$("scriptGif").value.trim(),orderNum=Number($("scriptOrder").value)||1;
  if(!name||name.length>60||!Number.isFinite(price)||price<0){toast("Check the script name and price.");return;}
  if(gif&&!safeImageUrl(gif)){toast("GIF URL must be a valid HTTP or HTTPS link.");return;}
  const record={name,price,gif_url:gif||null,display_order:orderNum};
  const result=id?await db.from("products").update(record).eq("id",id):await db.from("products").insert(record);
  if(result.error){toast(result.error.message);return;}
  await loadProducts();resetForm();toast(id?"Product updated.":"Product added.");
});
$("year").textContent=new Date().getFullYear();
$("scriptOrder").value=1;
if(db){
  db.auth.getSession().then(async({data})=>{if(data.session){currentUser=data.session.user;const{data:admin}=await db.from("admins").select("user_id").eq("user_id",currentUser.id).maybeSingle();if(admin)showDashboard();else await db.auth.signOut();}loadProducts();});
}else{renderStore();showConfigWarning();}
