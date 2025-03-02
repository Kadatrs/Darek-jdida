const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../middleware/validation');

const userController = {
  register: async (req, res) => {
    try {
      const { error } = registerValidation(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const { firstName, lastName, phoneNumber, email, password, wilaya } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'Cet email est déjà utilisé' });

      const user = new User({ firstName, lastName, phoneNumber, email, password, wilaya });
      await user.save();

      const token = jwt.sign({ id: user._id, wilaya: user.wilaya }, process.env.JWT_SECRET, { expiresIn: '24h' });

      res.status(201).json({ token, user: { id: user._id, firstName, lastName, email, wilaya } });
    } catch (error) {
      console.error('Error in user registration:', error); // Log the error for debugging
      res.status(500).json({ message: 'Erreur serveur', error: error.message }); // Send detailed error message
    }
    
    },
  

  login: async (req, res) => {
    try {
      const { error } = loginValidation(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const { email, password, wilaya } = req.body;
      const user = await User.findOne({ email });
      if (!user , !(await bcrypt.compare(password, user.password)) , user.wilaya !== wilaya) {
        return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
      }

      const token = jwt.sign({ id: user._id, wilaya: user.wilaya }, process.env.JWT_SECRET, { expiresIn: '24h' });

      res.json({ token, user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email, wilaya: user.wilaya } });
    } catch (error) {
      console.error('Error in user log in:', error); // Log the error for debugging
      res.status(500).json({ message: 'Erreur serveur', error: error.message }); // Send detailed error message
    }
  }
};

module.exports = userController;