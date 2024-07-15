const express = require("express")
const app = express()
const jwtToken = require("jsonwebtoken")

const { open } = require("sqlite")
const sqlite3 = require("sqlite3")
const bcrypt = require("bcrypt")

const path = require("path")
const dbPath = path.join(__dirname,"mydata.db")

let db = null;



const initializeTheServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3001,() => {
            console.log("Server Running at http://localhost/3001/")
        })
    }
    catch(e) {
        console.log(`DB Error: ${e.message}`)
        process.exit(1)
    } 
}

// REGISTER NEW USER 
// Add the user details to the request body using curl or insomania 
app.post('/users', async (request, response) => {
    const { username,email,password,role } = request.body;
    const hashedPassword = await bcrypt.hash(request.body.password,10);
    await db.run('INSERT INTO users (username,email,hashedPassword,role) VALUES (?, ?,?,?)', [username,email,password,role], (err) => {
      if (err) {
        return response.status(400).json({ error: 'Error adding user' });
      }
      response.status(201).json({ message: 'User created' });
    });
  });


  // Login user 
  app.post("/login", async (request, response) => {
    const { email, password } = request.body;
    const getUserEmail = `
      SELECT *
      FROM users
      where email = '${email}'
      `;
    const dbUser = await db.get(getUserEmail);
    // It will check the user is available in data base or not if not displays invalid user
    if (dbUser === undefined) { 
      response.status(400);
      response.send("Invalid User");
    } 
    // if available compares password with hashed password if wrong password given invalid password
    else {
      const checkPassword = await bcrypt.compare(password, dbUser.password);
      if (checkPassword === true) {
        response.send("Login Success");
      } else {
        response.status(400);
        response.send("Invalid Password");
      }
    }
  });
  
  



initializeTheServer()