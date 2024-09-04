NAME			:= Transcendence
DOCKER_FLAGS 	:= --build
HOST_HOSTNAME	:= $(shell hostname)

ifneq ($(fg),)
	DOCKER_FLAGS += -d
endif

all: ${NAME}

${NAME}:
	HOST_HOSTNAME=$(HOST_HOSTNAME) docker compose build --parallel
	HOST_HOSTNAME=$(HOST_HOSTNAME) docker compose up

up:
	docker compose up -d

down:
	docker compose down

clean:
	-docker volume rm transcendence_database
	-docker volume rm transcendence_ssl_certs
	-docker container prune -f
	-docker rmi $(docker images)


re: down clean
	${MAKE} ${NAME}
