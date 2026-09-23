import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";

dotenv.config();

const products = [
  {
    name: "Dymatize Iso100 Hydrolyzed-2.3KG.-71Serv. strawberry",
    description:
      "Dymatize ISO100 Hydrolyzed Whey Protein Isolate is one of the world's fastest absorbing proteins. It helps support muscle recovery, lean muscle growth and post-workout performance.",
    price: 5550,
    oldPrice: 6800,
    category: "Protein",
    brand: "Dymatize",
    flavor: "Strawberry",
    weight: "2.3 KG",
    servings: "71 Servings",
    image: "/images/products/whey2.jpg",
    gallery: [
      "/images/products/whey2.jpg",
      "/images/products/whey2.jpg",
      "/images/products/whey2.jpg",
    ],
    stock: 20,
    featured: true,
    rating: 4,
    reviewsCount: 0,
    badge: "Best Seller",
    benefits: [
      "25g Protein per Serving",
      "Hydrolyzed Whey Isolate",
      "Fast Absorption",
      "Low Sugar",
      "Gluten Free",
    ],
    ingredients: [
      "Hydrolyzed Whey Protein Isolate",
      "Natural & Artificial Flavors",
      "Salt",
      "Sucralose",
      "Soy Lecithin",
    ],
  },

  {
    name: "Big Ramy Labs Red Rex Creatine -60Serv.-300G. -No Flavor",
    description:
      "Red Rex Creatine Monohydrate helps increase strength, power and muscle performance during high-intensity workouts.",
    price: 950,
    oldPrice: 1100,
    category: "Creatine",
    brand: "Big Ramy Labs",
    flavor: "Unflavored",
    weight: "300 G",
    servings: "60 Servings",
    image: "/images/products/creatine2.jpg",
    gallery: [
      "/images/products/creatine2.jpg",
      "/images/products/creatine2.jpg",
      "/images/products/creatine2.jpg",
    ],
    stock: 20,
    featured: true,
    rating: 4,
    reviewsCount: 0,
    badge: "New",
    benefits: [
      "100% Creatine Monohydrate",
      "Improves Strength",
      "Supports Muscle Recovery",
      "Unflavored",
      "Easy To Mix",
    ],
    ingredients: [
      "Creatine Monohydrate",
    ],
  },

  {
    name: "Optimum Nutrition, Gold Standard® 100% Whey, Strawberry Banana, 5 lb",
    description:
      "Gold Standard 100% Whey is one of the world's best-selling protein powders, delivering premium whey protein for muscle growth and recovery.",
    price: 5400,
    oldPrice: 6500,
    category: "Protein",
    brand: "Optimum Nutrition",
    flavor: "Strawberry Banana",
    weight: "5 lb",
    servings: "74 Servings",
    image: "/images/products/whey.jpg",
    gallery: [
      "/images/products/whey.jpg",
      "/images/products/whey.jpg",
      "/images/products/whey.jpg",
    ],
    stock: 20,
    featured: true,
    rating: 5,
    reviewsCount: 0,
    badge: "",
    benefits: [
      "24g Protein",
      "5.5g BCAAs",
      "Fast Recovery",
      "Great Taste",
      "Low Sugar",
    ],
    ingredients: [
      "Whey Protein Isolate",
      "Whey Protein Concentrate",
      "Natural & Artificial Flavors",
      "Lecithin",
      "Sucralose",
    ],
  },

  {
    name: "Alpha Man Multi-Vitamin + Testosterone Support Muscleseed 60 Tablet",
    description:
      "Daily multivitamin formula designed to support overall health, energy production and natural testosterone levels.",
    price: 525,
    oldPrice: 635,
    category: "Vitamins",
    brand: "Muscleseed",
    flavor: "Tablets",
    weight: "60 Tablets",
    servings: "60 Servings",
    image: "/images/products/vitamin.jpg",
    gallery: [
      "/images/products/vitamin.jpg",
      "/images/products/vitamin.jpg",
      "/images/products/vitamin.jpg",
    ],
    stock: 20,
    featured: true,
    rating: 5,
    reviewsCount: 0,
    badge: "Best Seller",
    benefits: [
      "Supports Immunity",
      "Daily Vitamins",
      "Mineral Blend",
      "Energy Support",
      "Testosterone Support",
    ],
    ingredients: [
      "Vitamin A",
      "Vitamin C",
      "Vitamin D3",
      "Zinc",
      "Magnesium",
    ],
  },

  {
    name: "Optimum Nutrition Serious Mass-16Serv.-5.4KG",
    description:
      "Serious Mass is a high-calorie weight gainer designed to help athletes and hard gainers increase muscle size and body weight.",
    price: 5850,
    oldPrice: 7200,
    category: "Mass Gainer",
    brand: "Optimum Nutrition",
    flavor: "Chocolate",
    weight: "5.4 KG",
    servings: "16 Servings",
    image: "/images/products/mass1.jpg",
    gallery: [
      "/images/products/mass1.jpg",
      "/images/products/mass1.jpg",
      "/images/products/mass1.jpg",
    ],
    stock: 20,
    featured: true,
    rating: 5,
    reviewsCount: 0,
    badge: "Low Stock",
    benefits: [
      "1250 Calories",
      "50g Protein",
      "250g Carbohydrates",
      "Added Vitamins",
      "Muscle Growth Support",
    ],
    ingredients: [
      "Protein Blend",
      "Maltodextrin",
      "Cocoa Powder",
      "Vitamin Blend",
      "Minerals",
    ],
  },

  {
    name: "DY Nutrition Monohydrate Creatine 60 Servings",
    description:
      "Premium creatine monohydrate formula to increase strength, endurance and workout performance.",
    price: 1450,
    oldPrice: 1890,
    category: "Creatine",
    brand: "DY Nutrition",
    flavor: "Unflavored",
    weight: "300 G",
    servings: "60 Servings",
    image: "/images/products/creatine.jpg",
    gallery: [
      "/images/products/creatine.jpg",
      "/images/products/creatine.jpg",
      "/images/products/creatine.jpg",
    ],
    stock: 20,
    featured: true,
    rating: 4,
    reviewsCount: 0,
    badge: "New",
    benefits: [
      "Pure Creatine",
      "Improves Strength",
      "Supports Recovery",
      "60 Servings",
      "Easy Mixing",
    ],
    ingredients: [
      "Creatine Monohydrate",
    ],
  },

  {
    name: "Cellucor C4 Ultimate Pre Workout Powder ICY Blue Razz",
    description:
      "C4 Ultimate is an advanced pre-workout formula designed to increase focus, energy and workout intensity.",
    price: 1150,
    oldPrice: 1600,
    category: "Pre Workout",
    brand: "Cellucor",
    flavor: "Icy Blue Razz",
    weight: "390 G",
    servings: "20 Servings",
    image: "/images/products/pre-workout.jpg",
    gallery: [
      "/images/products/pre-workout.jpg",
      "/images/products/pre-workout.jpg",
      "/images/products/pre-workout.jpg",
    ],
    stock: 20,
    featured: true,
    rating: 4,
    reviewsCount: 0,
    badge: "Hot",
    benefits: [
      "Energy Boost",
      "Mental Focus",
      "Performance Support",
      "Enhanced Pumps",
      "Explosive Workouts",
    ],
    ingredients: [
      "Caffeine",
      "Beta Alanine",
      "Citrulline",
      "Creatine Nitrate",
      "Tyrosine",
    ],
  },

  {
    name: "Muscleseeds Ultra Seed Mass Gainer-15Serv.-2.250G",
    description:
      "Ultra Seed Mass Gainer provides high calories, quality protein and carbohydrates to support healthy weight gain and muscle growth.",
    price: 990,
    oldPrice: 1300,
    category: "Mass Gainer",
    brand: "Muscleseeds",
    flavor: "Chocolate",
    weight: "2.250 KG",
    servings: "15 Servings",
    image: "/images/products/mass-gainer.jpg",
    gallery: [
      "/images/products/mass-gainer.jpg",
      "/images/products/mass-gainer.jpg",
      "/images/products/mass-gainer.jpg",
    ],
    stock: 20,
    featured: true,
    rating: 5,
    reviewsCount: 0,
    badge: "",
    benefits: [
      "High Calories",
      "Protein Blend",
      "Fast Recovery",
      "Weight Gain Support",
      "Great Taste",
    ],
    ingredients: [
      "Protein Blend",
      "Carbohydrates",
      "Cocoa Powder",
      "Vitamin Blend",
      "Minerals",
    ],
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

   await Product.deleteMany({});

console.log("Old products deleted.");

    const createdProducts = await Product.insertMany(products);

    console.log(
      `${createdProducts.length} products inserted successfully.`
    );

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedProducts();