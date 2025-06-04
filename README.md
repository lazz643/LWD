# Tutorial Lengkap Setup React Native di Windows dengan Android Studio dan Emulator

---

## 1. Install Chocolatey (Package Manager Windows)

Buka **PowerShell sebagai Administrator**, lalu jalankan perintah berikut:

Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

Cek instalasi:

choco -v

---

## 2. Install Node.js, Git, dan React Native CLI

Jalankan di terminal (PowerShell/Git Bash):

choco install -y nodejs-lts git
npm install -g react-native-cli

Cek versi:

node -v
npm -v
git --version
react-native -v

---

## 3. Install Android Studio via Chocolatey

choco install -y androidstudio

---

## 4. Konfigurasi Android Studio

1. Buka Android Studio dari Start Menu.
2. Pilih **Standard** pada wizard setup.
3. Tunggu proses instalasi SDK dan komponen selesai.
4. Buka **SDK Manager**:  
   `More Actions → SDK Manager`

   - Di tab **SDK Platforms**: centang Android API terbaru (misalnya API 34).
   - Di tab **SDK Tools**: centang semua yang diperlukan:
     - Android SDK Build-Tools
     - Android Emulator
     - Android SDK Platform-Tools
     - Android SDK Command-line Tools
     - Intel x86 Emulator Accelerator (HAXM) _(jika CPU Intel)_

5. Klik **Apply** dan tunggu proses selesai.

---

## 5. Buat Emulator Android (AVD)

1. Buka **Virtual Device Manager**:  
   `More Actions → Virtual Device Manager` atau  
   `Tools → Device Manager`
2. Klik **Create Virtual Device**.
3. Pilih tipe device, contoh **Pixel 5**, klik **Next**.
4. Pilih API level (download jika belum ada), klik **Finish**.
5. Jalankan emulator dengan klik tombol ▶️ **Launch**.

---

## 6. Setting Environment Variables di Windows

Buka **Environment Variables**:

- Tambahkan variable baru di **User Variables**:

  ANDROID_HOME = C:\Users\<YourUser>\AppData\Local\Android\Sdk

- Tambahkan ini ke **Path** (User Variables):

  %ANDROID_HOME%\emulator
  %ANDROID_HOME%\platform-tools
  %ANDROID_HOME%\tools
  %ANDROID_HOME%\tools\bin

Ganti `<YourUser>` dengan username Windows kamu.

---

## 7. Verifikasi Instalasi

Buka terminal baru, cek:

adb --version
emulator -list-avds

Pastikan emulator sudah terdaftar.

---

## 8. (Opsional) Install Git Bash Terminal

Git Bash memberikan pengalaman terminal bash di Windows.

choco install -y git.install

Setelah itu bisa buka **Git Bash** dari Start Menu.

---

## 9. Menjalankan Proyek React Native

1. Jalankan aplikasi:

npx react-native run-android

atau

npm run android

---

## 10. Tips Troubleshooting Umum

| Masalah                        | Solusi                                                   |
| ------------------------------ | -------------------------------------------------------- |
| `SDK not found`                | Cek kembali environment variable ANDROID_HOME            |
| Emulator tidak berjalan lancar | Pastikan Virtualization Technology aktif di BIOS         |
| `adb` command tidak ditemukan  | Pastikan `%ANDROID_HOME%\platform-tools` sudah di Path   |
| Build gagal                    | Jalankan `cd android && ./gradlew clean` lalu ulangi run |

---

# Selesai!

Sekarang kamu sudah siap mengembangkan aplikasi React Native di Windows dengan Android Studio dan emulator Android.

# untuk deploy jadi apk

1. Tambahkan code ini ke file package.json bagian scripts:

   "prebuild": "npx react-native bundle --android platform --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res",

   "build": "cd android && gradlew assembleDebug && cd ../",

   "clear": "cd android && gradlew clean && cd ../

2. Pada folder android/app/src/main bikin folder baru bernama assets
3. Buka cmd pada folder proyek dan jalankan perintah ini:
   npm run clear
   npm run build
4. File apk akan ada di folder android/app/build/outputs/apk/debug

# Jika masih ada yang belum jelas bisa dilihat tutorial pada youtube ini:

1. Untuk setup tools yang diperlukan: https://www.youtube.com/watch?v=BfPBGwsB89Y&t=1175s
2. Untuk build apk: https://www.youtube.com/watch?v=NKzMj1ElvYY
