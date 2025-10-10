const createError = require('http-errors')
const User = require('../Models/User.Model')
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken,
} = require('../helpers/jwt_helpers')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

module.exports = {

    register: async (req, res, next) => {
        try {
          const result = req.body
          result.created_at = Date.now()
          result.updated_at = Date.now()
          result.created_by = req.user ? req.user.username : 'unauth'
          result.updated_by = req.user ? req.user.username : 'unauth'
          result.is_approved = true
          const doesExist = await User.findOne({ email: result.email })
          if (doesExist)
          throw createError.Conflict(`${result.email} is already been registered`)
          const user = new User(result)
          const savedUser = await user.save()
          const accessToken = await signAccessToken(savedUser.id)
          const refreshToken = await signRefreshToken(savedUser.id)
    
          res.send({ accessToken, refreshToken, success: true, msg: "User created successfully" })
        } catch (error) {
          if (error.isJoi === true) error.status = 422
          next(error)
        }
      },

    login: async (req, res, next) => {
        try {
            const result = req.body
            let user = {}
            if (result) {
                user = await User.findOne({ email: result.email })
                if (!user) {
                    throw createError.NotFound('User not registered')
                }
            } else {
                throw createError.NotAcceptable('No query Data')
            }
            const isMatch = await user.isValidPassword(result.password)
            if (!isMatch)
                throw createError.NotAcceptable('Username/password not valid')
            const accessToken = await signAccessToken(user.id)
            const refreshToken = await signRefreshToken(user.id)
            const userDataSend = {
                id: user._id,
                name:user.name,
                email: user.email,
            }
            res.send({ success: true, msg: 'Login Successfull', accessToken, refreshToken, user: userDataSend })
        } catch (error) {
            if (error.isJoi === true)
                return next(createError.BadRequest('Invalid Email/Password'))
            next(error)
        }
    },

    // Reset password method - for admin panel password reset
    resetPassword: async (req, res, next) => {
        try {
            const { newPassword, confirmPassword, email } = req.body
            
            // Validate input
            if (!newPassword || !confirmPassword) {
                throw createError.BadRequest('New password and confirm password are required')
            }
            
            if (newPassword !== confirmPassword) {
                throw createError.BadRequest('Passwords do not match')
            }
            
            if (newPassword.length < 6) {
                throw createError.BadRequest('Password must be at least 6 characters long')
            }

            // For admin panel - you need email to identify the user
            if (!email) {
                throw createError.BadRequest('Email is required')
            }

            // Find user by email
            const user = await User.findOne({ email: email })
            
            if (!user) {
                throw createError.NotFound('User not found with this email')
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(newPassword, salt)
            
            // Update user password
            await User.updateOne(
                { _id: user._id }, 
                { 
                    $set: { 
                        password: hashedPassword,
                        updated_at: Date.now(),
                        updated_by: req.user ? req.user.name : 'admin'
                    } 
                }
            )
            
            res.send({ 
                success: true, 
                msg: 'Password updated successfully',
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            })
            
        } catch (error) {
            next(error)
        }
    },

    // Change password for logged-in users
    changePassword: async (req, res, next) => {
        try {
            const { currentPassword, newPassword, confirmPassword } = req.body
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                throw createError.BadRequest('All password fields are required')
            }
            
            if (newPassword !== confirmPassword) {
                throw createError.BadRequest('New passwords do not match')
            }
            
            if (newPassword.length < 6) {
                throw createError.BadRequest('Password must be at least 6 characters long')
            }

            const user = await User.findById(req.user._id)
            if (!user) {
                throw createError.NotFound('User not found')
            }

            // Verify current password
            const isCurrentPasswordValid = await user.isValidPassword(currentPassword)
            if (!isCurrentPasswordValid) {
                throw createError.BadRequest('Current password is incorrect')
            }

            // Hash the new password
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(newPassword, salt)
            
            // Update user password
            await User.updateOne(
                { _id: user._id }, 
                { 
                    $set: { 
                        password: hashedPassword,
                        updated_at: Date.now(),
                        updated_by: user.name
                    } 
                }
            )
            
            res.send({ 
                success: true, 
                msg: 'Password changed successfully' 
            })
            
        } catch (error) {
            next(error)
        }
    },

    // Optional: Forgot password (if you want email-based reset in future)
    forgotPassword: async (req, res, next) => {
        try {
            const { email } = req.body
            
            if (!email) {
                throw createError.BadRequest('Email is required')
            }
            
            const user = await User.findOne({ email })
            if (!user) {
                // Don't reveal if email exists or not for security
                return res.send({ 
                    success: true, 
                    msg: 'If the email exists, a reset link has been sent' 
                })
            }
            
            // Here you would typically:
            // 1. Generate a reset token
            // 2. Save it to database with expiration
            // 3. Send email with reset link
            // For now, just return success
            
            res.send({ 
                success: true, 
                msg: 'Password reset instructions have been sent to your email' 
            })
            
        } catch (error) {
            next(error)
        }
    }
}