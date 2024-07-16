NAME		:= Transcendance
DOCKER_FLAGS 	:= --build
HOST_HOSTNAME	:= $(shell hostname)

ifneq ($(fg),)
	DOCKER_FLAGS += -d
endif

all: ${NAME} ;

${NAME}:
	HOST_HOSTNAME=$(HOST_HOSTNAME) docker compose build --parallel
	HOST_HOSTNAME=$(HOST_HOSTNAME) docker compose up

up:
	docker compose up -d

down:
	docker compose down

re:
	-docker container prune -f
	-docker volume rm transcendance_database transcendance_static
	${MAKE} ${NAME}
