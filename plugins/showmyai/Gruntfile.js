/**
 * Grunt configuration for ShowMyAI Moodle Plugin
 * Handles minification of AMD modules
 */

module.exports = function(grunt) {
    // Initialize Grunt configuration
    grunt.initConfig({
        // Read package.json for metadata
        pkg: grunt.file.readJSON('package.json'),

        // Uglify configuration for AMD module minification
        uglify: {
            options: {
                mangle: true,
                compress: {
                    sequences: true,
                    dead_code: true,
                    conditionals: true,
                    booleans: true,
                    unused: true,
                    if_return: true,
                    join_vars: true,
                    drop_console: false
                },
                output: {
                    comments: false,
                    beautify: false
                }
            },
            amd: {
                files: {
                    'amd/build/inject_button.min.js': 'amd/src/inject_button.js'
                }
            }
        },

        // Watch configuration for development
        watch: {
            amd: {
                files: ['amd/src/**/*.js'],
                tasks: ['uglify:amd'],
                options: {
                    spawn: false,
                    interrupt: true
                }
            }
        }
    });

    // Load the Grunt plugins
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Register custom tasks
    grunt.registerTask('amd', ['uglify:amd']);
    grunt.registerTask('all', ['amd']);
    grunt.registerTask('default', ['amd']);
};
