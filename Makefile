makemigrations:
	docker compose run --remove-orphans django python manage.py makemigrations

migrate:
	docker compose run --remove-orphans django python manage.py migrate

create_superuser:
	docker compose run --remove-orphans django python manage.py createsuperuser

install_dependencies:
	docker compose run --remove-orphans django pip install -r requirements.txt