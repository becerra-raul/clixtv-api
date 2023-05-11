module.exports = function(grunt) {
    grunt.initConfig({
        env: {
            development: {
                NODE_ENV: 'stage',
                NODE_CONFIG_DIR : '/etc/clixtv/api/',
                PORT: 3000
            },
            test: {
                NODE_ENV: 'stage',
                NODE_CONFIG_DIR : '/etc/clixtv/api/',
                PORT: 3000
            }
        },
        express: {
            api: {
                options: {
                    script: 'index.js'
                }
            }
        },
        watch: {
            options: {
                livereload: 9999,
            },
            express: {
                files: ['**/*.js', '!**/node_modules/**'],
                tasks: ['express:api'],
                options: {
                    spawn: false
                }
            }
        },
        apidoc: {
            api: {
                src: [
                    'controllers/',
                    'models/'
                ],
                dest: 'docs/'
            }
        },
        mochaTest: {
            integration: {
                options: {
                    reporter: 'spec'
                },
                src: [
                    'tests/integration/categories-test.js'
                    // 'tests/integration/*.js'
                ]
            },
            unit: {
                options: {
                    reporter: 'spec'
                },
                src: [
                    'tests/unit/**/*.js'
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-apidoc');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('doc', ['apidoc']);
    grunt.registerTask('test', ['env:test', 'mochaTest:unit']);
    grunt.registerTask('test:integration', ['mochaTest:integration']);
    grunt.registerTask('default', ['env:development', 'express', 'watch']);
};