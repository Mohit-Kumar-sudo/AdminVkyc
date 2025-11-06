import morgan from 'morgan';
import bodyParser from 'body-parser';
import compression from 'compression';
import helmet from 'helmet';
import passport from 'passport';

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

export default app => {
  if (isProd) {
    app.use(compression());
    app.use(helmet());
  }


  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
  app.use(passport.initialize());


  // addEventListener('fetch', event => {
  //   event.respondWith(handle(event.request)
  //       .catch(e => new Response(null, {
  //         status: 500,
  //         statusText: "Internal Server Error"
  //       }))
  //   )
  // })
  
  // async function handle(request) {
  //   if (request.method === "OPTIONS") {
  //     return handleOptions()
  //   } else {
  //     // Pass-through to origin.
  //     // This subrequest will get a cached response due to CF page rules
  //     return fetch(request)
  //   }
  // }

  // CORS Middleware node.js package for connect express
  app.use(function (req, res, next) {
    var menthods = "GET, POST";
    var preflightContinue = true;
    var optionsSuccessStatus = 204;
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", menthods,preflightContinue,optionsSuccessStatus);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType, Content-Type, Accept, Authorization");
    if (!menthods.includes(req.method.toUpperCase())) {
        return res.status(200).json({});
    };
    next();
  });

  // function handleOptions() {
  //   // Handle CORS pre-flight request.
  //   return new Response(null, {
  //     headers: corsHeaders
  //   })
  // }



  if (isDev) {
    app.use(morgan('dev'));
  }
};
