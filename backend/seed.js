import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const imagePool = {
  office: [
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
    "https://images.unsplash.com/photo-1497366216548-37526070297c",
    "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa",
  ],

  desk: [
    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6b2",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
  ],

  chair: [
    "https://images.unsplash.com/photo-1580480055273-228ff5388ef8",
    "https://images.unsplash.com/photo-1592078615290-033ee584e267",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
  ],

  meeting: [
    "https://images.unsplash.com/photo-1517502884422-41eaead166d4",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2",
    "https://images.unsplash.com/photo-1497366216548-37526070297c",
  ],

  reception: [
    "https://images.unsplash.com/photo-1556761175-b413da4baf72",
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
    "https://images.unsplash.com/photo-1497366858526-0766cadbe8fa",
  ],

  accessories: [
    "https://images.unsplash.com/photo-1586953208448-b95a79798f07",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36",
  ],
};

const categories = [
  {
    key: "computer-tables",
    ar: "مكاتب وطاولات كمبيوتر",
    en: "Computer Tables",
    imageType: "desk",
    count: 16,
    products: [
      ["مكتب كمبيوتر مودرن", "Modern Computer Desk"],
      ["مكتب كمبيوتر خشبي", "Wooden Computer Desk"],
      ["مكتب كمبيوتر إداري", "Executive Computer Desk"],
      ["مكتب كمبيوتر عملي", "Practical Computer Desk"],
      ["مكتب كمبيوتر صغير", "Compact Computer Desk"],
      ["مكتب كمبيوتر كبير", "Large Computer Desk"],
      ["مكتب كمبيوتر بملحق جانبي", "Computer Desk With Side Extension"],
      ["مكتب كمبيوتر بدرجين", "Computer Desk With Drawers"],
      ["مكتب كمبيوتر بثلاثة أدراج", "Computer Desk With Three Drawers"],
      ["مكتب كمبيوتر زاوية", "Corner Computer Desk"],
      ["مكتب كمبيوتر للمساحات الصغيرة", "Small Space Computer Desk"],
      ["مكتب كمبيوتر احترافي", "Professional Computer Desk"],
      ["مكتب كمبيوتر إداري فاخر", "Premium Executive Computer Desk"],
      ["مكتب كمبيوتر أبيض", "White Computer Desk"],
      ["مكتب كمبيوتر خشب ومعدن", "Wood And Metal Computer Desk"],
      ["مكتب كمبيوتر متعدد الاستخدامات", "Multi Purpose Computer Desk"],
    ],
  },

  {
    key: "mesh-chairs",
    ar: "كراسي شبك",
    en: "Mesh Chairs",
    imageType: "chair",
    count: 14,
    products: [
      ["كرسي مكتب شبك مودرن", "Modern Mesh Office Chair"],
      ["كرسي مدير شبك", "Mesh Executive Chair"],
      ["كرسي موظف شبك", "Mesh Staff Chair"],
      ["كرسي مكتب شبك مريح", "Comfort Mesh Office Chair"],
      ["كرسي شبك ظهر عالي", "High Back Mesh Chair"],
      ["كرسي شبك طبي", "Ergonomic Mesh Chair"],
      ["كرسي شبك مع مسند رأس", "Mesh Chair With Headrest"],
      ["كرسي شبك قابل للتعديل", "Adjustable Mesh Chair"],
      ["كرسي شبك أسود", "Black Mesh Office Chair"],
      ["كرسي شبك احترافي", "Professional Mesh Chair"],
      ["كرسي شبك للأعمال", "Business Mesh Chair"],
      ["كرسي شبك ظهر متوسط", "Mid Back Mesh Chair"],
      ["كرسي شبك فاخر", "Premium Mesh Chair"],
      ["كرسي شبك متعدد الاستخدام", "Multi Purpose Mesh Chair"],
    ],
  },

  {
    key: "leather-chairs",
    ar: "كراسي جلد",
    en: "Leather Chairs",
    imageType: "chair",
    count: 12,
    products: [
      ["كرسي مدير جلد فاخر", "Premium Leather Executive Chair"],
      ["كرسي مكتب جلد", "Leather Office Chair"],
      ["كرسي مدير جلد عالي الظهر", "High Back Leather Executive Chair"],
      ["كرسي موظف جلد", "Leather Staff Chair"],
      ["كرسي مكتب جلد مريح", "Comfort Leather Office Chair"],
      ["كرسي مدير كلاسيك", "Classic Executive Chair"],
      ["كرسي جلد أسود", "Black Leather Office Chair"],
      ["كرسي جلد بني", "Brown Leather Office Chair"],
      ["كرسي مدير احترافي", "Professional Executive Chair"],
      ["كرسي جلد مبطن", "Padded Leather Office Chair"],
      ["كرسي جلد دوار", "Swivel Leather Office Chair"],
      ["كرسي جلد فاخر", "Luxury Leather Office Chair"],
    ],
  },

  {
    key: "bar-chairs",
    ar: "كراسي بار",
    en: "Bar Chairs",
    imageType: "chair",
    count: 8,
    products: [
      ["كرسي بار مودرن", "Modern Bar Chair"],
      ["كرسي بار خشبي", "Wooden Bar Chair"],
      ["كرسي بار معدني", "Metal Bar Chair"],
      ["كرسي بار مرتفع", "High Bar Chair"],
      ["كرسي بار للمكاتب", "Office Bar Chair"],
      ["كرسي بار مبطن", "Padded Bar Chair"],
      ["كرسي بار فاخر", "Premium Bar Chair"],
      ["كرسي بار دوار", "Swivel Bar Chair"],
    ],
  },

  {
    key: "laboratory-chairs",
    ar: "كراسي المعمل",
    en: "Laboratory Chairs",
    imageType: "chair",
    count: 6,
    products: [
      ["كرسي معمل عالي", "High Laboratory Chair"],
      ["كرسي معمل قابل للتعديل", "Adjustable Laboratory Chair"],
      ["كرسي معمل دوار", "Swivel Laboratory Chair"],
      ["كرسي معمل بظهر", "Laboratory Chair With Backrest"],
      ["كرسي معمل صناعي", "Industrial Laboratory Chair"],
      ["كرسي معمل احترافي", "Professional Laboratory Chair"],
    ],
  },

  {
    key: "office-seating-sets",
    ar: "انتريهات مكتبية",
    en: "Office Seating Sets",
    imageType: "office",
    count: 10,
    products: [
      ["انتريه مكتب ثلاثي", "Three Seater Office Sofa"],
      ["انتريه مكتب ثنائي", "Two Seater Office Sofa"],
      ["انتريه استقبال مودرن", "Modern Reception Sofa"],
      ["انتريه مكتب فاخر", "Premium Office Sofa"],
      ["انتريه جلد مكتبي", "Leather Office Sofa"],
      ["انتريه انتظار", "Waiting Area Sofa"],
      ["انتريه مدير", "Executive Office Sofa"],
      ["انتريه مكتب كلاسيك", "Classic Office Sofa"],
      ["انتريه مكتب مريح", "Comfort Office Sofa"],
      ["طقم انتريه مكتبي", "Complete Office Sofa Set"],
    ],
  },

  {
    key: "working-stations",
    ar: "خلايا العمل",
    en: "Working Stations",
    imageType: "office",
    count: 10,
    products: [
      ["خلية عمل فردية", "Single Workstation"],
      ["خلية عمل ثنائية", "Double Workstation"],
      ["خلية عمل رباعية", "Four Person Workstation"],
      ["خلية عمل سداسية", "Six Person Workstation"],
      ["خلية عمل مودرن", "Modern Workstation"],
      ["خلية عمل إدارية", "Executive Workstation"],
      ["خلية عمل مفتوحة", "Open Workstation"],
      ["خلية عمل مع فاصل", "Workstation With Divider"],
      ["خلية عمل خشبية", "Wooden Workstation"],
      ["خلية عمل احترافية", "Professional Workstation"],
    ],
  },

  {
    key: "reception-desks",
    ar: "كاونتر استقبال",
    en: "Reception Desks",
    imageType: "reception",
    count: 8,
    products: [
      ["كاونتر استقبال مودرن", "Modern Reception Desk"],
      ["كاونتر استقبال خشبي", "Wooden Reception Desk"],
      ["كاونتر استقبال كبير", "Large Reception Desk"],
      ["كاونتر استقبال صغير", "Compact Reception Desk"],
      ["كاونتر استقبال فاخر", "Premium Reception Desk"],
      ["كاونتر استقبال مضيء", "LED Reception Desk"],
      ["كاونتر استقبال إداري", "Executive Reception Desk"],
      ["كاونتر استقبال حرف L", "L Shape Reception Desk"],
    ],
  },

  {
    key: "meeting-tables",
    ar: "ترابيزات اجتماعات",
    en: "Meeting Tables",
    imageType: "meeting",
    count: 8,
    products: [
      ["ترابيزة اجتماعات 6 أفراد", "6 Person Meeting Table"],
      ["ترابيزة اجتماعات 8 أفراد", "8 Person Meeting Table"],
      ["ترابيزة اجتماعات 10 أفراد", "10 Person Meeting Table"],
      ["ترابيزة اجتماعات 12 فرد", "12 Person Meeting Table"],
      ["ترابيزة اجتماعات مودرن", "Modern Meeting Table"],
      ["ترابيزة اجتماعات خشبية", "Wooden Meeting Table"],
      ["ترابيزة اجتماعات بيضاوية", "Oval Meeting Table"],
      ["ترابيزة اجتماعات فاخرة", "Premium Meeting Table"],
    ],
  },

  {
    key: "office-furniture-accessories",
    ar: "إكسسوارات الأثاث المكتبي",
    en: "Office Furniture Accessories",
    imageType: "accessories",
    count: 8,
    products: [
      ["وحدة أدراج مكتبية", "Office Drawer Unit"],
      ["وحدة تخزين مكتبية", "Office Storage Unit"],
      ["رف مكتبي خشبي", "Wooden Office Shelf"],
      ["حامل ملفات مكتبي", "Office File Holder"],
      ["وحدة ملفات متحركة", "Mobile Filing Cabinet"],
      ["دولاب ملفات مكتبي", "Office Filing Cabinet"],
      ["طاولة جانبية مكتبية", "Office Side Table"],
      ["وحدة تخزين جانبية", "Side Storage Cabinet"],
    ],
  },
];

const adjectives = [
  ["مودرن", "Modern"],
  ["احترافي", "Professional"],
  ["فاخر", "Premium"],
  ["عملي", "Practical"],
  ["متطور", "Advanced"],
];

const colors = [
  {
    ar: "أسود",
    en: "Black",
    hex: "#111111",
  },
  {
    ar: "أبيض",
    en: "White",
    hex: "#FFFFFF",
  },
  {
    ar: "رمادي",
    en: "Gray",
    hex: "#808080",
  },
  {
    ar: "بني",
    en: "Brown",
    hex: "#6B4423",
  },
  {
    ar: "بيج",
    en: "Beige",
    hex: "#D8C3A5",
  },
];

const brands = [
  ["Touch Wood", "تاتش وود"],
  ["Touch Wood Pro", "تاتش وود برو"],
  ["Touch Wood Office", "تاتش وود أوفيس"],
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getImage(type, index) {
  const pool = imagePool[type] || imagePool.office;
  return `${pool[index % pool.length]}?auto=format&fit=crop&w=1200&q=80`;
}

function createMedia(type, index, arName, enName) {
  const url = getImage(type, index);

  return [
    {
      type: "image",
      url,
      storageKey: "",
      thumbnail: url,
      alt: {
        ar: arName,
        en: enName,
      },
      sortOrder: 0,
      isPrimary: true,
    },
  ];
}

function createSpecifications(categoryKey, index) {
  const base = [
    {
      label: {
        ar: "الخامة",
        en: "Material",
      },
      value: {
        ar: index % 2 === 0 ? "خشب MDF ومعدن" : "خشب عالي الجودة",
        en: index % 2 === 0 ? "MDF Wood And Metal" : "High Quality Wood",
      },
    },
    {
      label: {
        ar: "اللون",
        en: "Color",
      },
      value: {
        ar: colors[index % colors.length].ar,
        en: colors[index % colors.length].en,
      },
    },
    {
      label: {
        ar: "الاستخدام",
        en: "Usage",
      },
      value: {
        ar: "مكاتب وشركات",
        en: "Offices And Companies",
      },
    },
  ];

  if (
    categoryKey.includes("chair")
  ) {
    base.push({
      label: {
        ar: "الارتفاع",
        en: "Height",
      },
      value: {
        ar: "قابل للتعديل",
        en: "Adjustable",
      },
    });
  }

  return base;
}

function createProduct(category, productInfo, index, globalIndex) {
  const [baseAr, baseEn] = productInfo;

  const adjective = adjectives[globalIndex % adjectives.length];

  const arName =
    globalIndex % 3 === 0
      ? `${baseAr} ${adjective[0]}`
      : baseAr;

  const enName =
    globalIndex % 3 === 0
      ? `${adjective[1]} ${baseEn}`
      : baseEn;

  const priceRanges = {
    "computer-tables": [2500, 7500],
    "mesh-chairs": [1800, 6500],
    "leather-chairs": [2800, 8500],
    "bar-chairs": [1400, 4200],
    "laboratory-chairs": [1200, 3500],
    "office-seating-sets": [6500, 18000],
    "working-stations": [4500, 14000],
    "reception-desks": [6500, 22000],
    "meeting-tables": [5500, 18000],
    "office-furniture-accessories": [900, 5500],
  };

  const [minPrice, maxPrice] =
    priceRanges[category.key] || [1500, 7000];

  const steps = Math.max(
    1,
    Math.floor((maxPrice - minPrice) / 12)
  );

  const price =
    Math.round(
      (minPrice + ((globalIndex * 7) % 12) * steps) / 50
    ) * 50;

  const oldPrice =
    Math.round((price * (1.15 + (index % 4) * 0.05)) / 50) * 50;

  const color = colors[globalIndex % colors.length];

  const badgeIndex = globalIndex % 7;

  let badge = {
    ar: "",
    en: "",
  };

  if (badgeIndex === 0) {
    badge = {
      ar: "الأكثر مبيعًا",
      en: "Best Seller",
    };
  }

  if (badgeIndex === 1) {
    badge = {
      ar: "جديد",
      en: "New",
    };
  }

  if (badgeIndex === 2) {
    badge = {
      ar: "عرض خاص",
      en: "Special Offer",
    };
  }

  const brand = brands[globalIndex % brands.length];

  const slug = `${slugify(enName)}-${category.key}-${globalIndex + 1}`;

  return {
    name: {
      ar: arName,
      en: enName,
    },

    description: {
      ar: `${arName} من منتجات تاتش وود للأثاث المكتبي، تصميم عملي وأنيق مناسب للمكاتب والشركات ومساحات العمل الحديثة.`,
      en: `${enName} from Touch Wood office furniture, featuring a practical and elegant design suitable for offices, companies and modern workspaces.`,
    },

    slug,

    category: category.key,

    price,

    oldPrice,

    serialNumber: `TW-${String(globalIndex + 1).padStart(4, "0")}`,

    media: createMedia(
      category.imageType,
      globalIndex,
      arName,
      enName
    ),

    colors: [
      {
        name: {
          ar: color.ar,
          en: color.en,
        },
        hex: color.hex,
        stock: 3 + (globalIndex % 15),
        serialNumber: `TW-${String(globalIndex + 1).padStart(4, "0")}-C1`,
        media: [],
      },
    ],

    stock: 5 + (globalIndex % 30),

    specifications: createSpecifications(
      category.key,
      globalIndex
    ),

    featured: globalIndex % 10 === 0,

    badge,

    rating: Number(
      (3.8 + ((globalIndex * 7) % 12) / 10).toFixed(1)
    ),

    reviewsCount: globalIndex % 9 === 0
      ? 0
      : 3 + (globalIndex % 35),

    active: true,

    brand: brand[0],
  };
}

const products = [];

let globalIndex = 0;

for (const category of categories) {
  for (const productInfo of category.products) {
    if (products.length >= 100) {
      break;
    }

    products.push(
      createProduct(
        category,
        productInfo,
        products.length,
        globalIndex
      )
    );

    globalIndex++;
  }

  if (products.length >= 100) {
    break;
  }
}

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    await Product.deleteMany({});

    console.log("Old products deleted.");

    const createdProducts =
      await Product.insertMany(products);

    console.log(
      `${createdProducts.length} products inserted successfully.`
    );

    const categoryStats = {};

    for (const product of createdProducts) {
      categoryStats[product.category] =
        (categoryStats[product.category] || 0) + 1;
    }

    console.log("\nProducts by category:");

    console.table(categoryStats);

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);

    process.exit(1);
  }
}

seedProducts();