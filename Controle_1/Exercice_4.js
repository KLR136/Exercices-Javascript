const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    const { email, password, confirmpassword } = req.body;

    if (!/\S+@\S+\.(fr|com)$/i.test(email)
        || password.length < 8 
        || password!== confirmpassword) 
    {
        return res.status(400).json({ error: 'nok' });
    }

    else 
    {
        return res.status(200).json({ message: 'ok' });
    }
});
