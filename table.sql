
Drop Table if EXISTS  reg_data ,towns;

CREATE TABLE towns
(
    id serial PRIMARY KEY NOT NULL,
    townname varchar(50) NOT NULL,
    towncode varchar(5) NOT NULL
);


CREATE TABLE reg_data
(
    id serial PRIMARY KEY NOT NULL,
    regnumber varchar(20) NOT NULL ,
    town_id int NOT NULL ,
    FOREIGN KEY (town_id) REFERENCES towns(id) ON DELETE CASCADE
);


INSERT INTO towns(townName,townCode) VALUES ('Cape Town', 'CA');
INSERT INTO towns(townName,townCode) VALUES ('George', 'CAW');
INSERT INTO towns(townName,townCode) VALUES ('Stellenbosch', 'CL');
INSERT INTO towns(townName,townCode) VALUES ('Paarl', 'CJ');