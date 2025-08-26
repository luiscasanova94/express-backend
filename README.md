# API with Node.js and Sequelize

This is the backend for an application that implements a robust and secure user authentication system. The API is built with **Node.js** and the **Express** framework, using **Sequelize** as an ORM to interact with a **PostgreSQL** database.

## ✨ Features

  * **Secure Authentication**: Implements a login system based on **JSON Web Tokens (JWT)**.
  * **Complete Session Management**: Includes endpoints for `login` and `logout`. The logout is handled using a token blacklist to invalidate them before expiration.
  * **Protected Routes**: Uses middleware to verify the validity of the token on routes that require authentication.
  * **Scalable Database**: Employs **Sequelize** with migrations for database schema version control and *seeders* to populate it with initial data.
  * **Centralized Configuration**: Manages sensitive information and configuration through environment variables with a `.env` file.

-----

## 🚀 Getting Started

Follow these instructions to set up and run the project in your local environment.

### **Prerequisites**

Make sure you have the following installed:

  * Node.js (v14 or higher)
  * PostgreSQL

### **Installation and Configuration**

1.  **Clone the repository**

    ```bash
    git clone <REPOSITORY-URL>
    cd backend
    ```

2.  **Install project dependencies**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the project root and configure it based on the `.env` file you provided.

    ```env
    DATABASE_URL=postgres://your_user:your_password@localhost:5432/your_database
    JWT_SECRET=a_very_strong_secret
    ```

4.  **Set up the Database**
    Ensure your PostgreSQL service is running and create the database you specified in the `DATABASE_URL`.

5.  **Run Migrations and Seeders**
    These commands will prepare the database by creating the necessary tables and adding the initial data.

    ```bash
    # Apply migrations to create the users table
    npx sequelize-cli db:migrate

    # Populate the database with the initial user
    npx sequelize-cli db:seed:all
    ```

-----

## 🛠️ Usage

### **Start the Server**

To run the application, use the `start` script defined in your `package.json`.

```bash
npm start
```

The server will start on port 3000 or the port defined in your environment variables. You will see the message: `🚀 Server running on 3000`.

### **API Endpoints**

You can test the following endpoints using a tool like Postman or Insomnia.

#### **Authentication**

  * **`POST /login`**

      * Authenticates a user and returns a JWT token.
      * **Body (JSON):**
        ```json
        {
          "username": "luis",
          "password": "540Mega$__"
        }
        ```
      * **Successful Response (200 OK):**
        ```json
        {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
        ```

  * **`POST /logout`**

      * Invalidates the user's current JWT token. Requires the token to be sent in the authorization header.
      * **Headers:**
        ```
        Authorization: Bearer <your_jwt_token>
        ```
      * **Successful Response (200 OK):**
        ```json
        {
          "message": "Logout successful."
        }
        ```

#### **Protected Routes**

  * **`GET /profile`**
      * Example route that returns information about the authenticated user.
      * **Headers:**
        ```
        Authorization: Bearer <your_jwt_token>
        ```
      * **Successful Response (200 OK):**
        ```json
        {
          "message": "Bienvenido luis (ID: 1)"
        }
        ```

-----

## 💻 Technologies Used

  * **Node.js**: JavaScript runtime environment.
  * **Express**: Web framework for the API.
  * **PostgreSQL**: Relational database.
  * **Sequelize**: ORM for Node.js and PostgreSQL.
  * **jsonwebtoken**: For creating and verifying JWT tokens.
  * **bcryptjs**: For securely hashing passwords.
  * **dotenv**: For managing environment variables.