import express from 'express'
import { verifyToken } from '~/middlewares/auth.middleware.js'
import { questionController } from '~/controllers/question.controller.js'
import { questionValidation } from '~/validations/question.validation.js'
import { generalValidation } from '~/validations/general.validation'

const Router = express.Router()

// Question routes
Router.route('/')
  .post(verifyToken, questionValidation.createNew, questionController.createQuestion)
  .get(questionValidation.getQuestions, questionController.getQuestions)

Router.route('/:id')
  .get(generalValidation.paramIdValidate, questionController.getQuestionById)
  .put(verifyToken, generalValidation.paramIdValidate, questionValidation.updateQuestion, questionController.updateQuestion)
  .delete(verifyToken, generalValidation.paramIdValidate, questionController.deleteQuestion)

Router.patch('/:id/like', verifyToken, generalValidation.paramIdValidate, questionController.likeQuestion)

// Answer routes
Router.post('/:id/answers', verifyToken, generalValidation.paramIdValidate, questionValidation.addAnswer, questionController.addAnswer)
Router.route('/answers/:answerId')
  .put(verifyToken, generalValidation.paramIdValidate, questionValidation.updateAnswer, questionController.updateAnswer)
  .delete(verifyToken, generalValidation.paramIdValidate, questionController.deleteAnswer)

Router.patch('/answers/:answerId/like', verifyToken, generalValidation.paramIdValidate, questionController.likeAnswer)

export const questionRoute = Router
