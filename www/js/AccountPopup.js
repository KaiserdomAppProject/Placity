var AccountPopup = function() {
    
    this.initialize = function() {
        this.el = $("<div/>").addClass("page");
        this.registerEvents();
    };
    
    this.render = function() {
        this.el.html(AccountPopup.template());
        return this;
    };
    
    this.registerEvents = function() {
        this.el.on("click", ".popup-close", function(){app.closePopup();});
        this.el.on("click", "#setName", function(){app.dataInterface.setValue("userName", $("#usernameIn").val(), function() {app.closePopup();})});
    };
    
    this.initialize();
}
    
AccountPopup.template = Handlebars.compile($("#account-tpl").html());