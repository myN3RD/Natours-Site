const crypto = require('crypto');
const { promisify } = require('util'); // = utility
const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');


// JWT TOKEN
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};


// ✅✅✅ COOKIE is in POSTMAN under cookie-tab 
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
  });

  // OLD     for HTTP !?!?!
  // const cookieOptions = {
  //   expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60  * 60 * 1000),
  //   httpOnly: true // ****SECURITY**** -> to prevent (XSS) CROSS SITE SCRIPTING ATTACKS FIXME: https later  ???
  // }
  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // defined in package.json
  // // sending a cookie
  // res.cookie('jwt', token, cookieOptions);
  
  // REMOVES the password from the output in postman
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}

// ✅ BE  SIGNUP - ALLOWS ONLY TO PUT IN DATA WE RLY NEED
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  
  createSendToken(newUser, 201, req, res);
  // LOG THE USER IN, AS SOON HE SIGNUP
    // const token = signToken(newUser._id);
});


// LOGIN  ✅ BE     -FE bundler err
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email & password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  };
  // 2) Check if the user exists & password is correct
  const user = await User.findOne({ email }).select('+password'); // +password -> now it will be back in the output

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything is ok, send token to client    JWS (JSON WEB TOKEN back to the client)
  // MUST HAPPEN OVER A HTTPS adress!
  // we reach this, just if there is no error before!
  createSendToken(user, 200, req, res);
});


// LOGOUT USER
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};


// WHEN THE USER IS LOGGED IN (Only for rendered pages)
exports.isLoggedIn = async (req, res, next) => { 
  if (req.cookies.jwt) {
    try {    
    // 1) verifys the token
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
      );
    // 2) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }
    // 3) Check if user changed password after the token was issued
    // with INSTANCE METHOD
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }

    // THERE IS A LOGGED IN USER
    res.locals.user = currentUser;
    return next();
  } catch (err) {
    return next();
  }
}
next();
};


// WE NEED ALL STEPS TO be 100% SAFE
exports.protect = catchAsync(async (req, res, next) => { // FIXME: for the login page
// 1) Getting token and check if its exist
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) { // = JWT
    return next(new AppError('You are not logged in! Please log in to get access.', 401)); // 401 => is not authorized
  };

// 2) Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

// 3) Check if user still exists - lecture 132
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does not longer exist', 401)); // FIXME: err msg doenst show up
  };

// 4) Check if user changed password after the token was issued
  // with INSTANCE METHOD
  if (currentUser.changedPasswordAfter(decoded.iat)) { // iat => issued at
    return next(new AppError('User recently changed password! Please log in again', 401));
  }; 

  // GRAND ACCESS TO PROTECTED ROUTE
  req.user = currentUser;             // *********** IMPORTANT LINE ***********
  res.locals.user = currentUser;
  next();
});

// USING ROLES TO DO SPECIFIC ACTIONS, like deleting something
//// or use {{URL}}api/v1/users -> in POSTMAN to get All Users
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array -> ['admin', 'lead-guide']
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You have no permission to perform this action.', 403)); // FIXME: err msg doenst show up
    }
    next();
  }
};

// PASSWORD FORGOT / RESET 
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get user based on POSTed email
  const user = await User.findOne({ email: req.body.email }); // email -> cause its the only data which is known
  if (!user) {
    return next(new AppError('There is no user with that email address', 404)); // FIXME: err msg doenst show up
  }
  // 2) generate the random reset token
  const resetToken = user.createPasswordResetToken();
  console.log(resetToken);// FIXME:  doesn't show up
  await user.save({ validateBeforeSave: false }); // IMPORTANT LINE !!!
  
  // 3) send it back as an email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    
    res.status(200).json({
      status: 'success',
      message: 'Token send to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false }); // IMPORTANT LINE !!!

    return next(new AppError('There was an error sending the email. Try again later!'), 500);
  };
});

// PASSWORD RESET 
exports.resetPassword = catchAsync(async(req, res, next) => {
  // 1) Get user based on the token
// encrypt the token again and compare it with the db
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // token is the only thing we know now
  const user = await User.findOne({ 
    passwordResetToken: hashedToken, 
    passwordResetExpires: { $gt: Date.now() }
});

  // 2) If token has not expired, and there is a user,  then set a new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired'), 400)
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the current user
    // --> this is in the userModel !

  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});


// ✅✅✅ UPDATE PASSWORD
// FOR LOGGED IN USERS
// always ask for the current password before updating it
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // 2) check if POSTed current password is correct
    if (!( await user.correctPassword(req.body.passwordCurrent, user.password))) {
      return next(new AppError('Your current password is wrong.', 401));
    }
  
    // 3) If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended here!
  
    // 4) Log user in, send JWT
    createSendToken(user, 200, req, res);
  });
