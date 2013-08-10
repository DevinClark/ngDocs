module.exports = function(grunt) {

	grunt.initConfig({
		bower: {
			all: {
				dest: 'js/assets.js',
				exclude: [],
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
				src: 'css/base.prefixed.css',
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
		},
		compass: {
			dist: {
				options: {
					config: 'config.rb'
				}
			}
		},
		watch: {
			sass: {
				files: ['sass/*.scss'],
				tasks: ['compass']
			},
			css: {
				files: ['css/base.css'],
				tasks: ['autoprefixer', 'cssmin'],
				options: {
					spawn: false,
				},
			}
		},
		autoprefixer: {
			dist: {
				options: {
					browsers: ['ios >= 5', 'chrome >= 28']
				},
				files: {
					'css/base.prefixed.css': ['css/base.css']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-bower-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-casperjs');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-css');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-compass');

	grunt.registerTask('default', ['shell', 'bower', 'uglify', 'autoprefixer', 'cssmin']);
	grunt.registerTask('test', ['shell', 'jshint']);
};