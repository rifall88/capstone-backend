**Smart Digital Twin API**

Smart Digital Twin API adalah RESTful API yang menjadi "otak" dari aplikasi pelacakan produktivitas dan kesejahteraan (well-being) cerdas. API ini berfungsi sebagai jembatan antara frontend dan database PostgreSQL, serta terhubung langsung dengan Microservice AI eksternal untuk memproses deteksi wajah (Face Analytics) dan prediksi produktivitas pengguna.

API ini menangani berbagai aktivitas krusial, mulai dari manajemen pengguna (login & registrasi), pencatatan metrik harian (Daily Logs), kalkulasi skor kelelahan (fatigue) dan stres, hingga sinkronisasi data dengan sistem AI. Untuk menjamin keamanan data, API ini dilengkapi dengan sistem autentikasi berbasis JWT (Access dan Refresh Token). Dengan Smart Digital Twin API, aliran data pengguna dari client hingga ke mesin Artificial Intelligence dapat berjalan secara aman, terstruktur, dan efisien.

**Cara Menjalankan Project**

1. Clone repository ini ke komputer lokal lu.
2. Masuk ke folder project melalui terminal, lalu jalankan perintah npm install
   (pastikan Node.js dan npm sudah terpasang).
3. Buat file .env di root project dan isi sesuai dengan format di bawah.
4. Lakukan sinkronisasi dan migrasi database PostgreSQL dengan cara menjalankan:

```bash
 npx prisma generate
 npx prisma migrate dev
```

5. Masuk ke folder prisma lalu jalankan "node createAdmin" untuk
   membuat user dengan role Admin

6. Pastikan Microservice AI (Python/FastAPI) untuk Face Detection dan Prediction sudah menyala di lokal
   server lu.

Jalankan project dengan perintah npm start

**Isi .env**

```env
DATABASE_URL=

PGUSER=
PGPASSWORD=
PGDATABASE=
PGHOST=
PGPORT=

PORT=

ACCESS_TOKEN_KEY=
REFRESH_TOKEN_KEY=

MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=

GOOGLE_CLIENT_ID=

FACE_DETECTION=
AI_PREDICTION_URL=
SECRET_TOKEN_AI=

ADMIN_PASSWORD=
```

[Link ERD](https://drive.google.com/file/d/1Im69keof8WHsrPPHohjouoLvN8flFANI/view?usp=sharing)
