NAME			:= Transcendance
DOCKER_FLAGS 	:= --build
HOST_HOSTNAME	:= $(shell hostname)

ifneq ($(fg),)
	DOCKER_FLAGS += -d
endif

all: ${NAME}

${NAME}: build_scripts
	HOST_HOSTNAME=$(HOST_HOSTNAME) docker compose build --parallel
	HOST_HOSTNAME=$(HOST_HOSTNAME) docker compose up

build_scripts:
	npm i
	npm run build -w web/static/scripts/pong

up:
	docker compose up -d

down:
	docker compose down

re:
	-docker container prune -f
	-docker volume prune -f
	-docker volume rm transcendance_database
	${MAKE} ${NAME}
