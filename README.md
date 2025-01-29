# Org Chart Validator

## Overview
Org Chart Validator is a simple web-based tool that validates organization hierarchy based on a CSV file input. The tool ensures that the organization structure follows predefined rules and highlights any errors in reporting.

## Features
- Upload and parse CSV files.
- Validate organization hierarchy based on predefined rules.
- Highlight errors and display valid rows in a table.
- Provide real-time feedback on structure issues.

## Logic
The validation logic follows these rules:

1. **Root User**:
   - There must be exactly **one** Root user.
   - The Root user **must not** report to anyone.

2. **Admin Role**:
   - An Admin **must report** to the Root.
   - Admin **cannot** report to a Manager or a Caller.
   
3. **Manager Role**:
   - A Manager **can report** to an Admin or another Manager.
   - A Manager **cannot** report to a Root or a Caller.

4. **Caller Role**:
   - A Caller **must report** to a Manager.
   - A Caller **cannot** report to an Admin, Root, or another Caller.

5. **General Reporting Rules**:
   - Every user **must report** to **exactly one** parent user.
   - A user **cannot have multiple parents** (i.e., no semicolon-separated values in the ReportsTo column).
   - If a user reports to a non-existent user, it's an error.


