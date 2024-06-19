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
