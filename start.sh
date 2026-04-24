#!/bin/bash

# ============================================================
#  AI Mining Operations Optimizer - Startup Script
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║       AI Mining Operations Optimizer             ║"
echo "  ║       Starting Application...                    ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
DB_NAME=${DB_NAME:-mining_optimizer}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# ---- Clean used ports ----
echo -e "${YELLOW}[1/6] Cleaning used ports...${NC}"

cleanup_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  Killing processes on port $port: $pids"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT
echo -e "${GREEN}  Ports $BACKEND_PORT and $FRONTEND_PORT are clear${NC}"

# ---- Check PostgreSQL ----
echo -e "${YELLOW}[2/6] Checking PostgreSQL...${NC}"

if command -v pg_isready &> /dev/null; then
  if pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo -e "${GREEN}  PostgreSQL is running${NC}"
  else
    echo -e "${RED}  PostgreSQL is not running. Attempting to start...${NC}"
    if command -v brew &> /dev/null; then
      brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || true
      sleep 2
    fi
    if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
      echo -e "${RED}  ERROR: PostgreSQL is not running. Please start it manually.${NC}"
      exit 1
    fi
  fi
else
  echo -e "${YELLOW}  pg_isready not found, assuming PostgreSQL is running${NC}"
fi

# ---- Create Database ----
echo -e "${YELLOW}[3/6] Setting up database...${NC}"

# Try to create the database (ignore error if it already exists)
PGPASSWORD=$DB_PASSWORD createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || true
echo -e "${GREEN}  Database '$DB_NAME' is ready${NC}"

# ---- Install Dependencies ----
echo -e "${YELLOW}[4/6] Installing dependencies...${NC}"

cd "$PROJECT_DIR/backend"
if [ ! -d "node_modules" ]; then
  echo -e "  Installing backend dependencies..."
  npm install --silent 2>&1 | tail -1
else
  echo -e "  Backend dependencies already installed"
fi

cd "$PROJECT_DIR/frontend"
if [ ! -d "node_modules" ]; then
  echo -e "  Installing frontend dependencies..."
  npm install --silent 2>&1 | tail -1
else
  echo -e "  Frontend dependencies already installed"
fi

# ---- Seed Database ----
echo -e "${YELLOW}[5/6] Seeding database...${NC}"
cd "$PROJECT_DIR/backend"
node src/seed/index.js
echo -e "${GREEN}  Database seeded successfully${NC}"

# ---- Start Services ----
echo -e "${YELLOW}[6/6] Starting services with hot reload...${NC}"

# Start backend with nodemon for hot reload
cd "$PROJECT_DIR/backend"
npx nodemon src/server.js &
BACKEND_PID=$!

# Start frontend with react-scripts (built-in hot reload)
cd "$PROJECT_DIR/frontend"
BROWSER=none PORT=$FRONTEND_PORT npm start &
FRONTEND_PID=$!

# Trap to cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  cleanup_port $BACKEND_PORT
  cleanup_port $FRONTEND_PORT
  echo -e "${GREEN}Shutdown complete${NC}"
  exit 0
}
trap cleanup SIGINT SIGTERM

echo -e "${CYAN}"
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║       Application Started Successfully!          ║"
echo "  ╠══════════════════════════════════════════════════╣"
echo "  ║  Frontend:  http://localhost:$FRONTEND_PORT              ║"
echo "  ║  Backend:   http://localhost:$BACKEND_PORT              ║"
echo "  ║                                                  ║"
echo "  ║  Login: admin@miningops.com / admin123           ║"
echo "  ║                                                  ║"
echo "  ║  Hot reload is active for both services          ║"
echo "  ║  Press Ctrl+C to stop                            ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo -e "${NC}"

# Wait for both processes
wait
