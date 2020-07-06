exports.registerController = (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);
};
