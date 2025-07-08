import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import stripeService from '../services/stripeService';
import { signupSchema, loginSchema } from '../validators/authValidator';
import env from '../config/envConfig';

// Signup controller
export const signup = async (req: Request, res: Response) => {
  try {
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      // Remove quotes from Joi error message
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({ message });
    }
    const { firstName, lastName, email, password } = value;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create Stripe customer
    const stripeCustomer = await stripeService.createCustomer({
      name: `${firstName} ${lastName}`,
      email
    });
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      stripeCustomerId: stripeCustomer.id
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Login controller
export const login = async (req: Request, res: Response) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      // Remove quotes from Joi error message
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({ message });
    }
    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
