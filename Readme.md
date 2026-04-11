# Personal Finance Manager

A web application to help users manage and track their personal finances. Users can record transactions, monitor expenses, and manage their financial data in one place.

## Tech Stack

Frontend:
- React
- Vite
- JavaScript
- CSS

Backend:
- Django
- Python
- PostgreSQL / SQLite

-----------------------------------

## Project Setup

### Backend Setup

1. Navigate to the backend folder

cd backend

2. Create a virtual environment

python -m venv venv

3. Activate the virtual environment

Windows:
venv\Scripts\activate

Mac/Linux:
source venv/bin/activate

then cd backend again

4. Install dependencies

pip install -r requirements.txt

5. Create a `.env` file in same folder as manage.py

The `.env` file is not committed to the repository, so it must be created manually.

Example:
DATABASE_URL= (add ur connection string from neon in single quotes)

6. Apply database migrations

python manage.py migrate

7. Run the backend server

python manage.py runserver

Backend will run at:
http://127.0.0.1:8000/

-----------------------------------

### Frontend Setup

1. Navigate to the frontend folder

cd frontend

2. Install dependencies

npm install

3. Run the development server

npm run dev

Frontend will run at:
http://localhost:5173/

-----------------------------------

## Notes

- The `.env` file is excluded from the repository for security reasons.
- Make sure Python and Node.js are installed before setup.
