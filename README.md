# Admin Rule Builder

This is a simple React-based admin interface for managing rules with conditional logic. Users can create, edit, and delete rules, defining **IF → THEN / ELSE** actions based on a blueprint of fields.

<img width="824" height="531" alt="Screenshot 2025-11-04 at 4 02 41 PM" src="https://github.com/user-attachments/assets/5eba8dfd-d6dc-44ae-a24b-15178a6a0b7c" />


## Features

- Fetch and display rules from a backend API.
- Create new rules with multiple conditions and actions.
- Edit existing rules.
- Delete rules.
- Support for logical operators (AND / OR) in conditions.
- Dynamic action builder with support for `setResult` and field properties (`display`, `required`).
- Simple modal interface for rule creation and editing.

## Technologies Used

- React (with hooks)
- Axios for API requests
- Tailwind CSS for basic styling

## API Endpoints

- `GET /api/rules` — Fetch all rules.
- `POST /api/rules` — Save updated rules.
- `GET /api/blueprint` — Fetch blueprint fields used for conditions and actions.

## Usage
!! IMPORTANT : make sure to have bun locally or else it will give you issue with using __dirname for as __dirname is not available in TS 
```bash
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

#this code must be added if not having bun
```

1. Clone the repository.
2. Install dependencies:
   ```bash
   cd frontend && bun install && cd .. && cd backend && bun install 
    ```
3. Run in in one terminal
    ```bash
    cd frontend && bun run dev 
    ```
4. Run in in another terminal
    ```bash
    cd backend && bun run dev
    ```
## Loom video url : https://www.loom.com/share/edf7968352e84461877e1351e6daf6f1
