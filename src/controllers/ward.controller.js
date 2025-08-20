import { wardService } from '../services/ward.service.js'

// Lấy tất cả phường/xã
const getAll = async (req, res) => {
  try {
    const wards = await wardService.getAll()
    res.json(wards)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Lấy phường/xã theo _id
const getById = async (req, res) => {
  try {
    const ward = await wardService.getById(req.params.id)
    if (!ward) return res.status(404).json({ message: 'Ward not found' })
    res.json(ward)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// Lấy phường/xã theo tên
const getByName = async (req, res) => {
  try {
    const ward = await wardService.getByName(req.params.name)
    if (!ward) return res.status(404).json({ message: 'Ward not found' })
    res.json(ward)
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

export const wardController = {
  getAll,
  getById,
  getByName
}