exports.sendMessage = async (msg) => {
  try {
    return console.log(msg);
  } catch (error) {
    return console.log(error.message);
  }
};
