# Secure File Sync with Hybrid Cryptography (AES–RSA)

Secure File Sync adalah aplikasi backend berbasis **Node.js** yang mengimplementasikan **kriptografi hibrida (AES + RSA)** untuk melakukan enkripsi, versioning, dan verifikasi integritas file secara aman.  
Proyek ini dirancang sebagai **portofolio keamanan siber** dengan fokus pada **data confidentiality, integrity, dan secure key management**.

---

## Tujuan Proyek

- Mengamankan file menggunakan **AES-256-GCM** untuk efisiensi dan performa
- Melindungi kunci simetris dengan **RSA-2048 (OAEP SHA-256)**
- Menerapkan **file versioning** untuk setiap perubahan
- Memastikan **integritas data** melalui validasi hash SHA-256
- Menyediakan API backend yang siap diuji menggunakan Postman

---

## Arsitektur Sistem

1. File diunggah oleh pengguna
2. Sistem menghasilkan **AES key & IV**
3. File dienkripsi menggunakan **AES-256-GCM**
4. AES key dienkripsi menggunakan **RSA public key**
5. Metadata (hash, versi, path, encrypted key) disimpan di MongoDB
6. Saat download:
   - AES key didekripsi menggunakan RSA private key
   - File didekripsi
   - Hash diverifikasi untuk memastikan integritas

---

## Skema Keamanan

- **AES-256-GCM**
  - Enkripsi data utama
  - Menyediakan confidentiality + integrity (authenticated encryption)

- **RSA-2048 (OAEP SHA-256)**
  - Digunakan hanya untuk enkripsi kunci AES
  - Mengurangi overhead komputasi

- **SHA-256**
  - Validasi integritas file
  - Membandingkan hash file sebelum enkripsi dan setelah dekripsi

---

## Observasi & Evaluasi Performa

### Observasi
- AES menangani beban utama enkripsi data
- RSA hanya digunakan untuk proteksi kunci AES
- Pendekatan hibrida memberikan keseimbangan antara **keamanan dan performa**

### Evaluasi Performa

| File | Ukuran File | Waktu AES (ms) | Waktu RSA (ms) | Ukuran Ciphertext |
|----|----|----|----|----|
| text_v1.txt | 12 KB | 8.6 | 18.0 | 12.3 KB |
| text_v2.txt | 12 KB | 8.7 | 18.1 | 12.3 KB |
| FINAL.docx | 350 KB | 32.4 | 18.2 | 352 KB |

**Catatan:**
- Waktu AES meningkat sesuai ukuran file
- Waktu RSA relatif konstan karena hanya memproses kunci
- Ciphertext bertambah sedikit akibat metadata kriptografi

---

## Validasi Integritas File

Integritas file diuji dengan membandingkan **SHA-256 hash** antara:
- File asli (sebelum enkripsi)
- File hasil dekripsi (setelah download)

 Hash identik  
 Tidak ada perubahan data  
 Proses enkripsi–dekripsi berjalan dengan benar  

---

## Tech Stack

- **Backend:** Node.js (Express)
- **Database:** MongoDB (Mongoose)
- **Kriptografi:**
  - AES-256-GCM
  - RSA-2048 (OAEP SHA-256)
- **File Handling:** Multer
- **API Testing:** Postman

---


