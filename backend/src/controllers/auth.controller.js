import * as authService from '../services/auth.service.js';

export const register = async (req, res) => {
  try {
    console.log('📥 Register request received:', {
      body: req.body,
      headers: req.headers,
    });

    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    // Không cho phép đăng ký với role ADMIN
    if (role && role.toUpperCase() === 'ADMIN') {
      console.log('❌ Attempted to register with ADMIN role');
      return res.status(403).json({ error: 'Không thể đăng ký với vai trò Admin' });
    }

    console.log('🔄 Calling authService.register...');
    const result = await authService.register(email, password, name, role);
    console.log('✅ Register successful:', { userId: result.user.id, email: result.user.email });
    res.status(201).json(result);
  } catch (error) {
    console.error('❌ Register error:', error.message);
    console.error('   Stack:', error.stack);
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await authService.getMe(req.userId);
    res.json({ user });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

