const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Настраиваем хранилище Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Папка, куда сохраняются изображения
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
  }
});

const upload = multer({ storage: storage });

// Маршрут для загрузки файлов
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Файл не загружен' });
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Запуск сервера
app.listen(5000, () => {
  console.log('Сервер запущен на порту 5000');
});

app.get("/api/products", async (req, res) => {
    try {
      const products = await Product.find(); // Если MongoDB
      console.log("Продукты из БД:", products);
      res.json(products);
    } catch (error) {
      console.error("Ошибка загрузки продуктов:", error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  });
  
