# Secure File Sync API Guide

## 1. Setup
1. Pastikan MongoDB sudah berjalan (default port 27017).
2. Install dependencies (jika belum):
   ```bash
   npm install
   ```
3. Jalankan server:
   ```bash
   npm run dev
   ```
   Server berjalan di `http://localhost:3000`.

## 2. Endpoints (Postman)

### 2.1. Generate Keys (Langkah Pertama WAJIB)
Sebelum melakukan upload/encrypt, Anda harus generate pasangan kunci RSA.
- **URL**: `POST http://localhost:3000/api/keys/generate`
- **Response**: `200 OK`
  ```json
  { "message": "RSA key pair generated successfully..." }
  ```

### 2.2. Upload File (Versi 1)
- **URL**: `POST http://localhost:3000/api/upload`
- **Body**: `form-data`
  - Key: `file`
  - Type: `File`
  - Value: (Pilih file Anda)
- **Response**: JSON berisi `fileId` dan statistik performa (Waktu enkripsi AES, Waktu enkripsi RSA, Ukuran Ciphertext).

### 2.3. Update File (Versi Baru)
- **URL**: `POST http://localhost:3000/api/update/:fileId`
  - Ganti `:fileId` dengan ID dari response Upload.
- **Body**: `form-data`
  - Key: `file`
  - Type: `File`
  - Value: (Pilih file yang sudah diedit)
- **Response**: JSON info versi baru dan statistik performa.

### 2.4. Download File
- **URL**: `GET http://localhost:3000/api/download/:fileId`
- **Response**: File asli (decrypted).
- **Headers Response**: Cek Headers di Postman untuk melihat statistik waktu dekripsi:
  - `X-Performance-AES-Decrypt-Time-Ms`
  - `X-Performance-RSA-Decrypt-Time-Ms`
  - `X-Performance-Total-Time-Ms`

### 2.5. Get Versions
- **URL**: `GET http://localhost:3000/api/versions/:fileId`
- **Response**: List semua versi file dan hash-nya.

### 2.6. Hybrid Encrypt Test (Teks Biasa)
- **URL**: `POST http://localhost:3000/api/encrypt-hybrid`
- **Body**: `raw (JSON)`
  ```json
  { "data": "Ini adalah pesan rahasia" }
  ```
- **Response**: Encrypted data dan key.

### 2.7. Hybrid Decrypt Test
- **URL**: `POST http://localhost:3000/api/decrypt-hybrid`
- **Body**: `raw (JSON)` (Copy dari response encrypt-hybrid)
  ```json
  {
    "encryptedData": "...",
    "encryptedKey": "...",
    "iv": "..."
  }
  ```
- **Response**: `decryptedData` asli.

## 3. Fitur Keamanan
- **AES-256-CBC**: Digunakan untuk mengenkripsi konten file.
- **RSA-2048**: Digunakan untuk mengenkripsi kunci AES (Key Encapsulation).
- **SHA-256**: Digunakan untuk hashing integritas file.

## 4. Struktur Output
Sesuai permintaan tugas, respons API menyertakan objek `performance` yang berisi:
- `aesEncryptionTimeMs` / `rsaKeyEncryptionTimeMs`
- `ciphertextSize`
- `totalTimeMs`

Gunakan data ini untuk mengisi "Tabel uji performa".
