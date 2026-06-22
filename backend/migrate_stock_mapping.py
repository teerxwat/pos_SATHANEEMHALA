import pymysql


def column_exists(cursor, table_name, column_name):
    cursor.execute(
        """
        SELECT COUNT(*) AS count
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = %s
          AND COLUMN_NAME = %s
        """,
        (table_name, column_name),
    )
    return cursor.fetchone()["count"] > 0


def migrate():
    connection = pymysql.connect(
        host="localhost",
        user="root",
        password="",
        database="sathanimala",
        cursorclass=pymysql.cursors.DictCursor,
    )

    try:
        with connection.cursor() as cursor:
            if not column_exists(cursor, "table_category", "is_stock_item"):
                print("Adding table_category.is_stock_item...")
                cursor.execute(
                    """
                    ALTER TABLE table_category
                    ADD COLUMN is_stock_item BOOLEAN NOT NULL DEFAULT FALSE AFTER cost
                    """
                )

            if not column_exists(cursor, "table_category", "stock_item_id"):
                print("Adding table_category.stock_item_id...")
                cursor.execute(
                    """
                    ALTER TABLE table_category
                    ADD COLUMN stock_item_id INT NULL AFTER is_stock_item
                    """
                )

            if not column_exists(cursor, "table_category", "stock_deduct_quantity"):
                print("Adding table_category.stock_deduct_quantity...")
                cursor.execute(
                    """
                    ALTER TABLE table_category
                    ADD COLUMN stock_deduct_quantity INT NOT NULL DEFAULT 1 AFTER stock_item_id
                    """
                )

            cursor.execute(
                """
                UPDATE table_category
                SET stock_deduct_quantity = 1
                WHERE stock_deduct_quantity IS NULL OR stock_deduct_quantity < 1
                """
            )
            cursor.execute(
                """
                UPDATE table_category tc
                JOIN type_menu tm ON tm.type_id = tc.type_id
                SET tc.is_stock_item = TRUE
                WHERE tm.type_name IN ('เครื่องดื่ม', 'แอลกอฮอล์', 'มิ๊กเซอร์')
                  AND tc.stock_item_id IS NULL
                  AND tc.menu_name NOT LIKE '%โปร%'
                  AND tc.menu_name NOT LIKE '%2 ขวด%'
                  AND tc.menu_name NOT LIKE '%3 ขวด%'
                  AND tc.menu_name NOT LIKE '%5 ขวด%'
                """
            )

        connection.commit()
        print("Stock mapping migration complete.")
    finally:
        connection.close()


if __name__ == "__main__":
    migrate()
