# Secure File Sync with Hybrid Encryption (AES-256 + RSA-2048)

Secure File Sync adalah sistem backend yang mensimulasikan **layanan penyimpanan file aman (secure cloud storage)** dengan menerapkan **Hybrid Cryptography**, yaitu kombinasi **AES-256-GCM** untuk enkripsi data dan **RSA-2048** untuk proteksi kunci enkripsi.

Proyek ini menitikberatkan pada **keamanan, integritas data, versioning file, dan evaluasi performa kriptografi**, sehingga relevan untuk bidang **Cybersecurity, SOC, Blue Team, dan Secure Backend Engineering**.

---

## Fitur Utama

 **Hybrid Encryption**
  - AES-256-GCM untuk enkripsi file
  - RSA-2048 (OAEP SHA-256) untuk enkripsi kunci AES
-  **File Versioning**
  - Setiap upload menghasilkan versi baru
  - Riwayat versi tersimpan di database
- **Restore Version**
  - Mengembalikan file ke versi sebelumnya tanpa plaintext
   **Integrity Validation**
  - Hash SHA-256 untuk verifikasi keaslian file
-  **Performance Measurement**
  - Waktu enkripsi AES dan RSA dicatat (ms)
-  **Secure Storage**
  - Ciphertext disimpan dalam bentuk file `.bin`
  - Metadata tersimpan di MongoDB

---

## Arsitektur Sistem

Client (Postman)
|
v
Express REST API
|
|-- AES-256-GCM (Encrypt File)
|-- RSA-2048 (Wrap AES Key)
|
MongoDB (Metadata & Versioning)
|
Local Storage (Ciphertext)

yaml
Salin kode

---

## Alur Kerja Sistem

1. User mengunggah file
2. Sistem menghitung **SHA-256 plaintext**
3. File dienkripsi menggunakan **AES-256-GCM**
4. Kunci AES dienkripsi menggunakan **RSA Public Key**
5. Ciphertext disimpan di local storage
6. Metadata dan versi disimpan di MongoDB
7. User dapat:
   - Download (decrypt otomatis)
   - Melihat seluruh versi
   - Restore versi lama

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|------|---------|----------|
| POST | `/api/upload` | Upload & encrypt file |
| POST | `/api/update/:fileId` | Upload versi baru |
| GET | `/api/download/:fileId` | Download & decrypt file |
| GET | `/api/versions/:fileId` | List seluruh versi |
| POST | `/encrypt-hybrid` | Demo hybrid encryption |
| POST | `/decrypt-hybrid` | Demo hybrid decryption |
| POST | `/keys/generate` | Generate RSA key pair |

---

## Hybrid Encryption Demo

Endpoint `/encrypt-hybrid` digunakan untuk menguji **overhead dan performa kriptografi**.

### Contoh Response
```json
{
  "status": "success",
  "algorithm": "AES-256-GCM + RSA-2048",
  "plaintext_size_bytes": 2048,
  "ciphertext_size_bytes": 2092,
  "aes_time_ms": 8.617,
  "rsa_time_ms": 18.001,
  "rsa_wrapped_key_size_bytes": 256
}
````

**Observasi:**

AES menangani beban utama enkripsi data

RSA hanya digunakan untuk proteksi kunci, sehingga overhead relatif kecil

 Evaluasi Performa
File	Size	AES Time (ms)	RSA Time (ms)	Ciphertext Size
text_v1.txt	12 KB	8.6	18.0	12.3 KB
text_v2.txt	12 KB	8.7	18.1	12.3 KB
FINAL.docx	350 KB	32.4	18.2	352 KB

 Validasi Integritas File
Integritas file diuji dengan membandingkan SHA-256 hash antara file asli dan file hasil dekripsi.

text
Salin kode
Original File SHA-256 : dd7c38b28476e92ad6e75ad24a964bcb80688388c9c333a9c114d41d433f7f24
Decrypted File SHA-256: dd7c38b28476e92ad6e75ad24a964bcb80688388c9c333a9c114d41d433f7f24
 Hash identik → integritas data terjaga

 Struktur Proyek
pgsql
Salin kode
secure-file-sync/
 ├─ src/
 │   ├─ controllers/
 │   ├─ routes/
 │   ├─ models/
 │   └─ server.js
 ├─ storage/
 │   ├─ encrypted/
 │   └─ ciphertext/
 ├─ docs/
 │   ├─ screenshots/
 │   ├─ flowchart.png
 │   └─ performance_table.png
 ├─ .env.example
 ├─ package.json
 ├─ README.md
 └─ .gitignore
** Tech Stack**
Node.js (Express)

MongoDB (Mongoose)

AES-256-GCM

RSA-2048 (OAEP SHA-256)

Multer

Postman
