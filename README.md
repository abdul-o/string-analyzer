String Analyzer Service — Stage 1 Backend Task
📘 Overview

This is the Stage 1 Backend Task for the internship — a RESTful API that analyzes strings and computes several properties such as length, palindrome status, unique characters, word count, SHA-256 hash, and character frequency.

Each analyzed string is stored and can be retrieved, filtered, or deleted.

🚀 Features

Analyze and store any string.

Compute:

String length

Palindrome check (case-insensitive)

Unique character count

Word count

SHA-256 hash (unique identifier)

Character frequency map

Retrieve all analyzed strings with filters.

Retrieve or delete a specific string.

Support for simple natural language filtering (e.g. “all single word palindromic strings”).

🧑‍💻 Tech Stack

Node.js

Express.js

Crypto (for SHA-256 hashing)

dotenv

cors

morgan

🧰 Dependencies
Package	Version	Purpose
express	^4.18.2	Web framework
cors	^2.8.5	Enable CORS
dotenv	^16.0.0	Manage environment variables
morgan	^1.10.0	HTTP request logging
crypto	(built-in)	Generate SHA-256 hash
⚙️ Installation & Setup
1️⃣ Clone the Repository

2️⃣ Install Dependencies
npm install

3️⃣ Environment Variables

Create a .env file in the root directory (optional, only if you want to override defaults):

PORT=3000
NODE_ENV=development


If no .env file is provided, the app will default to port 3000.

4️⃣ Run the Application
npm start


Server will start at:

http://localhost:3000

