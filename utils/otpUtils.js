exports.generateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 8999).toString();
    console.log(otp)
    return otp
};
