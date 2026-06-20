#!/usr/bin/env bash
# ============================================================
# Bootstrap do PostgreSQL + TimescaleDB (Fedora) para o backend.
# Rodar UMA vez, com privilégio:   sudo bash seed/bootstrap_db.sh
# Idempotente: pode rodar de novo sem quebrar.
# ============================================================
set -euo pipefail

DATA_DIR="/var/lib/pgsql/data"
DB_NAME="pontes"
APP_USER="${SUDO_USER:-$(whoami)}"

echo "==> Usuário da aplicação (role do banco): ${APP_USER}"

echo "==> 1/6 Instalando PostgreSQL + TimescaleDB"
dnf install -y timescaledb postgresql postgresql-server postgresql-contrib

echo "==> 2/6 Inicializando o cluster (se necessário)"
if [ ! -f "${DATA_DIR}/PG_VERSION" ]; then
  postgresql-setup --initdb
else
  echo "    cluster já inicializado, pulando initdb"
fi

echo "==> 3/6 Habilitando timescaledb em shared_preload_libraries"
CONF="${DATA_DIR}/postgresql.conf"
if ! grep -q "^shared_preload_libraries.*timescaledb" "${CONF}"; then
  echo "shared_preload_libraries = 'timescaledb'" >> "${CONF}"
  echo "    adicionado"
else
  echo "    já configurado"
fi

echo "==> 4/6 Iniciando o serviço"
systemctl enable postgresql
systemctl restart postgresql

echo "==> 5/6 Criando role e banco"
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${APP_USER}') THEN
    CREATE ROLE "${APP_USER}" LOGIN SUPERUSER;
  END IF;
END
\$\$;
SQL
# CREATE DATABASE não roda dentro de bloco DO; checa e cria.
if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
  sudo -u postgres createdb -O "${APP_USER}" "${DB_NAME}"
  echo "    banco ${DB_NAME} criado"
else
  echo "    banco ${DB_NAME} já existe"
fi

echo "==> 6/6 Habilitando a extensão timescaledb em ${DB_NAME}"
sudo -u postgres psql -d "${DB_NAME}" -v ON_ERROR_STOP=1 \
  -c "CREATE EXTENSION IF NOT EXISTS timescaledb;"

echo ""
echo "OK. Banco pronto. Verifique com:"
echo "  psql -d ${DB_NAME} -c '\\dx'"
