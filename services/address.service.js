const db = require("../config/db");
const addressRepo = require("../repo/address.repository");
/* ==============================
   GET BY ID
============================== */
exports.getAddressById = async (addressId, userId) => {
  if (!addressId || isNaN(addressId)) {
    throw new Error("Invalid address id");
  }

  const address = await addressRepo.findById(addressId, userId);

  if (!address) {
    throw new Error("Address not found");
  }

  return {
    id: address.id,
    full_name: address.full_name,
    phone: address.phone,
    email: address.email ?? null,
    province: address.province,
    ward: address.ward,
    street: address.street,
    is_default: Boolean(address.is_default),
  };
};
/* ==============================
   CREATE
============================== */
exports.createAddress = async (userId, dto) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const existingAddresses = await addressRepo.findByUserId(userId, conn);

    let isDefault = dto.is_default === true;

    // Nếu chưa có address nào → auto default
    if (existingAddresses.length === 0) {
      isDefault = true;
    }

    if (isDefault) {
      await addressRepo.clearDefault(userId, conn);
    }

    const id = await addressRepo.create(
      {
        ...dto,
        user_id: userId,
        is_default: isDefault,
      },
      conn,
    );

    await conn.commit();
    return id;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
/* ==============================
   GET ALL
============================== */
exports.getUserAddresses = async (userId) => {
  return await addressRepo.findByUserId(userId);
};

/* ==============================
   SET DEFAULT
============================== */
exports.setDefaultAddress = async (addressId, userId) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const address = await addressRepo.findById(addressId, userId, conn);
    if (!address) throw new Error("Address not found");

    await addressRepo.clearDefault(userId, conn);
    await addressRepo.setDefault(addressId, userId, conn);

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* ==============================
   UPDATE
============================== */
exports.updateAddress = async (userId, addressId, dto) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const address = await addressRepo.findById(addressId, userId, conn);
    if (!address) throw new Error("Address not found");

    if (dto.is_default === true) {
      await addressRepo.clearDefault(userId, conn);
    }

    await addressRepo.updateFull(
      addressId,
      userId,
      {
        ...dto,
        email: dto.email ?? null, // optional safe
      },
      conn,
    );

    await conn.commit();

    return { message: "Address updated successfully" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

/* ==============================
   DELETE
============================== */
exports.deleteAddress = async (addressId, userId) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const address = await addressRepo.findById(addressId, userId, conn);
    if (!address) throw new Error("Address not found");

    const wasDefault = address.is_default;

    await addressRepo.delete(addressId, userId, conn);

    if (wasDefault) {
      const addresses = await addressRepo.findByUserId(userId, conn);
      if (addresses.length > 0) {
        await addressRepo.setDefault(addresses[0].id, userId, conn);
      }
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
