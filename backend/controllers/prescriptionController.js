import db from "../config/db.js";

// add prescription to a medical record
// from: Medical Records page -> Prescriptions panel
// Shows medicine name, dosage,frequency ,status tag
export const addPrescription = async (req, res) => {
  try {
    const { record_id, medicine, dosage, duration, instructions, refills } =
      req.body;

    if (!record_id || !medicine || !dosage) {
      return res.status(400).json({
        message: "Record ID, medicine and dosage are required",
      });
    }

    // Check record exists
    const [recordRows] = await db.query(
      `select id, doctor_id from medical_records where id = ?`,
      [record_id],
    );
    if (recordRows.length === 0) {
      return res.status(404).json({ message: "Medical record not found" });
    }

    // Only the treating doctor can add prescriptions
    const [docRows] = await db.query(
      `select id from doctors where user_id = ?`,
      [req.user.id],
    );

    if (docRows.length === 0 || docRows[0].id !== recordRows[0].doctor_id) {
      return res.status(403).json({
        message: "Only the treating doctor can add prescriptions",
      });
    }

    const [result] = await db.query(
      `insert into prescriptions (record_id, medicine, dosage, duration, status)
    values (? ,? ,? ,? ,'active')
    `,
      [record_id, medicine, dosage, duration || null],
    );

    res.status(201).json({
      message: "Prescription added successfully",
      prescription_id: result.insertId,
      prescription: {
        id: result.insertId,
        medicine: medicine,
        dosage: dosage,
        duration: duration || null,
        status: "active",
      },
    });
  } catch (error) {
    console.error("Add prescription error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get all prescriptions for a medical record
// from: Medical Records page -> Prescriptions panel
export const getPrescriptionsByRecord = async (req, res) => {
  try {
    const { record_id } = req.params;

    const [prescriptions] = await db.query(
      `select id, medicine, dosage, duration, status
            from prescriptions where record_id = ?
            order by id desc
            `,
      [record_id],
    );

    res.status(200).json({
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get all active prescriptions for a patient
// from: Patient dashboard -> active medications

export const getActivePrescriptionsForPatient = async (req, res) => {
  try {
    const { patient_id } = req.params;

    const [prescriptions] = await db.query(
      `select p.id, p.medicine, p.dosage,
            p.duration, p.status,
            mr.diagnosis, mr.record_date,
            du.full_name as doctor_name,
            d.speciality
            from prescriptions p
            join medical_records mr on p.record_id= mr.id
            join doctors d on mr.doctor_id= d.id
            join users du on d.user_id= du.id
            where mr.patient_id = ?
            and p.status= 'active'
            order by mr.record_date desc
            `,
      [patient_id],
    );

    res.status(200).json({
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// update prescription status
// from: Medical Records -> mark as completed
//  "In Progress" / "Completed" / "Active" status tags
export const updatePrescriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["active", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Status must be active or completed",
      });
    }

    const [rows] = await db.query("select * from prescriptions where id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    await db.query(`update prescriptions set status = ? where id = ?`, [
      status,
      id,
    ]);
    res.status(200).json({
      message: `Prescription marked as ${status}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// delete prescription
// from: Medical Records page -> remove medication
export const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `select p.* , mr.doctor_id from prescriptions p 
            join medical_records mr on p.record_id= mr.id where p.id = ?`,
      [id],
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // Only treating doctor can delete
    const [docRows] = await db.query(
      `select id from doctors where user_id = ?`,
      [req.user.id],
    );
    if (docRows.length === 0 || docRows[0].id !== rows[0].doctor_id) {
      return res.status(403).json({
        message: "Only the treating doctor can delete prescriptions",
      });
    }

    await db.query("delete from prescriptions where id = ?", [id]);
    res.status(200).json({ message: "Prescriptions deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
