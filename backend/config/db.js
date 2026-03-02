import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// create a connection pool just like we use mongoose.connect(uri) in mongodb
const pool=mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnection: true,
    connectionLimit: 10, // max 10 simultaneous connections
    queueLimit: 0
});

// convert pool to use Promises(so we can use async/await)
const db=pool.promise();

// Test the connection
pool.getConnection((err,connection)=>{
    if(err){
        console.error('Database connection failed:',err.message);
    }else{
        console.log('MySQL Database connected successfully !');
        connection.release(); // release back to pool
    }
});
export default db;
