const categories = [
  {name:"إكسسوارات وديكور", img:"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=600&q=85"},
  {name:"المكاتب", img:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=600&q=85"},
  {name:"وحدات الحمام", img:"https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=85"},
  {name:"وحدات المونتال", img:"https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=600&q=85"},
  {name:"المطابخ ووحدات الخشب", img:"https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=600&q=85"},
  {name:"أبواب وشبابيك", img:"https://images.unsplash.com/photo-1600566753051-f0b89df2dd90?auto=format&fit=crop&w=600&q=85"}
];

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

const PRODUCTS_KEY = "madera_products_v1";
let products = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "null");
if (!Array.isArray(products)) {
  products = DEFAULT_PRODUCTS;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}
products = products.map(p => ({...p, img: p.img || p.image || ""}));


let cart = JSON.parse(localStorage.getItem("madera_cart") || "[]");

const categoryGrid = document.getElementById("categoryGrid");
const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const cartCount = document.getElementById("cartCount");
const cartElement = document.getElementById("cart");
const overlay = document.getElementById("overlay");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");

function money(value){
  return new Intl.NumberFormat("en-US").format(value) + " EGP";
}

function renderCategories(){
  categoryGrid.innerHTML = categories.map(c => `
    <a class="category" href="#products" data-category="${c.name}">
      <img src="${c.img}" alt="${c.name}">
      <b>${c.name}</b>
      <span>→</span>
    </a>
  `).join("");
}

function renderProducts(list = products){
  productsGrid.innerHTML = list.map(p => `
    <article class="product">
      <div class="product-image">
        <img src="${p.img || p.image || ""}" alt="${p.name}" loading="lazy">
        <button class="favorite" data-fav="${p.id}" aria-label="مفضلة">♡</button>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="product-meta">${p.size}</div>
        <div class="product-bottom">
          <strong class="price">${money(p.price)}</strong>
          <button class="add-cart" data-add="${p.id}" aria-label="أضف للسلة">♧</button>
        </div>
      </div>
    </article>
  `).join("");
}

function saveCart(){
  localStorage.setItem("madera_cart", JSON.stringify(cart));
}

function renderCart(){
  cartCount.textContent = cart.length;
  if(!cart.length){
    cartList.innerHTML = `<div class="empty-cart">السلة فارغة حاليًا.<br>اختار المنتجات اللي عجبتك.</div>`;
    cartTotal.textContent = "0 EGP";
    return;
  }

  cartList.innerHTML = cart.map((item,index) => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <p>${money(item.price)}</p>
      </div>
      <button class="cart-remove" data-remove="${index}">×</button>
    </div>
  `).join("");

  cartTotal.textContent = money(cart.reduce((sum,item)=>sum + item.price,0));
}

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),1800);
}

function openCart(){
  cartElement.classList.add("open");
  overlay.classList.add("show");
}
function closeCart(){
  cartElement.classList.remove("open");
  overlay.classList.remove("show");
}

document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  const remove = e.target.closest("[data-remove]");
  const fav = e.target.closest("[data-fav]");

  if(add){
    const product = products.find(p => String(p.id) === String(add.dataset.add));
    if(product){
      cart.push(product);
      saveCart();
      renderCart();
      openCart();
      showToast("تمت إضافة المنتج إلى السلة");
    }
  }

  if(remove){
    cart.splice(Number(remove.dataset.remove),1);
    saveCart();
    renderCart();
  }

  if(fav){
    fav.classList.toggle("liked");
    fav.textContent = fav.classList.contains("liked") ? "♥" : "♡";
  }
});

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

searchInput.addEventListener("input", e => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  );
  renderProducts(filtered);
});

document.getElementById("showAll").addEventListener("click", ()=>{
  searchInput.value = "";
  renderProducts(products);
  document.getElementById("products").scrollIntoView({behavior:"smooth"});
});

document.getElementById("newsletter").addEventListener("submit", e=>{
  e.preventDefault();
  e.target.reset();
  showToast("تم تسجيل بريدك بنجاح");
});

document.getElementById("checkout").addEventListener("click", ()=>{
  if(!cart.length){
    showToast("السلة فارغة");
    return;
  }
  alert("الخطوة التالية: ربط بوابة الدفع الإلكتروني + بيانات العميل + تأكيد الطلب.");
});

renderCategories();
renderProducts();
renderCart();
