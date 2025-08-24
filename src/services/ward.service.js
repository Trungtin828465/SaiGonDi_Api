import Ward from '../models/Ward.model.js'

// Lấy tất cả phường/xã
const getAll = async () => {
  return await Ward.find()
}

// Lấy phường/xã theo _id
const getById = async (id) => {
  return await Ward.findById(id)
}

// Lấy phường/xã theo tên
const getByName = async (name) => {
  return await Ward.findOne({ name: new RegExp('^' + name + '$', 'i') }) // Case-insensitive search
}

export const wardService = {
  getAll,
  getById,
  getByName
}