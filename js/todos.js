// An example Backbone application contributed by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses a simple
// [LocalStorage adapter](backbone-localstorage.html)
// to persist Backbone models within your browser.

// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Todo Model
  // ----------
  // Our basic **Todo** model has `title`, `url`, and `done` attributes.
  var Todo = Backbone.Model.extend({
	// Duration of a model (m seconds)
	duration: 60*60*24*1000,

    // Default attributes for the todo item.
    defaults: function() {
      return {
        title: "Loading Title...",
        done: false,
		url: null,
		created_at: new Date().toString() ,
		delete_at: new Date().getTime() + this.duration,
		archive: false,
		comment: null,
		page: Todos.getPage(),	// Archiveページング用の属性
      };
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
      this.save({done: !this.get("done")});
    },

	// 削除日時を過ぎていたら削除。既読ならばArchivesへ。renderする際にskipするか
	shouldBeSkipped: function() {
		if (this.get('archive')) return true;
		var date = new Date().getTime();
		var delete_at = this.get('delete_at');
		if (date > delete_at) {
			if (this.get('done'))
			{
				this.save({archive: true, delete_at: -1, done: false});
				return true;
			}
			this.destroy();
			return true;
		}
		return false;
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
    done: function(archive_flg) {
      return this.where({done: true, archive: archive_flg});
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function(archive_flg) {
      return this.where({done: false, archive: archive_flg});
    },

	// TODO 実装途中
    getPage: function() {
	  var perPage = 100;
      if (!this.length) return 1;
	  var quotient = Math.floor(this.length / perPage);
      return quotient + 1;
    },

    // Todos are sorted by their original insertion order.
    // comparator: 'created_at'
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
      "mouseenter img.thumbnail"	: "startZoom",
      "mouseleave img.thumbnail"	: "endZoom",
      // "mouseenter"	: "changeBgColor",
      // "mouseleave"	: "returnBgColor",
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
	// メモリリークの一因。zombie View。_this = null;で解決
    clear: function() {
	  var _this = this;
	  this.$el.hide('slow', function(){
		_this.model.destroy();
		_this = null;
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
					_this = null;
			  }
			},
			threshold: threshold,
			excludedElements:"button, input, select, textarea, .noSwipe, a",
			triggerOnTouchEnd:false,	// true:指を離すまで発火しない
			allowPageScroll:"auto",
		});
	},

 	startZoom: function(e) {
		var zoom_width = "350px";
		$(e.target).stop().animate({
					'width': zoom_width,//拡大で表示させておくサイズ
					// 'marginTop':'245px'//トップのマージンをマイナスで指定する事で底辺を起点としています
				},'fast');
	},
 	endZoom: function(e) {
		var default_widht = "85px";
		$(e.target).stop().animate({
					'width': default_widht,//デフォルトで表示させておくサイズ
					// 'marginTop':'0px'
				},'fast');
	},
  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({
	// page: 1,	// ページング用変数
	isArchive: false,	// 現在の表示がアーカイブか。

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    // Our template for the line of statistics at the bottom of the app.
    statsTemplate: _.template($('#stats-template').html()),

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "keypress #new-todo":  "createOnEnter",
      "click #clear-completed": "clearCompleted",
      "click #toggle-archives": "toggleArchives",
      "scroll": "scroll",
    },

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *localStorage*.
    initialize: function() {
	  // _.bindAll(this, 'scroll');
	  // $(window).scroll(this.scroll);

      this.input = this.$("#new-todo");

      this.listenTo(Todos, 'reset', this.loadWebs);	// page reload時に一度だけ発火
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
      var done = Todos.done(this.isArchive).length;
      var remaining = Todos.remaining(this.isArchive).length;

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

	  if (this.isArchive) return;	// アーカイブ表示時はprependしない
      var view = new TodoView({model: todo});
      this.$("#todo-list").prepend(view.render().el);
    },

	// ページ読み込み時のロード
    loadOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").prepend(view.render().el);
    },

    // Add all items in the **Todos** collection at once.
    loadWebs: function() {
	  console.log('[AppView] loadWebs');
	  var attributes = {
		archive: false,
	  }
	  var res = Todos.where(attributes);
	  for(var i=0; i<res.length; i++) {
		this.flg = res[i].shouldBeSkipped();
		if (this.flg) continue;
		this.loadOne(res[i]);
	  }
	  this.render();  // kick render()
    },

    // for Archive loading
    loadArchives: function() {
	  console.log('[AppView] loadArchives');
	  var attributes = {
		// page: this.page,
		archive: true,
	  }
	  var res = Todos.where(attributes);
	  // this.page++;
	  for(var i=0; i<res.length; i++) {
		this.loadOne(res[i]);
	  }
	  this.render();
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
      _.invoke(Todos.done(this.isArchive), 'destroy');
      return false;
    },

    // Archives表示と通常表示とを切り替える
    toggleArchives: function (e) {
		this.$("#todo-list").html('');	//HTMLを一度空にする
		this.$("#toggle-archives").toggleClass("selected");
		// this.page = 1;	//page 初期化
		this.isArchive = !this.isArchive;
		if (this.isArchive){
			this.loadArchives();
		} else {
			this.loadWebs();
		}
    },

    // Scroll event
    scroll: function(e) {
		if (!this.isArchive) return;
		var contentsHeight = $(document).height();
		var scrollPosition = $(window).height() + $(window).scrollTop();
		var threshold = 0;
		if (contentsHeight - scrollPosition < threshold)
		{
			console.debug('scrolled to bottom');
			// this.loadArchives();
		}
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
			console.log($(res.responseText).find("meta[name=description]"));
				// スクレイピングしたcontentsから特定のタグの内容を切り出す。
				var str = $(res.responseText).find('h1, h2, h3, p').text();
				// 文字列の切り出し
				str = str.substring(0, str_length);
				model.save({comment: str});
			}
		});
	},
  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

});
