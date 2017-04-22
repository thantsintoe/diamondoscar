var compressor          = require('node-minify');


module.exports = function() {
    
    // Using Google Closure Compiler to compress css and js files
    compressor.minify({
      compressor: 'clean-css',
      publicFolder: './public/stylesheets/',
      input: './public/stylesheets/uncompressed/main.css',
      output:  './public/stylesheets/main.css',
      callback: function (err, min) {
          if (err) {console.log(err);}
      }
    });
    
    compressor.minify({
      compressor: 'clean-css',
      publicFolder: './public/stylesheets/',
      input: './public/stylesheets/uncompressed/homepage.css',
      output:  './public/stylesheets/homepage.css',
      callback: function (err, min) {
          if (err) {console.log(err);}
      }
    });
    
    compressor.minify({
      compressor: 'clean-css',
      publicFolder: './public/stylesheets/',
      input: './public/stylesheets/uncompressed/dropdown.css',
      output:  './public/stylesheets/dropdown.css',
      callback: function (err, min) {
          if (err) {console.log(err);}
      }
    });
    
    compressor.minify({
      compressor: 'clean-css',
      publicFolder: './public/stylesheets/',
      input: './public/stylesheets/uncompressed/ShowPage.css',
      output:  './public/stylesheets/ShowPage.css',
      callback: function (err, min) {
          if (err) {console.log(err);}
      }
    });
};

