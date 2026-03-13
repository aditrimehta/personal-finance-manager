steps for install & setup:

BACKEND:
cd backend
python -m venv venv
source venv/Scripts/activate
pip install -r requirements.txt
Create .env- Since .env is not committed, they must create it themselves.
python manage.py migrate
python manage.py runserver

FRONTEND:
cd frontend
npm install
npm run dev
