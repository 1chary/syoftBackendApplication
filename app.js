const express = require("express")
const app = express()
const jwtToken = require("jsonwebtoken")

const { open } = require("sqlite")
const sqlite3 = require("sqlite3")

const path = require("path")
const dbPath = path.join(__dirname,"mydata.db")

let db = null;



const initialTheServer = async () => {
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


initialTheServer()