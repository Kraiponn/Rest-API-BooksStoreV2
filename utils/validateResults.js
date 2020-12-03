module.exports = (errors) => {
  const resultObj = errors.map((err) => {
    return err.msg;
  });

  return resultObj.join(", ");
};
