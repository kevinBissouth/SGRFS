
import psycopg2


def get_db_connection():
    conn = psycopg2.connect(
        host = "localhost",
        database = "gestion_requetes",
        user = "admin",
        password = "1234",
    )

    cur = conn.cursor()
    return conn, cur


