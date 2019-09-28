// middleware for doing role-based permissions
module.exports = function permit(...roles) {
    
    return (req, res, next) => {
        if (!req.user) {
            res.status(403).json({message: "Forbidden - User missing"}); // user is forbidden
        }
        var allowed = false;
        for(var i = 0, size = roles.length; i < size ; i++){ 
            if ((roles[i] === 'admin') && (req.user.isAdmin)) {
                allowed = true;
            }
            if ((roles[i] === 'buyer') && (req.user.isBuyer)) {
                allowed = true;
            }
            if ((roles[i] === 'seller') && (req.user.isSeller)) {
                allowed = true;
            }
            if ((roles[i] === 'transporter') && (req.user.isTransporter)) {
                allowed = true;
            }
            if ((roles[i] === 'agent') && (req.user.isAgent)) {
                allowed = true;
            }
            if ((roles[i] === 'emp0') && (req.user.isEmp0)) {
                allowed = true;
            }
            if ((roles[i] === 'emp1') && (req.user.isEmp1)) {
                allowed = true;
            } 
        }
        if (allowed) {
            next();
        }
        else {
            res.status(403).json({message: "Forbidden, Not Authorized"}); // user is forbidden
        }
    }
  }