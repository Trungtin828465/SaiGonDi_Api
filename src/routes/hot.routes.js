import express from 'express'
import { hotController } from '~/controllers/hot.controller.js'

const Router = express.Router()

Router.route('/')
  .get(hotController.getHotData)

export const hotRoute = Router
