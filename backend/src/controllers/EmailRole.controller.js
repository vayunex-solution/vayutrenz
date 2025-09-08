import EmailRole from "../models/emailRole.model.js";

// Get all emails
export const getEmailRoles = async (req, res) => {
  try {
    // console.log("geting")
    const data = await EmailRole.findOne(); // Assuming one document
    res.status(200).json(data?.emails || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Insert one email
export const insertEmailRole = async (req, res) => {
  
  try {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ error: "Email and role are required" });
    if (req.userRole !== "owner") {
      return res.status(403).json({ message: "You are not authorized to create email roles" });
    }
    let data = await EmailRole.findOne();
    if (!data) {
      data = await EmailRole.create({ emails: [{ email, role }] });
    } else {
      const exists = data.emails.some(e => e.email === email);
      if (exists) return res.status(400).json({ error: "Email already exists" });

      data.emails.push({ email, role });
      await data.save();
    }
    // console.log("data.emails",data.emails)
    res.status(200).json(data.emails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete by email
export const deleteEmailRole = async (req, res) => {
  const { email } = req.params;
  try {
    if (req.userRole !== "owner") {
      return res.status(403).json({ message: "You are not authorized to delete email roles" });
    }
    const data = await EmailRole.findOne();
    if (!data) return res.status(404).json({ error: "No data found" });

    data.emails = data.emails.filter(e => e.email !== email);
    await data.save();

    res.status(200).json(data.emails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
