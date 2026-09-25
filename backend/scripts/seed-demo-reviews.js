import "dotenv/config";
import mongoose from "mongoose";

import Product from "../models/Product.js";
import DemoReview from "../models/DemoReview.js";

const TOTAL_DEMO_REVIEWS = 30;

const egyptianNames = [
  {
    ar: "أحمد محمد",
    en: "Ahmed Mohamed",
  },
  {
    ar: "محمود حسن",
    en: "Mahmoud Hassan",
  },
  {
    ar: "محمد السيد",
    en: "Mohamed El Sayed",
  },
  {
    ar: "عمر إبراهيم",
    en: "Omar Ibrahim",
  },
  {
    ar: "يوسف خالد",
    en: "Youssef Khaled",
  },
  {
    ar: "كريم أشرف",
    en: "Karim Ashraf",
  },
  {
    ar: "مصطفى علي",
    en: "Mostafa Ali",
  },
  {
    ar: "سارة أحمد",
    en: "Sara Ahmed",
  },
  {
    ar: "مريم محمود",
    en: "Mariam Mahmoud",
  },
  {
    ar: "نور محمد",
    en: "Nour Mohamed",
  },
  {
    ar: "منة الله حسن",
    en: "Menna Allah Hassan",
  },
  {
    ar: "آية خالد",
    en: "Aya Khaled",
  },
  {
    ar: "عبد الرحمن سامي",
    en: "Abdelrahman Samy",
  },
  {
    ar: "ندى مصطفى",
    en: "Nada Mostafa",
  },
  {
    ar: "إسلام فتحي",
    en: "Islam Fathy",
  },
  {
    ar: "هبة وليد",
    en: "Heba Waleed",
  },
];

const arabicComments = [
  "الخامة ممتازة جدًا والتشطيب واضح أنه بجودة عالية.",
  "المنتج متين ومريح والتصميم جميل جدًا.",
  "الجودة ممتازة والمنتج مطابق للصور الموجودة على الموقع.",
  "الكرسي مريح جدًا والخامة تبدو قوية وتتحمل الاستخدام اليومي.",
  "التصميم أنيق ويناسب ديكور المنزل بشكل رائع.",
  "المنتج أفضل مما توقعت، والتفاصيل والتشطيب ممتازان.",
  "الخامات جيدة جدًا والتجميع كان سهلًا.",
  "تجربة شراء ممتازة، والمنتج وصل بحالة جيدة جدًا.",
  "المنتج عملي ومتين وشكله أجمل على الطبيعة.",
  "جودة ممتازة مقابل السعر وأنصح بتجربته.",
  "التغليف كان جيدًا والمنتج وصل بدون أي مشاكل.",
  "المنتج مريح جدًا ومناسب للاستخدام لفترات طويلة.",
  "الخامة قوية والتصميم عصري وأنيق.",
  "راضٍ جدًا عن المنتج، والجودة واضحة في كل التفاصيل.",
  "الطلب وصل بسرعة والمنتج مطابق للوصف.",
];

const englishComments = [
  "Excellent material quality and very good finishing.",
  "The product is durable, comfortable, and beautifully designed.",
  "Great quality and exactly as shown in the pictures.",
  "The chair is very comfortable and feels strong and durable.",
  "Elegant design that fits perfectly with the room.",
  "The product exceeded my expectations. Excellent finishing.",
  "Very good materials and easy assembly.",
  "Great shopping experience. The product arrived in perfect condition.",
  "Practical, durable, and even better in person.",
  "Excellent quality for the price. Highly recommended.",
  "The packaging was good and the product arrived safely.",
  "Very comfortable and suitable for long hours of use.",
  "Strong material with a modern and elegant design.",
  "Very satisfied with the quality and overall finishing.",
  "Fast delivery and the product matched the description.",
];

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function createReviewData(productId, index) {
  const name = randomItem(egyptianNames);

  const language = index % 2 === 0 ? "ar" : "en";

  const comment =
    language === "ar"
      ? randomItem(arabicComments)
      : randomItem(englishComments);

  return {
    product: productId,

    name: language === "ar" ? name.ar : name.en,

    nameAr: name.ar,

    nameEn: name.en,

    rating: randomInteger(4, 5),

    comment,

    language,

    isDemo: true,
  };
}

async function seedDemoReviews() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Demo reviews cannot be seeded while NODE_ENV=production."
    );
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from environment variables.");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("Connected to MongoDB.");

  const products = await Product.find({})
    .select("_id name")
    .lean();

  if (!products.length) {
    console.log("No products found. Nothing to seed.");
    return;
  }

  const existingDemoReviewsCount = await DemoReview.countDocuments({
    isDemo: true,
  });

  if (existingDemoReviewsCount > 0) {
    console.log(
      `Seeding cancelled: ${existingDemoReviewsCount} demo reviews already exist.`
    );

    return;
  }

  const shuffledProducts = shuffle(products);

  const reviews = [];

  for (let index = 0; index < TOTAL_DEMO_REVIEWS; index += 1) {
    const product =
      shuffledProducts[index % shuffledProducts.length];

    reviews.push(createReviewData(product._id, index));
  }

  await DemoReview.insertMany(reviews);

  const distribution = {};

  for (const review of reviews) {
    const productId = String(review.product);

    distribution[productId] = (distribution[productId] || 0) + 1;
  }

  console.log(
    `Successfully created ${reviews.length} demo reviews.`
  );

  console.log("Reviews distribution by product:");

  for (const [productId, count] of Object.entries(distribution)) {
    console.log(`Product ${productId}: ${count} reviews`);
  }
}

async function run() {
  try {
    await seedDemoReviews();
  } catch (error) {
    console.error("Failed to seed demo reviews:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

run();