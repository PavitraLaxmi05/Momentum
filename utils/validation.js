/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid flag and message
 */
const validatePassword = (password) => {
  // Password must be at least 8 characters long
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  // Password must contain at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  // Password must contain at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  // Password must contain at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  // Password must contain at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character'
    };
  }
  
  return {
    isValid: true,
    message: 'Password is valid'
  };
};

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {Object} - Validation result with isValid flag and message
 */
const validateUsername = (username) => {
  // Username must be at least 3 characters long
  if (username.length < 3) {
    return {
      isValid: false,
      message: 'Username must be at least 3 characters long'
    };
  }
  
  // Username must be at most 20 characters long
  if (username.length > 20) {
    return {
      isValid: false,
      message: 'Username must be at most 20 characters long'
    };
  }
  
  // Username must contain only alphanumeric characters and underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      message: 'Username must contain only letters, numbers, and underscores'
    };
  }
  
  return {
    isValid: true,
    message: 'Username is valid'
  };
};

/**
 * Validate idea input
 * @param {Object} idea - Idea object to validate
 * @returns {Object} - Validation result with isValid flag and errors
 */
const validateIdea = (idea) => {
  const errors = {};
  
  // Title is required and must be at least 5 characters long
  if (!idea.title) {
    errors.title = 'Title is required';
  } else if (idea.title.length < 5) {
    errors.title = 'Title must be at least 5 characters long';
  }
  
  // Description is required and must be at least 20 characters long
  if (!idea.description) {
    errors.description = 'Description is required';
  } else if (idea.description.length < 20) {
    errors.description = 'Description must be at least 20 characters long';
  }
  
  // Category is required
  if (!idea.category) {
    errors.category = 'Category is required';
  }
  
  // Target audience is required
  if (!idea.targetAudience) {
    errors.targetAudience = 'Target audience is required';
  }
  
  // Cost is required and must be a number
  if (idea.cost === undefined || idea.cost === null) {
    errors.cost = 'Cost is required';
  } else if (isNaN(idea.cost)) {
    errors.cost = 'Cost must be a number';
  }
  
  // Time to implement is required and must be a number
  if (idea.timeToImplement === undefined || idea.timeToImplement === null) {
    errors.timeToImplement = 'Time to implement is required';
  } else if (isNaN(idea.timeToImplement)) {
    errors.timeToImplement = 'Time to implement must be a number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate carbon entry input
 * @param {Object} entry - Carbon entry object to validate
 * @returns {Object} - Validation result with isValid flag and errors
 */
const validateCarbonEntry = (entry) => {
  const errors = {};
  
  // Entry type is required
  if (!entry.entryType) {
    errors.entryType = 'Entry type is required';
  } else {
    // Entry type must be one of the allowed types
    const allowedTypes = ['transportation', 'energy', 'food', 'waste', 'water'];
    if (!allowedTypes.includes(entry.entryType)) {
      errors.entryType = 'Invalid entry type';
    }
  }
  
  // Description is required
  if (!entry.description) {
    errors.description = 'Description is required';
  }
  
  // Quantity is required and must be a positive number
  if (entry.quantity === undefined || entry.quantity === null) {
    errors.quantity = 'Quantity is required';
  } else if (isNaN(entry.quantity)) {
    errors.quantity = 'Quantity must be a number';
  } else if (entry.quantity <= 0) {
    errors.quantity = 'Quantity must be greater than 0';
  }
  
  // Unit is required
  if (!entry.unit) {
    errors.unit = 'Unit is required';
  } else {
    // Unit must be one of the allowed units
    const allowedUnits = ['km', 'kWh', 'kg', 'L'];
    if (!allowedUnits.includes(entry.unit)) {
      errors.unit = 'Invalid unit';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  validatePassword,
  validateUsername,
  validateIdea,
  validateCarbonEntry
};