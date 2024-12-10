System.config({
    baseURL: '/',
    paths: {
      'npm:': 'node_modules/'
    },
    map: {
      'app': 'app', // Your main application files
      'react': 'npm:react/umd/react.production.min.js', // React mapped to its CDN version
      'react-dom': 'npm:react-dom/umd/react-dom.production.min.js', // ReactDOM
      'rxjs': 'npm:rxjs',
    },
    packages: {
      app: {
        main: './main.js',
        defaultExtension: 'js'
      }
    }
  });
  