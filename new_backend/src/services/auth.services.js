import passport from 'passport';
import LocalStrategy from 'passport-local';
import {Strategy as JWTStrategy, ExtractJwt} from 'passport-jwt';
import userModel from '../modules/users/user.model';
import constants from '../config/constants';
import logger from './../logs/logs';

const jwt = require('jsonwebtoken');

export const authJwt = (req, res, next) => {
  let token = req.headers.authorization;
  if (!token) return res.status(401).send({message: 'Unauthorized'});
  token = token.split(' ')[1];
  jwt.verify(token, constants.JWT_SECRET, (error, user) => {
    if (error) return res.status(401).send({message: 'Unauthorized'});
    userModel.Users.findById(user.id, {password: 0}, (dbError, dbUser) => {
      if (!dbUser) return res.status(401).send({message: 'Unauthorized'});
      req.user = dbUser;
      let obj = {
        baseUrl: req.baseUrl,
        originalUrl: req.originalUrl,
        params: req.params,
        query: req.query,
        request_type: req.method,
        route: req.route,
        userId: dbUser._id,
      };
      if (req.params.rid) {
        obj.reportId = req.params.rid ? req.params.rid : ''
      }
      // RequestsHistory.create(obj);
      logger.info(`User ID =========>${dbUser._id}`);
      next();
    });
  });
};

const localOpts = {
  usernameField: 'email',
};

// Local Strategy
const localStrategy = new LocalStrategy(
  localOpts,
  async (email, password, done) => {
    try {
      const user = await userModel.Users.findOne({email});
      if (!user) {
        return done(null, false);
      } else if (!user.authenticateUser(password)) {
        return done(null, false);
      }
      return done(null, user);
    } catch (e) {
      return done(e, false);
    }
  },
);

// Jwt Strategy
const jwtOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey: constants.JWT_SECRET,
};

const jwtStrategy = new JWTStrategy(jwtOpts, async (payload, done) => {
  try {
    const user = await userModel.Users.findById(payload.id);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (e) {
    return done(e, false);
  }
});

passport.use(localStrategy);
passport.use(jwtStrategy);

export const authLocal = passport.authenticate('local', {session: false});
// export const authJwt = passport.authenticate('jwt', {session: false});
