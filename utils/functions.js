const db = require('../db/connection')
const inquirer = require('inquirer');
const cTable = require('console.table');

const promptUser = () => {

    return inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'What would you like to do?',
            choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role', 'Update employee managers', 'View Employees by Department', 'Delete departments', 'Delete roles', 'Delete employees', 'View total budget', 'Leave the Database']
        }
    ]).then(({ choice }) => {

        if (choice === 'View all departments') {
            viewAllDepartments();
        }

        else if (choice === 'View all roles') {
            viewAllRoles();
        }

        else if (choice === 'View all employees') {
            viewAllEmployees();
        }

        else if (choice === 'Add a department') {
            addDepartment();
        }

        else if (choice === 'Add a role') {
            addRole();
        }

        else if (choice === 'Add an employee') {
            addEmployee();
        }

        else if (choice === 'Update an employee role') {
            updateEmployee();
        }

        else if (choice === 'Update employee managers') {
            updateManager();
        }

        else if (choice === 'View Employees by Department') {
            viewEmployeeDepartment();
        }

        else if (choice === 'Delete departments') {
            deleteDepartment();
        }

        else if (choice === 'Delete roles') {
            deleteRole();
        }

        else if (choice === 'Delete employees') {
            deleteEmployee();
        }

        else if (choice === 'View total budget') {
            totalBudget();
        }

        else {
            leaveDatabase();
        }
    })
}

function viewAllDepartments() {
    const sql = `SELECT * FROM department`;

    db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table('\n', rows, '\n');
        promptUser();
    });
}

function viewAllRoles() {
    const sql = `SELECT role.id, role.title, role.salary, department.department_name 
                AS department
                FROM role
                LEFT JOIN department
                ON role.department_id = department.id;`
        ;

    db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table('\n', rows, '\n');
        promptUser();
    });
}

function viewAllEmployees() {
    const sql = `SELECT
                employee.id,
                employee.first_name, 
                employee.last_name,
                role.title,
                department.department_name AS department,
                role.salary,
                CONCAT (manager.first_name, " ", manager.last_name) AS manager
                FROM employee
                LEFT JOIN role ON employee.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee manager ON employee.manager_id = manager.id`;

    db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table('\n', rows, '\n');
        promptUser();
    });
}

// creates department and adds to database
function addDepartment() {

    return inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the department you would like to add? (Required)',
            validate: name => {
                if (name) {
                    return true
                } else {
                    console.log('Please enter a department!');
                    return false;
                }
            }
        }
    ]).then((choice) => {

        const sql = `INSERT INTO department (department_name) VALUES (?)`;
        const params = [choice.name];

        db.query(sql, params, (err, result) => {
            if (err) throw err;
            console.log('Department is added to the database\n\n');// added new lines to space better
            promptUser();
        });
    })
}

//creates role and adds to database
function addRole() {

    return inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the role you would like to add? (Required)',
            validate: name => {
                if (name) {
                    return true
                } else {
                    console.log('Please enter a role!');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary of the role? (Required)',
            validate: salary => {
                if (isNaN(salary)) {
                    console.log('\tPlease enter a salary number!');
                    return false
                } else {
                    return true;
                }
            }
        },
    ]).then((answers) => {

        this.answers = [answers.name, answers.salary];

        const params = [answers.name, answers.salary];

        const roleSQL = `SELECT department_name, id FROM department`;//select department_name and id FROM THE department table

        db.query(roleSQL, (err, data) => {
            if (err) throw err;

            const department = data.map(({ department_name, id }) => ({ name: department_name, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'department',
                    message: "What department is this role in?",
                    choices: department
                }
            ]).then((departmentChoice) => {

                const dept = departmentChoice.department;
                params.push(dept);

                const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;

                db.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log('Role is added to the database\n\n');// added new lines to space better
                    promptUser();
                });

            })
        });

    })
}

//adds employee
function addEmployee() {

    return inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'What is the employees first name? (Required)',
            validate: firstName => {
                if (firstName) {
                    return true
                } else {
                    console.log('Please enter a department!');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: 'What is the employees last name? (Required)',
            validate: lastName => {
                if (lastName) {
                    return true
                } else {
                    console.log('Please enter a department!');
                    return false;
                }
            }
        },
    ]).then(({ firstName, lastName }) => {

        const params = [firstName, lastName];

        const roleSql = `SELECT role.id, role.title FROM role`;

        db.query(roleSql, (err, data) => {
            if (err) throw err;

            const roles = data.map(({ id, title }) => ({ name: title, value: id }));

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: "What is the employee's role?",
                    choices: roles
                }
            ]).then(({ role }) => {
                params.push(role);//adds role to array

                const managerSql = `SELECT * FROM employee`;

                db.query(managerSql, (err, data) => {
                    if (err) throw err;

                    const managers = data.map(({ first_name, last_name, id }) => ({ name: first_name + " " + last_name, value: id }));

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: "Who is the employee's manager?",
                            choices: managers
                        }
                    ]).then(({ manager }) => {
                        params.push(manager);

                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`;

                        db.query(sql, params, (err, result) => {
                            if (err) throw err;
                            console.log('Employee is added to the database\n\n');// added new lines to space better
                            promptUser();
                        });
                    })
                });
            })
        });
    })
}

//update employee
function updateEmployee() {

    const employeeSql = `SELECT * FROM employee`;

    db.query(employeeSql, (err, data) => {
        if (err) throw err;

        const employees = data.map(({ first_name, last_name, id }) => ({ name: first_name + " " + last_name, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeName',
                message: "Which employee would you like to update?",
                choices: employees
            }
        ]).then(({ employeeName }) => {

            const params = [];

            params.push(employeeName);

            const roleSql = `SELECT * FROM role`;

            db.query(roleSql, (err, data) => {
                if (err) throw err;

                const roles = data.map(({ title, id }) => ({ name: title, value: id }));

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'employeeRole',
                        message: "What is the employee's new role?",
                        choices: roles
                    }
                ]).then(({ employeeRole }) => {
                    params.unshift(employeeRole);

                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

                    db.query(sql, params, (err, result) => {
                        if (err) throw err;
                        console.log('Employee has been updated\n\n');// added new lines to space better
                        promptUser();
                    })
                })
            })
        })
    });
}


//update employee managers
function updateManager() {
    const employeeSql = `SELECT * FROM employee`;

    db.query(employeeSql, (err, data) => {
        if (err) throw err;

        const employees = data.map(({ first_name, last_name, id }) => ({ name: first_name + " " + last_name, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeName',
                message: "Which employee would you like to update?",
                choices: employees
            }
        ]).then(({ employeeName }) => {
            const params = [];
            params.push(employeeName);

            const managerSql = `SELECT * FROM employee`;

            db.query(managerSql, (err, data) => {
                if (err) throw err;

                const managers = data.map(({ first_name, last_name, id }) => ({ name: first_name + " " + last_name, value: id }));

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'managerName',
                        message: "Who is the employee's manager?",
                        choices: managers
                    }
                ]).then(({ managerName }) => {
                    params.unshift(managerName);

                    const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;

                    db.query(sql, params, (err, result) => {

                        console.log('Employee manager has been updated\n\n');

                        promptUser();
                    })
                })
            })
        })
    })
}

//View employees by department
function viewEmployeeDepartment() {
    const sql = `SELECT employee.first_name, 
                employee.last_name, 
                department.department_name AS department
                FROM employee 
                LEFT JOIN role ON employee.role_id = role.id 
                LEFT JOIN department ON role.department_id = department.id`;

    db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table('\n', rows, '\n');
        promptUser();
    })
}

//delete department
function deleteDepartment() {
    const departmentSql = "SELECT * FROM department";

    db.query(departmentSql, (err, data) => {

        const department = data.map(({ department_name, id }) => ({ name: department_name, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'department',
                message: 'What department would you like to delete?',
                choices: department
            }
        ]).then(({ department }) => {
            const sql = `DELETE FROM department WHERE id = ?`;

            db.query(sql, department, (err, result) => {
                if (err) throw err;
                console.log('The Department you selected is deleted\n\n');// added new lines to space better
                promptUser();
            })
        })
    })
}

//delete roles
function deleteRole() {
    const roleSql = "SELECT * FROM role";

    db.query(roleSql, (err, data) => {

        const role = data.map(({ title, id }) => ({ name: title, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'role',
                message: 'What role would you like to delete?',
                choices: role
            }
        ]).then(({ role }) => {
            const sql = `DELETE FROM role WHERE id = ?`;

            db.query(sql, role, (err, result) => {
                if (err) throw err;
                console.log('The role you selected is deleted\n\n');// added new lines to space better
                promptUser();
            })
        })
    })
}

//delete employee
function deleteEmployee() {
    const employeeSql = "SELECT * FROM employee";

    db.query(employeeSql, (err, data) => {

        const employees = data.map(({ first_name, last_name, id }) => ({ name: first_name + " " + last_name, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeName',
                message: 'What employee would you like to delete?',
                choices: employees
            }
        ]).then(({ employeeName }) => {
            const sql = `DELETE FROM employee WHERE id = ?`;

            db.query(sql, employeeName, (err, result) => {
                if (err) throw err;
                console.log('The employee you selected is deleted\n\n');// added new lines to space better
                promptUser();
            })
        })
    })
}

//show total budget
function totalBudget() {
    const sql = `SELECT department_id AS id, 
                department.department_name AS department,
                SUM(salary) AS budget
                FROM  role  
                JOIN department ON role.department_id = department.id GROUP BY department_id`;

    db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table('\n', rows, '\n');
        promptUser();
    });

}

//leave application
function leaveDatabase() {
    console.log("Goodbye");
    db.end();
}

module.exports = { promptUser };