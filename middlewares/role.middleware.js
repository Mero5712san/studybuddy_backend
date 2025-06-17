const authorizeRole = (roles = []) => {
    if (typeof roles === 'string') roles = [roles];

    return (req, res, next) => {
        if (!roles.includes(req.user.role) && req.user.role !== 'both') {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next();
    };
};

module.exports = authorizeRole ;
  