module.exports = function(grunt) {

	grunt.initConfig({
		bower: {
			all: {
				dest: 'js/assets.js',
				exclude: ['prefix-free'],
				dependencies: {
					'fitvids': 'jquery',
					'angular-mobile': 'angular',
				}
			}
		},
		jshint: {
			all: ['js/app.js']
		},
		casperjs: {
			options: {},
			files: ['tests/*.js']
		},
		uglify: {
			assets: {
				files: {
					'js/assets.js': [
						'js/assets.js',
						'js/prism.js'
					]
				}
			}
		},
		cssmin: {
			build: {
				src: 'css/base.css',
				dest: 'css/base.min.css'
			}
		},
		shell: {
			docGeneration: {
				command: 'docco js/app.js',
				options: {
					stdout: true
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-bower-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-casperjs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-css');
	grunt.loadNpmTasks('grunt-shell');

	grunt.registerTask('default', ['shell', 'bower', 'uglify', 'cssmin']);
	grunt.registerTask('test', ['shell', 'jshint']);
};