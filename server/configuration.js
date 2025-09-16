const defaultValues = {
  WEB_MONITORING_DB_URL: 'https://api.monitoring-staging.envirodatagov.org',
  ALLOW_PUBLIC_VIEW: false
};

const clientFields = [
  'WEB_MONITORING_DB_URL',
  'ALLOW_PUBLIC_VIEW'
];

const processEnvironment = Object.assign(
  {},
  process.env,
  { NODE_ENV: (process.env.NODE_ENV || 'development').toLowerCase() }
);

// Dotenv is optional (only installed in development for now).
let dotenv = { config () { return { parsed: {} }; } };
try {
  dotenv = await import('dotenv');
}
catch {
  // pass
}

function parseBoolean (text, options = { default: false }) {
  if (text == null || text === '') return options.default;

  if (typeof text === 'string') {
    return /^t|true|1$/.test(text.trim().toLowerCase());
  }
  else {
    return !!text;
  }
}

/**
 * Get the current configuration for the app. This consists of the process's
 * environment, then falls back to a local `.env` file (not used in production),
 * then some built-in defaults. When not in production, the local `.env` file
 * will be re-scanned on every call, so you get live-updated configuration.
 *
 * Note this configuration object is *not* suitable for sending to client code;
 * it may contain keys that must be kept secure.
 * @returns {Object}
 */
export function baseConfiguration () {
  let localEnvironment = processEnvironment;

  if (processEnvironment.NODE_ENV !== 'production') {
    localEnvironment.NODE_ENV = 'development';

    // dotenv.config() updates process.env, but only with properties it doesn't
    // already have. That means it won't update properties that were previously
    // specified, so we have to do it manually here.
    const fromFile = dotenv.config({ quiet: true });
    // If there is no .env file, don't throw and just use process.env
    if (fromFile.error && fromFile.error.code !== 'ENOENT') {
      throw fromFile.error;
    }
    else if (fromFile.parsed) {
      localEnvironment = Object.assign(fromFile.parsed, localEnvironment);
    }
  }

  // Special parsing
  localEnvironment.ALLOW_PUBLIC_VIEW = parseBoolean(
    localEnvironment.ALLOW_PUBLIC_VIEW,
    { default: null }
  );
  if (localEnvironment.ALLOW_PUBLIC_VIEW == null) {
    delete localEnvironment.ALLOW_PUBLIC_VIEW;
  }

  return Object.assign({}, defaultValues, localEnvironment);
}

/**
 * Get a configuration object that is safe to pass to client code.
 * @returns {Object}
 */
export function clientConfiguration () {
  const source = baseConfiguration();

  return clientFields.reduce((result, field) => {
    result[field] = source[field];
    return result;
  }, {});
}
