# Load environment variables from .env file
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Define Python/Pip paths based on the VENV_DIR variable from .env
# We use conditional logic for Windows vs Linux/Mac
ifeq ($(OS),Windows_NT)
    PYTHON_EXEC = $(VENV_DIR)/Scripts/python
    PIP_EXEC = $(VENV_DIR)/Scripts/pip
else
    PYTHON_EXEC = $(VENV_DIR)/bin/python
    PIP_EXEC = $(VENV_DIR)/bin/pip
endif

.PHONY: help setup-env install-backend install-frontend install run run-backend run-frontend clean lint format

# Help Command
help:
	@echo "--- Configuration from .env ---"
	@echo "Backend:  $(BACKEND_DIR)"
	@echo "Frontend: $(FRONTEND_DIR)"
	@echo "Venv:     $(VENV_DIR)"
	@echo "-------------------------------"
	@echo "make setup-env       : Create virtual environment only"
	@echo "make install         : Install dependencies"
	@echo "make run             : Run both apps"
	@echo "make lint            : Check code quality"
	@echo "make format          : Auto-format code"

# 1. Environment Setup (Only creates the folder)
setup-env:
	@echo "--> Creating virtual environment at $(VENV_DIR)..."
	python -m venv $(VENV_DIR)

# 2. Dependency Installation
install-backend:
	@echo "--> Installing Python requirements..."
	# Added flake8 and black for linting support
	$(PIP_EXEC) install fastapi uvicorn pypdf python-multipart flake8 black

install-frontend:
	@echo "--> Installing Node modules..."
	cd $(FRONTEND_DIR) && npm install

install: install-backend install-frontend

# 3. Execution
run-backend:
	@echo "--> Starting Backend..."
	cd $(BACKEND_DIR) && PYTHONUNBUFFERED=1 ../$(PYTHON_EXEC) -m uvicorn main:app --reload --port $(BACKEND_PORT)

run-frontend:
	@echo "--> Starting Frontend..."
	cd $(FRONTEND_DIR) && npm run dev

run:
	@echo "--> Starting Services..."
	@(trap 'kill 0' SIGINT; \
	cd $(BACKEND_DIR) && PYTHONUNBUFFERED=1 ../$(PYTHON_EXEC) -m uvicorn main:app --reload --port $(BACKEND_PORT) & \
	cd $(FRONTEND_DIR) && npm run dev)

# 4. Code Quality (NEW ADDITIONS)
lint:
	@echo "--- Linting Backend (Flake8) ---"
	$(PYTHON_EXEC) -m flake8 $(BACKEND_DIR) --count --select=E9,F63,F7,F82 --show-source --statistics
	@echo "--- Linting Frontend (ESLint) ---"
	cd $(FRONTEND_DIR) && npm run lint

format:
	@echo "--- Formatting Backend (Black) ---"
	$(PYTHON_EXEC) -m black $(BACKEND_DIR)
	@echo "--- Formatting Frontend (Prettier) ---"
	cd $(FRONTEND_DIR) && npm run format

# 5. Cleaning
clean:
	rm -rf $(VENV_DIR)
	rm -rf $(BACKEND_DIR)/__pycache__
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -rf $(FRONTEND_DIR)/dist