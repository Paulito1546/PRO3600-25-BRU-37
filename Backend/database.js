import mysql from "mysql2"

import dotenv from "dotenv"
dotenv.config()

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise()

export default pool;

async function getElt(id){
    const [result] = await pool.query(`
        SELECT *
        FROM mainTbl
        WHERE id = ?
    `, [id])
    return result
}
