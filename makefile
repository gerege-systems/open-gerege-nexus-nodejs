.PHONY: dev-backend dev-frontend up down migrate test build

DATABASE_URL ?= postgres://postgres:postgrespassword@localhost:5432/platform_db?sslmode=disable

dev-backend:
	cd backend && npm run dev

dev-frontend:
	cd frontend && npm run dev

up:
	docker-compose up -d

down:
	docker-compose down -v

migrate:
	cd backend && npm run db:migrate

test:
	cd backend && npm test

build:
	cd frontend && npm run build
