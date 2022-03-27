const db = require('../db/connection')
const inquirer = require('inquirer');
const cTable = require('console.table');

const promptUser = () => {

    return inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: '###############################\n Select an option\n#################################\n',
            choices: ['View all departments', 'View all roles', 'View all employees', 'View employees by department', 'View total budget', 'Edit departments', 'Edit roles', 'Edit employees', 'Leave the Database']
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

        else if (choice === 'View employees by department') {
            viewEmployeeDepartment();
        }

        else if (choice === 'View total budget') {
            totalBudget();
        }

        else if (choice === 'Edit departments') {
            editDepartments();
        }

        else if (choice === 'Edit roles') {
            editRoles();
        }

        else if (choice === 'Edit employees') {
            editEmployees();
        }

        else {
            leaveDatabase();
        }
    })
};

function viewAllDepartments() {
    const sql = `SELECT * FROM department`;

    db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table('\n', rows, '\n');
        promptUser();
    });
};

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
};

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
};

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
};

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
};

// Department section begin
function editDepartments() {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: '###############################\n Select an option\n#################################\n',
            choices: ['Add a department', 'Delete departments',]
        }
    ]).then(({ choice }) => {

        if (choice === 'Add a department') {
            addDepartment();
        }

        else if (choice === 'Delete departments') {
            deleteDepartment();
        }
    })
};

// creates department and adds to database
function addDepartment() {

    return inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: '###############################\nEnter a name for the department.\n#################################\n (Required)',
            validate: name => {
                if (name) {
                    return true
                } else {
                    console.log('Please enter a department name.');
                    return false;
                }
            }
        }
    ]).then((choice) => {

        const sql = `INSERT INTO department (department_name) VALUES (?)`;
        const params = [choice.name];

        db.query(sql, params, (err, result) => {
            if (err) throw err;
            console.log('############################### \nDepartment added to the database.\n#################################');// added new lines to space better
            promptUser();
        });
    })
};

//delete department
function deleteDepartment() {
    const departmentSql = "SELECT * FROM department";

    db.query(departmentSql, (err, data) => {

        const department = data.map(({ department_name, id }) => ({ name: department_name, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'department',
                message: '###############################\nSelect a department to delete.\n#################################\n',
                choices: department
            }
        ]).then(({ department }) => {
            const sql = `DELETE FROM department WHERE id = ?`;

            db.query(sql, department, (err, result) => {
                if (err) throw err;
                console.log('The Department is now deleted\n\n');
                promptUser();
            })
        })
    })
};
// Department section end

// Role functions begin
function editRoles() {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: '###############################\n Select an option\n#################################\n',
            choices: ['Add a role', 'Delete a role', 'Update an employee role']
        }
    ]).then(({ choice }) => {

        if (choice === 'Add a role') {
            addRole();
        }

        else if (choice === 'Delete a role') {
            deleteRole();
        }

        else if (choice === 'Update an employee role') {
            updateEmployee();
        }
    })
};

//creates role and adds to database
function addRole() {

    return inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: '###############################\nEnter a role name. (Required)\n#################################\n',
            validate: name => {
                if (name) {
                    return true
                } else {
                    console.log('Please enter a role name.');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: '###############################\nEnter a salary figure. (Required)\n#################################\n',
            validate: salary => {
                if (isNaN(salary)) {
                    console.log('\tPlease enter a salary number.');
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
                    message: "#################################\nSelect a department to be under.\n#################################\n",
                    choices: department
                }
            ]).then((departmentChoice) => {

                const dept = departmentChoice.department;
                params.push(dept);

                const sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;

                db.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log('Role added to the database.\n\n');
                    promptUser();
                });

            })
        });

    })
};

//delete roles
function deleteRole() {
    const roleSql = "SELECT * FROM role";

    db.query(roleSql, (err, data) => {

        const role = data.map(({ title, id }) => ({ name: title, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'role',
                message: '###############################\nSelect a role to delete.\n#################################\n',
                choices: role
            }
        ]).then(({ role }) => {
            const sql = `DELETE FROM role WHERE id = ?`;

            db.query(sql, role, (err, result) => {
                if (err) throw err;
                console.log('The role is now deleted\n\n');
                promptUser();
            })
        })
    })
};

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
                message: "#################################\nSelect an employee to update.\n#################################\n",
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
                        message: "#################################\nSelect the employee's new role.\n#################################\n",
                        choices: roles
                    }
                ]).then(({ employeeRole }) => {
                    params.unshift(employeeRole);

                    const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

                    db.query(sql, params, (err, result) => {
                        if (err) throw err;
                        console.log('Employee has been updated\n\n');
                        promptUser();
                    })
                })
            })
        })
    });
};
// Role section ends

// Employee section begins
function editEmployees() {
    return inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: '###############################\n Select an option\n#################################\n',
            choices: ['Add an employee', 'Delete employees', 'Update employee managers']
        }
    ]).then(({ choice }) => {

        if (choice === 'Add an employee') {
            addEmployee();
        }

        else if (choice === 'Delete employees') {
            deleteEmployee();
        }

        else if (choice === 'Update employee managers') {
            updateManager();
        }
    })
};

//adds employee
function addEmployee() {

    return inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: '###############################\nEnter the employees first name. (Required)\n#################################\n',
            validate: firstName => {
                if (firstName) {
                    return true
                } else {
                    console.log('Please enter a first name.');
                    return false;
                }
            }
        },
        {
            type: 'input',
            name: 'lastName',
            message: '###############################\nEnter the employees last name. (Required)\n#################################\n ',
            validate: lastName => {
                if (lastName) {
                    return true
                } else {
                    console.log('Please enter a last name.');
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
                    message: "#################################\nSelect the employee's role.\n#################################\n",
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
                            message: "#################################\nSelect their manager.\n#################################\n",
                            choices: managers
                        }
                    ]).then(({ manager }) => {
                        params.push(manager);

                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                    VALUES (?, ?, ?, ?)`;

                        db.query(sql, params, (err, result) => {
                            if (err) throw err;
                            console.log('Employee is added to the database\n\n');
                            promptUser();
                        });
                    })
                });
            })
        });
    })
};

//delete employee
function deleteEmployee() {
    const employeeSql = "SELECT * FROM employee";

    db.query(employeeSql, (err, data) => {

        const employees = data.map(({ first_name, last_name, id }) => ({ name: first_name + " " + last_name, value: id }));

        inquirer.prompt([
            {
                type: 'list',
                name: 'employeeName',
                message: '###############################\nSelect an employee to delete.\n#################################\n',
                choices: employees
            }
        ]).then(({ employeeName }) => {
            const sql = `DELETE FROM employee WHERE id = ?`;

            db.query(sql, employeeName, (err, result) => {
                if (err) throw err;
                console.log('The employee is now deleted\n\n');
                promptUser();
            })
        })
    })
};

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
                message: "#################################\nSelect which employee to update.\n#################################\n",
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
                        message: "#################################\nSelect their manager.\n#################################\n",
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
};
// Employee section ends

//leave application
function leaveDatabase() {
    console.log("Goodbye");
    db.end();
};

module.exports = { promptUser };