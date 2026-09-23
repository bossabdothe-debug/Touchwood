const isValidPrice = (price) => {
  return (
    price !== undefined &&
    price !== null &&
    price !== "" &&
    Number.isFinite(Number(price)) &&
    Number(price) >= 0
  );
};

const hasLocalizedValue = (value) => {
  return (
    value &&
    typeof value === "object" &&
    (
      value.ar?.trim?.() ||
      value.en?.trim?.()
    )
  );
};

const isValidCategory = (category) => {
  return (
    category !== undefined &&
    category !== null &&
    typeof category === "string" &&
    category.trim().length > 0
  );
};

/* =========================================================
   CREATE PRODUCT VALIDATION
========================================================= */

export const validateProduct = (
  req,
  res,
  next
) => {  console.log("VALIDATE PRODUCT BODY:", req.body);

  const {
    name,
    description,
    category,
    price,
  } = req.body || {};

  /* =========================
     NAME
  ========================= */

  if (!hasLocalizedValue(name)) {
    return res.status(400).json({
      message:
        "Product name is required",
    });
  }

  /* =========================
     DESCRIPTION
  ========================= */

  if (!hasLocalizedValue(description)) {
    return res.status(400).json({
      message:
        "Product description is required",
    });
  }

  /* =========================
     CATEGORY
  ========================= */

  if (!isValidCategory(category)) {
    return res.status(400).json({
      message:
        "Valid category is required",
    });
  }

  /* =========================
     PRICE
  ========================= */

  if (!isValidPrice(price)) {
    return res.status(400).json({
      message:
        "Price must be a valid positive number",
    });
  }

  next();
};

/* =========================================================
   UPDATE PRODUCT VALIDATION
========================================================= */

export const validateupdateProduct = (
  req,
  res,
  next
) => {
  const {
    name,
    description,
    category,
    price,
  } = req.body || {};

  /* =========================
     NAME
  ========================= */

  if (
    name !== undefined &&
    !hasLocalizedValue(name)
  ) {
    return res.status(400).json({
      message:
        "Product name is invalid",
    });
  }

  /* =========================
     DESCRIPTION
  ========================= */

  if (
    description !== undefined &&
    !hasLocalizedValue(description)
  ) {
    return res.status(400).json({
      message:
        "Product description is invalid",
    });
  }

  /* =========================
     CATEGORY
  ========================= */

  if (
    category !== undefined &&
    !isValidCategory(category)
  ) {
    return res.status(400).json({
      message:
        "Product category is invalid",
    });
  }

  /* =========================
     PRICE
  ========================= */

  if (
    price !== undefined &&
    !isValidPrice(price)
  ) {
    return res.status(400).json({
      message:
        "Price must be a valid positive number",
    });
  }

  next();
};