import jwt from 'jsonwebtoken';
// Protect: verify jwt token
// verify if a user is logged in or not
export const protect= (req,res,next)=>{
try {
    // get token from header
    const authHeader=req.headers.authorization;
    console.log("Authentication header:",authHeader);
    // authHeader:Bearer TOKEN
    
    if(!authHeader || !authHeader.startsWith('Bearer')){
        return res.status(401).json({message:'No token,unauthorized'});
    }
    const token=authHeader.split(' ')[1];
    {/*
        the above code does suppose 'Bearer eyJhbGc12345' then split result: ["Bearer", "eyJhbGc12345"]
        */}

    // verify token
    const decoded=jwt.verify(token, process.env.JWT_SECRET);

    req.user=decoded;  // adds the user data to the request
    console.log('the req.user=decoded is',req.user);
    next();
} catch (error) {
    return res.status(401).json({message: 'Token invalid or expired'});
}
};

// Check if the user has permission (role authorization)
// restrict to: allow only certain roles
// This middleware controls who can access a route.

export const restrictTo=(...roles)=>{
    // here ...roles becomes an array
    return (req,res,next)=>{

        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                 message: `Access denied. ${req.user.role}s cannot access this route`
            });
        }
        next();
    }
};