NAME		:= Transcendance
DOCKER_FLAGS 	:= --build

ifneq ($(fg),)
	DOCKER_FLAGS += -d
endif

all: ${NAME} ;

${NAME}:
	npm install --prefix back/static/scripts/pong
	npm run build-dev --prefix back/static/scripts/pong
	docker compose up --build

up:
	docker compose up -d

down:
	docker compose down
