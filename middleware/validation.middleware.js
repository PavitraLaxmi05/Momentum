const { validationResult } = require('express-validator');

/**
 * Middleware to validate request data using express-validator
 * @param {Array} validations - Array of express-validator validation rules
 * @returns {Function} Express middleware function
 */
exports.validate = (validations) => {
  return async (req, res, next) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg
    }));

    // Return validation errors
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  };
};

/**
 * Common validation rules for reuse across routes
 */
exports.validationRules = {
  // User validation rules
  user: {
    username: {
      notEmpty: {
        errorMessage: 'Username is required'
      },
      isLength: {
        options: { min: 3, max: 20 },
        errorMessage: 'Username must be between 3 and 20 characters'
      },
      matches: {
        options: /^[a-zA-Z0-9_]+$/,
        errorMessage: 'Username must contain only letters, numbers, and underscores'
      }
    },
    email: {
      notEmpty: {
        errorMessage: 'Email is required'
      },
      isEmail: {
        errorMessage: 'Must be a valid email address'
      },
      normalizeEmail: true
    },
    password: {
      notEmpty: {
        errorMessage: 'Password is required'
      },
      isLength: {
        options: { min: 8 },
        errorMessage: 'Password must be at least 8 characters long'
      },
      matches: {
        options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }
    }
  },
  
  // Idea validation rules
  idea: {
    title: {
      notEmpty: {
        errorMessage: 'Title is required'
      },
      isLength: {
        options: { min: 3, max: 100 },
        errorMessage: 'Title must be between 3 and 100 characters'
      }
    },
    description: {
      notEmpty: {
        errorMessage: 'Description is required'
      },
      isLength: {
        options: { min: 10 },
        errorMessage: 'Description must be at least 10 characters long'
      }
    },
    category: {
      notEmpty: {
        errorMessage: 'Category is required'
      },
      isIn: {
        options: [['energy', 'waste', 'water', 'transportation', 'food', 'other']],
        errorMessage: 'Category must be one of: energy, waste, water, transportation, food, other'
      }
    }
  },
  
  // Carbon entry validation rules
  carbon: {
    entryType: {
      notEmpty: {
        errorMessage: 'Entry type is required'
      },
      isIn: {
        options: [['transportation', 'energy', 'food', 'waste', 'water']],
        errorMessage: 'Entry type must be one of: transportation, energy, food, waste, water'
      }
    },
    quantity: {
      notEmpty: {
        errorMessage: 'Quantity is required'
      },
      isNumeric: {
        errorMessage: 'Quantity must be a number'
      }
    },
    unit: {
      notEmpty: {
        errorMessage: 'Unit is required'
      }
    }
  },
  
  // Product validation rules
  product: {
    name: {
      notEmpty: {
        errorMessage: 'Product name is required'
      },
      isLength: {
        options: { min: 3, max: 100 },
        errorMessage: 'Product name must be between 3 and 100 characters'
      }
    },
    description: {
      notEmpty: {
        errorMessage: 'Description is required'
      }
    },
    category: {
      notEmpty: {
        errorMessage: 'Category is required'
      }
    },
    price: {
      notEmpty: {
        errorMessage: 'Price is required'
      },
      isNumeric: {
        errorMessage: 'Price must be a number'
      }
    },
    sustainabilityScore: {
      notEmpty: {
        errorMessage: 'Sustainability score is required'
      },
      isInt: {
        options: { min: 1, max: 10 },
        errorMessage: 'Sustainability score must be between 1 and 10'
      }
    }
  }
};