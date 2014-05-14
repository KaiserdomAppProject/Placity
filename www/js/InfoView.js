var InfoView = function() {
    
    this.initialize = function() {
        this.el = $("<div/>").addClass("page");
        this.registerEvents();
        this.setScroll();
    };
    
    this.render = function() {
        this.el.html(InfoView.template());
        return this;
    };
    
    this.setScroll = function() {
        var self = this;
        if (self.myscroll) {
            setTimeout(function(){self.myscroll.refresh();}, 0);
        } else {
            setTimeout(function(){self.myscroll = new IScroll($('#infoframe', self.el)[0], {
                useTransform: true,
                zoom: false,
                onBeforeScrollStart: function (e) {
                var target = e.target;
                while (target.nodeType != 1) target = target.parentNode;
                
                if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
                e.preventDefault();
                }
            });}, 0);
        }  
    };
    
    this.registerEvents = function() {
        this.el.on("click", "#help_info", function(){app.openPopup("#help", {page:"info"});}); 
        this.el.on("click", "#start", function(){window.location.hash = "#"});   
    };
    
    this.initialize();
}
    
InfoView.template = Handlebars.compile($("#info-tpl").html());