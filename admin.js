const KEY="madera_products_v1";

const DEFAULT_PRODUCTS = [
  {id:"1",name:"جزيرة مطبخ خشب",category:"مطابخ",size:"180 × 90 سم",price:12500,image:"https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=800&q=90"},
  {id:"2",name:"شباك ألومنيوم",category:"مونتال",size:"150 × 120 سم",price:4200,image:"https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=800&q=90"},
  {id:"3",name:"مكتب عملي مع رفوف",category:"مكاتب",size:"120 × 60 سم",price:7500,image:"https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=90"},
  {id:"4",name:"مطبخ خشب + مونتال",category:"مطابخ",size:"2.56 × 2.56 م",price:32000,image:"https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=800&q=90"},
  {id:"5",name:"وحدة حمام مودرن",category:"حمامات",size:"80 × 50 سم",price:5800,image:"https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=90"},
  {id:"6",name:"وحدة تلفزيون خشب",category:"مطابخ",size:"180 × 45 سم",price:8900,image:"https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=90"},
  {id:"7",name:"باب ألومنيوم مودرن",category:"مونتال",size:"90 × 210 سم",price:6800,image:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=90"},
  {id:"8",name:"وحدة حوض حمام",category:"حمامات",size:"100 × 50 سم",price:6400,image:"https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=90"},
  {id:"9",name:"مكتب منزلي خشب",category:"مكاتب",size:"140 × 70 سم",price:8200,image:"https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=800&q=90"},
  {id:"10",name:"مطبخ خشب طبيعي",category:"مطابخ",size:"حسب المقاس",price:28500,image:"https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=800&q=90"}
];

let products = JSON.parse(localStorage.getItem(KEY) || "null");
if(!Array.isArray(products)){
  products = DEFAULT_PRODUCTS.map(p=>({...p,active:true,featured:false,oldPrice:""}));
  localStorage.setItem(KEY, JSON.stringify(products));
}
products = products.map(p=>({
  ...p,
  image:p.image || p.img || "",
  active:p.active !== false,
  featured:p.featured === true,
  oldPrice:p.oldPrice || ""
}));

let selectedImage = "";
let editingId = null;

const $ = id => document.getElementById(id);

function saveData(message){
  localStorage.setItem(KEY, JSON.stringify(products));
  localStorage.setItem(KEY+"_updated", new Date().toLocaleString("ar-EG"));
  render();
  if(message) toast(message);
}

function render(){
  const q=$("search").value.trim().toLowerCase();
  const filter=$("statusFilter").value;

  $("totalCount").textContent=products.length;
  $("visibleCount").textContent=products.filter(p=>p.active!==false).length;
  $("featuredCount").textContent=products.filter(p=>p.featured===true).length;
  $("categoryCount").textContent=new Set(products.map(p=>p.category).filter(Boolean)).size;
  $("lastUpdate").textContent=localStorage.getItem(KEY+"_updated") || "—";

  const filtered=products.filter(p=>{
    const text=((p.name||"")+" "+(p.category||"")).toLowerCase();
    const matchesSearch=text.includes(q);
    const matchesFilter=
      filter==="all" ||
      (filter==="active" && p.active!==false) ||
      (filter==="hidden" && p.active===false) ||
      (filter==="featured" && p.featured===true);
    return matchesSearch && matchesFilter;
  });

  $("products").innerHTML=filtered.map(p=>{
    const status=p.active===false ? "مخفي" : "ظاهر";
    const featured=p.featured ? " • ⭐ مميز" : "";
    const price=Number(p.price||0).toLocaleString("ar-EG");
    const old=p.oldPrice ? `<del>${Number(p.oldPrice).toLocaleString("ar-EG")} جنيه</del>` : "";
    return `
      <article class="card ${p.active===false ? "is-hidden" : ""}">
        <div class="card-img">
          ${p.image ? `<img src="${p.image}" alt="${esc(p.name)}">` : `<span>بدون صورة</span>`}
          <span class="status ${p.active===false ? "off" : ""}">${status}</span>
        </div>
        <div class="card-body">
          <h3>${esc(p.name)}</h3>
          <div class="meta">${esc(p.category)}${p.size ? " • "+esc(p.size) : ""}${featured}</div>
          <div class="price">${price} جنيه ${old}</div>
          <div class="card-actions">
            <button onclick="editProduct('${p.id}')">✏️ تعديل الكل</button>
            <button onclick="toggleActive('${p.id}')">${p.active===false ? "👁️ إظهار" : "🙈 إخفاء"}</button>
            <button onclick="duplicateProduct('${p.id}')">📋 نسخ</button>
            <button class="delete" onclick="deleteProduct('${p.id}')">🗑️ حذف</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  $("empty").classList.toggle("hidden", filtered.length!==0);
}

function esc(s){
  return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

$("image").addEventListener("change",e=>{
  const file=e.target.files[0];
  if(!file)return;
  if(file.size>5*1024*1024){
    toast("الصورة أكبر من 5MB");
    e.target.value="";
    return;
  }
  const reader=new FileReader();
  reader.onload=()=>{
    selectedImage=reader.result;
    $("preview").src=selectedImage;
    $("previewWrap").classList.remove("hidden");
    $("uploadText").textContent="✅ تم اختيار صورة جديدة";
  };
  reader.readAsDataURL(file);
});

$("productForm").addEventListener("submit",e=>{
  e.preventDefault();

  const existing=editingId ? products.find(p=>String(p.id)===String(editingId)) : null;
  if(!selectedImage && !existing?.image){
    toast("اختار صورة للمنتج");
    return;
  }

  const data={
    ...(existing||{}),
    id:editingId || Date.now().toString(),
    name:$("name").value.trim(),
    price:Number($("price").value),
    oldPrice:$("oldPrice").value ? Number($("oldPrice").value) : "",
    category:$("category").value,
    size:$("size").value.trim(),
    description:$("description").value.trim(),
    image:selectedImage || existing?.image || "",
    active:$("active").checked,
    featured:$("featured").checked,
    createdAt:existing?.createdAt || new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };

  if(editingId){
    const i=products.findIndex(p=>String(p.id)===String(editingId));
    if(i>=0)products[i]=data;
    saveData("تم تعديل المنتج بالكامل بنجاح");
  }else{
    products.unshift(data);
    saveData("تمت إضافة المنتج بنجاح");
  }
  resetForm();
});

function editProduct(id){
  const p=products.find(x=>String(x.id)===String(id));
  if(!p)return;
  editingId=p.id;
  $("editId").value=p.id;
  $("name").value=p.name||"";
  $("price").value=p.price??"";
  $("oldPrice").value=p.oldPrice??"";
  $("category").value=p.category||"";
  $("size").value=p.size||"";
  $("description").value=p.description||"";
  $("active").checked=p.active!==false;
  $("featured").checked=p.featured===true;
  selectedImage=p.image||"";
  if(selectedImage){
    $("preview").src=selectedImage;
    $("previewWrap").classList.remove("hidden");
    $("uploadText").textContent="📷 الصورة الحالية — اختر صورة أخرى لاستبدالها";
  }else{
    removeImage();
  }
  $("formTitle").textContent="تعديل المنتج";
  $("saveBtn").textContent="💾 حفظ كل التعديلات";
  $("duplicateBtn").classList.remove("hidden");
  $("cancelEdit").classList.remove("hidden");
  scrollToForm();
}

function resetForm(){
  editingId=null;
  selectedImage="";
  $("productForm").reset();
  $("active").checked=true;
  $("editId").value="";
  $("previewWrap").classList.add("hidden");
  $("preview").src="";
  $("uploadText").textContent="📷 اختيار صورة جديدة من اللابتوب";
  $("formTitle").textContent="إضافة منتج جديد";
  $("saveBtn").textContent="حفظ المنتج";
  $("duplicateBtn").classList.add("hidden");
  $("cancelEdit").classList.add("hidden");
}

function removeImage(){
  selectedImage="";
  $("image").value="";
  $("previewWrap").classList.add("hidden");
  $("preview").src="";
  $("uploadText").textContent="📷 اختيار صورة جديدة من اللابتوب";
}

function toggleActive(id){
  const p=products.find(x=>String(x.id)===String(id));
  if(!p)return;
  p.active=p.active===false;
  p.updatedAt=new Date().toISOString();
  saveData(p.active ? "تم إظهار المنتج" : "تم إخفاء المنتج");
}

function duplicateProduct(id){
  const p=products.find(x=>String(x.id)===String(id));
  if(!p)return;
  const copy={...p,id:Date.now().toString(),name:(p.name||"")+" - نسخة",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
  products.unshift(copy);
  saveData("تم نسخ المنتج");
}

function duplicateCurrent(){
  if(!editingId)return;
  duplicateProduct(editingId);
  resetForm();
}

function deleteProduct(id){
  const p=products.find(x=>String(x.id)===String(id));
  if(!p || !confirm(`هل تريد حذف "${p.name}" نهائيًا؟`))return;
  products=products.filter(x=>String(x.id)!==String(id));
  saveData("تم حذف المنتج");
  if(String(editingId)===String(id))resetForm();
}

function clearAllProducts(){
  if(!products.length)return toast("لا توجد منتجات");
  if(confirm("سيتم حذف كل المنتجات من هذه النسخة. متأكد؟")){
    products=[];
    saveData("تم مسح كل المنتجات");
    resetForm();
  }
}

function exportProducts(){
  const blob=new Blob([JSON.stringify(products,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download="madera-products-backup.json";
  a.click();
  URL.revokeObjectURL(url);
  toast("تم تصدير نسخة احتياطية");
}

$("importFile").addEventListener("change",e=>{
  const file=e.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const imported=JSON.parse(reader.result);
      if(!Array.isArray(imported))throw new Error();
      if(!confirm(`سيتم استبدال المنتجات الحالية بعدد ${imported.length} منتج. هل تريد المتابعة؟`))return;
      products=imported.map(p=>({
        ...p,
        image:p.image||p.img||"",
        active:p.active!==false,
        featured:p.featured===true
      }));
      saveData("تم استيراد المنتجات");
    }catch(err){
      toast("ملف JSON غير صالح");
    }finally{
      e.target.value="";
    }
  };
  reader.readAsText(file);
});

function scrollToForm(){
  $("productFormSection").scrollIntoView({behavior:"smooth"});
}

function showProducts(){
  $("productsSection").scrollIntoView({behavior:"smooth"});
}

function toast(msg){
  const t=$("toast");
  t.textContent=msg;
  t.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>t.classList.remove("show"),2400);
}

$("search").addEventListener("input",render);
$("statusFilter").addEventListener("change",render);
render();
