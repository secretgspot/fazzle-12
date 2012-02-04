// Change *namespace* to your namespace!
// This contains the module definition factory function, application state,
// events, and the router.
this.fazzle = {
	// Assist with code organization, by breaking up logical components of code
	// into modules.
	module: function() {
		// Internal module cache.
		var modules = {};

		// Create a new module reference scaffold or load an existing module.
		return function(name) {
			// If this module has already been created, return it.
			if (modules[name]) {
				return modules[name];
			}

			// Create a module and save it under this name
			return modules[name] = { Views: {} };
		};
	}(),

	// This is useful when developing if you don't want to use a
	// build process every time you change a template.
	//
	// Delete if you are using a different template loading method.
	fetchTemplate: function(path, done) {
		window.JST = window.JST || {};

		// Should be an instant synchronous way of getting the template, if it
		// exists in the JST object.
		if (JST[path]) {
			return done(JST[path]);
		}

		// Fetch it asynchronously if not available from JST
		return $.get(path, function(contents) {
			var tmpl = _.template(contents);
			JST[path] = tmpl;

			done(tmpl);
		});
	},

	// Keep active application instances namespaced under an app object.
	app: _.extend({}, Backbone.Events)
};

// Treat the jQuery ready function as the entry point to the application.
// Inside this function, kick-off all initialization, everything up to this
// point should be definitions.
jQuery(function($) {

	// Shorthand the application namespace
	var app = fazzle.app;

	// Include the primary modules
	var Runway = fazzle.module("runway");
	var Profile = fazzle.module("profile");
	var Buzz = fazzle.module("buzz");
	var Closet = fazzle.module("closet");
	var Settings = fazzle.module("settings");

	// Include the secondary modules
	var Viewing = fazzle.module("viewing");
	var Editing = fazzle.module("editing");


	// Defining the application router, you can attach sub routers here.
	var Router = Backbone.Router.extend({
		routes: {
			"runway": "index",
			"": "index"
			//":hash": "index"
		},
		initialize: function(){
			// If you have sub routers defined in additional modules, you can do attach them here. 
			// This enables navigation such as 'app.routers.OtherRouter.navigate'
			//
			this.runway = new Runway.Router("runway/");
			this.profile = new Profile.Router("profile/");
			this.buzz = new Buzz.Router("buzz/");
			this.closet = new Closet.Router("closet/");
			this.settings = new Settings.Router("settings/");

			this.viewing = new Viewing.Router("viewing/");
			this.editing = new Editing.Router("editing/");
		},
		index: function(hash) {
			var route = this;
			var home = new Runway.Views.Home();

			// Attach the runway to the DOM
			home.render(function(el) {
				$("#main").html(el);

				// Fix for hashes in pushState and hash fragment
				if (hash && !route._alreadyTriggered) {
					// Reset to home, pushState support automatically converts hashes
					Backbone.history.navigate("", false);

					// Trigger the default browser behavior
					location.hash = hash;

					// Set an internal flag to stop recursive looping
					route._alreadyTriggered = true;
				}
			});
		}
	});
	
	// Actually initialize
	//new app.Router();

	// Define your master router on the application namespace and trigger all
	// navigation from this instance.
	app.router = new Router();

	// Trigger the initial route and enable HTML5 History API support
	Backbone.history.start({ pushState: true });

	// All navigation that is relative should be passed through the navigate
	// method, to be processed by the router.  If the link has a data-bypass
	// attribute, bypass the delegation completely.
	$(document).on("click", "a:not([data-bypass])", function(evt) {
		// Get the anchor href and protcol
		var href = $(this).attr("href");
		var protocol = this.protocol + "//";

		// Ensure the protocol is not part of URL, meaning its relative.
		if (href.slice(0, protocol.length) !== protocol) {
			// Stop the default event to ensure the link will not cause a page
			// refresh.
			evt.preventDefault();

			// This uses the default router defined above, and not any routers
			// that may be placed in modules.  To have this work globally (at the
			// cost of losing all route events) you can change the following line
			// to: Backbone.history.navigate(href, true);
			app.router.navigate(href, true);
		}
	});
});