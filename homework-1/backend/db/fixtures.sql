BEGIN;
INSERT INTO users (
        email,
        first_name,
        last_name,
        gender,
        birthday,
        city,
        interests
    )
VALUES (
        "ross@gmail.com",
        "Ross",
        "Galler",
        "male",
        "1960-01-30",
        (
            SELECT id
            FROM cities
            WHERE name = "London"
        ),
        '["swimming", "dinosaurs"]'
    ),
    (
        "monica@gmail.com",
        "Monica",
        "Galler",
        "female",
        "1963-02-1",
        (
            SELECT id
            FROM cities
            WHERE name = "San Francisco"
        ),
        '["cooking"]'
    ),
    (
        "bing@gmail.com",
        "Chandler",
        null,
        null,
        null,
        (
            SELECT id
            FROM cities
            WHERE name = "Zurich"
        ),
        '["swimming", "dinosaurs"]'
    ),
    (
        "joey@gmail.com",
        "Joey",
        "Tribianni",
        "male",
        "1959-05-31",
        (
            SELECT id
            FROM cities
            WHERE name = "Zurich"
        ),
        '["girls"]'
    ),
    (
        "rachel@gmail.com",
        "Rachen",
        "Greem",
        "female",
        null,
        (
            SELECT id
            FROM cities
            WHERE name = "Zurich"
        ),
        null
    );
INSERT into friendship (req_friend, acc_friend, accepted, id)
VALUES (
        (
            SELECT @user1 := id
            from users
            WHERE email = "rachel@gmail.com"
        ),
        (
            SELECT @user2 := id
            from users
            WHERE email = "monica@gmail.com"
        ),
        true,
        unique_combination(@user1, @user2)
    ),
    (
        (
            SELECT @user1 := id
            from users
            WHERE email = "joey@gmail.com"
        ),
        (
            SELECT @user2 := id
            from users
            WHERE email = "bing@gmail.com"
        ),
        false,
        unique_combination(@user1, @user2)
    ),
    (
        (
            SELECT @user1 := id
            from users
            WHERE email = "ross@gmail.com"
        ),
        (
            SELECT @user2 := id
            from users
            WHERE email = "rachel@gmail.com"
        ),
        true,
        unique_combination(@user1, @user2)
    ),
    (
        (
            SELECT @user1 := id
            from users
            WHERE email = "joey@gmail.com"
        ),
        (
            SELECT @user2 := id
            from users
            WHERE email = "rachel@gmail.com"
        ),
        false,
        unique_combination(@user1, @user2)
    );
COMMIT;