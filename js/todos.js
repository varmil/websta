// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Todo Model
  // ----------

  // Our basic **Todo** model has `title`, `order`, and `done` attributes.
  var Todo = Backbone.Model.extend({

    // Default attributes for the todo item.
    defaults: function() {
      return {
        title: "Loading Title...",
        done: false,
		url: null,
		created_at: new Date().toString() ,
		deleted_at: parseInt( new Date() /1000 ),
		state: 1,
		comment: null,
        order:  Todos.nextOrder(),
      };
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
      this.save({done: !this.get("done")});
    },

  });

  // Todo Collection
  // ---------------

  // The collection of todos is backed by *localStorage* instead of a remote
  // server.
  var TodoList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Todo,

    // Save all of the todo items under the `"todos-backbone"` namespace.
    localStorage: new Backbone.LocalStorage("todos-backbone"),

    // Filter down the list of all todo items that are finished.
    done: function() {
      return this.where({done: true});
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.done());
    },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
	// -していくので新しいものほど上に来る
    nextOrder: function() {
      if (!this.length) return 0;
      return this.first().get('order') - 1;
    },

    // Todos are sorted by their original insertion order.
    comparator: 'order'

  });

  // Create our global collection of **Todos**.
  var Todos = new TodoList;

  // Todo Item View
  // --------------

  // The DOM element for a todo item...
  var TodoView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .toggle"				: "toggleDone",
      "click .content_text"	: "toggleDone",
      "dblclick .view"			: "edit",
      "click a.destroy"			: "clear",
      "keypress .edit"			: "updateOnEnter",
      "blur .edit"					: "close",
      "hover img.thumbnail"	: "startZoom",
      "hover"	: "changeColor"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);

	  // Swipeイベントを有効に
	  this.startSwipe();
    },

    // Re-render the titles of the todo item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.input = this.$('.edit');
      return this;
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      this.$el.addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
      var value = this.input.val();
      if (!value) {
        this.clear();
      } else {
        this.model.save({title: value});
        this.$el.removeClass("editing");
      }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
	  console.log('[TodoView] updateOnEnter start');
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
	  var _this = this;
	  this.$el.hide('slow', function(){
		_this.model.destroy();
	  });
    },

	// Swipeの制御
	startSwipe: function() {
		var _this = this;
		var threshold = 350;
		this.$el.swipe( {
			swipeStatus:function(event, phase, direction, distance, duration, fingerCount)
			{
			  var str = "";
			  if (phase=="move") {
					if (direction =="left") {
						$(this).css("-webkit-transform", "translateX(-"+ distance +"px)");
						$(this).css("-moz-transform", "translateX(-"+ distance +"px)");
						$(this).css("-o-transform", "translateX(-"+ distance +"px)");
						$(this).css("-ms-transform", "translateX(-"+ distance +"px)");
						$(this).css("opacity", 1.0 - 1.0 * distance / threshold);
					}
					else if (direction =="right") {
						$(this).css("-webkit-transform", "translateX("+ distance +"px)");
						$(this).css("-moz-transform", "translateX("+ distance +"px)");
						$(this).css("-o-transform", "translateX("+ distance +"px)");
						$(this).css("-ms-transform", "translateX("+ distance +"px)");
						$(this).css("opacity", 1.0 - 1.0 * distance / threshold);
					}
			  } else if (phase =="cancel") {
					// スワイプが足りないので元に戻す
					$(this).css("-webkit-transform", "translateX("+ 0 +"px)");
					$(this).css("-moz-transform", "translateX("+ 0 +"px)");
					$(this).css("-o-transform", "translateX("+ 0 +"px)");
					$(this).css("-ms-transform", "translateX("+ 0 +"px)");
					$(this).css("opacity", 1.0);
			  } else if (phase =="end") {
					// 一定以上スワイプしたので削除
					_this.clear();
			  }
			},
			threshold: threshold,
			// maxTimeThreshold:2500,
			excludedElements:"button, input, select, textarea, .noSwipe, a",
			triggerOnTouchEnd:false,	// true:指を離すまで発火しない
			allowPageScroll:"auto",
		});
	},

 	startZoom: function() {
		zoom_width = "350px";
		default_widht = "85px";
		$('img.thumbnail')
		.on({
			'mouseenter': function(){
				$(this).stop().animate({
					'width': zoom_width,//拡大で表示させておくサイズ
					// 'marginTop':'245px'//トップのマージンをマイナスで指定する事で底辺を起点としています
				},'fast');
			},
			'mouseleave': function () {
				$(this).stop().animate({
					'width': default_widht,//デフォルトで表示させておくサイズ
					// 'marginTop':'0px'
				},'fast');
			}
		});
	},

	changeColor: function() {
		// var distance = "-7px";
		// var duration = 100;
		$(this.el)
		.on({
			'mouseenter': function(){
				$(this).css("background-color", "ghostwhite");
				// $(this).stop().animate({
					// 'left': distance,
				// }, duration);
			},
			'mouseleave': function () {
				$(this).css("background-color", "white");
				// $(this).stop().animate({
					// 'left': '0px',
				// }, duration);
			}
		});
	}
  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-todo":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-all": "toggleAllComplete"
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {

      this.input = this.$("#new-todo");
      this.allCheckbox = this.$("#toggle-all")[0];			// inputなので属性にchecked:true or false を持つ

      this.listenTo(Todos, 'reset', this.loadAll);			// page reload時に一度だけ発火
      this.listenTo(Todos, 'add', this.addOne);			// collection.create()時に発火
      this.listenTo(Todos, 'change', this.render);		// collectionはmodelが発火したイベントも受け取れる
      this.listenTo(Todos, 'destroy', this.render);		// modelが破棄されたら発火

	  this.on('getTitle', this.getTitle);
	  this.on('getComment', this.getComment);

      this.status_bar = this.$('.status_bar');
      this.main = $('#main');

      Todos.fetch({reset: true});  // reset: true にするとaddが発火しなくなり、reset: falseにするとaddが発火する
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      var done = Todos.done().length;
      var remaining = Todos.remaining().length;
	  console.log('remaining = ', remaining);

      if (Todos.length) {
        this.main.show();
        this.status_bar.html(this.statsTemplate({done: done, remaining: remaining}));
      } else {
        this.main.hide();
      }
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(todo) {
	  this.trigger('getTitle', todo);
	  this.trigger('getComment', todo);
      var view = new TodoView({model: todo});
      this.$("#todo-list").prepend(view.render().el);
    },

	// ページ読み込み時のロード
    loadOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").append(view.render().el);
    },

    // Add all items in the **Todos** collection at once.
    loadAll: function() {
	  console.log('[AppView] loadAll');
      Todos.each(this.loadOne, this);
	  this.render();  // kick render()
    },

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    createOnEnter: function(e) {
      if (e.keyCode != 13) return;
      if (!this.input.val()) return;

	  Todos.create({url: this.input.val()});
      this.input.val('');
    },

    // Clear all done todo items, destroying their models.
    clearCompleted: function() {
      _.invoke(Todos.done(), 'destroy');
      return false;
    },

    toggleAllComplete: function () {
	  console.log('this.allCheckbox.checked = ', this.allCheckbox.checked);
      var done = this.allCheckbox.checked;			// 不思議。clickして変更された後の属性を取得
      Todos.each(function (todo) { todo.save({'done': done}); });
    },

	// modelのurlを元にタイトルを取得する。
	// API: http://ryouchi.seesaa.net/article/42059413.html
	getTitle: function(model) {
		$.getJSON("http://www.usamimi.info/~ryouchi/title/get_title_jsonp.php?callback=?",
		{
			url: model.get('url'),
		},
		function(res){
			model.save({title: res.title});
		});
	},

	// スクレイピング
	getComment: function(model) {
		var str_length = 180;
		$.ajax({
			url: model.get('url'),
			type: 'GET',
			success: function(res) {
				// スクレイピングしたcontentsから特定のタグの内容を切り出す。
				var str = $(res.responseText).find('h1, h2, h3, p').text();
				// 文字列の切り出し
				result_str = str.substring(0, str_length);
				model.save({comment: result_str});
				console.log(result_str);
			}
		});
	},
  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

});
