import { CONFIG } from './config.js';
import { CATEGORIES, PRODUCTS, COLLECTIONS } from './products.js';

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => new Intl.NumberFormat(CONFIG.locale,{style:'currency',currency:CONFIG.currency,maximumFractionDigits:0}).format(Math.round(n));
const byId = id => PRODUCTS.find(p => p.id === id);
const byCategory = slug => CATEGORIES.find(c => c.slug === slug);
const storage = {
  read(key, fallback){ try { const value=JSON.parse(localStorage.getItem(`mixt:${key}`)); return value ?? fallback; } catch { return fallback; } },
  write(key, value){ try { localStorage.setItem(`mixt:${key}`,JSON.stringify(value)); } catch { toast('Your browser could not save this change.'); } }
};
let modalReturnFocus=null, drawerReturnFocus=null;
const state = {
  cart: storage.read('cart',[]),
  wishlist: storage.read('wishlist',[]),
  recently: storage.read('recently',[]),
  promo: storage.read('promo',null),
  lastOrder: storage.read('lastOrder',null),
  listing: { category:'', query:'', sort:'recommended', maxPrice:25000, ratings:[], subcategories:[], colors:[], sizes:[], onlyStock:false, offset:12 },
  pdp: { id:null, image:0, color:0, size:'', quantity:1 },
  quick: { id:null, color:0, size:'' },
  searchQuery: '',
  searchTarget: null,
  filtersOpen: false,
  menuOpen: false
};
// Validate persisted demo state before using it in commerce calculations.
state.cart = Array.isArray(state.cart) ? state.cart.filter(l=>l && byId(l.id) && Number.isInteger(l.qty) && l.qty>0).map(l=>{const p=byId(l.id),size=typeof l.size==='string'?l.size:null,max=size&&p.sizeStock?.[size]!==undefined?p.sizeStock[size]:p.stock;return {id:l.id,qty:Math.min(l.qty,max),color:typeof l.color==='string'?l.color:null,size};}).filter(l=>l.qty>0) : [];
state.wishlist = Array.isArray(state.wishlist) ? [...new Set(state.wishlist.filter(id=>Boolean(byId(id))))] : [];
state.recently = Array.isArray(state.recently) ? state.recently.filter(id=>Boolean(byId(id))).slice(0,8) : [];

function persist(){
  storage.write('cart',state.cart); storage.write('wishlist',state.wishlist);
  storage.write('recently',state.recently.slice(0,8)); storage.write('promo',state.promo);
  updateCounts();
}
function toast(message){
  const stack=$('#toast-stack'); if(!stack) return;
  const item=document.createElement('div'); item.className='toast'; item.textContent=message; stack.append(item);
  setTimeout(()=>item.remove(),2600);
}
function updateCounts(){
  $('#cart-count').textContent=state.cart.reduce((n,i)=>n+i.qty,0)||'';
  $('#wishlist-count').textContent=state.wishlist.length||'';
}
function currentRoute(){
  const raw=location.hash.slice(1)||'home';
  if(raw.startsWith('category/')) return {name:'category',slug:raw.split('/')[1]};
  if(raw.startsWith('product/')) return {name:'product',id:raw.split('/')[1]};
  if(raw.startsWith('search/')) return {name:'search',query:decodeURIComponent(raw.slice(7))};
  if(raw==='shop-new') return {name:'new'};
  if(raw==='shop') return {name:'shop'};
  if(raw==='wishlist'||raw==='checkout'||raw==='success'||raw==='about'||raw==='contact'||raw==='shipping') return {name:raw};
  if(raw.startsWith('edit/')) return {name:'edit',slug:raw.split('/')[1]};
  return {name:'home'};
}
function setRoute(route){ location.hash=route; }
function closeOverlays(){
  $('#cart-drawer').classList.remove('open'); $('#cart-drawer').setAttribute('aria-hidden','true');
  $('#modal-shell').classList.remove('open'); $('#modal-shell').setAttribute('aria-hidden','true');
  $('#mobile-nav').classList.remove('open'); $('#mobile-nav').setAttribute('aria-hidden','true');
  $('#page-shade').classList.remove('open'); document.body.classList.remove('locked');
  state.menuOpen=false;
}
function openDrawer(){
  if(!$('#cart-drawer').classList.contains('open'))drawerReturnFocus=document.activeElement;
  $('#cart-drawer').innerHTML=renderCartDrawer();
  $('#cart-drawer').classList.add('open'); $('#cart-drawer').setAttribute('aria-hidden','false');
  $('#page-shade').classList.add('open'); document.body.classList.add('locked');setTimeout(()=>$('#cart-drawer .drawer-close')?.focus(),50);
}
function closeDrawer(){ $('#cart-drawer').classList.remove('open'); $('#cart-drawer').setAttribute('aria-hidden','true'); $('#page-shade').classList.remove('open'); document.body.classList.remove('locked'); const target=drawerReturnFocus;drawerReturnFocus=null;if(target?.isConnected)setTimeout(()=>target.focus(),30); }
function openModal(html, label='MIXT dialog'){
  if(!$('#modal-shell').classList.contains('open'))modalReturnFocus=document.activeElement;
  $('#modal-panel').innerHTML=`<button class="modal-close" data-action="modal-close" aria-label="Close dialog">×</button>${html}`;
  $('#modal-panel').setAttribute('aria-label',label);
  $('#modal-shell').classList.add('open'); $('#modal-shell').setAttribute('aria-hidden','false');
  document.body.classList.add('locked');
  setTimeout(()=>$('#modal-panel input, #modal-panel button')?.focus(),60);
}
function closeModal(){ $('#modal-shell').classList.remove('open'); $('#modal-shell').setAttribute('aria-hidden','true'); document.body.classList.remove('locked'); const target=modalReturnFocus;modalReturnFocus=null;if(target?.isConnected)setTimeout(()=>target.focus(),30); }
function footer(){return `
<footer class="site-footer"><div class="wrap"><div class="footer-main">
 <div class="footer-brand"><a class="wordmark" href="#home">MIXT<span class="wordmark-star">✦</span></a><p>${esc(CONFIG.tagline)}</p><div class="socials"><a href="#contact" aria-label="Instagram">ig</a><a href="#contact" aria-label="Pinterest">p</a><a href="#contact" aria-label="Facebook">f</a></div></div>
 <div class="footer-col"><h4>Discover</h4><a href="#shop-new">New arrivals</a><a href="#shop">All products</a><a href="#edit/weekend">The Weekend Edit</a><a href="#edit/gifting">The Art of Gifting</a><a href="#about">Our story</a></div>
 <div class="footer-col"><h4>Departments</h4>${CATEGORIES.map(c=>`<a href="#category/${c.slug}">${esc(c.title)}</a>`).join('')}</div>
 <div class="footer-col"><h4>Customer care</h4><a href="#contact">Contact us</a><a href="#shipping">Shipping & returns</a><a href="#shipping">Frequently asked questions</a><a href="#shipping">Privacy & terms</a><a href="mailto:${esc(CONFIG.contactEmail)}">${esc(CONFIG.contactEmail)}</a></div>
 </div><div class="footer-bottom"><span>© ${new Date().getFullYear()} MIXT. All prices in INR.</span><span class="demo-note">DEMO STORE — NO REAL PAYMENTS OR ORDERS ARE PROCESSED.</span><span>Designed as a static storefront experience.</span></div></div></footer>`;}

function productCard(p){
 const wished=state.wishlist.includes(p.id); const off=p.originalPrice?Math.round((1-p.price/p.originalPrice)*100):0;
 const colors=p.colors.slice(0,4).map((c,i)=>`<i class="swatch" style="background:${colorHex(c)}" title="${esc(c)}"></i>`).join('');
 return `<article class="product-card" data-product="${p.id}">
  <div class="product-media"><a href="#product/${p.id}" aria-label="View ${esc(p.name)}"><img src="${esc(p.images[0])}" alt="${esc(p.imageAlt)}" loading="lazy"><img class="alt-image" src="${esc(p.images[1])}" alt="" loading="lazy"></a>
  ${p.badge?`<span class="tag-label product-badge ${p.badge==='BESTSELLER'?'dark':''}">${esc(p.badge)}</span>`:''}
  <button class="product-wish ${wished?'active':''}" data-action="wish" data-id="${p.id}" aria-label="${wished?'Remove from':'Add to'} wishlist" aria-pressed="${wished}"><svg viewBox="0 0 24 24"><path d="M20.7 8.7c0 5.3-8.7 11-8.7 11s-8.7-5.7-8.7-11a4.7 4.7 0 0 1 8.7-2.2 4.7 4.7 0 0 1 8.7 2.2Z"/></svg></button>
  <div class="quick-actions"><button data-action="quick-view" data-id="${p.id}">Quick view</button><button data-action="quick-add" data-id="${p.id}">Quick add</button></div>
  </div>
  <button class="mobile-quick" data-action="quick-add" data-id="${p.id}">Quick add to bag +</button>
  <div class="product-info"><div class="product-category">${esc(p.category)} · ${esc(p.subcategory)}</div><div class="product-title-line"><a class="product-title" href="#product/${p.id}">${esc(p.name)}</a><span class="product-price">${money(p.price)}</span></div>
  <div class="product-meta"><div><span class="stars">★★★★★</span><span class="rating-count">${p.rating.toFixed(1)} · sample</span></div><div class="swatches">${colors}</div></div>
  ${off?`<div class="product-category" style="margin-top:5px;color:var(--burgundy)">${off}% below reference price</div>`:''}</div>
 </article>`;
}
function colorHex(name){
 const map={Oat:'#d8c9ad',Olive:'#747a53',Ink:'#292d32',Cognac:'#985c36',Black:'#252321',Ivory:'#efe9db',Forest:'#244b3b',Burgundy:'#692b3b',Stone:'#b7aa96',Charcoal:'#4c4a46',White:'#f4f1e9',Sky:'#9ab4c8',Camel:'#a77d4e',Chocolate:'#513326',Graphite:'#4a4a4d',Terracotta:'#b96542',Sand:'#d4c4a7',Cream:'#e8ddc9',Silver:'#b9babc',Midnight:'#252b3d',Brass:'#b39455','Antique Brass':'#ad8950',Walnut:'#69472e',Gold:'#b39455',Rose:'#c58b8b',Clear:'#e5e2d8',Original:'#d9c9a9',Citrus:'#c0a64f',Unscented:'#e4dfd2',Multi:'#9b9c83','Ivory/Forest':'#d7dbc9','Ink/Coral':'#3b3e45',Rust:'#9c593e',Lilac:'#bca8ff','Tortoise':'#75513b','Gold/Black':'#a58c54','Silver/Blue':'#74879c','Burgundy/Olive':'#6a3948','Walnut/Brass':'#76543a'};
 return map[name]||'#aaa08f';
}
function sectionHeader(eyebrow,title,link='#shop',linkText='VIEW ALL'){return `<div class="section-head"><div><span class="eyebrow">${eyebrow}</span><h2>${title}</h2></div><a class="section-link" href="${link}">${linkText}<span>↗</span></a></div>`;}
function homePage(){
 const fresh=PRODUCTS.filter(p=>p.isNew).slice(0,8);
 const best=PRODUCTS.filter(p=>p.isBestSeller).slice(0,12);
 const featured=PRODUCTS.filter(p=>p.isFeatured).slice(0,8);
 return `
 <section class="hero"><div class="hero-photo"></div><div class="hero-content"><div class="hero-kicker">THE MIXT EDIT&nbsp; / &nbsp;VOL. 01</div><h1>THE ART OF<br>FINDING<br><em>SOMETHING</em><br>EXTRAORDINARY.</h1><p class="hero-copy">An inspired collection of fashion, design, technology and everything worth discovering.</p><div class="hero-actions"><a class="btn light" href="#shop">EXPLORE THE COLLECTION <span>→</span></a><a class="btn outline" href="#edit/weekend">DISCOVER THE EDIT</a></div><div class="hero-meta"><b></b> AUTUMN / WINTER — THE DISCOVERY ISSUE</div></div><div class="hero-volume"><span>VOL. 01</span>THE MIXT<br>COLLECTION</div></section>
 <section class="departments"><div class="wrap"><div class="dept-intro"><div><span class="eyebrow">SHOP BY DEPARTMENT</span><h2>A WORLD OF<br>POSSIBILITIES.</h2></div><p>Discover exceptional finds across the things you love. From everyday essentials to objects worth keeping.</p></div><div class="dept-grid">${CATEGORIES.map((c,i)=>`<a class="dept-card dept-${c.slug}" href="#category/${c.slug}"><img src="${c.image}" alt="${esc(c.title)} collection" loading="lazy"><div class="dept-copy"><span class="eyebrow light">${esc(c.eyebrow)}</span><h3>${esc(c.title)}</h3><p>${esc(c.description.split('. ')[0])}.</p><span>EXPLORE DEPARTMENT ↗</span></div></a>`).join('')}</div></div></section>
 <section class="products-section dark"><div class="wrap">${sectionHeader('NEW ARRIVALS','FRESH FROM THE EDIT.','#shop-new','VIEW ALL ARRIVALS')}<div class="product-grid">${fresh.map(productCard).join('')}</div></div></section>
 <section class="editorial-split"><div class="editorial-image"><img src="assets/images/campaigns/objects-of-desire.webp" alt="A thoughtful arrangement of fashion and lifestyle objects" loading="lazy"></div><div class="editorial-copy"><span class="eyebrow">THE OBJECTS ISSUE</span><h2>Objects<br>of desire.</h2><p>Thoughtful details. Remarkable design. Pieces that make everyday life a little more beautiful.</p><a class="btn light" href="#category/home">EXPLORE HOME & LIVING ↗</a></div></section>
 <section class="products-section"><div class="wrap">${sectionHeader('THE MOST LOVED','GOOD THINGS, WELL CHOSEN.','#shop','SHOP BESTSELLERS')}<div class="products-rail" id="best-rail">${best.map(productCard).join('')}</div><div class="rail-controls" style="justify-content:flex-end;margin-top:15px"><button data-action="rail" data-dir="-1" data-target="best-rail" aria-label="Previous products">‹</button><button data-action="rail" data-dir="1" data-target="best-rail" aria-label="Next products">›</button></div></div></section>
 <section class="products-section" style="background:var(--ivory)"><div class="wrap">${sectionHeader('THE EDITORIAL SELECTION','DISCOVER THE MIXT EDIT.','#shop','EXPLORE EVERYTHING')}<div class="edit-grid">${COLLECTIONS.map((c,i)=>`<article class="edit-card"><img src="${c.image}" alt="${esc(c.title)}" loading="lazy"><div><span class="eyebrow light">${esc(c.eyebrow)}</span><h3>${esc(c.title)}</h3><p>${esc(c.description)}</p><a href="#edit/${c.slug}">EXPLORE THE EDIT ↗</a></div></article>`).join('')}</div></div></section>
 <section class="story-band"><div class="story-copy"><span class="eyebrow">A NOTE FROM MIXT</span><h2>Good taste is in the details.</h2><p>We believe great finds deserve a thoughtful destination. From useful everyday objects to remarkable design pieces, MIXT brings together products worth discovering and experiences worth returning to.</p><a class="text-arrow" href="#about">A LITTLE ABOUT US <span>↗</span></a></div><div class="story-photo"><img src="assets/images/hero/mixt-hero.webp" alt="The MIXT edit — a considered collection of objects" loading="lazy"></div></section>
 <section class="service-strip"><div class="wrap service-grid"><div class="service"><span class="service-icon">✧</span><div><strong>Considered selection</strong><small>A thoughtful mix of everyday finds</small></div></div><div class="service"><span class="service-icon">⌁</span><div><strong>Easy discovery</strong><small>Curated edits, made to explore</small></div></div><div class="service"><span class="service-icon">◇</span><div><strong>Clear pricing</strong><small>Prices displayed in INR</small></div></div><div class="service"><span class="service-icon">♡</span><div><strong>Made for browsing</strong><small>A static storefront demonstration</small></div></div></div></section>
 <section class="newsletter"><div class="wrap newsletter-inner"><div><span class="eyebrow light">A GOOD NOTE, NOW AND THEN</span><h2>GOOD THINGS,<br>STRAIGHT TO YOUR INBOX.</h2><p>Discover new arrivals, curious finds and the latest MIXT edit.</p></div><form class="newsletter-form" id="newsletter-form"><input type="email" name="email" placeholder="Your email address" aria-label="Your email address" required><button type="submit">SIGN ME UP ↗</button></form></div><div class="wrap newsletter-message" id="newsletter-message" aria-live="polite"></div></section>
 ${footer()}`;
}
function listingProducts(){
 let list=PRODUCTS.filter(p=>{
  const l=state.listing; if(l.category && p.categorySlug!==l.category) return false;
  if(l.query && !(p.name+' '+p.category+' '+p.subcategory+' '+p.keywords+' '+p.brand).toLowerCase().includes(l.query.toLowerCase())) return false;
  if(p.price>l.maxPrice) return false;
  if(l.subcategories.length && !l.subcategories.includes(p.subcategory)) return false;
  if(l.colors.length && !p.colors.some(c=>l.colors.includes(c))) return false;
  if(l.sizes.length && !p.sizes.some(s=>l.sizes.includes(s))) return false;
  if(l.ratings.length && !l.ratings.some(r=>p.rating>=Number(r))) return false;
  if(l.onlyStock && p.stock<=0) return false;
  return true;
 });
 const sort=state.listing.sort;
 if(sort==='price-low') list.sort((a,b)=>a.price-b.price);
 else if(sort==='price-high') list.sort((a,b)=>b.price-a.price);
 else if(sort==='rating') list.sort((a,b)=>b.rating-a.rating);
 else if(sort==='popular') list.sort((a,b)=>Number(b.isBestSeller)-Number(a.isBestSeller)||b.reviewCount-a.reviewCount);
 else if(sort==='new') list.sort((a,b)=>Number(b.isNew)-Number(a.isNew));
 return list;
}
function listingPage(route){
 const category=route.name==='category'?byCategory(route.slug):null;
 state.listing.category=category?.slug||'';
 state.listing.query=route.name==='search'?route.query||'':route.name==='new'?'':state.listing.query;
 const products=listingProducts(); const visible=products.slice(0,state.listing.offset);
 const title=category?.title||(route.name==='new'?'New Arrivals':route.name==='search'?`Search: “${route.query}”`:'Discover all');
 const intro=category?.description||(route.name==='new'?'The latest pieces to make their way into the MIXT collection.':route.name==='search'?'A few good things we found for your search.':'A considered collection across the things you love.');
 const hero=category?`<div class="listing-hero"><img src="${category.image}" alt="${esc(category.title)} collection"><h2>${esc(category.title)}</h2></div>`:'';
 return `<div class="wrap"><div class="page-intro"><div class="breadcrumbs"><a href="#home">HOME</a> &nbsp; / &nbsp; ${category?esc(category.title.toUpperCase()):esc(title.toUpperCase())}</div><span class="eyebrow">${category?esc(category.eyebrow):'THE MIXT COLLECTION'}</span><h1>${esc(title)}</h1><p>${esc(intro)}</p></div>${hero}<div class="shop-layout"><aside class="filter-panel" id="desktop-filters">${filterMarkup(category,'-desktop')}</aside><div class="listing-main"><div class="listing-toolbar"><span class="result-count">${products.length} pieces to discover</span><div class="toolbar-right"><button class="mobile-filter" data-action="filter-open">☷ FILTERS</button><label class="sr-only" for="sort-select">Sort products</label><select class="sort-select" id="sort-select"><option value="recommended">Recommended</option><option value="new">Newest</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="popular">Popularity</option><option value="rating">Customer Rating</option></select></div></div><div class="active-filters" id="active-filters"></div><div class="product-grid" id="listing-grid">${visible.length?visible.map(productCard).join(''):`<div class="empty-state" style="grid-column:1/-1"><h3>No pieces found.</h3><p>Try a wider price range or clear a filter.</p><button class="btn" data-action="clear-filters">CLEAR FILTERS</button></div>`}</div>${products.length>visible.length?`<div class="load-more"><button class="btn outline" data-action="load-more">LOAD MORE PIECES</button></div>`:''}</div></div></div><div class="mobile-filter-shade" id="filter-shade"></div><div class="mobile-filter-panel" id="mobile-filter-panel">${filterMarkup(category,'-mobile')}<button class="btn" style="width:100%;margin-top:15px" data-action="filter-close">SHOW ${products.length} PIECES</button></div>${footer()}`;
}
function filterMarkup(category,suffix=''){
 const set=category?PRODUCTS.filter(p=>p.categorySlug===category.slug):PRODUCTS;
 const subs=[...new Set(set.map(p=>p.subcategory))].sort();
 const colors=[...new Set(set.flatMap(p=>p.colors))].slice(0,12);
 const sizes=[...new Set(set.flatMap(p=>p.sizes))].sort((a,b)=>{const order=['XS','S','M','L','XL','6','7','8','9','10'];return order.indexOf(a)-order.indexOf(b);});
 return `<div class="filter-title">Refine the edit <button class="clear-btn" data-action="clear-filters">CLEAR</button></div>
 <div class="filter-group"><h4>Department</h4>${(category?[category]:CATEGORIES).map(c=>`<label class="filter-option"><input type="checkbox" data-filter-category="${c.slug}" ${state.listing.category===c.slug?'checked':''}> ${esc(c.title)}</label>`).join('')}</div>
 ${subs.length>1?`<div class="filter-group"><h4>Shop by type</h4>${subs.map(v=>`<label class="filter-option"><input type="checkbox" data-filter-sub="${esc(v)}" ${state.listing.subcategories.includes(v)?'checked':''}> ${esc(v)}</label>`).join('')}</div>`:''}
 ${colors.length?`<div class="filter-group"><h4>Colour / finish</h4>${colors.map(v=>`<label class="filter-option"><input type="checkbox" data-filter-color="${esc(v)}" ${state.listing.colors.includes(v)?'checked':''}> ${esc(v)}</label>`).join('')}</div>`:''}
 ${sizes.length?`<div class="filter-group"><h4>Size</h4>${sizes.map(v=>`<label class="filter-option"><input type="checkbox" data-filter-size="${esc(v)}" ${state.listing.sizes.includes(v)?'checked':''}> ${esc(v)}</label>`).join('')}</div>`:''}
 <div class="filter-group"><h4>Price range</h4><div class="filter-option" style="justify-content:space-between"><span>Up to</span><strong id="filter-price-value${suffix}" data-filter-price-value>${money(state.listing.maxPrice)}</strong></div><input class="price-range" id="price-range${suffix}" data-filter-price type="range" min="500" max="25000" step="500" value="${state.listing.maxPrice}" aria-label="Maximum price"></div>
 <div class="filter-group"><h4>Customer rating</h4>${['4.5','4','3.5'].map(r=>`<label class="filter-option"><input type="checkbox" data-filter-rating="${r}" ${state.listing.ratings.includes(r)?'checked':''}> ${r}+ stars</label>`).join('')}</div>
 <div class="filter-group"><h4>Availability</h4><label class="filter-option"><input type="checkbox" data-filter-stock ${state.listing.onlyStock?'checked':''}> In stock only</label></div>
 <div class="filter-actions"><small style="color:var(--muted)">Demo inventory</small><button class="clear-btn" data-action="clear-filters">RESET ALL</button></div>`;
}
function updateListingGrid(){
 const products=listingProducts();const visible=products.slice(0,state.listing.offset);
 const grid=$('#listing-grid'); if(!grid)return;
 grid.innerHTML=visible.length?visible.map(productCard).join(''):`<div class="empty-state" style="grid-column:1/-1"><h3>No pieces found.</h3><p>Try a wider price range or clear a filter.</p><button class="btn" data-action="clear-filters">CLEAR FILTERS</button></div>`;
 $('.result-count').textContent=`${products.length} pieces to discover`;
 const load=$('.load-more'); if(load)load.remove(); if(products.length>visible.length){grid.insertAdjacentHTML('afterend',`<div class="load-more"><button class="btn outline" data-action="load-more">LOAD MORE PIECES</button></div>`);}
 const active=[];
 if(state.listing.category)active.push({label:byCategory(state.listing.category)?.title,key:'category'});
 if(state.listing.maxPrice<25000)active.push({label:`Under ${money(state.listing.maxPrice)}`,key:'price'});
 state.listing.subcategories.forEach(v=>active.push({label:v,key:`sub:${v}`}));
 state.listing.colors.forEach(v=>active.push({label:v,key:`color:${v}`}));
 state.listing.sizes.forEach(v=>active.push({label:`Size ${v}`,key:`size:${v}`}));
 state.listing.ratings.forEach(r=>active.push({label:`${r}+ stars`,key:`rating:${r}`}));
 if(state.listing.onlyStock)active.push({label:'In stock',key:'stock'});
 $('#active-filters').innerHTML=active.map(f=>`<button class="filter-chip" data-action="remove-filter" data-key="${f.key}">${esc(f.label)} <span>×</span></button>`).join('');
 const sort=$('#sort-select');if(sort)sort.value=state.listing.sort;
}
function productPage(p){
 state.pdp={id:p.id,image:0,color:0,size:'',quantity:1};
 state.recently=[p.id,...state.recently.filter(x=>x!==p.id)].slice(0,8);storage.write('recently',state.recently);
 const related=PRODUCTS.filter(x=>x.id!==p.id&&(x.categorySlug===p.categorySlug||x.isFeatured)).slice(0,4);
 return `<div class="wrap pdp"><div class="breadcrumbs"><a href="#home">HOME</a> &nbsp; / &nbsp; <a href="#category/${p.categorySlug}">${esc(p.category.toUpperCase())}</a> &nbsp; / &nbsp; ${esc(p.name.toUpperCase())}</div><div class="pdp-grid"><div class="pdp-gallery"><div class="pdp-thumbs">${p.images.map((im,i)=>`<button data-action="pdp-image" data-index="${i}" class="${i===0?'active':''}" aria-label="View image ${i+1}"><img src="${im}" alt=""></button>`).join('')}</div><div class="pdp-main-image"><img id="pdp-main-img" src="${p.images[0]}" alt="${esc(p.imageAlt)}"></div></div><div class="pdp-info"><span class="eyebrow">${esc(p.category)} / ${esc(p.subcategory)}</span><h1>${esc(p.name)}</h1><div class="pdp-rating"><span class="stars">★★★★★</span> &nbsp; ${p.rating.toFixed(1)} / 5 &nbsp; <span>(${p.reviewCount} illustrative reviews)</span></div><div class="pdp-price">${money(p.price)} ${p.originalPrice?`<span class="price-old">${money(p.originalPrice)}</span>`:''}</div><p class="pdp-description">${esc(p.description)}</p>
 ${p.colors.length?`<div class="option-block"><div class="option-heading"><span>Colour / finish</span><small id="selected-color">${esc(p.colors[0])}</small></div><div class="variant-row pdp-colors">${p.colors.map((c,i)=>`<button class="variant-btn ${i===0?'selected':''}" data-action="pdp-color" data-index="${i}"><i class="color-dot" style="--dot:${colorHex(c)}"></i>${esc(c)}</button>`).join('')}</div></div>`:''}
 ${p.sizes.length?`<div class="option-block"><div class="option-heading"><span>Choose size</span><button class="clear-btn" data-action="size-guide">SIZE GUIDE</button></div><div class="variant-row">${p.sizes.map(s=>`<button class="variant-btn" data-action="pdp-size" data-size="${s}" ${p.sizeStock[s]===0?'disabled':''}>${esc(s)}</button>`).join('')}</div><div class="stock-note" id="pdp-stock-note">Select an option to check availability. Demo inventory only.</div></div>`:`<div class="option-block"><div class="option-heading"><span>Availability</span><small>In stock · demo inventory</small></div></div>`}
 <div class="purchase-row"><div class="quantity-control"><button data-action="pdp-qty" data-dir="-1" aria-label="Decrease quantity">−</button><span id="pdp-qty">1</span><button data-action="pdp-qty" data-dir="1" aria-label="Increase quantity">+</button></div><button class="btn" data-action="pdp-add" data-id="${p.id}">ADD TO BAG ↗</button><button class="pdp-wish ${state.wishlist.includes(p.id)?'active':''}" data-action="wish" data-id="${p.id}" aria-label="Add to wishlist"><svg viewBox="0 0 24 24"><path d="M20.7 8.7c0 5.3-8.7 11-8.7 11s-8.7-5.7-8.7-11a4.7 4.7 0 0 1 8.7-2.2 4.7 4.7 0 0 1 8.7 2.2Z"/></svg></button></div>
 <p style="font-size:10px;color:var(--muted)">Complimentary delivery on orders above ${money(CONFIG.shippingThreshold)}. This is a demonstration storefront; inventory and fulfilment are simulated.</p>
 <div class="pdp-accordions"><details open><summary>THE DETAILS</summary><p>${esc(p.description)}<br><br>Category: ${esc(p.category)} · ${esc(p.subcategory)}<br>Reference: ${esc(p.id.toUpperCase())}</p></details><details><summary>MATERIAL & SPECIFICATIONS</summary><p>${esc(p.material)}. Product specifications shown here are illustrative and should be replaced with supplier-verified information for a live store.</p></details><details><summary>DELIVERY & RETURNS</summary><p>Standard demo delivery is shown as ₹149 below the free-shipping threshold. A 7-day demonstration return window is displayed for showcase purposes. No parcel or real order is created.</p></details></div></div></div>
 <section class="products-section" style="padding:55px 0 0">${sectionHeader('A LITTLE MORE TO LOVE','YOU MAY ALSO LIKE.','#shop','DISCOVER MORE')}<div class="product-grid">${related.map(productCard).join('')}</div></section></div><div class="pdp-mobile-buy"><strong>${money(p.price)}</strong><button class="btn" data-action="pdp-add" data-id="${p.id}">ADD TO BAG ↗</button></div>${footer()}`;
}
function wishPage(){
 const products=state.wishlist.map(byId).filter(Boolean);
 return `<div class="wrap"><div class="page-intro"><span class="eyebrow">YOUR PRIVATE EDIT</span><h1>Saved for<br>later.</h1><p>A collection of pieces you have your eye on.</p></div>${products.length?`<div class="product-grid" style="padding-bottom:85px">${products.map(productCard).join('')}</div>`:`<div class="empty-state" style="margin:20px 0 90px"><h3>Your edit is waiting.</h3><p>Save a few good things and they'll be right here.</p><a class="btn" href="#shop">DISCOVER THE COLLECTION</a></div>`}</div>${footer()}`;
}
function editPage(slug){
 const edit=COLLECTIONS.find(c=>c.slug===slug)||COLLECTIONS[0];
 const list=PRODUCTS.filter(p=>edit.categories.includes(p.categorySlug));
 return `<div class="wrap"><div class="page-intro"><div class="breadcrumbs"><a href="#home">HOME</a> &nbsp; / &nbsp; THE EDIT</div><span class="eyebrow">${esc(edit.eyebrow)}</span><h1>${esc(edit.title)}</h1><p>${esc(edit.description)}</p></div><div class="listing-hero"><img src="${edit.image}" alt="${esc(edit.title)}"><h2>${esc(edit.title)}</h2></div><div class="product-grid" style="padding-bottom:80px">${list.map(productCard).join('')}</div></div>${footer()}`;
}
function aboutPage(){return `<section class="content-page"><div class="wrap content-box"><span class="eyebrow">A NOTE FROM MIXT</span><h1>A considered<br>collection of<br>extraordinary things.</h1><p>MIXT is a curated destination for the objects, essentials and everyday discoveries that make life more interesting. We bring fashion, technology, home, beauty, sport and lifestyle together in one thoughtful edit.</p><p>We believe browsing should be an experience in itself: a little unexpected, always considered and full of things worth discovering.</p><a class="btn" href="#shop">EXPLORE THE COLLECTION ↗</a></div></section>${footer()}`;}
function contactPage(){return `<section class="content-page"><div class="wrap"><span class="eyebrow">WE WOULD LOVE TO HEAR FROM YOU</span><h1>Let's talk.</h1><p>Questions about a piece, an edit or the MIXT experience? This demonstration contact page is ready to be connected to a real customer-support channel.</p><div class="content-box"><p><strong>Email</strong><br>${esc(CONFIG.contactEmail)} <small>(placeholder address)</small></p><p><strong>Customer care</strong><br>Monday–Saturday · 10:00–18:00 IST (illustrative hours)</p><a class="btn" href="mailto:${esc(CONFIG.contactEmail)}">WRITE TO MIXT ↗</a></div></div></section>${footer()}`;}
function shippingPage(){return `<section class="content-page"><div class="wrap content-box"><span class="eyebrow">THE PRACTICAL DETAILS</span><h1>Good to know.</h1><p>Complimentary demonstration shipping is shown for orders of ₹2,999 and above. Orders below the threshold show a standard ₹149 delivery charge.</p><p>A 7-day returns window is included as sample storefront content. No products are dispatched and no real return requests can be submitted from this static demo.</p><p>Prices are displayed in INR and labelled as inclusive of GST for the demonstration. Product ratings, stock and customer review counts are illustrative sample data.</p><p><strong>Payments:</strong> The checkout is simulated. No payment gateway, order processing service or customer database is connected.</p><a class="btn" href="#shop">CONTINUE BROWSING ↗</a></div></section>${footer()}`;}
function checkoutSummary(){const subtotal=cartSubtotal(),discount=discountAmount(),shipping=shippingAmount(),total=Math.max(0,subtotal-discount+shipping);return {subtotal,discount,shipping,total};}
function renderCheckout(){
 if(!state.cart.length)return `<div class="wrap empty-state" style="margin:70px auto"><h3>Your bag is empty.</h3><p>Find something extraordinary first.</p><a href="#shop" class="btn">EXPLORE MIXT ↗</a></div>${footer()}`;
 const totals=checkoutSummary();
 return `<div class="wrap checkout-page"><div class="breadcrumbs"><a href="#home">HOME</a> &nbsp; / &nbsp; CHECKOUT</div><span class="eyebrow">A FEW DETAILS, THEN YOU'RE DONE</span><h1>Make it yours.</h1><div class="checkout-grid"><form id="checkout-form"><section class="checkout-section"><h3>01 / Contact details</h3><div class="checkout-form-grid"><div class="field"><label for="first-name">First name</label><input id="first-name" name="firstName" autocomplete="given-name" required></div><div class="field"><label for="last-name">Last name</label><input id="last-name" name="lastName" autocomplete="family-name" required></div><div class="field full"><label for="email">Email address</label><input id="email" name="email" type="email" autocomplete="email" required></div><div class="field full"><label for="phone">Mobile number</label><input id="phone" name="phone" type="tel" inputmode="numeric" pattern="[6-9][0-9]{9}" maxlength="10" placeholder="10-digit Indian mobile number" required></div></div></section><section class="checkout-section"><h3>02 / Delivery address</h3><div class="checkout-form-grid"><div class="field full"><label for="address">Address</label><input id="address" name="address" autocomplete="street-address" required></div><div class="field"><label for="city">City</label><input id="city" name="city" required></div><div class="field"><label for="state">State</label><input id="state" name="state" required></div><div class="field"><label for="pincode">PIN code</label><input id="pincode" name="pincode" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required></div><div class="field"><label for="country">Country</label><input id="country" name="country" value="India" readonly></div></div></section><section class="checkout-section"><h3>03 / Payment preference</h3><label class="payment-option"><input type="radio" name="payment" value="upi-demo" checked> UPI · demonstration only</label><label class="payment-option"><input type="radio" name="payment" value="card-demo"> Card · no card details requested</label><label class="payment-option"><input type="radio" name="payment" value="cod-demo"> Cash on delivery · demonstration only</label><div class="demo-payment-note">DEMO CHECKOUT — no payment will be taken, no payment details are collected, and no order is transmitted to a retailer.</div></section><label class="filter-option" style="margin:18px 0"><input type="checkbox" id="terms-check" required> I understand this is a simulated checkout.</label><button class="btn" style="width:100%" type="submit">PLACE DEMO ORDER ↗</button></form><aside class="order-summary"><h3>Your selection</h3>${state.cart.map(line=>{const p=byId(line.id);return `<div class="order-summary-line"><span>${esc(p.name)} × ${line.qty}<br><small>${esc(line.color||'Standard')}${line.size?' · '+esc(line.size):''}</small></span><strong>${money(p.price*line.qty)}</strong></div>`;}).join('')}<div class="summary-row" style="margin-top:14px"><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></div><div class="summary-row"><span>Promotion</span><strong>${totals.discount?`− ${money(totals.discount)}`:'—'}</strong></div><div class="summary-row"><span>Delivery</span><strong>${totals.shipping?money(totals.shipping):'Complimentary'}</strong></div><div class="summary-row total"><span>Total</span><strong>${money(totals.total)}</strong></div><small style="display:block;color:var(--muted);margin-top:13px">Prices include GST for demonstration purposes.</small></aside></div></div>${footer()}`;
}
function successPage(){
 const order=state.lastOrder||storage.read('lastOrder',null);
 return `<div class="wrap success-page"><div class="success-mark">✓</div><span class="eyebrow">THE MIXT EXPERIENCE</span><h1>Consider it<br>discovered.</h1><p>This is a demonstration order only. No payment was made and no parcel will be sent.</p><p><strong>Reference: ${esc(order?.number||'MIXT-DEMO')}</strong><br>Illustrative total: ${money(order?.total||0)}</p><a class="btn" href="#home">BACK TO DISCOVERING ↗</a></div>${footer()}`;
}
function cartSubtotal(){return state.cart.reduce((sum,line)=>{const p=byId(line.id);return sum+(p?p.price*line.qty:0);},0);}
function discountAmount(){if(!state.promo)return 0;const subtotal=cartSubtotal(),rule=CONFIG.promotions[state.promo.code];if(!rule||subtotal<rule.minSubtotal)return 0;const amount=Math.round(subtotal*rule.percent/100);return rule.maxDiscount?Math.min(rule.maxDiscount,amount):amount;}
function shippingAmount(){return cartSubtotal()>=CONFIG.shippingThreshold?0:CONFIG.standardShipping;}
function availableStock(p,line){return line.size&&p.sizeStock?.[line.size]!==undefined?p.sizeStock[line.size]:p.stock;}
function addToCart(p,{color=null,size=null,qty=1}={}){
 if(p.sizes.length&&!size){toast('Choose a size before adding to bag.');return false;}
 const probe={size};const max=availableStock(p,probe);if(max<=0){toast('That option is currently unavailable.');return false;}
 const key=line=>line.id===p.id&&(line.color||'')===(color||'')&&(line.size||'')===(size||'');
 const line=state.cart.find(key);const current=line?.qty||0;
 if(current+qty>max){toast(`Only ${max} available in this demo selection.`);return false;}
 if(line)line.qty+=qty;else state.cart.push({id:p.id,color,size,qty});
 persist();toast(`${p.name} added to your bag.`);return true;
}
function changeCartQty(index,delta){const line=state.cart[index];if(!line)return;const p=byId(line.id);const next=line.qty+delta;const max=availableStock(p,line);if(next<1){state.cart.splice(index,1);}else if(next>max){toast(`Only ${max} available in this demo selection.`);return;}else line.qty=next;persist();$('#cart-drawer').innerHTML=renderCartDrawer();}
function renderCartDrawer(){
 if(!state.cart.length)return `<div class="drawer-head"><h2>Your bag</h2><button class="drawer-close" data-action="cart-close" aria-label="Close bag">×</button></div><div class="drawer-body empty-cart"><div style="font:48px var(--serif);color:var(--gold)">♡</div><h3>Nothing in the bag.</h3><p>A good find is just around the corner.</p><a class="btn" href="#shop" data-action="cart-close">DISCOVER MIXT ↗</a></div>`;
 const subtotal=cartSubtotal(),discount=discountAmount(),shipping=shippingAmount(),total=subtotal-discount+shipping,progress=Math.min(100,subtotal/CONFIG.shippingThreshold*100);
 return `<div class="drawer-head"><h2>Your bag <small style="font:12px var(--sans);color:var(--muted)">(${state.cart.reduce((n,l)=>n+l.qty,0)})</small></h2><button class="drawer-close" data-action="cart-close" aria-label="Close bag">×</button></div><div class="drawer-body"><div class="ship-progress">${subtotal>=CONFIG.shippingThreshold?'<strong>You have unlocked complimentary delivery.</strong>':`You are ${money(CONFIG.shippingThreshold-subtotal)} away from complimentary delivery.`}<div class="progress-track"><span style="width:${progress}%"></span></div></div>${state.cart.map((line,i)=>{const p=byId(line.id);return `<div class="cart-line"><a href="#product/${p.id}" data-action="cart-close"><img src="${p.images[0]}" alt="${esc(p.name)}"></a><div><a class="cart-line-title" href="#product/${p.id}" data-action="cart-close">${esc(p.name)}</a><div class="cart-line-meta">${esc(line.color||'Standard')}${line.size?' · '+esc(line.size):''}</div><strong>${money(p.price*line.qty)}</strong><div class="cart-line-bottom"><div class="mini-qty"><button data-action="cart-qty" data-index="${i}" data-dir="-1" aria-label="Decrease quantity">−</button><span>${line.qty}</span><button data-action="cart-qty" data-index="${i}" data-dir="1" aria-label="Increase quantity">+</button></div><button class="remove-line" data-action="cart-remove" data-index="${i}">REMOVE</button></div></div></div>`;}).join('')}</div><div class="drawer-foot"><form class="promo-box" id="promo-form"><input name="code" placeholder="Enter a promo code" aria-label="Promo code" value="${state.promo?esc(state.promo.code):''}"><button type="submit">APPLY</button></form><div class="promo-message" id="promo-message">${state.promo?`${esc(state.promo.code)} applied.`:'WELCOME10: 10% off above ₹1,500 · EDIT15: 15% off above ₹4,999 (max ₹1,000).'}</div><div class="summary-row"><span>Subtotal</span><strong>${money(subtotal)}</strong></div><div class="summary-row"><span>Promotion</span><strong>${discount?`− ${money(discount)}`:'—'}</strong></div><div class="summary-row"><span>Delivery</span><strong>${shipping?money(shipping):'Complimentary'}</strong></div><div class="summary-row total"><span>Total</span><strong>${money(total)}</strong></div><a class="btn" href="#checkout" data-action="cart-close">CONTINUE TO CHECKOUT ↗</a><p style="font-size:9px;text-align:center;color:var(--muted);margin:10px 0 0">Demonstration only. No real transaction will be made.</p></div>`;
}
function toggleWish(id){
 const at=state.wishlist.indexOf(id);if(at>=0){state.wishlist.splice(at,1);toast('Removed from your saved edit.');}else{state.wishlist.push(id);toast('Saved to your edit.');}
 persist();
 $$(`[data-action="wish"][data-id="${CSS.escape(id)}"]`).forEach(b=>{const on=state.wishlist.includes(id);b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',on?'Remove from wishlist':'Add to wishlist');});
 if(currentRoute().name==='wishlist')render();
}
function quickView(id){
 const p=byId(id);if(!p)return;state.quick={id,color:0,size:''};renderQuickModal();
}
function renderQuickModal(){
 const p=byId(state.quick.id);if(!p)return;
 const max=state.quick.size?p.sizeStock[state.quick.size]:p.stock;
 openModal(`<div class="quick-view"><div class="quick-view-image"><img src="${p.images[0]}" alt="${esc(p.imageAlt)}"></div><div class="quick-view-info"><span class="eyebrow">${esc(p.category)} · QUICK VIEW</span><h2>${esc(p.name)}</h2><div class="pdp-price">${money(p.price)}</div><p class="pdp-description">${esc(p.description)}</p>${p.colors.length?`<div class="option-block"><div class="option-heading"><span>Colour / finish</span><small>${esc(p.colors[state.quick.color])}</small></div><div class="variant-row">${p.colors.map((c,i)=>`<button class="variant-btn ${state.quick.color===i?'selected':''}" data-action="quick-color" data-index="${i}"><i class="color-dot" style="--dot:${colorHex(c)}"></i>${esc(c)}</button>`).join('')}</div></div>`:''}${p.sizes.length?`<div class="option-block"><div class="option-heading"><span>Choose size</span><button class="clear-btn" data-action="size-guide">SIZE GUIDE</button></div><div class="variant-row">${p.sizes.map(s=>`<button class="variant-btn ${state.quick.size===s?'selected':''}" data-action="quick-size" data-size="${s}" ${p.sizeStock[s]===0?'disabled':''}>${esc(s)}</button>`).join('')}</div><div class="stock-note">${state.quick.size?max>0?`${max} available in demo inventory`:'Unavailable':'Choose a size to continue'}</div></div>`:''}<a href="#product/${p.id}" class="text-arrow" data-action="modal-close">FULL PRODUCT DETAILS ↗</a><button class="btn" style="width:100%;margin-top:20px" data-action="quick-add-confirm">ADD TO BAG ↗</button></div></div>`,'Quick view');
}
function searchModal(){openModal(`<div style="padding:12px 0 5px"><span class="eyebrow">FIND A GOOD THING</span><h2 style="font:500 42px var(--serif);color:var(--burgundy);margin:8px 0 16px">What are you looking for?</h2><form id="search-form" class="search-form"><input id="search-modal-input" name="q" placeholder="Search fashion, headphones, home…" value="${esc(state.searchQuery)}" autocomplete="off"><button type="submit">SEARCH ↗</button></form><div id="search-suggestions" class="search-suggestions">${searchSuggestions(state.searchQuery)}</div></div>`,'Search MIXT');}
function searchSuggestions(q){
 const results=q?PRODUCTS.filter(p=>(p.name+' '+p.category+' '+p.keywords).toLowerCase().includes(q.toLowerCase())).slice(0,5):PRODUCTS.filter(p=>p.isBestSeller).slice(0,4);
 return `<div class="suggestion-label">${q?'MATCHING PIECES':'POPULAR RIGHT NOW'}</div>${results.length?results.map(p=>`<a class="suggestion-item" href="#product/${p.id}" data-action="modal-close"><img src="${p.images[0]}" alt=""><span><strong>${esc(p.name)}</strong><small>${esc(p.category)} · ${money(p.price)}</small></span><b>↗</b></a>`).join(''):`<p class="empty-search">No pieces found. Try another search.</p>`}`;
}
function accountModal(){openModal(`<div style="padding:14px 0"><span class="eyebrow">YOUR MIXT ACCOUNT</span><h2 style="font:500 42px var(--serif);color:var(--burgundy)">Welcome in.</h2><p style="font:italic 18px var(--serif);color:var(--muted)">This is a local demonstration profile. No account is created on a server.</p><form id="account-form"><div class="field"><label for="demo-name">Your name</label><input id="demo-name" name="name" required></div><div class="field" style="margin:12px 0"><label for="demo-email">Email</label><input type="email" id="demo-email" name="email" required></div><button class="btn" style="width:100%">CONTINUE AS DEMO GUEST</button></form></div>`,'Demo account');}
function render(){
 closeOverlays(); const route=currentRoute(); const app=$('#app');
 if(route.name==='category'||route.name==='shop'||route.name==='new'||route.name==='search'){
   state.listing.category=route.name==='category'?route.slug:'';
   state.listing.query=route.name==='search'?route.query||'':'';
   state.listing.offset=12; state.listing.sort='recommended'; state.listing.maxPrice=25000; state.listing.ratings=[]; state.listing.subcategories=[]; state.listing.colors=[]; state.listing.sizes=[]; state.listing.onlyStock=false;
   app.innerHTML=listingPage(route); updateListingGrid();
 } else if(route.name==='product'){
   const p=byId(route.id); app.innerHTML=p?productPage(p):`<div class="wrap empty-state"><h3>That piece has moved on.</h3><a class="btn" href="#shop">BACK TO THE COLLECTION</a></div>${footer()}`;
 } else if(route.name==='wishlist') app.innerHTML=wishPage();
 else if(route.name==='checkout') app.innerHTML=renderCheckout();
 else if(route.name==='success') app.innerHTML=successPage();
 else if(route.name==='about') app.innerHTML=aboutPage();
 else if(route.name==='contact') app.innerHTML=contactPage();
 else if(route.name==='shipping') app.innerHTML=shippingPage();
 else if(route.name==='edit') app.innerHTML=editPage(route.slug);
 else app.innerHTML=homePage();
 window.scrollTo({top:0,behavior:'auto'}); updateCounts();
}

// Interaction handlers
function handleClick(e){
 const control=e.target.closest('[data-action]'); if(!control){if(e.target.id==='filter-shade'){$('#mobile-filter-panel')?.classList.remove('open');$('#filter-shade')?.classList.remove('open');document.body.classList.remove('locked');}return;}
 const action=control.dataset.action; const id=control.dataset.id;
 if(action==='menu'){state.menuOpen=true;$('#mobile-nav').classList.add('open');$('#mobile-nav').setAttribute('aria-hidden','false');$('#page-shade').classList.add('open');document.body.classList.add('locked');setTimeout(()=>$('#mobile-nav a')?.focus(),50);}
 else if(action==='menu-close'){closeOverlays();}
 else if(action==='search'){state.searchQuery='';searchModal();}
 else if(action==='account'){accountModal();}
 else if(action==='cart'){openDrawer();}
 else if(action==='cart-close'){closeDrawer();}
 else if(action==='modal-close'){closeModal();}
 else if(action==='wish'){toggleWish(id);}
 else if(action==='quick-view'){quickView(id);}
 else if(action==='quick-add'){const p=byId(id);if(p){state.quick={id,color:0,size:''};renderQuickModal();}}
 else if(action==='quick-color'){state.quick.color=Number(control.dataset.index);renderQuickModal();}
 else if(action==='quick-size'){state.quick.size=control.dataset.size;renderQuickModal();}
 else if(action==='quick-add-confirm'){const p=byId(state.quick.id);if(p){const ok=addToCart(p,{color:p.colors[state.quick.color],size:state.quick.size||null,qty:1});if(ok){closeModal();openDrawer();}}}
 else if(action==='cart-qty'){changeCartQty(Number(control.dataset.index),Number(control.dataset.dir));}
 else if(action==='cart-remove'){state.cart.splice(Number(control.dataset.index),1);persist();$('#cart-drawer').innerHTML=renderCartDrawer();toast('Removed from your bag.');}
 else if(action==='rail'){const rail=$(`#${control.dataset.target}`);if(rail)rail.scrollBy({left:Number(control.dataset.dir)*rail.clientWidth*.78,behavior:'smooth'});}
 else if(action==='clear-filters'){state.listing.maxPrice=25000;state.listing.ratings=[];state.listing.subcategories=[];state.listing.colors=[];state.listing.sizes=[];state.listing.onlyStock=false;state.listing.category=currentRoute().name==='category'?currentRoute().slug:'';$$('[data-filter-category]').forEach(i=>i.checked=i.dataset.filterCategory===state.listing.category);$$('[data-filter-rating],[data-filter-stock],[data-filter-sub],[data-filter-color],[data-filter-size]').forEach(i=>i.checked=false);$$('[data-filter-price]').forEach(range=>range.value=25000);$$('[data-filter-price-value]').forEach(price=>price.textContent=money(25000));updateListingGrid();}
 else if(action==='remove-filter'){const key=control.dataset.key;if(key==='category')state.listing.category='';else if(key==='price')state.listing.maxPrice=25000;else if(key==='stock')state.listing.onlyStock=false;else if(key.startsWith('rating:'))state.listing.ratings=state.listing.ratings.filter(r=>r!==key.split(':')[1]);else if(key.startsWith('sub:'))state.listing.subcategories=state.listing.subcategories.filter(v=>v!==key.slice(4));else if(key.startsWith('color:'))state.listing.colors=state.listing.colors.filter(v=>v!==key.slice(6));else if(key.startsWith('size:'))state.listing.sizes=state.listing.sizes.filter(v=>v!==key.slice(5));$$('[data-filter-price]').forEach(rr=>rr.value=state.listing.maxPrice);$$('[data-filter-price-value]').forEach(pv=>pv.textContent=money(state.listing.maxPrice));$$('[data-filter-category]').forEach(x=>x.checked=x.dataset.filterCategory===state.listing.category);$$('[data-filter-rating]').forEach(x=>x.checked=state.listing.ratings.includes(x.dataset.filterRating));$$('[data-filter-sub]').forEach(x=>x.checked=state.listing.subcategories.includes(x.dataset.filterSub));$$('[data-filter-color]').forEach(x=>x.checked=state.listing.colors.includes(x.dataset.filterColor));$$('[data-filter-size]').forEach(x=>x.checked=state.listing.sizes.includes(x.dataset.filterSize));const si=$('[data-filter-stock]');if(si)si.checked=state.listing.onlyStock;updateListingGrid();}
 else if(action==='load-more'){state.listing.offset+=12;updateListingGrid();}
 else if(action==='filter-open'){$('#mobile-filter-panel').classList.add('open');$('#filter-shade').classList.add('open');document.body.classList.add('locked');}
 else if(action==='filter-close'){$('#mobile-filter-panel').classList.remove('open');$('#filter-shade').classList.remove('open');document.body.classList.remove('locked');updateListingGrid();}
 else if(action==='pdp-image'){const p=byId(state.pdp.id);state.pdp.image=Number(control.dataset.index);$('#pdp-main-img').src=p.images[state.pdp.image];$$('.pdp-thumbs button').forEach((b,i)=>b.classList.toggle('active',i===state.pdp.image));}
 else if(action==='pdp-color'){state.pdp.color=Number(control.dataset.index);$$('[data-action="pdp-color"]').forEach((b,i)=>b.classList.toggle('selected',i===state.pdp.color));$('#selected-color').textContent=byId(state.pdp.id).colors[state.pdp.color];}
 else if(action==='pdp-size'){state.pdp.size=control.dataset.size;$$('[data-action="pdp-size"]').forEach(b=>b.classList.toggle('selected',b===control));const p=byId(state.pdp.id),n=p.sizeStock[state.pdp.size];$('#pdp-stock-note').textContent=n?`${n} available in this demo selection.`:'This size is currently unavailable.';}
 else if(action==='pdp-qty'){state.pdp.quantity=Math.max(1,Math.min(9,state.pdp.quantity+Number(control.dataset.dir)));$('#pdp-qty').textContent=state.pdp.quantity;}
 else if(action==='pdp-add'){const p=byId(control.dataset.id||state.pdp.id);if(p){const ok=addToCart(p,{color:p.colors[state.pdp.color]||null,size:state.pdp.size||null,qty:state.pdp.quantity});if(ok)openDrawer();}}
 else if(action==='pdp-wish'){toggleWish(state.pdp.id);}
 else if(action==='size-guide'){
  const contextProduct=$('#modal-shell').classList.contains('open')&&state.quick.id?byId(state.quick.id):byId(state.pdp.id);
  const footwear=contextProduct?.subcategory==='Footwear';
  const guide=footwear?`<p style="font-size:12px;color:var(--muted)">Illustrative size options only. Use the size information supplied with the real product before launch.</p><div class="variant-row">${['6','7','8','9','10'].map(v=>`<span class="variant-btn">${v}</span>`).join('')}</div><p style="font-size:12px;color:var(--muted)">No international size conversion is provided in this demo.</p>`:`<p style="font-size:12px;color:var(--muted)">Illustrative garment measurements. Replace with verified measurements for each real product.</p><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr><th style="text-align:left;padding:10px;border-bottom:1px solid var(--line)">Size</th><th style="padding:10px;border-bottom:1px solid var(--line)">Chest (cm)</th><th style="padding:10px;border-bottom:1px solid var(--line)">Waist (cm)</th></tr></thead><tbody>${[['S',90,74],['M',96,80],['L',102,86],['XL',108,92]].map(r=>`<tr><td style="padding:10px;border-bottom:1px solid var(--line)">${r[0]}</td><td style="text-align:center;border-bottom:1px solid var(--line)">${r[1]}</td><td style="text-align:center;border-bottom:1px solid var(--line)">${r[2]}</td></tr>`).join('')}</tbody></table>`;
  openModal(`<div style="padding:12px 0"><span class="eyebrow">A HELPFUL GUIDE</span><h2 style="font:500 38px var(--serif);color:var(--burgundy)">Size notes</h2>${guide}</div>`,'Size guide');
 }
}
document.addEventListener('click',handleClick);
$('#page-shade').addEventListener('click',()=>{closeDrawer();$('#mobile-nav').classList.remove('open');$('#mobile-nav').setAttribute('aria-hidden','true');$('#page-shade').classList.remove('open');document.body.classList.remove('locked');});
window.addEventListener('hashchange',render);
window.addEventListener('scroll',()=>$('#site-header').classList.toggle('scrolled',window.scrollY>16),{passive:true});
window.addEventListener('keydown',e=>{
 if(e.key==='Escape'){
  if($('#modal-shell').classList.contains('open'))closeModal();
  else if($('#cart-drawer').classList.contains('open'))closeDrawer();
  else if($('#mobile-filter-panel.open')){$('#mobile-filter-panel').classList.remove('open');$('#filter-shade').classList.remove('open');document.body.classList.remove('locked');}
  else if($('#mobile-nav').classList.contains('open')){closeOverlays();$('#bg')?.focus();}
  return;
 }
 if(e.key==='Tab'){
  const container=$('#modal-shell').classList.contains('open')?$('#modal-panel'):$('#cart-drawer').classList.contains('open')?$('#cart-drawer'):$('#mobile-nav').classList.contains('open')?$('#mobile-nav'):null;
  if(!container)return;
  const items=$$('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])',container).filter(el=>el.offsetParent!==null);
  if(!items.length)return;
  const first=items[0],last=items[items.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});

document.addEventListener('change',e=>{
 const t=e.target;
 if(t.matches('[data-filter-category]')){state.listing.category=t.checked?t.dataset.filterCategory:'';state.listing.offset=12;updateListingGrid();}
 if(t.matches('[data-filter-rating]')){const r=t.dataset.filterRating;if(t.checked)state.listing.ratings.push(r);else state.listing.ratings=state.listing.ratings.filter(x=>x!==r);updateListingGrid();}
 if(t.matches('[data-filter-stock]')){state.listing.onlyStock=t.checked;updateListingGrid();}
 if(t.matches('[data-filter-sub]')){const v=t.dataset.filterSub;t.checked?state.listing.subcategories.push(v):state.listing.subcategories=state.listing.subcategories.filter(x=>x!==v);updateListingGrid();}
 if(t.matches('[data-filter-color]')){const v=t.dataset.filterColor;t.checked?state.listing.colors.push(v):state.listing.colors=state.listing.colors.filter(x=>x!==v);updateListingGrid();}
 if(t.matches('[data-filter-size]')){const v=t.dataset.filterSize;t.checked?state.listing.sizes.push(v):state.listing.sizes=state.listing.sizes.filter(x=>x!==v);updateListingGrid();}
 if(t.id==='sort-select'){state.listing.sort=t.value;updateListingGrid();}
});
document.addEventListener('input',e=>{
 if(e.target.matches('[data-filter-price]')){state.listing.maxPrice=Number(e.target.value);$$('[data-filter-price-value]').forEach(v=>v.textContent=money(state.listing.maxPrice));$$('[data-filter-price]').forEach(r=>r.value=state.listing.maxPrice);updateListingGrid();}
 if(e.target.id==='search-modal-input'){state.searchQuery=e.target.value;$('#search-suggestions').innerHTML=searchSuggestions(state.searchQuery);}
});

document.addEventListener('submit',e=>{
 e.preventDefault(); const form=e.target;
 if(form.id==='newsletter-form'){const msg=$('#newsletter-message');msg.textContent='Thank you. You are on the MIXT demo list; no email has been stored or sent.';form.reset();}
 if(form.id==='search-form'){const q=new FormData(form).get('q')?.trim();if(q){closeModal();setRoute(`search/${encodeURIComponent(q)}`);}}
 if(form.id==='promo-form'){
  const code=String(new FormData(form).get('code')||'').trim().toUpperCase();
  const message=$('#promo-message');
  const rule=CONFIG.promotions[code];
  if(rule&&cartSubtotal()>=rule.minSubtotal){state.promo={code};persist();$('#cart-drawer').innerHTML=renderCartDrawer();toast(`${code} applied.`);}
  else if(rule){if(message)message.textContent=`${code} needs a ${money(rule.minSubtotal)} minimum subtotal.`;}
  else if(code===''){state.promo=null;persist();$('#cart-drawer').innerHTML=renderCartDrawer();toast('Promotion removed.');}
  else {if(message)message.textContent='That code is not recognised in this demo.';}
 }
 if(form.id==='account-form'){const fd=new FormData(form);toast(`Welcome, ${fd.get('name')}. Demo guest session only.`);closeModal();}
 if(form.id==='checkout-form'){
  if(!state.cart.length){toast('Your bag is empty.');setRoute('shop');return;}
  const invalid=state.cart.some(line=>line.qty>availableStock(byId(line.id),line));if(invalid){toast('One or more quantities need to be updated.');openDrawer();return;}
  const fd=new FormData(form);const totals=checkoutSummary();
  const number='MX-'+Math.floor(100000+Math.random()*900000);
  state.lastOrder={number,total:totals.total,items:state.cart.reduce((n,l)=>n+l.qty,0),name:`${fd.get('firstName')} ${fd.get('lastName')}`};storage.write('lastOrder',state.lastOrder);
  state.cart=[];state.promo=null;persist();toast('Demo order completed. No payment processed.');setRoute('success');
 }
});

// Initial boot
updateCounts();
render();

document.addEventListener('error',e=>{
  const img=e.target;
  if(img instanceof HTMLImageElement && !img.dataset.fallback){
    img.dataset.fallback='1';img.src='assets/images/fallback.webp';img.alt=img.alt||'MIXT editorial image';
  }
},true);
