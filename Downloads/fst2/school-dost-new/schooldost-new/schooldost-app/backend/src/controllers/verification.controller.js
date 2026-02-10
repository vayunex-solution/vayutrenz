const prisma = require('../config/database');
const { deleteImage } = require('../config/cloudinary');

// Request Verification
const requestVerification = async (req, res) => {
    try {
        const { role, idCardUrl } = req.body;

        if (!role || !['STUDENT', 'TEACHER', 'PROFESSOR'].includes(role)) {
            return res.status(400).json({ error: 'Invalid or missing role' });
        }

        if (['TEACHER', 'PROFESSOR'].includes(role) && !idCardUrl) {
            return res.status(400).json({ error: 'ID Card is mandatory for Teachers/Professors' });
        }

        // Determine status
        // Students might be auto-verified later, for now everything is PENDING or VERIFIED based on logic
        let status = 'PENDING';
        
        // Auto-verify students with .edu.in emails (placeholder logic)
        // const isEduEmail = req.user.email.endsWith('.edu.in');
        // if (role === 'STUDENT' && isEduEmail) status = 'VERIFIED';

        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                role,
                idCardUrl: idCardUrl || null,
                verificationStatus: status,
                isProfileComplete: true // Assume wizard is done after this
            }
        });

        res.json({ 
            message: 'Verification request submitted', 
            status,
            user: { role, verificationStatus: status } 
        });

    } catch (error) {
        console.error('Verification request error:', error);
        res.status(500).json({ error: 'Failed to submit verification request' });
    }
};

// Get Verification Status
const getVerificationStatus = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                role: true,
                verificationStatus: true,
                idCardUrl: true
            }
        });

        res.json({ verification: user });
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: 'Failed to get verification status' });
    }
};

module.exports = {
    requestVerification,
    getVerificationStatus
};
