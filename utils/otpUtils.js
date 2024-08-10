exports.generateOTP = () => {
    return Math.floor(1000 + Math.random() * 8999).toString();
};
