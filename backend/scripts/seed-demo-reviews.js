import "dotenv/config";
import mongoose from "mongoose";

import Product from "../models/Product.js";
import DemoReview from "../models/DemoReview.js";

const MIN_REVIEWS_PER_PRODUCT = 2;
const MAX_REVIEWS_PER_PRODUCT = 4;

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
  {
    ar: "طارق عادل",
    en: "Tarek Adel",
  },
  {
    ar: "ريم حسام",
    en: "Reem Hossam",
  },
  {
    ar: "زياد سامح",
    en: "Ziad Sameh",
  },
  {
    ar: "دينا وائل",
    en: "Dina Wael",
  },
];

const arabicComments = [
  "الخامة ممتازة والتشطيب نظيف جدًا، والمنتج شكله أنيق في المكان.",
  "المنتج مريح للاستخدام اليومي، والتصميم عملي ومناسب للمساحة.",
  "الجودة أفضل مما توقعت، والخامات تبدو قوية وتتحمل الاستخدام.",
  "اللون مطابق للصور تقريبًا، والتفاصيل النهائية جميلة جدًا.",
  "التجميع كان سهلًا والتعليمات واضحة، والمنتج مستقر بعد التركيب.",
  "المنتج مناسب للعمل لفترات طويلة، خصوصًا من ناحية الراحة والتصميم.",
  "الخامة جيدة جدًا مقارنة بالسعر، والشكل النهائي يعطي إحساسًا بالجودة.",
  "التغليف كان جيدًا والمنتج وصل دون أي تلف أو خدوش.",
  "التوصيل كان سريعًا، والمنتج وصل بحالة ممتازة.",
  "التصميم عصري ويناسب المكتب والمنزل في نفس الوقت.",
  "المنتج متين ولا يتحرك بسهولة، وهذا أكثر شيء أعجبني فيه.",
  "الحجم مناسب كما هو موضح في الوصف، ولم أواجه مشكلة في المساحة.",
  "التشطيب جيد والحواف ناعمة، والمنتج يبدو متقن الصنع.",
  "تجربة جيدة جدًا، والمنتج مطابق للمواصفات الموجودة على الموقع.",
  "المنتج مريح وشكله جميل، وأعتقد أنه مناسب للاستخدام المتكرر.",
  "الخامات قوية والتفاصيل واضحة، والمنتج يبدو عمليًا لفترة طويلة.",
  "الطلب كان منظمًا والتواصل بخصوص التوصيل كان جيدًا.",
  "أعجبني توازن التصميم بين الشكل الأنيق والاستخدام العملي.",
  "المنتج سهل التنظيف ومناسب للاستخدام اليومي.",
  "الجودة جيدة جدًا، والمنتج أعطى شكلًا أفضل للمكان.",
  "المنتج ثابت ومتين، ولم ألاحظ أي مشكلة بعد الاستخدام.",
  "التفاصيل النهائية جيدة جدًا، خاصة التشطيب وجودة الخامة.",
  "وصل المنتج في الموعد المتوقع وكان التغليف مناسبًا.",
  "المنتج مريح والتصميم يساعد على استخدامه لفترات طويلة.",
  "اختيار موفق، الخامة والتصميم أفضل من المنتجات التي جربتها سابقًا.",
];

const englishComments = [
  "Excellent material quality and clean finishing. It looks elegant in the room.",
  "The product is comfortable for daily use and has a very practical design.",
  "The quality exceeded my expectations. The materials feel strong and durable.",
  "The color is very close to the pictures, and the finishing details look great.",
  "Assembly was easy, and the instructions were clear and helpful.",
  "Very suitable for long working hours because of its comfort and design.",
  "The materials are very good for the price, and the final look feels premium.",
  "The packaging was good, and the product arrived without any damage.",
  "Fast delivery and the product arrived in excellent condition.",
  "A modern design that works well for both home and office spaces.",
  "The product feels stable and durable, which I liked the most.",
  "The size matches the description and fits the space perfectly.",
  "Good finishing and smooth edges. The product feels well made.",
  "A very good experience. The product matched the website description.",
  "Comfortable, attractive, and suitable for frequent daily use.",
  "Strong materials and thoughtful details. It feels built to last.",
  "The ordering process was smooth, and delivery communication was good.",
  "I like the balance between the elegant appearance and practical use.",
  "Easy to clean and suitable for everyday use.",
  "Very good quality, and it improved the overall look of the room.",
  "The product is stable and durable, with no issues after use.",
  "The finishing details are impressive, especially the material quality.",
  "The product arrived within the expected delivery time and was well packed.",
  "Comfortable design that works well for extended periods of use.",
  "A great choice. The quality and design are better than similar products.",
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

function createReviewData(productId, language) {
  const selectedName = randomItem(egyptianNames);

  const comment =
    language === "ar"
      ? randomItem(arabicComments)
      : randomItem(englishComments);

  return {
    product: productId,

    name:
      language === "ar"
        ? selectedName.ar
        : selectedName.en,

    nameAr: selectedName.ar,

    nameEn: selectedName.en,

    rating: randomInteger(4, 5),

    comment,

    language,

    isDemo: true,
  };
}

async function seedDemoReviews() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_DEMO_REVIEW_SEED !== "true"
  ) {
    throw new Error(
      "Demo reviews are blocked in production unless explicitly enabled.",
    );
  }

  if (!process.env.MONGO_URI) {
    throw new Error(
      "MONGO_URI is missing from environment variables.",
    );
  }

  await mongoose.connect(process.env.MONGO_URI);

  console.log("Connected to MongoDB.");

  const products = await Product.find({})
    .select("_id name")
    .lean();

  if (!products.length) {
    console.log("No products found. Nothing to seed.");
    return;
  }

  const existingDemoReviewsCount =
    await DemoReview.countDocuments({
      isDemo: true,
    });

  if (existingDemoReviewsCount > 0) {
    console.log(
      `Seeding cancelled: ${existingDemoReviewsCount} demo reviews already exist.`,
    );

    return;
  }

  const reviews = [];

  let arabicCount = 0;
  let englishCount = 0;

  for (const product of shuffle(products)) {
    const reviewCount = randomInteger(
      MIN_REVIEWS_PER_PRODUCT,
      MAX_REVIEWS_PER_PRODUCT,
    );

    const languages = shuffle(
      Array.from(
        { length: reviewCount },
        (_, index) =>
          index % 2 === 0 ? "ar" : "en",
      ),
    );

    for (const language of languages) {
      reviews.push(
        createReviewData(product._id, language),
      );

      if (language === "ar") {
        arabicCount += 1;
      } else {
        englishCount += 1;
      }
    }
  }

  await DemoReview.insertMany(reviews);

  console.log(
    `Successfully created ${reviews.length} demo reviews.`,
  );

  console.log(`Arabic reviews: ${arabicCount}`);
  console.log(`English reviews: ${englishCount}`);
  console.log(`Products processed: ${products.length}`);
}

async function run() {
  try {
    await seedDemoReviews();
  } catch (error) {
    console.error(
      "Failed to seed demo reviews:",
      error,
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

run();