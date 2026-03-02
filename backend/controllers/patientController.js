import db from '../config/db.js'
// get patient profile
export const getPatientProfile=async (req,res) => {
    try {
        const [rows]=await db.query(
            `select p.id,p.dob,p.blood_group,
            p.address,p.emergency_contact,
            u.full_name,u.email,u.phone,u.profile_image
            from patients p
            join users u 
            on p.user_id= u.id
            where p.user_id= ?
            `,[req.user.id]
        );

        if(rows.length === 0){
             return res.status(404).json({ message: 'Patient not found' });

        }
        res.status(200).json({patient: rows[0]});
    } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
    }  
};

// update patient profile
export const updatePatientProfile=async (req,res) => {
    try {
        const {full_name, phone,dob,blood_group,address,emergency_contact}=req.body;

        // update users table
        await db.query(
            
        )
    } catch (error) {
        
    }
    
}