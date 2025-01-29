document.getElementById('csvInput').addEventListener('change', handleFile);

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        processCSV(e.target.result);
    };
    reader.readAsText(file);
}

function processCSV(csvData) {
    const errors = [];
    const validRows = [];
    const errorRows = [];
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    const headers = lines[0].split(',').map(h => h.trim());
    const users = [];
    const userMap = {};

    // Parse CSV data
    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(',').map(cell => cell.trim());
        const user = {
            email: cells[0],
            fullName: cells[1],
            role: cells[2],
            reportsTo: cells[3]
        };
        users.push(user);
        userMap[user.email] = user;
    }

    // Validate Root user
    const rootUsers = users.filter(u => u.role === 'Root');
    if (rootUsers.length !== 1) {
        errors.push(`Invalid Root configuration: Found ${rootUsers.length} Root users (must be exactly 1)`);
    } else {
        const root = rootUsers[0];
        if (root.reportsTo !== '') {
            errors.push(`Root user (${root.email}) must not report to anyone`);
        }
    }

    // Validate all users
    users.forEach(user => {
        if (user.role === 'Root') return;

        let isValid = true;
        let errorMessage = '';

        if (user.reportsTo.includes(';')) {
            errorMessage = `Cannot report to multiple parents (${user.reportsTo})`;
            isValid = false;
        }

        if (!user.reportsTo) {
            errorMessage = `Missing ReportsTo entry`;
            isValid = false;
        }

        const parent = userMap[user.reportsTo];
        if (!parent) {
            errorMessage = `Reports to non-existent user (${user.reportsTo})`;
            isValid = false;
        }

        switch (user.role) {
            case 'Admin':
                if (parent && parent.role !== 'Root') {
                    errorMessage = `Admin cannot report to ${parent.role} (${parent.fullName}) - must report to Root`;
                    isValid = false;
                }
                break;
            case 'Manager':
                if (parent && !['Admin', 'Manager'].includes(parent.role)) {
                    errorMessage = `Manager cannot report to ${parent.role} (${parent.fullName})`;
                    isValid = false;
                }
                break;
            case 'Caller':
                if (parent && parent.role !== 'Manager') {
                    errorMessage = `Caller cannot report to ${parent.role} (${parent.fullName})`;
                    isValid = false;
                }
                break;
            default:
                errorMessage = `Unknown role '${user.role}'`;
                isValid = false;
        }

        if (isValid) {
            validRows.push(user);
        } else {
            errorRows.push({ ...user, error: errorMessage });
        }
    });

    displayTable(validRows, errorRows);
    displayErrors(errors);
}

function displayTable(validRows, errorRows) {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = '';

    if (validRows.length === 0 && errorRows.length === 0) {
        tableContainer.innerHTML = '<p>No data to display.</p>';
        return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headerRow = document.createElement('tr');
    ['Email', 'Full Name', 'Role', 'Reports To', 'Error'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    validRows.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'valid-row';
        [row.email, row.fullName, row.role, row.reportsTo, ''].forEach(cellData => {
            const td = document.createElement('td');
            td.textContent = cellData;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    errorRows.forEach(row => {
        const tr = document.createElement('tr');
        tr.className = 'error-row';
        [row.email, row.fullName, row.role, row.reportsTo, row.error].forEach(cellData => {
            const td = document.createElement('td');
            if (cellData === row.error) {
                td.className = 'error-message';
            }
            td.textContent = cellData;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
}
