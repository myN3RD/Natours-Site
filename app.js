const path = require('path');
const express = require('express');
const morgan = require('morgan'); // recommended when using APIs
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const csp = require('helmet-csp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
// const globalErrorHandler = require('./../');


const tourRouter = require('./routes/tourRoutes'); 
const userRouter = require('./routes/userRoutes'); 
const reviewRouter = require('./routes/reviewRoutes'); 
const viewRouter = require('./routes/viewRoutes'); // FIXME:


const app = express();


app.use(cors());

// SERVER SIDE RENDERING - TEMPLATING ENGINE
app.set('view engine', 'pug');

app.set('views', path.join(__dirname, 'views')); // + -> using the path module
// app.use("/views", express.static("views"));
app.set(express.static(path.join(__dirname, 'public'))); //path join -> will always create a correct path!
// app.set('public', path.join(__dirname, 'public')); //path join -> will always create a correct path!
// app.use("/public", express.static("public"));




// 1) GLOBAL MIDDLEWARE

// Set security http headers
app.use(helmet());


// Development logging
// console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
};

// TO HANDLE MAX REQ IN 1 HOUR   (POSTMAN -> headers tab: "X-RateLimit-Limit")
// middleware
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // = 100 req from the same ip in 1 hour
  message: 'Too many requests from this IP, please try again in an hour.'
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json( { limit: '10kb' } )); // OLD was body-parser instead of (express...
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ****SECURITY**** data saniazation against NoSQL query injection
app.use(mongoSanitize());

// ****SECURITY**** data saniazation against XSS
app.use(xss());

// ****SECURITY****  prevent parameter pollution -> clears up the query string = {{URL}}api/v1/tours?sort=duration&sort=price -> means it took only the last one price rom the query
// -> we can whitelist stuff (allows duplication in the query-string), lecture 146
app.use(hpp({
    whitelist: [
      'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
    ]
  })
); 

app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  console.log("TEST MIDDLEWARE");
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  console.log(req.cookies);
  
  next();
});


app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://cdn.jsdelivr.net"
  );
  next();
});

  

// 3) ROUTES

// app.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'test123'
//   });
// });

app.use('/', viewRouter); // FIXME:
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);


// ROUTE HANDLER -> for all the routes which are not defined
// middleware -> will be reaced ONLY if NOT handled by any other router
// .all -> means it runs for all the VERBS (http methods) -> (get, put, patch, delete etc.)
// has to be at the end of our app after all other routes!
app.all('*', (req, res, next) => {
  next(new AppError(`GLOBAL ERROR HANDLER -> Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;
