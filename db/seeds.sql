INSERT INTO department(department_name) VALUES
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal');

INSERT INTO role(title, salary, department_id) VALUES
    ('Sales Lead', 100000, 1),
    ('Salesperson', 80000, 1),
    ('Lead Engineer', 150000, 2),
    ('Software Engineer', 120000, 2),
    ('Account Manager', 160000, 3),
    ('Accountant', 125000, 3),
    ('Legal Team Lead', 250000, 4),
    ('Lawyer', 190000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES
    ('Brock', 'Obama', 1, NULL),
    ('Ceaser', 'Salad', 1, 1),
    ('Anne', 'Chovie', 2, NULL),
    ('Ash', 'Ketchum', 2, 3),
    ('Heathcliff', 'Riffraff', 3, NULL),
    ('Tenchi', 'Muyo', 3, 5),
    ('Tommy', 'Pickles', 4, NULL),
    ('Tom', 'Ato', 4, 7)
    ;