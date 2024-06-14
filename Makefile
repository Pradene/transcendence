NAME	:= Transcendance

all: ${NAME} ;

${NAME}:
	npm install --prefix back/static/scripts/pong
	npm run build-dev --prefix back/static/scripts/pong
	docker compose up --build -d

up:
	docker compose up -d

down:
	docker compose down
