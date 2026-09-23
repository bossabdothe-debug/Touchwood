
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const imagePools = {
  "computer-desks": [
    "https://images.unsplash.com/photo-1778287527407-1dc5ce1aa8e8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1767786330387-5cef0327b6c1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1772164585108-f391c1b1771a?auto=format&fit=crop&w=1200&q=80",
  ],

  chairs: [
    "https://images.unsplash.com/photo-1782080163196-26ed8ea266d7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1786456805212-47324cf7cb5c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1774853114355-1ac941f85397?auto=format&fit=crop&w=1200&q=80",
  ],

  "office-sofas": [
    "https://images.unsplash.com/photo-1774853114355-1ac941f85397?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1772164585108-f391c1b1771a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1767786330387-5cef0327b6c1?auto=format&fit=crop&w=1200&q=80",
  ],

  "work-cells": [
    "https://images.unsplash.com/photo-1772164585108-f391c1b1771a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1767786330387-5cef0327b6c1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1778287527407-1dc5ce1aa8e8?auto=format&fit=crop&w=1200&q=80",
  ],

  "reception-counters": [
    "https://images.unsplash.com/photo-1767786330387-5cef0327b6c1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1778287527407-1dc5ce1aa8e8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1772164585108-f391c1b1771a?auto=format&fit=crop&w=1200&q=80",
  ],

  "meeting-tables": [
    "https://images.unsplash.com/photo-1782080163196-26ed8ea266d7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1772164585108-f391c1b1771a?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1767786330387-5cef0327b6c1?auto=format&fit=crop&w=1200&q=80",
  ],

  "office-accessories": [
    "https://images.unsplash.com/photo-1767786330387-5cef0327b6c1?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1778287527407-1dc5ce1aa8e8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1772164585108-f391c1b1771a?auto=format&fit=crop&w=1200&q=80",
  ],
};

const categories = [
  {
    key: "computer-desks",
    names: [
      ["مكتب مدير كلاسيك", "Classic Executive Desk"],
      ["مكتب مدير مودرن", "Modern Executive Desk"],
      ["مكتب مدير خشبي", "Wooden Executive Desk"],
      ["مكتب عمل احترافي", "Professional Work Desk"],
      ["مكتب كمبيوتر إداري", "Executive Computer Desk"],
      ["مكتب موظف مفرد", "Single Employee Desk"],
      ["مكتب موظفين مزدوج", "Double Employee Desk"],
      ["مكتب زاوية إداري", "Executive Corner Desk"],
      ["مكتب كمبيوتر مودرن", "Modern Computer Desk"],
      ["مكتب عمل بسيط", "Simple Work Desk"],
      ["مكتب مدير فاخر", "Luxury Executive Desk"],
      ["مكتب موظف عملي", "Practical Employee Desk"],
      ["مكتب استقبال مكتبي", "Office Reception Desk"],
      ["مكتب عمل خشبي", "Wooden Work Desk"],
      ["مكتب إداري كبير", "Large Administrative Desk"],
    ],
  },

  {
    key: "chairs",
    names: [
      ["كرسي مكتب تنفيذي", "Executive Office Chair"],
      ["كرسي مدير فاخر", "Luxury Manager Chair"],
      ["كرسي موظف مودرن", "Modern Employee Chair"],
      ["كرسي مكتب شبكي", "Mesh Office Chair"],
      ["كرسي مكتب جلد", "Leather Office Chair"],
      ["كرسي اجتماعات", "Meeting Chair"],
      ["كرسي انتظار", "Waiting Chair"],
      ["كرسي مدير عالي الظهر", "High Back Manager Chair"],
      ["كرسي موظف مريح", "Comfort Employee Chair"],
      ["كرسي مكتب متحرك", "Mobile Office Chair"],
      ["كرسي اجتماعات فاخر", "Luxury Meeting Chair"],
      ["كرسي مكتب اقتصادي", "Economy Office Chair"],
      ["كرسي زائر", "Visitor Chair"],
      ["كرسي مكتب احترافي", "Professional Office Chair"],
      ["كرسي مدير مودرن", "Modern Manager Chair"],
    ],
  },

  {
    key: "office-sofas",
    names: [
      ["انتريه مكتبي فاخر", "Luxury Office Sofa"],
      ["انتريه مكتبي مودرن", "Modern Office Sofa"],
      ["كنبة مكتب ثلاثية", "Three Seat Office Sofa"],
      ["كنبة مكتب ثنائية", "Two Seat Office Sofa"],
      ["كرسي استقبال فاخر", "Luxury Reception Sofa"],
      ["انتريه استقبال", "Reception Sofa Set"],
      ["كنبة جلد مكتبية", "Leather Office Sofa"],
      ["انتريه رمادي مودرن", "Modern Gray Sofa Set"],
      ["انتريه بيج مكتبي", "Beige Office Sofa Set"],
      ["كنبة انتظار مكتبية", "Office Waiting Sofa"],
      ["انتريه مديرين", "Executive Sofa Set"],
      ["كنبة اجتماعات", "Meeting Room Sofa"],
      ["انتريه استقبال فاخر", "Luxury Reception Set"],
      ["كنبة مكتبية عصرية", "Contemporary Office Sofa"],
      ["انتريه شركات", "Corporate Office Sofa Set"],
    ],
  },

  {
    key: "work-cells",
    names: [
      ["خلية عمل مكتبية", "Office Work Cell"],
      ["خلية عمل فردية", "Single Work Cell"],
      ["خلية عمل مزدوجة", "Double Work Cell"],
      ["خلية عمل رباعية", "Four Person Work Cell"],
      ["خلية موظفين مودرن", "Modern Employee Work Cell"],
      ["خلية عمل مفتوحة", "Open Work Cell"],
      ["خلية عمل مغلقة", "Closed Work Cell"],
      ["خلية عمل خشبية", "Wooden Work Cell"],
      ["خلية عمل إدارية", "Administrative Work Cell"],
      ["خلية عمل احترافية", "Professional Work Cell"],
      ["خلية عمل للشركات", "Corporate Work Cell"],
      ["خلية عمل اقتصادية", "Economy Work Cell"],
      ["خلية عمل كبيرة", "Large Work Cell"],
      ["خلية عمل مودرن", "Modern Work Cell"],
    ],
  },

  {
    key: "reception-counters",
    names: [
      ["كاونتر استقبال مودرن", "Modern Reception Counter"],
      ["كاونتر استقبال فاخر", "Luxury Reception Counter"],
      ["كاونتر استقبال خشبي", "Wooden Reception Counter"],
      ["كاونتر استقبال شركات", "Corporate Reception Counter"],
      ["كاونتر استقبال عيادات", "Clinic Reception Counter"],
      ["كاونتر استقبال صغير", "Small Reception Counter"],
      ["كاونتر استقبال كبير", "Large Reception Counter"],
      ["كاونتر استقبال حرف L", "L Shape Reception Counter"],
      ["كاونتر استقبال مزدوج", "Double Reception Counter"],
      ["كاونتر استقبال إداري", "Administrative Reception Counter"],
      ["كاونتر استقبال أبيض", "White Reception Counter"],
      ["كاونتر استقبال أسود", "Black Reception Counter"],
      ["كاونتر استقبال خشب ومعدن", "Wood and Metal Reception Counter"],
      ["كاونتر استقبال احترافي", "Professional Reception Counter"],
    ],
  },

  {
    key: "meeting-tables",
    names: [
      ["ترابيزة اجتماعات كبيرة", "Large Meeting Table"],
      ["ترابيزة اجتماعات مودرن", "Modern Meeting Table"],
      ["ترابيزة اجتماعات خشبية", "Wooden Meeting Table"],
      ["ترابيزة اجتماعات صغيرة", "Small Meeting Table"],
      ["ترابيزة اجتماعات مستطيلة", "Rectangular Meeting Table"],
      ["ترابيزة اجتماعات بيضاوية", "Oval Meeting Table"],
      ["ترابيزة اجتماعات دائرية", "Round Meeting Table"],
      ["ترابيزة اجتماعات تنفيذية", "Executive Meeting Table"],
      ["ترابيزة اجتماعات للشركات", "Corporate Meeting Table"],
      ["ترابيزة اجتماعات فاخرة", "Luxury Meeting Table"],
      ["ترابيزة اجتماعات عملية", "Practical Meeting Table"],
      ["ترابيزة اجتماعات مودرن كبيرة", "Large Modern Meeting Table"],
      ["ترابيزة اجتماعات خشب طبيعي", "Natural Wood Meeting Table"],
      ["ترابيزة اجتماعات احترافية", "Professional Meeting Table"],
    ],
  },

  {
    key: "office-accessories",
    names: [
      ["وحدة إكسسوارات مكتبية", "Office Accessories Unit"],
      ["وحدة تخزين مكتبية", "Office Storage Unit"],
      ["وحدة أدراج مكتبية", "Office Drawer Unit"],
      ["دولاب ملفات مكتبي", "Office Filing Cabinet"],
      ["وحدة رفوف مكتبية", "Office Shelving Unit"],
      ["حامل ملفات مكتبي", "Office File Holder"],
      ["وحدة تنظيم المكتب", "Office Organizer Unit"],
      ["دولاب جانبي مكتبي", "Office Side Cabinet"],
      ["وحدة تخزين جانبية", "Side Storage Unit"],
      ["حامل طابعة مكتبي", "Office Printer Stand"],
      ["وحدة مستلزمات مكتبية", "Office Supplies Unit"],
      ["دولاب مستندات", "Document Cabinet"],
      ["وحدة تنظيم ملفات", "File Organization Unit"],
    ],
  },
];

const colors = [
  {
    name: { ar: "أسود", en: "Black" },
    hex: "#181818",
  },
  {
    name: { ar: "بني", en: "Brown" },
    hex: "#6B4532",
  },
  {
    name: { ar: "رمادي", en: "Gray" },
    hex: "#777777",
  },
  {
    name: { ar: "أبيض", en: "White" },
    hex: "#F5F5F5",
  },
  {
    name: { ar: "بيج", en: "Beige" },
    hex: "#C8B99A",
  },
];

const specifications = {
  "computer-desks": [
    {
      label: {
        ar: "الخامة",
        en: "Material",
      },
      value: {
        ar: "خشب MDF عالي الجودة",
        en: "High-quality MDF wood",
      },
    },
    {
      label: {
        ar: "الاستخدام",
        en: "Usage",
      },
      value: {
        ar: "المكاتب الإدارية",
        en: "Administrative offices",
      },
    },
  ],

  chairs: [
    {
      label: {
        ar: "الخامة",
        en: "Material",
      },
      value: {
        ar: "خامات مكتبية عالية الجودة",
        en: "High-quality office materials",
      },
    },
    {
      label: {
        ar: "الاستخدام",
        en: "Usage",
      },
      value: {
        ar: "المكاتب والشركات",
        en: "Offices and companies",
      },
    },
  ],

  "office-sofas": [
    {
      label: {
        ar: "الخامة",
        en: "Material",
      },
      value: {
        ar: "جلد صناعي عالي الجودة",
        en: "High-quality artificial leather",
      },
    },
    {
      label: {
        ar: "الاستخدام",
        en: "Usage",
      },
      value: {
        ar: "الاستقبال والمكاتب",
        en: "Reception areas and offices",
      },
    },
  ],

  "work-cells": [
    {
      label: {
        ar: "التصميم",
        en: "Design",
      },
      value: {
        ar: "تصميم عملي للمساحات المكتبية",
        en: "Practical office workspace design",
      },
    },
    {
      label: {
        ar: "الاستخدام",
        en: "Usage",
      },
      value: {
        ar: "الشركات والمكاتب",
        en: "Companies and offices",
      },
    },
  ],

  "reception-counters": [
    {
      label: {
        ar: "الخامة",
        en: "Material",
      },
      value: {
        ar: "خشب MDF",
        en: "MDF wood",
      },
    },
    {
      label: {
        ar: "الاستخدام",
        en: "Usage",
      },
      value: {
        ar: "استقبال الشركات والعيادات",
        en: "Corporate and clinic reception",
      },
    },
  ],

  "meeting-tables": [
    {
      label: {
        ar: "الخامة",
        en: "Material",
      },
      value: {
        ar: "خشب MDF عالي الجودة",
        en: "High-quality MDF wood",
      },
    },
    {
      label: {
        ar: "الاستخدام",
        en: "Usage",
      },
      value: {
        ar: "غرف الاجتماعات",
        en: "Meeting rooms",
      },
    },
  ],

  "office-accessories": [
    {
      label: {
        ar: "الخامة",
        en: "Material",
      },
      value: {
        ar: "خشب MDF",
        en: "MDF wood",
      },
    },
    {
      label: {
        ar: "الاستخدام",
        en: "Usage",
      },
      value: {
        ar: "تنظيم المكتب",
        en: "Office organization",
      },
    },
  ],
};

const createMedia = (categoryKey, index, nameAr, nameEn) => {
  const pool = imagePools[categoryKey];

  const firstImage = pool[index % pool.length];
  const secondImage = pool[(index + 1) % pool.length];

  return [
    {
      type: "image",
      url: firstImage,
      storageKey: "",
      thumbnail: firstImage,
      alt: {
        ar: nameAr,
        en: nameEn,
      },
      sortOrder: 0,
      isPrimary: true,
    },
    {
      type: "image",
      url: secondImage,
      storageKey: "",
      thumbnail: secondImage,
      alt: {
        ar: `${nameAr} - صورة إضافية`,
        en: `${nameEn} - Additional Image`,
      },
      sortOrder: 1,
      isPrimary: false,
    },
  ];
};

const createProducts = () => {
  const products = [];
  let productNumber = 1;

  for (const category of categories) {
    for (let i = 0; i < category.names.length; i++) {
      const [nameAr, nameEn] = category.names[i];

      const color1 = colors[i % colors.length];
      const color2 = colors[(i + 1) % colors.length];

      const basePrice = {
        "computer-desks": 8500,
        chairs: 3200,
        "office-sofas": 12000,
        "work-cells": 7500,
        "reception-counters": 9000,
        "meeting-tables": 11000,
        "office-accessories": 1800,
      }[category.key];

      const price = basePrice + (i % 5) * 750;
      const oldPrice = price + 1000 + (i % 4) * 500;

      const media = createMedia(
        category.key,
        i,
        nameAr,
        nameEn
      );

      products.push({
        name: {
          ar: nameAr,
          en: nameEn,
        },

        description: {
          ar: `${nameAr} بتصميم عصري وجودة عالية، مناسب للمكاتب والشركات والمساحات الإدارية.`,
          en: `${nameEn} with a modern design and high-quality construction, suitable for offices, companies, and administrative spaces.`,
        },

        slug: `${nameEn
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}-tw-${String(
          productNumber
        ).padStart(3, "0")}`,

        category: category.key,

        price,

        oldPrice,

        serialNumber: `TW-2026-${String(productNumber).padStart(
          3,
          "0"
        )}`,

        stock: 5 + (i % 6) * 5,

        media,

        colors: [
          {
            name: color1.name,
            hex: color1.hex,
            stock: 3 + (i % 5),
            serialNumber: `TW-2026-${String(
              productNumber
            ).padStart(3, "0")}-01`,
            media: [],
          },
          {
            name: color2.name,
            hex: color2.hex,
            stock: 2 + (i % 4),
            serialNumber: `TW-2026-${String(
              productNumber
            ).padStart(3, "0")}-02`,
            media: [],
          },
        ],

        specifications: specifications[category.key],

        featured: productNumber <= 20,

        badge:
          productNumber <= 10
            ? {
                ar: "الأكثر مبيعًا",
                en: "Best Seller",
              }
            : productNumber <= 20
            ? {
                ar: "مميز",
                en: "Featured",
              }
            : {
                ar: "",
                en: "",
              },

        rating: Number(
          (4.2 + (i % 8) * 0.1).toFixed(1)
        ),

        reviewsCount: 5 + (i % 20),

        active: true,
      });

      productNumber++;
    }
  }

  return products;
};

const seed = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI غير موجود في ملف .env"
      );
    }

    const products = createProducts();

    console.log(
      `Preparing ${products.length} products...`
    );

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    await Product.deleteMany({});

    console.log("Old products deleted");

    await Product.insertMany(products);

    console.log(
      `Seed completed successfully: ${products.length} products inserted`
    );

    console.log("\nCategory counts:");

    const categoryCounts = {};

    for (const product of products) {
      categoryCounts[product.category] =
        (categoryCounts[product.category] || 0) + 1;
    }

    Object.entries(categoryCounts).forEach(
      ([category, count]) => {
        console.log(
          `- ${category}: ${count} product(s)`
        );
      }
    );

    console.log(
      `\nProducts with images: ${products.filter(
        (product) => product.media.length > 0
      ).length}`
    );

    await mongoose.connection.close();

    console.log("\nMongoDB connection closed");
  } catch (error) {
    console.error("Seed failed:", error);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
};

seed();

