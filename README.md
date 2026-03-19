# ⚡ React + TypeScript + Vite Starter

A modern and minimal setup for building fast, scalable React applications using **Vite**, **TypeScript**, and **ESLint**. This template is optimized for performance, developer experience, and clean code practices.

---

## 🚀 Features

* ⚛️ React with TypeScript support
* ⚡ Lightning-fast development powered by Vite
* 🔥 Hot Module Replacement (HMR)
* 🧹 ESLint for code quality and consistency
* 📦 Optimized build configuration
* 🧩 Plugin-based architecture

---

## 📦 Available React Plugins

This template supports two official Vite plugins for React:

### 1. `@vitejs/plugin-react`

* Uses **Oxc** for fast transformations
* Recommended for most projects

### 2. `@vitejs/plugin-react-swc`

* Uses **SWC** (faster alternative to Babel)
* Ideal for high-performance builds

---

## 🧠 React Compiler (Optional)

The React Compiler is not enabled by default due to its impact on development and build performance.

To enable it, follow the official documentation:
👉 https://react.dev/learn/react-compiler/installation

---

## 🛠️ ESLint Configuration (Advanced Setup)

For production-level applications, it is recommended to enable **type-aware linting**.

### ✅ Recommended Configuration

Update your `eslint.config.js`:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Replace basic rules with type-checked rules
      tseslint.configs.recommendedTypeChecked,

      // Optional: stricter rules
      tseslint.configs.strictTypeChecked,

      // Optional: stylistic rules
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

---

## 🔌 React-Specific Linting (Optional)

Enhance your linting with React-focused rules:

### Install Plugins

```bash
npm install eslint-plugin-react-x eslint-plugin-react-dom --save-dev
```

### Update ESLint Config

```js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

---

## 📁 Project Structure

```
src/
 ├── components/
 ├── pages/
 ├── hooks/
 ├── context/
 ├── App.tsx
 └── main.tsx
```

---

## 🧑‍💻 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

---

## 📌 Best Practices

* Use **TypeScript types** everywhere
* Keep components small and reusable
* Use **hooks** for logic separation
* Enable strict ESLint rules for cleaner code
* Organize project using feature-based structure

---

## 📈 Future Improvements

* Add state management (Redux / Zustand)
* Integrate API layer (Axios / React Query)
* Add authentication system
* Setup testing (Jest / React Testing Library)

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull request.

---

## 📄 License

This project is open-source and available under the MIT License.

---

💡 Built for developers who want **speed, scalability, and clean architecture**.
