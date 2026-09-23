"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Edit3,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  createProduct,
  createUploadUrl,
  deleteProduct,
  getProducts,
  updateProduct,
  uploadImageToR2,
} from "@/services/api";

type Localized = {
  ar: string;
  en: string;
};

type Media = {
  type: "image";
  url: string;
  storageKey: string;
  thumbnail: string;
  alt: Localized;
  sortOrder: number;
  isPrimary: boolean;
};

type ProductColor = {
  name: Localized;
  hex: string;
  stock: number;
  serialNumber: string;
  media: Media[];
};

type Product = {
  _id: string;
  name: Localized;
  description: Localized;
  slug: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  serialNumber?: string;
  stock: number;
  media: Media[];
  colors: ProductColor[];
  active: boolean;
  featured: boolean;
};

const categories = [
  ["computer-desks", "مكاتب وطاولات كمبيوتر"],
  ["chairs", "كراسي"],
  ["office-sofas", "انتريهات مكتبية"],
  ["work-cells", "خلايا العمل"],
  ["reception-counters", "كاونتر استقبال"],
  ["meeting-tables", "ترابيزات اجتماعات"],
  ["office-accessories", "إكسسوارات الأثاث المكتبي"],
];

const emptyLocalized = (): Localized => ({
  ar: "",
  en: "",
});

const emptyForm = () => ({
  name: emptyLocalized(),
  description: emptyLocalized(),
  slug: "",
  category: "",
  price: "",
  oldPrice: "",
  serialNumber: "",
  stock: "0",
  featured: false,
  active: true,
});

const emptyColor = (): ProductColor => ({
  name: emptyLocalized(),
  hex: "#000000",
  stock: 0,
  serialNumber: "",
  media: [],
});

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [primaryImage, setPrimaryImage] =
    useState<Media | null>(null);

  const [galleryImages, setGalleryImages] =
    useState<Media[]>([]);

  const [colors, setColors] = useState<ProductColor[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر تحميل المنتجات"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return products;
    }

    return products.filter((product) =>
      [
        product.name?.ar,
        product.name?.en,
        product.slug,
        product.serialNumber,
      ].some((item) =>
        item?.toLowerCase().includes(value)
      )
    );
  }, [products, search]);

  const openCreateForm = () => {
    setEditingProduct(null);
    setForm(emptyForm());
    setPrimaryImage(null);
    setGalleryImages([]);
    setColors([]);
    setMessage("");
    setShowForm(true);
  };

  const openEditForm = (product: Product) => {
    const mainImage =
      product.media?.find(
        (item) => item.isPrimary
      ) || product.media?.[0];

    setEditingProduct(product);

    setForm({
      name: product.name || emptyLocalized(),
      description:
        product.description || emptyLocalized(),
      slug: product.slug || "",
      category: product.category || "",
      price: String(product.price || ""),
      oldPrice:
        product.oldPrice === null ||
        product.oldPrice === undefined
          ? ""
          : String(product.oldPrice),
      serialNumber: product.serialNumber || "",
      stock: String(product.stock || 0),
      featured: Boolean(product.featured),
      active: product.active !== false,
    });

    setPrimaryImage(mainImage || null);

    setGalleryImages(
      (product.media || []).filter(
        (item) => item.storageKey !== mainImage?.storageKey
      )
    );

    setColors(product.colors || []);
    setMessage("");
    setShowForm(true);
  };

  const uploadImage = async (
    file: File,
    isPrimary: boolean
  ) => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "يرجى تسجيل الدخول كمسؤول أولًا"
      );
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("يمكن رفع الصور فقط");
    }

    const upload = await createUploadUrl(
      token,
      file.name,
      file.type,
      "products/gallery"
    );

    await uploadImageToR2(upload.uploadUrl, file);

    return {
      type: "image" as const,
      url: upload.publicUrl,
      storageKey: upload.key,
      thumbnail: upload.publicUrl,
      alt: {
        ar: form.name.ar,
        en: form.name.en,
      },
      sortOrder: 0,
      isPrimary,
    };
  };

  const handleImageUpload = async (
    event: ChangeEvent<HTMLInputElement>,
    target: "primary" | "gallery"
  ) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const uploadedImages: Media[] = [];

      for (const file of files) {
        uploadedImages.push(
          await uploadImage(
            file,
            target === "primary"
          )
        );
      }

      if (target === "primary") {
        setPrimaryImage(uploadedImages[0]);

        if (uploadedImages.length > 1) {
          setGalleryImages((current) => [
            ...current,
            ...uploadedImages.slice(1),
          ]);
        }
      } else {
        setGalleryImages((current) => [
          ...current,
          ...uploadedImages,
        ]);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر رفع الصورة"
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage(
        "يرجى تسجيل الدخول كمسؤول أولًا"
      );
      return;
    }

    if (
      !form.name.ar.trim() ||
      !form.description.ar.trim() ||
      !form.slug.trim() ||
      !form.category ||
      !form.price ||
      !primaryImage
    ) {
      setMessage(
        "أكمل الحقول المطلوبة وأضف الصورة الرئيسية"
      );
      return;
    }

    const media = [
      primaryImage,
      ...galleryImages,
    ].map((image, index) => ({
      ...image,
      isPrimary: index === 0,
      sortOrder: index,
      alt: {
        ar: image.alt?.ar || form.name.ar,
        en: image.alt?.en || form.name.en,
      },
    }));

    const productData = {
      name: form.name,
      description: form.description,
      slug: form.slug.trim().toLowerCase(),
      category: form.category,
      price: Number(form.price),
      oldPrice: form.oldPrice
        ? Number(form.oldPrice)
        : null,
      serialNumber: form.serialNumber.trim(),
      stock: Number(form.stock) || 0,
      featured: form.featured,
      active: form.active,
      media,
      colors: colors.map((color) => ({
        ...color,
        stock: Number(color.stock) || 0,
        serialNumber: color.serialNumber.trim(),
      })),
      specifications: [],
    };

    try {
      setSaving(true);
      setMessage("");

      if (editingProduct) {
        await updateProduct(
          token,
          editingProduct._id,
          productData
        );
      } else {
        await createProduct(token, productData);
      }

      setShowForm(false);
      await loadProducts();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ المنتج"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage(
        "يرجى تسجيل الدخول كمسؤول أولًا"
      );
      return;
    }

    if (
      !window.confirm(
        `هل تريد حذف المنتج: ${product.name.ar}؟`
      )
    ) {
      return;
    }

    try {
      await deleteProduct(token, product._id);

      setProducts((current) =>
        current.filter(
          (item) => item._id !== product._id
        )
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر حذف المنتج"
      );
    }
  };

  if (loading) {
    return (
      <main style={ui.loading}>
        <Loader2 size={28} className="spin" />
        جاري تحميل المنتجات...
      </main>
    );
  }

  return (
    <main style={ui.page} dir="rtl">
      <style>{`
        .spin { animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input, textarea, select { font: inherit; }
      `}</style>

      <header style={ui.header}>
        <div>
          <span style={ui.eyebrow}>
            لوحة التحكم
          </span>

          <h1 style={ui.title}>إدارة المنتجات</h1>

          <p style={ui.subtitle}>
            إضافة وتعديل وحذف المنتجات، الصور،
            والألوان.
          </p>
        </div>

        <button
          style={ui.primaryButton}
          onClick={openCreateForm}
        >
          <Plus size={18} />
          إضافة منتج
        </button>
      </header>

      {message && (
        <div style={ui.message}>
          <span>{message}</span>

          <button
            style={ui.iconButton}
            onClick={() => setMessage("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      <input
        style={ui.search}
        value={search}
        onChange={(event) =>
          setSearch(event.target.value)
        }
        placeholder="ابحث باسم المنتج أو السيريال أو Slug"
      />

      <section style={ui.cards}>
        {filteredProducts.map((product) => {
          const image =
            product.media?.find(
              (item) => item.isPrimary
            ) || product.media?.[0];

          return (
            <article
              key={product._id}
              style={ui.card}
            >
              <div style={ui.imageBox}>
                {image ? (
                  <img
                    src={image.url}
                    alt={product.name.ar}
                    style={ui.coverImage}
                  />
                ) : (
                  <Package size={34} />
                )}
              </div>

              <div style={ui.cardContent}>
                <small style={ui.category}>
                  {product.category}
                </small>

                <h2 style={ui.productTitle}>
                  {product.name.ar ||
                    product.name.en}
                </h2>

                <strong style={ui.price}>
                  {product.price.toLocaleString("ar-EG")} ج.م
                </strong>

                <p style={ui.serial}>
                  Serial:{" "}
                  {product.serialNumber || "—"}
                </p>

                <div style={ui.actions}>
                  <button
                    style={ui.editButton}
                    onClick={() =>
                      openEditForm(product)
                    }
                  >
                    <Edit3 size={16} />
                    تعديل
                  </button>

                  <button
                    style={ui.deleteButton}
                    onClick={() =>
                      handleDelete(product)
                    }
                  >
                    <Trash2 size={16} />
                    حذف
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {!filteredProducts.length && (
        <div style={ui.empty}>
          <Package size={42} />
          <p>لا توجد منتجات حاليًا</p>
        </div>
      )}

      {showForm && (
        <div style={ui.overlay}>
          <form
            style={ui.modal}
            onSubmit={handleSubmit}
          >
            <header style={ui.modalHeader}>
              <div>
                <h2 style={{ margin: 0 }}>
                  {editingProduct
                    ? "تعديل المنتج"
                    : "إضافة منتج جديد"}
                </h2>

                <p style={ui.modalSub}>
                  الحقول التي تحتوي على * مطلوبة
                </p>
              </div>

              <button
                type="button"
                style={ui.iconButton}
                onClick={() => setShowForm(false)}
              >
                <X size={22} />
              </button>
            </header>

            <div style={ui.formBody}>
              <h3>المعلومات الأساسية</h3>

              <div style={ui.grid}>
                <Field label="اسم المنتج بالعربية *">
                  <input
                    style={ui.input}
                    value={form.name.ar}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: {
                          ...current.name,
                          ar: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>

                <Field label="اسم المنتج بالإنجليزية">
                  <input
                    dir="ltr"
                    style={ui.input}
                    value={form.name.en}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: {
                          ...current.name,
                          en: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>

                <Field label="الوصف بالعربية *">
                  <textarea
                    style={ui.textarea}
                    value={form.description.ar}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: {
                          ...current.description,
                          ar: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>

                <Field label="الوصف بالإنجليزية">
                  <textarea
                    dir="ltr"
                    style={ui.textarea}
                    value={form.description.en}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: {
                          ...current.description,
                          en: event.target.value,
                        },
                      }))
                    }
                  />
                </Field>

                <Field label="Slug *">
                  <input
                    dir="ltr"
                    style={ui.input}
                    value={form.slug}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slug: event.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-"),
                      }))
                    }
                  />
                </Field>

                <Field label="التصنيف *">
                  <select
                    style={ui.input}
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                  >
                    <option value="">
                      اختر التصنيف
                    </option>

                    {categories.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="السعر *">
                  <input
                    type="number"
                    min="0"
                    style={ui.input}
                    value={form.price}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="السعر القديم">
                  <input
                    type="number"
                    min="0"
                    style={ui.input}
                    value={form.oldPrice}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        oldPrice: event.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="Serial Number">
                  <input
                    dir="ltr"
                    style={ui.input}
                    value={form.serialNumber}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        serialNumber: event.target.value,
                      }))
                    }
                  />
                </Field>

                <Field label="المخزون">
                  <input
                    type="number"
                    min="0"
                    style={ui.input}
                    value={form.stock}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        stock: event.target.value,
                      }))
                    }
                  />
                </Field>
              </div>

              <h3>صور المنتج</h3>

              <div style={ui.imagesGrid}>
                <div style={ui.imagePanel}>
                  <b>الصورة الرئيسية / Thumbnail *</b>

                  {primaryImage ? (
                    <>
                      <img
                        src={primaryImage.url}
                        alt="الصورة الرئيسية"
                        style={ui.preview}
                      />

                      <button
                        type="button"
                        style={ui.removeImage}
                        onClick={() =>
                          setPrimaryImage(null)
                        }
                      >
                        <Trash2 size={15} />
                        إزالة الصورة
                      </button>
                    </>
                  ) : (
                    <label style={ui.uploadBox}>
                      <ImagePlus size={27} />
                      {uploading
                        ? "جاري الرفع..."
                        : "اختر الصورة الرئيسية"}

                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={(event) =>
                          handleImageUpload(
                            event,
                            "primary"
                          )
                        }
                      />
                    </label>
                  )}
                </div>

                <div style={ui.imagePanel}>
                  <b>صور المعرض</b>

                  <label style={ui.galleryUpload}>
                    <ImagePlus size={18} />
                    إضافة صور

                    <input
                      hidden
                      type="file"
                      multiple
                      accept="image/*"
                      disabled={uploading}
                      onChange={(event) =>
                        handleImageUpload(
                          event,
                          "gallery"
                        )
                      }
                    />
                  </label>

                  <div style={ui.gallery}>
                    {galleryImages.map(
                      (image, index) => (
                        <div
                          key={image.storageKey}
                          style={ui.thumbnailBox}
                        >
                          <img
                            src={image.url}
                            alt=""
                            style={ui.thumbnail}
                          />

                          <button
                            type="button"
                            style={ui.thumbnailDelete}
                            onClick={() =>
                              setGalleryImages(
                                (current) =>
                                  current.filter(
                                    (_, itemIndex) =>
                                      itemIndex !== index
                                  )
                              )
                            }
                          >
                            <X size={15} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div style={ui.colorsHeader}>
                <h3>الألوان والسيريال</h3>

                <button
                  type="button"
                  style={ui.editButton}
                  onClick={() =>
                    setColors((current) => [
                      ...current,
                      emptyColor(),
                    ])
                  }
                >
                  <Plus size={16} />
                  إضافة لون
                </button>
              </div>

              {colors.map((color, index) => (
                <div
                  key={index}
                  style={ui.colorRow}
                >
                  <input
                    style={ui.input}
                    placeholder="اسم اللون بالعربية"
                    value={color.name.ar}
                    onChange={(event) =>
                      setColors((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                name: {
                                  ...item.name,
                                  ar: event.target.value,
                                },
                              }
                            : item
                        )
                      )
                    }
                  />

                  <input
                    dir="ltr"
                    style={ui.input}
                    placeholder="Color name"
                    value={color.name.en}
                    onChange={(event) =>
                      setColors((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                name: {
                                  ...item.name,
                                  en: event.target.value,
                                },
                              }
                            : item
                        )
                      )
                    }
                  />

                  <input
                    type="color"
                    value={color.hex}
                    onChange={(event) =>
                      setColors((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                hex: event.target.value,
                              }
                            : item
                        )
                      )
                    }
                  />

                  <input
                    type="number"
                    min="0"
                    style={ui.input}
                    placeholder="المخزون"
                    value={color.stock}
                    onChange={(event) =>
                      setColors((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                stock: Number(
                                  event.target.value
                                ),
                              }
                            : item
                        )
                      )
                    }
                  />

                  <input
                    dir="ltr"
                    style={ui.input}
                    placeholder="Serial Number"
                    value={color.serialNumber}
                    onChange={(event) =>
                      setColors((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? {
                                ...item,
                                serialNumber:
                                  event.target.value,
                              }
                            : item
                        )
                      )
                    }
                  />

                  <button
                    type="button"
                    style={ui.deleteButton}
                    onClick={() =>
                      setColors((current) =>
                        current.filter(
                          (_, itemIndex) =>
                            itemIndex !== index
                        )
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <div style={ui.checks}>
                <label>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        featured: event.target.checked,
                      }))
                    }
                  />
                  منتج مميز
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        active: event.target.checked,
                      }))
                    }
                  />
                  المنتج نشط ومتاح للعرض
                </label>
              </div>
            </div>

            <footer style={ui.footer}>
              <button
                type="button"
                style={ui.cancelButton}
                onClick={() => setShowForm(false)}
              >
                إلغاء
              </button>

              <button
                type="submit"
                style={ui.primaryButton}
                disabled={saving || uploading}
              >
                {saving && (
                  <Loader2
                    size={16}
                    className="spin"
                  />
                )}

                {saving
                  ? "جاري الحفظ..."
                  : editingProduct
                  ? "حفظ التعديلات"
                  : "إضافة المنتج"}
              </button>
            </footer>
          </form>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={ui.field}>
      <span>{label}</span>
      {children}
    </label>
  );
}

const ui: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: "32px",
    background: "#f5f7f3",
    color: "#263127",
    fontFamily: "Arial, sans-serif",
  },
  loading: {
    minHeight: "60vh",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    maxWidth: "1400px",
    margin: "0 auto 24px",
    display: "flex",
    gap: "20px",
    alignItems: "end",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: "#6d8068",
    fontSize: "12px",
    fontWeight: 700,
  },
  title: {
    margin: "6px 0",
    fontSize: "28px",
  },
  subtitle: {
    margin: 0,
    color: "#6d766d",
  },
  primaryButton: {
    border: 0,
    borderRadius: "9px",
    padding: "12px 17px",
    background: "#405d3a",
    color: "#fff",
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
    cursor: "pointer",
    fontWeight: 700,
  },
  message: {
    maxWidth: "1400px",
    margin: "0 auto 15px",
    padding: "12px",
    borderRadius: "8px",
    background: "#fff0ed",
    color: "#a33b2d",
    display: "flex",
    justifyContent: "space-between",
  },
  iconButton: {
    border: 0,
    background: "transparent",
    cursor: "pointer",
  },
  search: {
    width: "100%",
    maxWidth: "1400px",
    boxSizing: "border-box",
    display: "block",
    margin: "0 auto 20px",
    padding: "13px",
    borderRadius: "9px",
    border: "1px solid #d7dfd4",
  },
  cards: {
    maxWidth: "1400px",
    margin: "auto",
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "16px",
  },
  card: {
    minHeight: "158px",
    background: "#fff",
    border: "1px solid #e0e6dd",
    borderRadius: "12px",
    overflow: "hidden",
    display: "flex",
  },
  imageBox: {
    width: "112px",
    background: "#edf1eb",
    display: "grid",
    placeItems: "center",
    color: "#788477",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  cardContent: {
    flex: 1,
    padding: "14px",
  },
  category: {
    color: "#71806c",
  },
  productTitle: {
    fontSize: "16px",
    margin: "7px 0",
  },
  price: {
    color: "#42613d",
  },
  serial: {
    color: "#788077",
    fontSize: "11px",
  },
  actions: {
    display: "flex",
    gap: "7px",
  },
  editButton: {
    border: 0,
    borderRadius: "7px",
    padding: "8px",
    background: "#e8f0e5",
    color: "#3f5c3a",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
  },
  deleteButton: {
    border: 0,
    borderRadius: "7px",
    padding: "8px",
    background: "#fff0ed",
    color: "#a33b2d",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
  },
  empty: {
    minHeight: "200px",
    display: "grid",
    placeContent: "center",
    justifyItems: "center",
    color: "#778177",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    overflow: "auto",
    padding: "20px",
    background: "#14201499",
  },
  modal: {
    width: "min(1050px, 100%)",
    margin: "20px auto",
    background: "#fff",
    borderRadius: "15px",
    overflow: "hidden",
  },
  modalHeader: {
    padding: "18px 24px",
    borderBottom: "1px solid #e6ece3",
    display: "flex",
    justifyContent: "space-between",
  },
  modalSub: {
    color: "#788178",
    margin: "6px 0 0",
    fontSize: "12px",
  },
  formBody: {
    padding: "24px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "13px",
  },
  field: {
    display: "grid",
    gap: "6px",
    fontSize: "12px",
    fontWeight: 700,
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "10px",
    border: "1px solid #d5ddd2",
    borderRadius: "7px",
  },
  textarea: {
    minHeight: "80px",
    padding: "10px",
    border: "1px solid #d5ddd2",
    borderRadius: "7px",
    resize: "vertical",
  },
  imagesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "15px",
  },
  imagePanel: {
    minHeight: "180px",
    padding: "14px",
    border: "1px solid #dce4d9",
    borderRadius: "10px",
  },
  uploadBox: {
    minHeight: "130px",
    marginTop: "12px",
    border: "2px dashed #b9cbb4",
    borderRadius: "8px",
    display: "grid",
    placeContent: "center",
    justifyItems: "center",
    gap: "8px",
    color: "#496543",
    cursor: "pointer",
  },
  preview: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    marginTop: "12px",
    borderRadius: "8px",
  },
  removeImage: {
    marginTop: "8px",
    border: 0,
    color: "#a33b2d",
    background: "#fff0ed",
    borderRadius: "6px",
    padding: "7px",
    cursor: "pointer",
  },
  galleryUpload: {
    margin: "12px 0",
    display: "inline-flex",
    gap: "6px",
    padding: "9px",
    borderRadius: "7px",
    background: "#e8f0e5",
    color: "#3f5c3a",
    cursor: "pointer",
  },
  gallery: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  thumbnailBox: {
    width: "70px",
    height: "70px",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "7px",
  },
  thumbnailDelete: {
    position: "absolute",
    top: "-6px",
    left: "-6px",
    border: 0,
    borderRadius: "50%",
    color: "#fff",
    background: "#a33b2d",
    cursor: "pointer",
  },
  colorsHeader: {
    marginTop: "25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  colorRow: {
    display: "grid",
    gridTemplateColumns:
      "1fr 1fr 45px 90px 150px 38px",
    gap: "7px",
    marginBottom: "8px",
  },
  checks: {
    marginTop: "22px",
    display: "flex",
    gap: "25px",
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid #e6ece3",
    display: "flex",
    justifyContent: "end",
    gap: "10px",
  },
  cancelButton: {
    border: 0,
    borderRadius: "9px",
    padding: "12px 17px",
    background: "#e7ece5",
    cursor: "pointer",
  },
};