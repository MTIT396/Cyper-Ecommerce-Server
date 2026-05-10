const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// routes
const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const authRoutes = require("./routes/auth.routes");
const cartRoutes = require("./routes/cart.routes");
const userRoutes = require("./routes/user.routes");
const orderRoutes = require("./routes/order.routes");
const addressRoutes = require("./routes/address.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const paymentRoutes = require("./routes/payment.routes");
const googleRoutes = require("./routes/google.routes");
const uploadRoutes = require("./routes/upload.routes");

//admin
const adminProductsRoutes = require("./routes/admin.product.routes");

const errorMiddleware = require("./middlewares/error.middleware");

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// for momo payment
app.use(express.text({ type: "text/plain" }));

// CORS Configuration - Only allow specific origins

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/upload", uploadRoutes);

app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin/products", adminProductsRoutes);

app.use(errorMiddleware);

const PORT = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Listening at port: ${PORT}`);
});
