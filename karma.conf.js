module.exports = function(config) {
    config.set({
        autoWatch: false,
        singleRun: true,
        basePath: '',
        frameworks: ['mocha', 'chai', 'sinon', 'jquery-3.2.1'],
        files: [
            './node_modules/sinon-chai/lib/sinon-chai.js',
            './client/js/*.js',
            './client/test/*.spec.js',
        ],
        exclude: [
        ],
        browsers: ['PhantomJS'],
        plugins : [
            'karma-mocha',
            'karma-chai',
            'karma-sinon',
            'karma-jquery',
            'karma-phantomjs-launcher'
        ]
    });
};