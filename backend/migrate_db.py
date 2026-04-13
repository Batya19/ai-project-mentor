"""Additive schema sync helper for local development.

This keeps existing data and adds the project columns introduced after the
initial schema. It avoids destructive operations.
"""

from sqlalchemy import text

from app.db.session import engine


STATEMENTS = [
    "ALTER TABLE projects ADD COLUMN IF NOT EXISTS domain VARCHAR(100) NOT NULL DEFAULT 'general'",
    "ALTER TABLE projects ADD COLUMN IF NOT EXISTS business_value TEXT NOT NULL DEFAULT ''",
    "ALTER TABLE projects ADD COLUMN IF NOT EXISTS unique_aspects TEXT NOT NULL DEFAULT ''",
]


def main() -> None:
    with engine.begin() as connection:
        for statement in STATEMENTS:
            connection.execute(text(statement))
            print(f"Applied: {statement}")

    print("Schema sync complete")


if __name__ == "__main__":
    main()
