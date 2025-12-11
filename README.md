# 🦴 PetMatch Backbone (Main Service)

[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Render-%2346E3B7.svg?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

> **The monolith core of the PetMatch ecosystem.**
> Built with NestJS, this service handles the primary business logic, authentication, and AI integrations, deployed on Render with custom optimization strategies.

---

## 📖 About The Project

**PetMatch** is a platform connecting pet owners, sitters, and vets. This repository hosts the **Main Backend Service** (Monolith), which operates alongside a separate Community Microservice.

This project was a deep dive into system design and cloud infrastructure, moving beyond basic CRUD to implement scalable patterns, containerization, and cost-effective cloud deployment strategies.

### 🏗️ Architecture & Features

* **Authentication:** Secure JWT Auth + Google Sign-In (OAuth).
* **Pet Matching Logic:** core algorithms to connect pets with owners/sitters.
* **Vision AI Integration:** Automated pet image recognition and tagging.
* **Data Persistence:** PostgreSQL on Neon (optimized with separate DB instances for load handling).
* **Image Management:** Cloudinary integration for scalable media storage.
* **Keep-Alive Mechanism:** A custom "ping" strategy using EC2 to prevent Render free-tier spin-downs.

---

## 🛠️ Tech Stack

* **Framework:** NestJS
* **Database:** PostgreSQL (Neon)
* **ORM:** TypeORM / Prisma (Update based on code)
* **Containerization:** Docker (Multi-stage builds for minimal image size)
* **CI/CD:** GitHub Actions
* **Deployment:** Render (Main App)

---

## 🚀 Deployment & Infrastructure

This project uses a hybrid deployment strategy to balance performance and cost:

1.  **Main App (This Repo):** Deployed on **Render**.
2.  **Community Microservice:** Deployed on **AWS ECS (EC2 launch type)**.
    * *Link to Community Repo:* [Insert Link Here]
3.  **Optimization:**
    * **Docker:** Multi-stage Dockerfiles reduce final image size significantly.
    * **Auto-scaling:** Configured to scale when CPU hits 75%.
    * **Cost Efficiency:** No load balancer (direct port binding/reverse proxy setup) to stay within budget.

---

## 🏁 Getting Started

Follow these steps to run the main service locally.

### Prerequisites

* Node.js (v18+)
* Docker & Docker Compose
* PostgreSQL Database URL

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/COOLMishraG/pet-match-backbone.git](https://github.com/COOLMishraG/pet-match-backbone.git)
    cd pet-match-backbone
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    DATABASE_URL=postgresql://user:password@host/db
    JWT_SECRET=your_secret
    GOOGLE_CLIENT_ID=your_google_id
    GOOGLE_CLIENT_SECRET=your_google_secret
    CLOUDINARY_URL=cloudinary://key:secret@cloud_name
    VISION_API_KEY=your_vision_key
    ```

4.  **Run with Docker (Recommended)**
    ```bash
    docker-compose up --build
    ```

5.  **Run Manually**
    ```bash
    npm run start:dev
    ```

---

## 🧠 Engineering Challenges Solved

Building this wasn't just about writing code; it was about solving infrastructure pain points:

* **Docker Optimization:** Wrestled with image bloat by implementing multi-stage builds.
* **Render Sleep Issue:** Solved the "cold start" problem on Render by engineering a cron-job style pinger from the AWS EC2 instance.
* **Vision AI:** Integrated image recognition to prevent spam/irrelevant uploads (after much trial and error with "trash" results!).

---

## 🤝 Related Repositories

* [**Frontend (React)**](https://github.com/COOLMishraG/pet-match-frontend)
* [**Community Microservice (AWS ECS)**](https://github.com/COOLMishraG/pet-match-community) *(Update link if available)*

---

## 📬 Contact

**Anuj Mishra**

* **LinkedIn:** [anuj-omishra-](https://www.linkedin.com/in/anuj-omishra-)
* **GitHub:** [COOLMishraG](https://github.com/COOLMishraG)
* **Live App:** [pet-match-iota.vercel.app](https://pet-match-iota.vercel.app)

---

<p align="center">
  Made with ❤️, NestJS, and 2AM debugging sessions.
</p>
