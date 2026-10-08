const KEY="madera_products_v1";
let products = JSON.parse(localStorage.getItem(KEY) || "[]");
let selectedImage = "";
let editingId = null;

const $ = id => document.getElementById(id);

function saveData(){
  localStorage.setItem(KEY, JSON.stringify(products));
  localStorage.setItem(KEY+"_updated", new Date().toLocaleString("ar-EG"));
  render();
}

function render(){
  $("totalCount").textContent = products.length;
  $("categoryCount").textContent = new Set(products.map(p=>p.category)).size;
  $("lastUpdate").textContent = localStorage.getItem(KEY+"_updated") || "—";

  const q = $("search").value.trim().toLowerCase();
  const filtered = products.filter(p =>
    (p.name||"").toLowerCase().includes(q) ||
    (p.category||"").toLowerCase().includes(q)
  );

  $("products").innerHTML = filtered.map(p => `
    <article class="card">
      <div class="card-img">${p.image ? `<img src="${p.image}" alt="">` : ""}</div>
      <div class="card-body">
        <h3>${esc(p.name)}</h3>
        <div class="meta">${esc(p.category)} ${p.size ? " • "+esc(p.size) : ""}</div>
        <div class="price">${Number(p.price||0).toLocaleString("ar-EG")} جنيه</div>
        <div class="card-actions">
          <button onclick="editProduct('${p.id}')">✏️ تعديل</button>
          <button class="delete" onclick="deleteProduct('${p.id}')">🗑️ حذف</button>
        </div>
      </div>
    </article>
  `).join("");

  $("empty").classList.toggle("hidden", filtered.length !== 0);
}

function esc(s){
  return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

$("image").addEventListener("change", e=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    selectedImage=reader.result;
    $("preview").src=selectedImage;
    $("previewWrap").classList.remove("hidden");
    $("uploadText").textContent="✅ تم اختيار الصورة";
  };
  reader.readAsDataURL(file);
});

$("productForm").addEventListener("submit", e=>{
  e.preventDefault();
  if(!selectedImage && !editingId){toast("اختار صورة المنتج أولاً");return;}

  const data={
    id: editingId || Date.now().toString(),
    name:$("name").value.trim(),
    price:Number($("price").value),
    category:$("category").value,
    size:$("size").value.trim(),
    description:$("description").value.trim(),
    image:selectedImage || (products.find(p=>p.id===editingId)||{}).image || "",
    createdAt:new Date().toISOString()
  };

  if(editingId){
    const i=products.findIndex(p=>p.id===editingId);
    if(i>=0) products[i]=data;
    toast("تم تعديل المنتج بنجاح");
  }else{
    products.unshift(data);
    toast("تمت إضافة المنتج بنجاح");
  }
  saveData();
  resetForm();
});

function editProduct(id){
  const p=products.find(x=>x.id===id); if(!p)return;
  editingId=id;
  $("editId").value=id;
  $("name").value=p.name||"";
  $("price").value=p.price||"";
  $("category").value=p.category||"";
  $("size").value=p.size||"";
  $("description").value=p.description||"";
  selectedImage=p.image||"";
  if(selectedImage){$("preview").src=selectedImage;$("previewWrap").classList.remove("hidden");}
  $("formTitle").textContent="تعديل المنتج";
  $("saveBtn").textContent="حفظ التعديل";
  $("cancelEdit").classList.remove("hidden");
  scrollToForm();
}

function resetForm(){
  editingId=null;selectedImage="";
  $("productForm").reset();
  $("editId").value="";
  $("previewWrap").classList.add("hidden");
  $("preview").src="";
  $("uploadText").textContent="📷 اضغط لاختيار صورة من اللابتوب";
  $("formTitle").textContent="إضافة منتج جديد";
  $("saveBtn").textContent="حفظ المنتج";
  $("cancelEdit").classList.add("hidden");
}

function removeImage(){
  selectedImage="";
  $("image").value="";
  $("previewWrap").classList.add("hidden");
  $("preview").src="";
  $("uploadText").textContent="📷 اضغط لاختيار صورة من اللابتوب";
}

function deleteProduct(id){
  const p=products.find(x=>x.id===id);
  if(!p || !confirm(`هل تريد حذف "${p.name}"؟`))return;
  products=products.filter(x=>x.id!==id);
  saveData();toast("تم حذف المنتج");
}

function clearAllProducts(){
  if(!products.length)return toast("لا توجد منتجات");
  if(confirm("سيتم حذف كل المنتجات من نسخة التجربة. متأكد؟")){
    products=[];saveData();toast("تم مسح كل المنتجات");
  }
}

function scrollToForm(){
  $("productFormSection").scrollIntoView({behavior:"smooth"});
}

function toast(msg){
  const t=$("toast");t.textContent=msg;t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2200);
}
$("search").addEventListener("input",render);
render();
