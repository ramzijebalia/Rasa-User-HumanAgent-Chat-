// email content  email snet to users when their first time registration
module.exports.getEmailContent = (firstName, lastName, email, password) => {
    return `
      Dear ${firstName} ${lastName},
      
      Congratulations on successfully registering! We're excited to have you as a member of our community.
      
      As requested, here are your account details:
      
      E-mail: ${email}
      Password: ${password}
      
      Please keep this information secure and do not share your password with anyone. 
      
      If you have any questions or need assistance, feel free to contact our support team. We're here to help!
      
      Thank you for choosing our application. We look forward to serving you and providing you with a great experience.
      
      Best regards,
    `;
  };
  
  