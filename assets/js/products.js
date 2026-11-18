export { CONFIG } from './config.js';

export const CATEGORIES = [
  { slug:'fashion', title:'Fashion', eyebrow:'THE WARDROBE', description:'Modern staples. Timeless style. Pieces with a point of view.', image:'assets/images/categories/fashion.webp', accent:'burgundy', count:8, subcategories:['Clothing','Footwear','Bags & Accessories'] },
  { slug:'technology', title:'Technology', eyebrow:'GOOD GADGETS', description:'Beautifully useful objects for work, play and everything between.', image:'assets/images/categories/technology.webp', accent:'forest', count:8, subcategories:['Audio','Desk Essentials','Smart Accessories'] },
  { slug:'home', title:'Home & Living', eyebrow:'THE HOME EDIT', description:'Thoughtful details for spaces that feel like you.', image:'assets/images/categories/home.webp', accent:'terracotta', count:8, subcategories:['Decor','Lighting','Soft Furnishings'] },
  { slug:'beauty', title:'Beauty & Grooming', eyebrow:'THE DAILY RITUAL', description:'Considered essentials for the everyday art of looking after yourself.', image:'assets/images/categories/beauty.webp', accent:'burgundy', count:8, subcategories:['Fragrance','Skincare','Grooming'] },
  { slug:'sports', title:'Sports & Outdoors', eyebrow:'MOVE WELL', description:'Good design for the miles, minutes and moments that move you.', image:'assets/images/categories/sports.webp', accent:'forest', count:8, subcategories:['Training','Outdoor','Recovery'] },
  { slug:'lifestyle', title:'Lifestyle & Travel', eyebrow:'TAKE THE LONG WAY', description:'Everyday companions, considered for wherever life takes you.', image:'assets/images/categories/lifestyle.webp', accent:'blue', count:8, subcategories:['Travel','Accessories','Desk & Paper'] }
];

const catalog = [
  { category:'fashion', items:[
    {name:'Structured Linen Overshirt',sub:'Clothing',price:3490,mrp:4290,desc:'A relaxed, considered layer with a clean collar, generous pockets and an easy silhouette.',material:'Linen-cotton blend',colors:['Oat','Olive','Ink'],sizes:['S','M','L','XL'],badge:'NEW ARRIVAL',keywords:'shirt jacket menswear womenswear linen'},
    {name:'Everyday Leather Tote',sub:'Bags & Accessories',price:5290,mrp:6290,desc:'A quietly confident carryall with a roomy interior and beautifully simple lines.',material:'Textured vegan leather',colors:['Cognac','Black'],sizes:[],badge:'THE EDIT',keywords:'bag tote carryall handbag'},
    {name:'Court Leather Sneakers',sub:'Footwear',price:5990,mrp:7490,desc:'A low-profile court silhouette with a crisp finish and a little everyday ease.',material:'Leather-look upper with rubber sole',colors:['Ivory','Forest','Burgundy'],sizes:['6','7','8','9','10'],badge:'BESTSELLER',keywords:'shoes sneakers trainers footwear'},
    {name:'Relaxed Tailored Trousers',sub:'Clothing',price:3990,mrp:0,desc:'A fluid straight leg, considered pleats and a mid-rise fit make these an easy wardrobe anchor.',material:'Viscose-cotton twill',colors:['Stone','Charcoal'],sizes:['S','M','L','XL'],badge:'',keywords:'pants trousers tailoring'},
    {name:'The Crisp Cotton Shirt',sub:'Clothing',price:2890,mrp:3490,desc:'A fresh, versatile shirt with a soft hand and a neatly proportioned collar.',material:'100% cotton poplin',colors:['White','Sky','Stripe'],sizes:['S','M','L','XL'],badge:'NEW ARRIVAL',keywords:'shirt cotton classic'},
    {name:'Weekend Wool Jacket',sub:'Clothing',price:8990,mrp:10990,desc:'An easy structured jacket with a soft shoulder and a relaxed weekend sensibility.',material:'Wool blend',colors:['Camel','Forest'],sizes:['S','M','L','XL'],badge:'LIMITED EDIT',keywords:'jacket outerwear wool coat'},
    {name:'Pebble Leather Wallet',sub:'Bags & Accessories',price:1990,mrp:0,desc:'A slim everyday essential with considered compartments and a tactile finish.',material:'Textured vegan leather',colors:['Cognac','Black','Olive'],sizes:[],badge:'',keywords:'wallet card holder leather accessory'},
    {name:'Sculpted Shoulder Bag',sub:'Bags & Accessories',price:6490,mrp:7890,desc:'A softly sculpted shape with clean hardware and room for the everyday essentials.',material:'Textured vegan leather',colors:['Chocolate','Burgundy'],sizes:[],badge:'NEW ARRIVAL',keywords:'bag shoulder purse handbag'}
  ]},
  { category:'technology', items:[
    {name:'Studio Wireless Headphones',sub:'Audio',price:8990,mrp:10990,desc:'Comfort-led over-ear listening with a beautifully understated studio-inspired finish.',material:'Soft-touch polymer, memory foam and metal accents',colors:['Forest','Ivory','Graphite'],sizes:[],badge:'BESTSELLER',keywords:'headphones audio music wireless sound'},
    {name:'Portable Bluetooth Speaker',sub:'Audio',price:4290,mrp:4990,desc:'Room-filling sound in a compact form made for moving from room to room.',material:'Woven acoustic fabric and recycled polymer',colors:['Terracotta','Forest','Sand'],sizes:[],badge:'NEW ARRIVAL',keywords:'speaker bluetooth audio music'},
    {name:'Classic Smartwatch',sub:'Smart Accessories',price:7490,mrp:8990,desc:'A clean, versatile watch face with thoughtful everyday activity and notification features.',material:'Aluminium case and silicone strap',colors:['Black','Stone'],sizes:[],badge:'',keywords:'watch wearable fitness technology'},
    {name:'Wireless Charging Stand',sub:'Desk Essentials',price:2490,mrp:0,desc:'A tidy, angled charging stand that keeps a phone visible and a desk uncluttered.',material:'Aluminium and soft-touch finish',colors:['Ivory','Graphite'],sizes:[],badge:'',keywords:'charger charging dock desk'},
    {name:'Mechanical Keyboard',sub:'Desk Essentials',price:6990,mrp:8290,desc:'A compact mechanical keyboard with tactile switches and a considered desktop presence.',material:'Aluminium top plate and PBT keycaps',colors:['Cream','Charcoal'],sizes:[],badge:'THE EDIT',keywords:'keyboard mechanical computer desk'},
    {name:'Portable Solid State Drive',sub:'Smart Accessories',price:5990,mrp:6990,desc:'A pocket-sized storage companion for files, creative work and everyday backups.',material:'Aluminium alloy enclosure',colors:['Silver','Midnight'],sizes:[],badge:'',keywords:'ssd storage drive portable'},
    {name:'Brass Desk Lamp',sub:'Desk Essentials',price:6490,mrp:7990,desc:'A warm pool of light and a timeless silhouette for a more thoughtful workspace.',material:'Brushed metal and opal diffuser',colors:['Antique Brass','Ink'],sizes:[],badge:'NEW ARRIVAL',keywords:'lamp light desk lighting'},
    {name:'True Wireless Earbuds',sub:'Audio',price:4990,mrp:5990,desc:'Compact everyday earbuds with a pocketable case and a clean, comfortable fit.',material:'Matte polymer',colors:['Ivory','Black','Olive'],sizes:[],badge:'',keywords:'earbuds earphones wireless audio'}
  ]},
  { category:'home', items:[
    {name:'Sculptural Ceramic Vase',sub:'Decor',price:2490,mrp:0,desc:'An expressive ceramic form that looks just as considered with a single stem as on its own.',material:'Glazed stoneware',colors:['Chalk','Oxblood'],sizes:[],badge:'THE EDIT',keywords:'vase ceramic home decor'},
    {name:'Contemporary Table Lamp',sub:'Lighting',price:7490,mrp:8990,desc:'A softly sculptural lamp that brings warm, ambient light to a side table or reading corner.',material:'Metal base and linen shade',colors:['Brass','Forest'],sizes:[],badge:'BESTSELLER',keywords:'lamp lighting table light'},
    {name:'Textured Throw Blanket',sub:'Soft Furnishings',price:3290,mrp:3990,desc:'A tactile, generously sized throw for slow mornings and layered evenings.',material:'Cotton-acrylic weave',colors:['Terracotta','Oat','Olive'],sizes:[],badge:'NEW ARRIVAL',keywords:'blanket throw textile bedding'},
    {name:'Minimal Wall Clock',sub:'Decor',price:2890,mrp:0,desc:'A quiet, easy-to-read timepiece with a clean dial and considered proportions.',material:'Wood composite and mineral glass',colors:['Walnut','Ivory'],sizes:[],badge:'',keywords:'clock wall decor'},
    {name:'Brass Catchall Tray',sub:'Decor',price:1790,mrp:2190,desc:'A small landing place for keys, jewellery and the everyday things worth keeping close.',material:'Cast metal with antique finish',colors:['Antique Brass'],sizes:[],badge:'',keywords:'tray jewellery dish organiser'},
    {name:'Sculpted Coffee Table',sub:'Furniture',price:18990,mrp:21990,desc:'A compact statement table with rounded edges and a warm, furniture-grade finish.',material:'Engineered wood with veneer finish',colors:['Walnut','Black'],sizes:[],badge:'FEATURED',keywords:'table furniture living room'},
    {name:'Velvet Cushion Pair',sub:'Soft Furnishings',price:2290,mrp:0,desc:'Two richly textured cushions designed to add depth and colour to a favourite chair.',material:'Cotton velvet with polyester fill',colors:['Burgundy','Olive','Gold'],sizes:[],badge:'',keywords:'cushion pillow velvet home'},
    {name:'Handblown Glassware Set',sub:'Dining',price:2990,mrp:3590,desc:'A set of four subtly varied glasses for everyday tables and special occasions alike.',material:'Hand-finished soda-lime glass',colors:['Clear','Smoked'],sizes:[],badge:'NEW ARRIVAL',keywords:'glassware dining kitchen drink'}
  ]},
  { category:'beauty', items:[
    {name:'Signature Eau de Parfum',sub:'Fragrance',price:4990,mrp:5990,desc:'A warm, layered fragrance with amber woods, soft florals and a gently lasting finish.',material:'Eau de parfum; 50 ml',colors:['Amber'],sizes:[],badge:'BESTSELLER',keywords:'perfume fragrance scent'},
    {name:'Botanical Face Serum',sub:'Skincare',price:1890,mrp:2290,desc:'A lightweight daily serum designed to sit comfortably beneath moisturiser.',material:'30 ml glass bottle',colors:['Clear'],sizes:[],badge:'NEW ARRIVAL',keywords:'serum face skincare botanical'},
    {name:'Daily Ritual Skincare Set',sub:'Skincare',price:3490,mrp:4290,desc:'A simple three-step routine with cleanser, serum and moisturiser for everyday care.',material:'Three-piece skincare set',colors:['Original'],sizes:[],badge:'THE EDIT',keywords:'skincare set beauty face routine'},
    {name:'Premium Grooming Kit',sub:'Grooming',price:2790,mrp:0,desc:'A considered grooming set with the tools and essentials for a neat daily ritual.',material:'Metal and soft-touch accessories',colors:['Graphite'],sizes:[],badge:'',keywords:'grooming beard personal care'},
    {name:'Body Care Duo',sub:'Body Care',price:1690,mrp:1990,desc:'A gentle body wash and nourishing lotion duo for a simple everyday reset.',material:'Two-piece body care set',colors:['Citrus','Unscented'],sizes:[],badge:'',keywords:'body wash lotion care'},
    {name:'Gentle Face Cleanser',sub:'Skincare',price:990,mrp:0,desc:'A mild daily cleanser with a comfortable, non-stripping feel.',material:'150 ml tube',colors:['Original'],sizes:[],badge:'',keywords:'cleanser face wash skincare'},
    {name:'Velvet Hand Cream',sub:'Body Care',price:690,mrp:850,desc:'A compact hand cream with a soft finish, ideal for a desk or travel pouch.',material:'50 ml tube',colors:['Rose','Cedar'],sizes:[],badge:'',keywords:'hand cream moisturiser beauty'},
    {name:'Travel Beauty Case',sub:'Accessories',price:2190,mrp:2590,desc:'A wipe-clean case with useful compartments for keeping a daily routine together.',material:'Textured coated fabric',colors:['Burgundy','Olive'],sizes:[],badge:'NEW ARRIVAL',keywords:'beauty bag travel organiser'}
  ]},
  { category:'sports', items:[
    {name:'Performance Running Shoes',sub:'Footwear',price:6990,mrp:8490,desc:'A cushioned everyday trainer designed for comfortable road miles and active days.',material:'Engineered mesh and rubber outsole',colors:['Ivory/Forest','Ink/Coral'],sizes:['6','7','8','9','10'],badge:'BESTSELLER',keywords:'running shoes trainers sneakers'},
    {name:'Training Duffle Bag',sub:'Training',price:3290,mrp:3990,desc:'A practical carryall with a wide opening, inner pocket and room for a full session.',material:'Water-resistant woven polyester',colors:['Forest','Black'],sizes:[],badge:'',keywords:'gym duffle sports bag'},
    {name:'Premium Yoga Mat',sub:'Training',price:2490,mrp:2990,desc:'A supportive, grippy mat with a comfortable surface for daily movement.',material:'Natural rubber blend',colors:['Terracotta','Olive','Lilac'],sizes:[],badge:'NEW ARRIVAL',keywords:'yoga mat exercise fitness'},
    {name:'Insulated Water Bottle',sub:'Outdoor',price:1290,mrp:1590,desc:'A double-wall bottle that keeps drinks close at hand through a busy day.',material:'Stainless steel',colors:['Cream','Forest','Coral'],sizes:[],badge:'',keywords:'bottle water flask hydration'},
    {name:'Lightweight Training Jacket',sub:'Training',price:4290,mrp:0,desc:'A light outer layer with an easy fit for warm-ups, cool evenings and commutes.',material:'Lightweight recycled polyester',colors:['Ink','Olive'],sizes:['S','M','L','XL'],badge:'',keywords:'jacket training running sports'},
    {name:'Resistance Band Set',sub:'Training',price:990,mrp:1190,desc:'A compact set of resistance bands for mobility, strength and travel workouts.',material:'Natural latex blend',colors:['Multi'],sizes:[],badge:'',keywords:'resistance band fitness workout'},
    {name:'Trail Daypack',sub:'Outdoor',price:3790,mrp:4490,desc:'A lightweight daypack with useful organisation for short walks and everyday exploring.',material:'Reinforced technical fabric',colors:['Forest','Rust'],sizes:[],badge:'THE EDIT',keywords:'backpack hiking outdoor trail'},
    {name:'Running Essentials Set',sub:'Recovery',price:1890,mrp:2290,desc:'A practical set of small essentials for warm-ups, cool-downs and post-run recovery.',material:'Mixed training accessories',colors:['Multi'],sizes:[],badge:'',keywords:'running fitness recovery set'}
  ]},
  { category:'lifestyle', items:[
    {name:'Leather Weekender',sub:'Travel',price:8990,mrp:10990,desc:'A generously sized overnight bag with timeless proportions and a considered interior.',material:'Textured vegan leather and cotton lining',colors:['Cognac','Black'],sizes:[],badge:'BESTSELLER',keywords:'travel bag duffel weekender luggage'},
    {name:'Classic Analog Watch',sub:'Accessories',price:5990,mrp:7290,desc:'A clean dial and understated case make this an easy companion from weekday to weekend.',material:'Stainless steel case and leather-look strap',colors:['Gold/Black','Silver/Blue'],sizes:[],badge:'',keywords:'watch analog wristwatch'},
    {name:'Tortoiseshell Sunglasses',sub:'Accessories',price:2490,mrp:2990,desc:'A timeless frame with a softly rounded shape and protective tinted lenses.',material:'Acetate-look frame with UV400 lenses',colors:['Tortoise','Black'],sizes:[],badge:'NEW ARRIVAL',keywords:'sunglasses eyewear accessories'},
    {name:'Travel Organiser Set',sub:'Travel',price:1690,mrp:1990,desc:'A set of packing pouches that gives small essentials a proper place on the move.',material:'Lightweight woven fabric',colors:['Sand','Olive'],sizes:[],badge:'',keywords:'travel organiser packing pouch'},
    {name:'Leather Passport Case',sub:'Travel',price:1590,mrp:0,desc:'A slim passport sleeve with a couple of useful slots for travel documents.',material:'Textured vegan leather',colors:['Cognac','Burgundy'],sizes:[],badge:'',keywords:'passport cover travel wallet'},
    {name:'Everyday Backpack',sub:'Bags',price:4290,mrp:5190,desc:'A versatile daily pack with a padded laptop sleeve and clean, practical lines.',material:'Durable coated canvas',colors:['Forest','Ink','Stone'],sizes:[],badge:'',keywords:'backpack bag laptop everyday'},
    {name:'Desk Accessories Set',sub:'Desk & Paper',price:2290,mrp:2790,desc:'A coordinated set of desk essentials for a workspace that feels a little more considered.',material:'Metal, paper and wood composite',colors:['Walnut/Brass','Ink'],sizes:[],badge:'THE EDIT',keywords:'desk accessories stationery office'},
    {name:'Linen Bound Journal',sub:'Desk & Paper',price:890,mrp:0,desc:'A tactile, lay-flat journal for notes, lists and plans worth putting on paper.',material:'Linen-effect cover and FSC-style paper claim omitted',colors:['Burgundy','Olive','Sand'],sizes:[],badge:'',keywords:'journal notebook diary paper'}
  ]}
];

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
export const PRODUCTS = catalog.flatMap(group => {
  const category = CATEGORIES.find(c => c.slug === group.category);
  return group.items.map((item, i) => {
    const id = `${group.category}-${String(i+1).padStart(2,'0')}`;
    const image = `assets/images/products/${group.category}-${String(i+1).padStart(2,'0')}.webp`;
    const detail = `assets/images/products/${group.category}-detail.webp`;
    const sizes = item.sizes || [];
    return {
      id, slug:slug(item.name), name:item.name, category:category.title, categorySlug:group.category,
      subcategory:item.sub, brand:'MIXT EDIT', price:item.price, originalPrice:item.mrp || null,
      currency:'INR', rating:Number((4.5 + ((i+group.category.length)%5)*0.1).toFixed(1)),
      reviewCount:38 + i*19 + group.category.length*7, badge:item.badge, description:item.desc,
      material:item.material, colors:item.colors, sizes, stock:4 + ((i*3 + group.category.length)%13),
      sizeStock:Object.fromEntries(sizes.map((s,j)=>[s,Math.max(0,((i+j+group.category.length)%7===0)?0:2+((i+j*2)%7))])),
      images:[image, detail], imageAlt:`${item.name} — illustrative MIXT editorial product image`,
      keywords:item.keywords, isNew:i<3 || item.badge==='NEW ARRIVAL',
      isFeatured:[0,2,4].includes(i), isBestSeller:item.badge==='BESTSELLER' || [1,5].includes(i),
      collection:['weekend','everyday','home','gifting'][(i+group.category.length)%4]
    };
  });
});

export const COLLECTIONS = [
  {slug:'weekend',title:'The Weekend Edit',eyebrow:'SLOW DOWN, LOOK AROUND',description:'A little escape, a little indulgence and everything in between.',image:'assets/images/campaigns/objects-of-desire.webp',accent:'burgundy',categories:['fashion','lifestyle','sports']},
  {slug:'everyday',title:'The Everyday Upgrade',eyebrow:'THE LITTLE DIFFERENCES',description:'Thoughtful pieces that make the everyday feel considered.',image:'assets/images/categories/technology.webp',accent:'forest',categories:['technology','fashion','beauty']},
  {slug:'home',title:'Objects for the Home',eyebrow:'A PLACE TO CALL YOUR OWN',description:'Details, textures and beautiful things to live with.',image:'assets/images/categories/home.webp',accent:'terracotta',categories:['home']},
  {slug:'gifting',title:'The Art of Gifting',eyebrow:'GIVE A LITTLE EXTRA',description:'Well-chosen things for the people who make life good.',image:'assets/images/categories/lifestyle.webp',accent:'blue',categories:['lifestyle','beauty','home']}
];
