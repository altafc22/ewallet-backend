const Beneficiary = require("../models/Beneficiary");

const createBeneficiary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check the number of beneficiaries created by the current user
    const beneficiaryCount = await Beneficiary.countDocuments({
      userID: userId,
    });

    // Check if the user has already created 5 beneficiaries
    if (beneficiaryCount >= 5) {
      return res.status(400).json({
        status: false,
        message: "Maximum number of beneficiaries reached (5)",
      });
    }

    const beneficiaryData = { ...req.body, userID: userId };
    const beneficiary = new Beneficiary(beneficiaryData);
    await beneficiary.save();

    res.status(201).json({ status: true, message: "Success", beneficiary });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

const getAllBeneficiaries = async (req, res) => {
  try {
    const userID = req.user._id;
    const beneficiaries = await Beneficiary.find({ userID }).sort({
      createdAt: -1,
    });
    res.json({ status: true, message: "Success", beneficiaries });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const getBeneficiaryById = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) {
      return res
        .status(404)
        .json({ status: false, message: "Beneficiary not found" });
    }
    res.json({ status: true, message: "Success", beneficiary });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const updateBeneficiaryById = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!beneficiary) {
      return res
        .status(404)
        .json({ status: false, message: "Beneficiary not found" });
    }
    res.json(beneficiary);
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};

const deleteBeneficiaryById = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findByIdAndDelete(req.params.id);
    if (!beneficiary) {
      return res
        .status(404)
        .json({ status: false, message: "Beneficiary not found" });
    }
    res.json({ status: true, message: "Beneficiary deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: error.message });
  }
};

const credit = async (beneficiaryId, amount) => {
  try {
    const beneficiary = await Beneficiary.findById(beneficiaryId);
    if (!beneficiary) {
      throw new Error("Beneficiary not found");
    }
    beneficiary.balance = beneficiary.balance + amount;
    const updatedData = await beneficiary.save();
    return updatedData;
  } catch (error) {
    console.error("Error updating beneficiary balance:", error);
    throw error;
  }
};

const debit = async (beneficiaryId, amount) => {
  try {
    const beneficiary = await Beneficiary.findById(beneficiaryId);
    if (!beneficiary) {
      throw new Error("Beneficiary not found");
    }
    if (beneficiary.balance < 0) {
      throw new Error("Invalid debit amount");
    }
    const newBalance = beneficiary.balance - amount;
    beneficiary.balance = newBalance;
    const updatedData = await beneficiary.save();
    return updatedData;
  } catch (error) {
    console.error("Error updating beneficiary balance:", error);
    throw error;
  }
};

const getBeneficiariesByUserId = async (userId) => {
  try {
    const beneficiary = await Beneficiary.find({ userID: userId }).sort({
      createdAt: -1,
    });
    if (!beneficiary) {
      return res
        .status(404)
        .json({ status: false, message: "Beneficiary not found" });
    }
    res.json({ status: true, message: "Success", user });
  } catch (error) {
    console.error("Error fetching beneficiary:", error);
    throw error;
  }
};

module.exports = {
  createBeneficiary,
  getAllBeneficiaries,
  getBeneficiaryById,
  updateBeneficiaryById,
  deleteBeneficiaryById,
  getBeneficiariesByUserId,
  credit,
  debit,
};
