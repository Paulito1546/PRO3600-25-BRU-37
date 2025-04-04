USE mainDb;

-- ADD: mealImage LONGBLOB 

CREATE TABLE meals (
    mealId INTEGER PRIMARY KEY,
    mealName VARCHAR(255) NOT NULL,
    likes INTEGER DEFAULT 0,
    positionInWeek INTEGER -- Between 1 and 5, represents day of the week (meals are refreshed weekly)
);
