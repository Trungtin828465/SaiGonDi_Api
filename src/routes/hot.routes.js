import express from 'express'
import { hotController } from '~/controllers/hot.controller.js'

const Router = express.Router()

Router.route('/')
  .get(hotController.getHotData)

Router.route('/top-searches')
  .get(hotController.getTopSearchKeywords)

export const hotRoute = Router