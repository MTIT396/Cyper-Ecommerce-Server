const addressService = require("../services/address.service");
exports.getAddressById = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = Number(req.params.id);

    const address = await addressService.getAddressById(addressId, userId);

    res.json(address);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
exports.createAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const id = await addressService.createAddress(userId, req.body);

    res.status(201).json({
      message: "Address created successfully",
      addressId: id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMyAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await addressService.getUserAddresses(userId);

    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = Number(req.params.id);

    await addressService.setDefaultAddress(addressId, userId);

    res.json({ message: "Default address updated" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = Number(req.params.id);

    const result = await addressService.updateAddress(
      userId,
      addressId,
      req.body,
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = Number(req.params.id);

    await addressService.deleteAddress(addressId, userId);

    res.json({ message: "Address deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
