# FarmasiLink

FarmasiLink adalah sistem informasi manajemen klinik dan apotek yang terintegrasi (Sistem Mananjemen Klinik/Klinik-Apotek). Sistem ini dirancang untuk memfasilitasi alur kerja mulai dari pendaftaran pasien, pemeriksaan oleh dokter, hingga penebusan resep di apotek.

## 🌟 Fitur Utama (Berdasarkan Role)

Sistem ini menggunakan Role-Based Access Control (RBAC) dengan 4 role utama:

1. **Admin**
   - Manajemen penuh sistem
   - Manajemen pengguna (User) & log aktivitas
   - Akses penuh ke data Master (Pasien, Obat, Pemeriksaan, Resep)
2. **Resepsionis**
   - Pendaftaran pasien baru (Registrasi)
   - Manajemen rekam medis pasien awal
   - Upload dokumen rekam medis
3. **Dokter**
   - Melakukan pemeriksaan fisik & input vital sign
   - Melihat rekam medis pasien
   - Membuat/input resep untuk pasien
4. **Apoteker**
   - Mengelola daftar obat (termasuk sinkronisasi dari API)
   - Menerima dan melayani (approve) resep dari dokter

## 🚀 Panduan Deployment (Production)

Proyek ini telah dikompilasi (build production) untuk environment frontend-nya, sehingga **Anda tidak perlu menginstall Node.js maupun menjalankan `npm run build`** di server production.

Berikut adalah panduan untuk mendepoy aplikasi menggunakan dua cara: Docker Compose dan cPanel/Shared Hosting.

### Opsi 1: Menggunakan Docker Compose (Disarankan)

Pastikan server Anda sudah terinstall Docker dan Docker Compose.

1. **Clone repositori**
   ```bash
   git clone <url-repo-anda>
   cd FarmasiLink
   ```

2. **Konfigurasi Environment**
   Salin file `.env.example` menjadi `.env`.
   ```bash
   cp .env.example .env
   ```
   Atur kredensial database di dalam file `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=database
   DB_PORT=3306
   DB_DATABASE=farmasilink
   DB_USERNAME=root
   DB_PASSWORD=secret
   ```

3. **Jalankan Docker Compose**
   ```bash
   docker-compose up -d
   ```
   *Catatan: Konfigurasi docker compose otomatis memetakan port `7767` untuk web app dan `7768` untuk adminer (database gui).*

4. **Install Dependensi Composer, Migrate, dan Seeding Database**
   Masuk ke container aplikasi (contoh nama container: `farmasilink`):
   ```bash
   docker exec -it farmasilink bash
   ```
   Di dalam container, jalankan:
   ```bash
   composer install --optimize-autoloader --no-dev
   php artisan key:generate
   php artisan storage:link
   php artisan migrate --seed
   ```
   *Perintah `migrate --seed` sangat penting untuk memasukkan data awal (termasuk akun administrator/role).*

5. **Akses Aplikasi**
   Buka browser dan akses `https://<ip-server>:7767` atau `http://<ip-server>:7767`.

---

### Opsi 2: Menggunakan cPanel (Shared Hosting)

1. **Upload File**
   - Zip seluruh file dari repositori (sudah termasuk folder `public/build` hasil production).
   - Di File Manager cPanel, buat folder aplikasi (misal: `farmasilink-app`) **di luar** `public_html`.
   - Ekstrak file zip tersebut ke dalam folder aplikasi `farmasilink-app`.

2. **Konfigurasi Folder Publik**
   - Copy seluruh isi dari folder `public` aplikasi ke dalam folder `public_html` domain/subdomain Anda di cPanel.
   - Edit file `index.php` yang ada di dalam `public_html`:
     ```php
     // Ubah path ini menyesuaikan lokasi folder app Anda
     require __DIR__.'/../farmasilink-app/vendor/autoload.php';
     $app = require_once __DIR__.'/../farmasilink-app/bootstrap/app.php';
     ```

3. **Konfigurasi Environment dan Database**
   - Buat database MySQL dan user MySQL di cPanel.
   - Ubah nama `.env.example` menjadi `.env` di folder `farmasilink-app`.
   - Sesuaikan konfigurasi database:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=nama_db_cpanel
     DB_USERNAME=user_db_cpanel
     DB_PASSWORD=password_db_cpanel
     ```

4. **Jalankan Instalasi (Terminal cPanel)**
   - Buka menu **Terminal** di dashboard cPanel.
   - Masuk ke direktori aplikasi:
     ```bash
     cd farmasilink-app
     ```
   - Jalankan perintah instalasi berikut:
     ```bash
     composer install --optimize-autoloader --no-dev
     php artisan key:generate
     php artisan storage:link
     php artisan migrate --seed
     ```
   *Folder storage link mungkin perlu disesuaikan path-nya jika Anda menggunakan struktur public_html terpisah. Pastikan data seeder berhasil dibuat.*

## 📚 Struktur Arsitektur

Informasi lebih detail mengenai struktur spesifik *Service Pattern* aplikasi ini dapat dilihat di [ARCHITECTURE.md](ARCHITECTURE.md).
