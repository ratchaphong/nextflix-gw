## 📌 ระบบ Movie App (NestJS + Microservices)

ระบบนี้ใช้สถาปัตยกรรม Microservices แยกบริการต่าง ๆ ออกเป็นหลาย Service โดยมี Gateway เป็นตัวกลางในการเชื่อมต่อระหว่าง Service ต่าง ๆ เช่น:

- `user-service` – จัดการผู้ใช้และ household
- `profile-service` – จัดการโปรไฟล์สูงสุด 4 คนต่อ user
- `movie-service` – ดึงข้อมูลภาพยนตร์จาก OMDB API
- `gateway` – รับคำสั่งจาก frontend และส่งต่อไปยัง service ที่เกี่ยวข้องผ่าน HTTP/RPC

## ✅ ฟีเจอร์หลัก

- ✅ สมัครสมาชิก / เข้าสู่ระบบ พร้อม JWT
- ✅ แก้ไขข้อมูลผู้ใช้งาน
- ✅ สร้าง household และ member
- ✅ เพิ่ม / แก้ไข / ลบโปรไฟล์ (สูงสุด 4 คน/บัญชี)
- ✅ ป้องกันการลบโปรไฟล์แรก
- ✅ เรียกดูโปรไฟล์ตัวเองแบบรวม household และ profiles ที่ยังไม่ถูกลบ
- ✅ ค้นหาภาพยนตร์จาก OMDB API
- ✅ ดึงภาพยนตร์ตามหมวดหมู่
- ✅ ดึงรายการวิดีโอแนะนำ
- ✅ Swagger พร้อม Bearer Token และจำ token ได้หลัง refresh

## ⚙️ การติดตั้ง

```bash
# เริ่มต้น database (PostgreSQL) ผ่าน Docker
docker-compose up -d

# ติดตั้ง dependencies
yarn install

# รัน migration
npx prisma migrate dev

# เริ่มระบบ
yarn start:dev
```

---

# 🎬 Movie App System (NestJS + Microservices)

This is a full-stack microservices-based backend system for managing users and streaming movie data. Designed for scalability and modularity, this app serves as a base architecture for applications similar to Netflix.

## 🧱 Architecture

This project is composed of the following services:

- **`user-service`** – Manages users and households
- **`profile-service`** – Each user can have up to 4 profiles
- **`movie-service`** – Fetches movies from OMDB API
- **`gateway`** – Entry point, routes requests to appropriate services

## ✅ Features

- ✅ Register / Login with JWT Authentication
- ✅ Update user information
- ✅ Create household and members
- ✅ Add / Edit / Delete profiles (max 4 per user)
- ✅ Prevent deletion of the first profile
- ✅ View profile with household and active (non-deleted) profiles
- ✅ Search movies from OMDB API
- ✅ List videos by category
- ✅ Show recommended videos
- ✅ Swagger UI with Bearer Token support and persistence on refresh

## 🧰 Tech Stack

- **NestJS** (monorepo)
- **PostgreSQL** via Docker
- **Prisma ORM**
- **Swagger / OpenAPI**
- **RabbitMQ** (optional for message passing between services)
- **OMDB API** integration

## ⚙️ Installation

```bash
# Start the database (PostgreSQL) using Docker
docker-compose up -d

# Install dependencies
yarn install

# Run database migrations
npx prisma migrate dev

# Start the application
yarn start:dev

```
