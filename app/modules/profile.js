(function(Profile) {

	Profile.Model = Backbone.Model.extend({ /* ... */ });
	Profile.Collection = Backbone.Collection.extend({ /* ... */ });
	//Profile.Router = Backbone.Router.extend({ /* ... */ });

	var Helper = fazzle.module("helper");

	Profile.Router = Helper.SubRoute.extend({
		routes: {
			"": "view",
			"edit": "edit"
		},
		view: function(hash) {
			var route = this;
			var profile = new Profile.Views.Home();

			// Attach the runway to the DOM
			profile.render(function(el) {
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

	// This will fetch the tutorial template and render it.
	Profile.Views.Home = Backbone.View.extend({
		template: "app/templates/profile/main.html",

		render: function(done) {
			var view = this;

			// Fetch the template, render it to the View element and call done.
			fazzle.fetchTemplate(this.template, function(tmpl) {
				view.el.innerHTML = tmpl();

				done(view.el);
			});
		}
	});

})(fazzle.module("profile"));