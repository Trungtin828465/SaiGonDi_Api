import { StatusCodes } from 'http-status-codes'
import { questionService } from '~/services/question.service.js'

const createQuestion = async (req, res, next) => {
  try {
    const authorId = req.user.id
    const newQuestion = await questionService.createQuestion(req.body, authorId)
    res.status(StatusCodes.CREATED).json({
      message: 'Question created successfully',
      data: newQuestion
    })
  } catch (error) {
    next(error)
  }
}

const getQuestions = async (req, res, next) => {
  try {
    const questionList = await questionService.getQuestions(req.query)
    res.status(StatusCodes.OK).json({
      message: 'Question list retrieved successfully',
      data: questionList
    })
  } catch (error) {
    next(error)
  }
}

const getQuestionById = async (req, res, next) => {
  try {
    const questionId = req.params.id
    const questionDetails = await questionService.getQuestionById(questionId)
    res.status(StatusCodes.OK).json({
      message: 'Question details retrieved successfully',
      data: questionDetails
    })
  } catch (error) {
    next(error)
  }
}

const updateQuestion = async (req, res, next) => {
  try {
    const questionId = req.params.id
    const updatedQuestion = await questionService.updateQuestion(questionId, req.body)
    res.status(StatusCodes.OK).json({
      message: 'Question updated successfully',
      data: updatedQuestion
    })
  } catch (error) {
    next(error)
  }
}

const deleteQuestion = async (req, res, next) => {
  try {
    const questionId = req.params.id
    await questionService.deleteQuestion(questionId)
    res.status(StatusCodes.OK).json({ message: 'Question deleted successfully' })
  } catch (error) {
    next(error)
  }
}

const likeQuestion = async (req, res, next) => {
  try {
    const questionId = req.params.id
    const userId = req.user.id
    await questionService.likeQuestion(questionId, userId)
    res.status(StatusCodes.OK).json({ message: 'Question liked successfully' })
  } catch (error) {
    next(error)
  }
}

const addAnswer = async (req, res, next) => {
  try {
    const questionId = req.params.id
    const authorId = req.user.id
    const answerData = { ...req.body, author: authorId }
    const newAnswer = await questionService.addAnswer(questionId, answerData)
    res.status(StatusCodes.CREATED).json({
      message: 'Answer added successfully',
      data: newAnswer
    })
  } catch (error) {
    next(error)
  }
}

const updateAnswer = async (req, res, next) => {
  try {
    const answerId = req.params.answerId
    const updatedAnswer = await questionService.updateAnswer(answerId, req.body)
    res.status(StatusCodes.OK).json({
      message: 'Answer updated successfully',
      data: updatedAnswer
    })
  } catch (error) {
    next(error)
  }
}

const deleteAnswer = async (req, res, next) => {
  try {
    const answerId = req.params.answerId
    await questionService.deleteAnswer(answerId)
    res.status(StatusCodes.OK).json({ message: 'Answer deleted successfully' })
  } catch (error) {
    next(error)
  }
}

const likeAnswer = async (req, res, next) => {
  try {
    const answerId = req.params.answerId
    const userId = req.user.id
    await questionService.likeAnswer(answerId, userId)
    res.status(StatusCodes.OK).json({ message: 'Answer liked successfully' })
  } catch (error) {
    next(error)
  }
}

export const questionController = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  likeQuestion,
  addAnswer,
  updateAnswer,
  deleteAnswer,
  likeAnswer
}
