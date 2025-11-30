@echo off
echo Setting up FranCheese E-commerce Backend...
echo.

echo Installing dependencies...
npm install
echo.

echo Setting up environment variables...
if not exist .env (
    echo PORT=5000 > .env
    echo MONGODB_URI=mongodb://localhost:27017/francheese >> .env
    echo JWT_SECRET=your-super-secret-jwt-key-change-this-in-production >> .env
    echo Environment file created. Please update .env with your MongoDB connection.
) else (
    echo Environment file already exists.
)
echo.

echo Setup complete!
echo.
echo Next steps:
echo 1. Make sure MongoDB is running locally or update MONGODB_URI in .env
echo 2. Run 'npm start' to start the backend server
echo 3. Open the frontend at http://localhost:8000/src/francheese.html
echo 4. Login with admin@francheese.com / admin123
echo.
pause
