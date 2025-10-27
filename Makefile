# SecureShop Makefile
.PHONY: build dev stop

# Install dependencies and build containers
build:
	@echo "Installing backend dependencies..."
	@cd secure-backend && go mod download && go mod tidy
	@echo "Installing frontend dependencies..."
	@cd secure-frontend && npm install
	@echo "Building Docker containers..."
	@docker compose --env-file .env.production build

# Run both backend and frontend in development mode
dev:
	@echo "Starting backend and frontend..."
	@powershell -Command "Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd secure-backend; go run main.go'"
	@powershell -Command "Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd secure-frontend; npm run dev'"

# Stop all running processes
stop:
	@echo "Stopping Docker containers..."
	@docker compose --env-file .env.production down
	@echo "Killing backend and frontend processes..."
	@powershell -Command "Get-Process | Where-Object {$$_.ProcessName -eq 'go' -or ($$_.ProcessName -eq 'node' -and $$_.CommandLine -like '*vite*')} | Stop-Process -Force" 2>$$null || echo "No running processes found"
