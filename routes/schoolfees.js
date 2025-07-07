const express = require('express');
const { verifyToken, isAdmin } = require('../validators/verifyToken');
const { school_fees, pupils, school_fees_history, classes, streams } = require('../models/database_models');

const school_fees_routes = express();

// get all school fees
school_fees_routes.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const all_payments = await school_fees.findAll({
            include: [
                {
                    model: pupils,
                    as: 'pupil'
                }
            ]
        })

        return res.status(200).json({ message: "Fetched all payments", data: all_payments });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// get single payment
school_fees_routes.get('/:id', verifyToken, async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({ message: "Provid the payment identification" });
        }
        const payment = await school_fees.findByPk(req.params.id);
        if (!payment) return res.status(404).json({ message: "Payment not found" });

        return res.status(200).json({ message: "Fetched payment", data: payment });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// get payment for pupil
school_fees_routes.get('/payment/:pupil_id', verifyToken, async (req, res) => {
    try {
        const pupil_id = req.params.pupil_id;
        if (!pupil_id) {
            return res.status(400).json({ message: "Pupil id not provided" });
        }

        const check_pupil = await pupils.findByPk(pupil_id, {
            include: [
                {
                    model: classes,
                    as: 'class',
                },
                {
                    model: streams,
                    as: 'stream',
                }
            ]
        });
        if (!check_pupil) {
            return res.status(404).json({ message: "Pupil not found" });
        }

        const get_payments_for_pupil = await school_fees.findAll({
            where: { pupil_id: pupil_id },
            include: [
                {
                    model: pupils,
                    as: 'pupil'
                }
            ]
        })
        if (get_payments_for_pupil.length === 0) {
            return res.status(200).json({ message: "No current payments for the pupil", pupil: check_pupil });
        }

        return res.status(200).json({ message: "Payments for pupil fetched", data: get_payments_for_pupil, pupil: check_pupil })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

// get history payments for pupil
school_fees_routes.get('/history_payment/:pupil_id', verifyToken, async (req, res) => {
    try {
        const pupil_id = req.params.pupil_id;
        if (!pupil_id) {
            return res.status(400).json({ message: "Pupil id not provided" });
        }

        const check_pupil = await pupils.findByPk(pupil_id);
        if (!check_pupil) {
            return res.status(404).json({ message: "Pupil not found" });
        }

        const get_payments_for_pupil = await school_fees_history.findAll({ where: { pupil_id: pupil_id } })
        if (get_payments_for_pupil.length === 0) {
            return res.status(200).json({ message: "No current payments for the pupil" });
        }

        return res.status(200).json({ message: "Payment histories for pupil fetched", data: get_payments_for_pupil })
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

// create payment
school_fees_routes.post('/create_payment', verifyToken, isAdmin, async (req, res) => {
    try {
        const { pupil_id, fees_amount, fees_type, payment_status, payment_method } = req.body;

        if (!pupil_id || !fees_amount || !fees_type || !payment_status || !payment_method) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        await school_fees.create({ pupil_id, fees_amount, fees_type, payment_status, payment_method });
        await school_fees_history.create({ pupil_id, fees_amount, payment_method, fees_type });

        return res.status(200).json({ message: 'Payment successful' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

// update payments
school_fees_routes.put('/edit_payment/:payment_id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { pupil_id, fees_amount, fees_type, payment_status, payment_method } = req.body;
        const payment_id = req.params.payment_id;

        if (!pupil_id || !fees_amount || !fees_type || !payment_status || !payment_method) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (!payment_id) {
            return res.status(400).json({ message: "Missing payment identifier required" })
        }

        const check_payment = await school_fees.findByPk(payment_id);

        await check_payment.update({ pupil_id, fees_amount, fees_type, payment_status, payment_method });
        await school_fees_history.create({ pupil_id, fees_amount, payment_method, fees_type });

        return res.status(200).json({ message: 'Payment successful' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

// delete payemnt
school_fees_routes.delete('/remove_payemnt/:payment_id', verifyToken, isAdmin, async (req, res) => {
    try {
        const payment_id = req.params.payment_id;
        if (!payment_id) {
            return res.status(400).json({ message: 'Payment identifier not provided' });
        }

        const check_payment = await school_fees.findByPk(payment_id);
        if (!check_payment) {
            return res.status(404).json({ message: 'Invalid payment identifier' });
        }

        await check_payment.destroy()
        return res.status(200).json({ message: 'Payment was successfully deleted' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

// delete payment history
school_fees_routes.delete('/remove_payment_history/:payment_id', verifyToken, isAdmin, async (req, res) => {
    try {
        const payment_id = req.params.payment_id;
        if (!payment_id) {
            return res.status(400).json({ message: 'Payment identifier not provided' });
        }

        const check_payment = await school_fees_history.findByPk(payment_id);
        if (!check_payment) {
            return res.status(404).json({ message: 'Invalid payment identifier' });
        }

        await check_payment.destroy();
        return res.status(200).json({ message: 'Payment history was successfully deleted' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

// clear payment history of a pupil
school_fees_routes.delete('/remove_payment_history/:pupil_id', verifyToken, isAdmin, async (req, res) => {
    try {
        const pupil_id = req.params.pupil_id;
        if (!pupil_id) {
            return res.status(400).json({ message: 'Pupil identifier not provided' });
        }

        const check_pupil = await pupils.findByPk(pupil_id);
        if (!check_pupil) {
            return res.status(404).json({ message: 'Pupil not found' });
        }

        const check_payment = await school_fees_history.findAll({ where: { pupil_id: pupil_id } });
        if (check_payment.length === 0) {
            return res.status(404).json({ message: 'Invalid pupil identifier' });
        }

        await check_payment.destroy();
        return res.status(200).json({ message: "Pupil's Payment history was successfully cleared" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
})

module.exports = school_fees_routes;
