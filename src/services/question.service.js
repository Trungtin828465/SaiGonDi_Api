import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { mongoose } from 'mongoose'
import QuestionModel from '~/models/Question.model'
import AnswerModel from '~/models/Answer.model'
import { OBJECT_ID_RULE } from '~/utils/validators'

const createQuestion = async (questionData, userId) => {
  try {
    const newQuestion = await QuestionModel.create({
      ...questionData,
      author: userId
    })
    return newQuestion
  } catch (error) {
    throw error
  }
}

const getQuestions = async (queryParams) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = queryParams
    const startIndex = (page - 1) * limit

    const questions = await QuestionModel.find({ isDeleted: false })
      .populate({
        path: 'author',
        select: '_id firstName lastName avatar'
      })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(startIndex)
      .limit(limit)
      .lean()

    const formatted = questions.map(q => ({
      ...q,
      authorId: q.author?._id?.toString(),
      authorName: `${q.author?.firstName || ''} ${q.author?.lastName || ''}`.trim(),
      authorAvatar: q.author?.avatar || null,
    }))

    const total = await QuestionModel.countDocuments({ isDeleted: false })

    return {
      questions: formatted,
      pagination: {
        total,
        limit,
        page,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    throw error
  }
}

const getQuestionById = async (questionId) => {
  try {
    const question = await QuestionModel.findByIdAndUpdate(
      questionId,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate({
        path: 'author',
        select: '_id firstName lastName avatar'
      })
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'firstName lastName avatar'
        }
      })
      .lean()

    if (!question || question.isDeleted) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Question not found')
    }

    return {
      ...question,
      authorId: question.author?._id?.toString(),
      authorName: `${question.author?.firstName || ''} ${question.author?.lastName || ''}`.trim(),
      authorAvatar: question.author?.avatar || null,
    }
  } catch (error) {
    throw error
  }
}

const updateQuestion = async (questionId, updateData) => {
  try {
    const updatedQuestion = await QuestionModel.findByIdAndUpdate(
      questionId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
    if (!updatedQuestion) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Question not found')
    }
    return updatedQuestion
  } catch (error) {
    throw error
  }
}

const deleteQuestion = async (questionId) => {
  try {
    await QuestionModel.findByIdAndUpdate(questionId, {
      isDeleted: true,
      deletedAt: new Date()
    })
    return { message: 'Question deleted successfully' }
  } catch (error) {
    throw error
  }
}

const likeQuestion = async (questionId, userId) => {
  try {
    const question = await QuestionModel.findById(questionId)
    if (!question) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Question not found')
    }

    const isLiked = question.likes.includes(userId)
    if (isLiked) {
      question.likes.pull(userId)
    } else {
      question.likes.push(userId)
    }
    question.totalLikes = question.likes.length
    await question.save()
    return question
  } catch (error) {
    throw error
  }
}

const addAnswer = async (questionId, answerData) => {
  try {
    const question = await QuestionModel.findById(questionId)
    if (!question || question.isDeleted) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Question not found')
    }
    const newAnswer = await AnswerModel.create({
      ...answerData,
      question: questionId
    })

    question.answers.push(newAnswer._id)
    question.totalAnswers = question.answers.length
    await question.save()

    return newAnswer
  } catch (error) {
    throw error
  }
}

const updateAnswer = async (answerId, updateData) => {
  try {
    const updatedAnswer = await AnswerModel.findByIdAndUpdate(
      answerId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
    if (!updatedAnswer) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Answer not found')
    }
    return updatedAnswer
  } catch (error) {
    throw error
  }
}

const deleteAnswer = async (answerId) => {
  try {
    const answer = await AnswerModel.findById(answerId)
    if (!answer) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Answer not found')
    }
    await AnswerModel.findByIdAndUpdate(answerId, {
      isDeleted: true,
      deletedAt: new Date()
    })

    const question = await QuestionModel.findById(answer.question)
    if (question) {
      question.answers.pull(answerId)
      question.totalAnswers = question.answers.length
      await question.save()
    }

    return { message: 'Answer deleted successfully' }
  } catch (error) {
    throw error
  }
}

const likeAnswer = async (answerId, userId) => {
  try {
    const answer = await AnswerModel.findById(answerId)
    if (!answer) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Answer not found')
    }

    const isLiked = answer.likes.includes(userId)
    if (isLiked) {
      answer.likes.pull(userId)
    } else {
      answer.likes.push(userId)
    }
    answer.totalLikes = answer.likes.length
    await answer.save()
    return answer
  } catch (error) {
    throw error
  }
}

export const questionService = {
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
