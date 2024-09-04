const express = require("express");
const multer = require("multer");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

// Middleware untuk menangani body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware untuk melayani file statis di folder public
app.use(express.static("public"));

// Set storage engine untuk Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Menyimpan file di folder public/uploads
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Memberikan nama unik pada file
  },
});

// Initialize Multer upload
const upload = multer({ storage: storage });

// Rute untuk upload gambar
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    // Akses file yang di-upload
    const fileName = req.file.filename;

    // Simpan nama file ke database menggunakan Prisma
    await prisma.gambar.create({
      data: {
        nama: fileName,
      },
    });

    res.status(200).json({
      message: "File uploaded successfully",
      fileName: fileName,
    });
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
