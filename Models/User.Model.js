const validator = require("validator");
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const { passwordReg } = require("../Validations/user.validate");


const UserSchema = new Schema(
    {
      email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        trim: true,
        validate: {
          validator(email) {
            return validator.isEmail(email);
          },
          message: "{VALUE} is not a valid email"
        }
      },
      firstName: {
        type: String,
        required: [true, "FirstName is required"],
        trim: true
      },
      lastName: {
        type: String,
        required: [true, "LastName is required"],
        trim: true
      },
      password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        minlength: [6, "Password should have more that 6 characters"],
        validate: {
          validator(password) {
            return passwordReg.test(password);
          },
          message: "{VALUE} is not a valid password"
        }
      },
      emailConfirm: {
        type: Number,
        default: 0
      },
      adminConfirm: {
        type: Number,
        default: 0
      },
      pptExport: {
        type: Schema.Types.Boolean,
        default: false
      },
      imageExport: {
        type: Schema.Types.Boolean,
        default: false
      },
      pdfExport: {
        type: Schema.Types.Boolean,
        default: false
      },
      excelExport: {
        type: Schema.Types.Boolean,
        default: false
      },
      wordOpen: {
        type: Schema.Types.Boolean,
        default: false
      },
      pdfOpen: {
        type: Schema.Types.Boolean,
        default: false
      },
      excelOpen: {
        type: Schema.Types.Boolean,
        default: false
      },
      leadDBOpen: {
        type: Schema.Types.Boolean,
        default: false
      },
      createPpt: {
        type: Schema.Types.Boolean,
        default: false
      },
      sendWhatsApp: {
        type: Schema.Types.Boolean,
        default: false
      },
      allowedReportTypes: [
        {
          type: Schema.Types.String
        }
      ],
      strictlyAllowedReportTypes: [
        {
          type: Schema.Types.String
        }
      ],
      myPpts: [
        {
          title: { type: Schema.Types.String },
          reportId: {
            type: Schema.Types.ObjectId,
            ref: "reports",
            trim: true,
            required: true
          },
          slides: [{ type: Schema.Types.Mixed }]
        }
      ],
      myDashboards: [
        {
          title: { type: Schema.Types.String },
          panels: [
            {
              reportId: {
                type: Schema.Types.ObjectId,
                ref: "reports",
                trim: true,
                required: true
              },
              data: { type: Schema.Types.Mixed }
            }
          ]
        }
      ],
      mySelfServiceReports: [
        {
          title: { type: Schema.Types.String },
          selfServiceData: { type: Schema.Types.Mixed }
        }
      ],
      settings: [
        {
          title: Schema.Types.String,
          data: { type: Schema.Types.Mixed }
        }
      ],
      points: {
        type: Schema.Types.Number
      },
      pointsHistory: [{ pastPoints: Schema.Types.Number }, { timestamps: true }],
      reportIds: [
        {
          type: Schema.Types.ObjectId,
          ref: "reports",
          trim: true,
          required: true
        }
      ],
      featuredReportIds: [
        {
          type: Schema.Types.ObjectId,
          ref: "reports",
          trim: true,
          required: true
        }
      ]
    },
    {
      timestamps: true
    }
  );

  UserSchema.pre('save', async function (next) {
    try {
        /* 
        Here first checking if the document is new by using a helper of mongoose .isNew, therefore, this.isNew is true if document is new else false, and we only want to hash the password if its a new document, else  it will again hash the password if you save the document again by making some changes in other fields incase your document contains other fields.
        */
        if (this.isNew) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(this.password, salt)
            this.password = hashedPassword
        }
        if (this.isModified('spin')) {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(this.spin, salt)
            this.spin = hashedPassword
        }
        next()
    } catch (error) {
        next(error)
    }
})

UserSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password)
    } catch (error) {
        throw error
    }
}

UserSchema.methods.isValidSpin = async function (spin) {
    try {
        return await bcrypt.compare(spin, this.spin)
    } catch (error) {
        throw error
    }
}

UserSchema.index({
    email: 1,
    password: 1
})

const User = mongoose.model('user', UserSchema)

module.exports = User