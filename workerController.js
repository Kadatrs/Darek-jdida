const Worker = require('../models/Worker');
//const Worker = require('../../models/Worker');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../middleware/workerValidation');

const workerController = {
  register: async (req, res) => {
    try {
      const { error } = registerValidation(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const { firstName, lastName, phoneNumber, email, password, wilaya, workType } = req.body;
      const existingWorker = await Worker.findOne({ email });
      if (existingWorker) return res.status(400).json({ message: 'Cet email est déjà utilisé' });

      const worker = new Worker({ firstName, lastName, phoneNumber, email, password, wilaya, workType });
      await worker.save();

      const token = jwt.sign({ id: worker._id, wilaya: worker.wilaya, workType: worker.workType }, process.env.JWT_SECRET, { expiresIn: '24h' });

      res.status(201).json({ token, worker: { id: worker._id, firstName, lastName, email, wilaya, workType } });
    } catch (error) {
      console.error('Error in worker registration:', error); // Log the error for debugging
      res.status(500).json({ message: 'Erreur serveur', error: error.message }); // Send detailed error message
    }
  },

// Worker Login (new functionality)
  login: async (req, res) => {
    try {
      // Validate the request body
      const { error } = loginValidation(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      // Extract email, password, and wilaya from the request body
      const { email, password, wilaya } = req.body;

      // Check if the worker exists
      const worker = await Worker.findOne({ email });
      if (!worker) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Check if the password is correct
      const isPasswordValid = await bcrypt.compare(password, worker.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Check if the wilaya matches
      if (worker.wilaya !== wilaya) {
        return res.status(400).json({ message: 'Wilaya incorrecte' });
      }

      // Generate a JWT token
      const token = jwt.sign({ id: worker._id, wilaya: worker.wilaya }, process.env.JWT_SECRET, { expiresIn: '24h' });

      // Return the token and worker details (excluding the password)
      res.json({
        token,
        worker: {
          id: worker._id,
          firstName: worker.firstName,
          lastName: worker.lastName,
          email: worker.email,
          wilaya: worker.wilaya,
          profession: worker.profession,
        },
      });
    } catch (error) {
      console.error('Error in worker login:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  },
  
};

module.exports = workerController;