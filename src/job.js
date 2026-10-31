const sendEmail = async function (toEmail) {
  await new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });
};
module.exports = sendEmail;