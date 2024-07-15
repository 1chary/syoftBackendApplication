const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")

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
app.post('/users/', async (request, response) => {
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
  app.post("/login/", async (request, response) => {
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
  
  // This function will authenticate jwt token 

  const authenticateToken = (request,response,next) => {
    let jwtToken;
    const authHeader = request.headers['authorization']
    if (authHeader !== undefined) {
        jwtToken = authHeader.split(" ")[1]
    }
    if (authHeader === undefined) {
        response.send(400)
        response.send("Token not provided")
    }
    else {
        jwt.verify(jwtToken,'myToken', async(error,payload) => {
            if (error) {
                response.send(401);
                response.send("Invalid JWT Token")
            }
            else {
                next();
            }
        })
    }

  }
  
  // create a content 
  app.post("/create/", authenticateToken , async(request,response) => {
    const { username } = request.body;
    await db.run(`INSERT INTO product_details (title,description,inventory_count) VALUES (?,?,?) WHERE username = ${username} `, [title,description,inventory_count], (err) => {
      if (err) {
        return response.status(400).json({ error: 'Error adding details' });
      }
      response.status(201).json({ message: 'Details Added Successfully' });
    });
  })

  // Read a content 

  app.get("/details/:username", authenticateToken, async(request,response) => {
    const {username} = request.body;
    const getDetails = `
        SELECT *
        FROM product_details
        WHERE username = ${username}
    `
    const responseData = await db.get(getDetails)
    response.send(responseData)
  })

  // update content 
  app.put("/details/:username", authenticateToken, async(request,response) => {
    const { username } = request.params;
    const updateDetails  = request.body;
    const {title,description,inventory_count} = updateDetails;
    const updateProductQuery = `
    UPDATE
      product_details
    SET
      title='${title}',
      description='${description}',
      inventory_count = '${inventory_count}'
    WHERE
      username = ${username};`;
    await db.run(updateProductQuery);
    response.send("Product Details Updated Successfully");
  })

  // delete 
  app.delete("/details/:username", authenticateToken, async(request,response) => {
    const { username } = request.params;
    const deleteProductQuery = `
      DELETE FROM
        product_details
      WHERE
        username = ${username};`;
    await db.run(deleteProductQuery);
    response.send("Product Details Deleted Successfully");
  })

initializeTheServer()