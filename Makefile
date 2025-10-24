# Shola Time Tracker - Build and Deploy Makefile

.PHONY: help build deploy clean install dev preview

# Default target
help:
	@echo "Available commands:"
	@echo "  make build     - Build the project for production"
	@echo "  make deploy    - Build and commit changes (requires MESSAGE='your commit message')"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make install   - Install dependencies"
	@echo "  make dev       - Start development server"
	@echo "  make preview   - Preview production build"
	@echo ""
	@echo "Usage examples:"
	@echo "  make deploy MESSAGE='Update work hours calculator'"
	@echo "  make deploy MESSAGE='Fix discount calculation bug'"

# Build the project
build:
	@echo "Building project..."
	npm run build
	@echo "Build complete! Files are in ./docs/"

# Deploy: build and commit with generic message
deploy:
	@echo "Building project..."
	npm run build
	@echo "Adding docs/ to git..."
	git add docs/
	@echo "Committing with generic deploy message..."
	git commit -m "Deploy build files for GitHub Pages"
	@echo "Pushing to origin..."
	git push
	@echo "Deployment complete! Your changes should be live on GitHub Pages shortly."

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf docs/
	@echo "Clean complete!"

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	@echo "Dependencies installed!"

# Start development server
dev:
	@echo "Starting development server..."
	npm run dev

# Preview production build
preview:
	@echo "Starting preview server..."
	npm run preview
