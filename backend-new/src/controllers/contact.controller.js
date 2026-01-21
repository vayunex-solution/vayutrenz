import { run, query } from '../config/database.js'

export const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body
        if (!name || !email || !message) return res.status(400).json({ success: false, message: 'Missing fields' })

        await run(`
            INSERT INTO contact_messages (name, email, subject, message)
            VALUES (?, ?, ?, ?)
        `, [name, email, subject, message])

        res.status(201).json({ success: true, message: 'Message sent successfully' })
    } catch (error) {
        console.error('Contact error:', error)
        res.status(500).json({ success: false, message: 'Server error' })
    }
}

export const getMessages = async (req, res) => {
    try {
        const messages = await query('SELECT * FROM contact_messages ORDER BY created_at DESC')
        res.json({ success: true, messages })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch messages' })
    }
}

export const deleteMessage = async (req, res) => {
    try {
        await run('DELETE FROM contact_messages WHERE id = ?', [req.params.id])
        res.json({ success: true, message: 'Message deleted' })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete' })
    }
}
