import express from 'express';
import ServiceRequest from '../models/ServiceRequest.js';
import User from '../models/User.js';
import { protect, roleGuard } from '../middleware/auth.js';
import { validateRequest, validateStatusUpdate } from '../middleware/validate.js';
import { sendConfirmationEmail, sendBookingCreatedEmail } from '../utils/sendEmail.js';

const router = express.Router();

// GET all requests (protected)
router.get('/', protect, async (req, res) => {
  try {
    const requests = await ServiceRequest.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests', error: error.message });
  }
});

// POST a new request (allow authenticated users, and allow guest bookings with email)
router.post('/', async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return protect(req, res, () => {
      return roleGuard('client', 'admin')(req, res, next);
    });
  }
  next();
}, validateRequest, async (req, res) => {
  try {
    const { service, description, location, date, desc, customerEmail } = req.body;

    const newRequest = new ServiceRequest({
      service,
      description,
      location,
      date,
      desc: desc || description,
      customerEmail: customerEmail || (req.user ? req.user.email : null),
      status: 'Pending',
      statusColor: 'bg-yellow-100 text-yellow-800',
    });

    const savedRequest = await newRequest.save();
    
    // Emit WebSocket event for real-time updates
    const io = req.app.get('io');
    if (io) io.emit('newRequest', savedRequest);

    // Send immediate booking confirmation email to customer
    const emailToNotify = savedRequest.customerEmail;
    if (emailToNotify) {
      sendBookingCreatedEmail({
        bookingId: savedRequest._id ? savedRequest._id.toString() : (savedRequest.id || ''),
        customerEmail: emailToNotify,
        service: savedRequest.service,
        location: savedRequest.location,
        date: savedRequest.date,
        desc: savedRequest.desc
      }).catch(err => console.error('Booking confirmation email error:', err));
    }
    
    res.status(201).json(savedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error creating request', error: error.message });
  }
});

// PUT (update) a request
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const io = req.app.get('io');
    if (io) io.emit('requestUpdated', updatedRequest);

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Error updating request', error: error.message });
  }
});

// DELETE a request (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRequest = await ServiceRequest.findByIdAndDelete(id);

    if (!deletedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const io = req.app.get('io');
    if (io) io.emit('requestDeleted', { id });

    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting request', error: error.message });
  }
});

// PUT /:id/status - Update status + send confirmation emails (Experiment 8)
router.put('/:id/status', protect, validateStatusUpdate, async (req, res) => {
  try {
    const { status, provider } = req.body;

    let statusColor = 'bg-yellow-100 text-yellow-800';
    if (status === 'In Progress') statusColor = 'bg-blue-100 text-blue-800';
    if (status === 'Completed') statusColor = 'bg-emerald-100 text-emerald-800';

    const updatedRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status, provider, statusColor },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Emit WebSocket event for real-time update
    const io = req.app.get('io');
    if (io) io.emit('requestUpdated', updatedRequest);

    // Experiment 8 – Send confirmation emails when worker accepts the job
    if (status === 'In Progress' && provider) {
      const workerUser = await User.findOne({ name: provider });
      const workerEmail = workerUser?.email || req.user.email;

      sendConfirmationEmail({
        bookingId: updatedRequest._id ? updatedRequest._id.toString() : (updatedRequest.id || ''),
        customerEmail: updatedRequest.customerEmail || 'customer@example.com',
        workerName: provider,
        workerEmail: workerEmail,
        service: updatedRequest.service,
        location: updatedRequest.location,
        date: updatedRequest.date,
      }).catch(err => console.error('Email error:', err));
    }

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
});

export default router;
