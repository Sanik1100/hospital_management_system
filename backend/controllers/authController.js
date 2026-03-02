import db from "../config/db.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';

// register logic
export const register=async (req,res) => {
    try {
        const {full_name,email,password,phone,role}=req.body;

        // 1. Check if all fields are provided
        if(!full_name || !email || !password){
            return res.status(400).json({
                message: 'Full name, email and password are required'
            });
        }

        // 2. Check if email already exists
        // here existingUser is an array
        const [existingUser]=await db.query(
            'select id from users where email = ?',[email]
        );

        if(existingUser.length > 0){
            return res.status(400).json({
                message: 'Email already registered'
            });
        }

        // 3.hash the password
        const hashedPassword=await bcrypt.hash(password,10);

        //4.Insert into users table
        // here result is an array
        const [result]=await db.query(
            `insert into users (full_name,email,password,phone,role)
            values(?,?,?,?,?)`,
            [full_name,email,hashedPassword,phone || null, role || 'patient']
        );

        const userId=result.insertId;  // id is inserted by mysql itself automatically in database

        // create Patient Profile
        if(role === 'patient' || !role){
            await db.query(
                'insert into patients (user_id) values (?)',
                [userId]
            );
        }
        // create Doctor Profile
        if(role === 'doctor'){
            await db.query(
                'insert into doctors (user_id) values (?)',
                [userId]
            );
        }
        // generate jwt token
        const token=jwt.sign(
            {id: userId, role:role || 'patient'},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );
        // send response
        res.status(201).json({
            message:'Registration successfull',
            token,
            user:{
                id: userId,
                full_name: full_name,
                email: email,
                role: role || 'patient'
            }
        });


    } catch (error) {
        console.error('Register error:'.error);
        res.status(500).json({message:'Server error', error:error.message})
    } 
};

// login logic
export const login=async (req,res) => {
    try {
        const {email,password,role}=req.body;

        if(!email || !password){
            return res.status(400).json({
                message:'Email and password are required'
            });
        }

        // 2.Find the user by email
        // here users is an array of rows returned from MySQL.
        const [users]=await db.query(
            'select * from users where email= ?', [email]
        );

        {/*
users = [
  {
    id: 5,
    full_name: "John Doe",
    email: "john@gmail.com",
    password: "$2a$10$abcd...",
    role: "patient"
  }
]
            
            */}
        if(users.length === 0){
            return res.status(401).json({
                message:'Invalid email or password'
            });
        }
        const user=users[0];  // extracts the first user object from the users array returned by the database query
        {/*
            user={
            id:5,
            full_name:'John doe',
            email: 'john@gmail.com',
            password:'1234' 
            }
             */}

             // Check role matches
             if(role && user.role !== role){
                return res.status(401).json({
                    message:`No ${role} account found with this email`

                });
             }

             // 4.Compare password
             const isMatch= await bcrypt.compare(password,user.password);
             if(!isMatch){
                return res.status(401).json({
                    message: 'Invalid email or password'
                });
             }

             // generate JWT token for login
             const token=jwt.sign(
              {id: user.id,
                role:user.role
              },
              process.env.JWT_SECRET,
              {expiresIn:'7d'}
             );

             // send response
             res.status(200).json({
                message:'Login successfull',
                token,
                user:{
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone
                }
             });
    } catch (error) {
        console.error('Login error:',error);
        res.status(500).json({message:'Server error', error:error.message})
    } 
};

// get  current logged in user
export const getMe=async(req,res)=>{
try {
    // req.user.id comes from jwt authentication middleware
    const [users]=await db.query(
       'select id,full_name,email,role,phone,profile_image from users where id= ?',[req.user.id] 
    );
    if(users.length === 0){
        return res.status(404).json({
            message:'User not found'
        });
    }
    res.status(200).json({user: users[0]});
} catch (error) {
    res.status(500).json({message: 'Server error', error: error.message});
}
};

// POST   /api/auth/forgot-password
export const forgotPassword=async (req,res) => {
    try {
        const {email}=req.body;

        const [users]=await db.query(
            'select id from users where email = ?',[email]
        );

        if(users.length === 0){
            return res.status(404).json({ message: 'No account with that email'});
        }

        // generate a reset token
        const resetToken= jwt.sign(
            {id: users[0].id},
            process.env.JWT_SECRET,
            {expiresIn: '15m'}
        );

        // In production we would email the reset link to the user
        res.status(200).json({
            message:'Password reset token generated',
            resetToken,  // later it would be sent via email using nodemailer
        });
    } catch (error) {
        res.status(500).json({message:'Server error',error:error.message});
        
    }
};

// POST /api/auth/reset-password
export const resetPassword=async (req,res) => {
    try {
        const {resetToken,newPassword}=req.body;

        // verify the reset token
        const decoded=jwt.verify(resetToken,process.env.JWT_SECRET);

        // hashed the new password
        const hashedPassword=await bcrypt.hash(newPassword,10);

        // Update the new password in the database
        await db.query(
            'update users set password = ? where id = ?',[hashedPassword,decoded.id]
        );

        res.status(200).json({message:'Password reset successfully !!'});

    } catch (error) {
        res.status(500).json({message:'Invalid or expired token'});
    }
    
};