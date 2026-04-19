# 🐾 Adoptly — Frontend

The frontend for the Adoptly pet adoption platform. Built with React 18, Vite, and Redux Toolkit.

## 🛠 Tech Stack

- React 18
- Vite
- Redux Toolkit
- SweetAlert2

## 🚀 Local Setup

### Prerequisites
- Node.js ≥ 18

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:5001
```

### 3. Run the app

```bash
npm run dev
```

The app will run at **http://localhost:5173**.

## 🌍 Deployment

### Netlify

1. Set `VITE_API_URL` to your backend URL, e.g.:
   ```
   VITE_API_URL=https://pet-adoption-backend-xxxx.onrender.com
   ```
2. Deploy the `frontend/` folder.

## ✅ Form Validation

The frontend enforces inline validation for all inputs to ensure data integrity before submission.
