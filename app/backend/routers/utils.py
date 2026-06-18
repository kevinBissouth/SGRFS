"""Utils partagés pour les routers: helpers DB et sécurité.
"""
from typing import Any, List, Optional, Tuple
from backend.database.database import get_db_connection
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def query_one(query: str, params: Tuple = ()) -> Optional[Tuple[Any, ...]]:
    conn, cur = get_db_connection()
    try:
        cur.execute(query, params)
        return cur.fetchone()
    finally:
        cur.close()
        conn.close()


def query_all(query: str, params: Tuple = ()) -> List[Tuple[Any, ...]]:
    conn, cur = get_db_connection()
    try:
        cur.execute(query, params)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()


def execute_commit(query: str, params: Tuple = ()) -> None:
    conn, cur = get_db_connection()
    try:
        cur.execute(query, params)
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()
