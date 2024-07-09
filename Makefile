NAME		:= Transcendance
DOCKER_FLAGS 	:= --build

ifneq ($(fg),)
	DOCKER_FLAGS += -d
endif

all: ${NAME} ;

${NAME}:
	docker compose build --parallel
	docker compose up

up:
	docker compose up -d

down:
	docker compose down

re:
	-docker container prune -f
	-docker volume rm transcendance_database transcendance_static
	${MAKE} ${NAME}
