NAME			:= Transcendence
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
	echo hello
# npm i
# npm run build -w front/src/scripts/pong

up:
	docker compose up -d

down:
	docker compose down

re: down
	-docker container prune -f
	${MAKE} ${NAME}
