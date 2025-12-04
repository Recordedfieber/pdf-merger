# PDF Merger Tool

A full-stack web application that allows users to upload multiple PDF files, reorder them, and merge them into a single downloadable document.

## 🚀 Features

- **Drag & Drop Upload:** Easy interface to upload multiple files.
- **Reordering:** Move files up and down to change the merge order.
- **Renaming:** Custom output filename support.
- **Real-time Progress:** Visual progress bar for Uploading, Processing, and Downloading.
- **Fast Processing:** Powered by Python's `pypdf` streaming directly to the client.

## 🛠️ Tech Stack

**Backend:**
- Python 3.10+
- FastAPI (Web Framework)
- pypdf (PDF Processing)

**Frontend:**
- React (Vite)
- Tailwind CSS (Styling)
- Axios (API Requests)

## 📦 Installation & Setup

This project uses a `Makefile` to automate setup.

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Quick Start

1. **Configure Environment** (Optional but recommended)
   Create a `.env` file in the root (defaults are provided in Makefile, but you can override):
   ```bash
   BACKEND_DIR=pdf-merger-backend
   FRONTEND_DIR=pdf-merger-frontend
   VENV_DIR=.venv

### Install Dependencies

Run the following command to create the virtual environment and install both Python and Node dependencies:

```bash
make install
Run the Application
Start both the Backend and Frontend concurrently:
```


```bash
make run
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000


Sure, here you go. And yes, I formatted your chaotic list into something a human might actually want to read. Try not to break it again.

## Run the Project

```bash
make run
````

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:8000](http://localhost:8000)

## ⚙️ Development Commands

| Command        | Description                                |
| -------------- | ------------------------------------------ |
| `make install` | Full installation for backend and frontend |
| `make run`     | Run both services                          |
| `make lint`    | Run code formatting and linting            |
| `make clean`   | Remove virtual env and build artifacts     |

## 🧪 CI and Code Quality

This project uses **Husky** for pre commit hooks and **GitHub Actions** for CI.

### Frontend

* Prettier for formatting
* ESLint for linting

### Backend

* Black for formatting
* Ruff for linting

To manually run linting:

```bash
make lint
```
